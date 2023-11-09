from datetime import datetime, timedelta, timezone
from pathlib import Path

import astropy.units as u
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from tqdm import tqdm

from tas.dcc.orbits.compute.eligibilities import EligibilityComputation
from tas.dcc.orbits.compute.ephemeris import PoliastroPropagator
from tas.dcc.orbits.models import GroundLocation
from tas.dcc.orbits.utils.coordinates import celest_gcrs_to_itrs
from tas.dcc.orbits.utils.eligibilities import make_constant_mask
from tas.dcc.smartlink import models
from tas.dcc.smartlink.database.managers import (
    EligibilityManager,
    EphemerisManager,
    GroundSegmentManager,
    SystemManager,
    TopologyManager,
)
from tas.dcc.smartlink.database.models.base import Base
from tas.dcc.smartlink.database.models.eligibility import EligibilityGroup
from tas.dcc.smartlink.models import Ephemeris, GroundSegment, Horizon, Station
from tas.dcc.smartlink.utils.builder.constellation import (
    TelesatOrbitParameters,
    make_constellation,
)
from tas.dcc.smartlink.utils.builder.topology import make_simple_topology

engine = create_engine(
    "mariadb+mariadbconnector://smartlink:smartlink@localhost:3306/smartlink",
    echo=False,
)

Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)


# example system
EPOCH = datetime(2023, 7, 1, 0, 0, 0, tzinfo=timezone.utc)
SYSTEM_EXAMPLE = models.System(
    id=None,
    name="telesat-2021",
    constellations=[
        make_constellation(
            name="inclined",
            n_planes=20,
            n_per_plane=11,
            orbit_parameters=TelesatOrbitParameters(
                epoch=EPOCH,
                semi_major_axis=u.Quantity(7703.137, u.km),
                eccentricity=u.Quantity(0.000742, u.one),
                true_anomaly_period=u.Quantity(-19.63637, u.deg),
                inclination=u.Quantity(50.88388, u.deg),
                argument_of_perigee=u.Quantity(90, u.deg),
                raan_base=u.Quantity(0, u.deg),
            ),
        ),
        make_constellation(
            name="polar",
            n_planes=6,
            n_per_plane=13,
            orbit_parameters=TelesatOrbitParameters(
                epoch=EPOCH,
                semi_major_axis=u.Quantity(7393.137, u.km),
                eccentricity=u.Quantity(0.000995, u.one),
                true_anomaly_period=u.Quantity(-12.30769, u.deg),
                inclination=u.Quantity(98.97937, u.deg),
                argument_of_perigee=u.Quantity(90, u.deg),
                raan_base=u.Quantity(0, u.deg),
                raan_spacing=u.Quantity(40, u.deg),
            ),
        ),
    ],
)

with Session(engine) as db:
    sm = SystemManager(db)

    system_db = sm.store(SYSTEM_EXAMPLE)
    system_example = sm.load(system_db.id)

    assert system_example is not None


TOPOLOGY_EXAMPLES = [
    make_simple_topology(
        "telesat-inclined-full",
        constellation=system_example.constellations[0],
        intra=True,
        inter=True,
        shift=-1,
        seam=False,
    ),
    make_simple_topology(
        "telesat-polar-full",
        constellation=system_example.constellations[1],
        intra=True,
        inter=True,
        shift=0,
        seam=True,
    ),
]

with Session(engine) as db:
    for topology in TOPOLOGY_EXAMPLES:
        TopologyManager(db, topology.constellation).store(topology)

stations_df = pd.read_csv(Path(__file__).parent.joinpath("stations.csv"))
stations = [
    Station(
        id=None,
        country=tup.country,
        city=tup.city,
        location=GroundLocation(
            longitude=tup.longitude * u.deg, latitude=tup.latitude * u.deg
        ),
    )
    for tup in stations_df.itertuples()
]
ground_segment = GroundSegment(
    name="default-ground-segment", stations=stations, id=None
)

with Session(engine) as db:
    group_segment_db = GroundSegmentManager(db).store(ground_segment)
    ground_segment = GroundSegmentManager(db).convert_from_database(group_segment_db)

ephemeris: list[Ephemeris] = []
propagator = PoliastroPropagator(timedelta(seconds=30))
for constellation in system_example.constellations:
    for satellite in tqdm([s for p in constellation.planes for s in p.satellites]):
        horizon = Horizon(
            start=EPOCH, end=EPOCH + timedelta(seconds=7200), step=timedelta(seconds=30)
        )
        ephemeris.append(
            Ephemeris(
                id=None,
                satellite=satellite,
                horizon=horizon,
                itrs=celest_gcrs_to_itrs(
                    propagator.propagate(
                        satellite, start=EPOCH, end=EPOCH + timedelta(seconds=7200)
                    )
                ),
            )
        )

with Session(engine) as db:
    ems: list[EligibilityGroup] = []
    for ephem in tqdm(ephemeris):
        db_ephem = EphemerisManager(db).convert_to_database(ephem)

        interpolation_step = timedelta(seconds=10)

        eligibility_compute = EligibilityComputation(
            ephem.satellite,
            ephem.itrs,
            interpolation="cubic",
            interpolation_step=interpolation_step,
        )

        for station in ground_segment.stations:
            mask = make_constant_mask(u.Quantity(20, u.deg))

            eligibilities = eligibility_compute.compute(station.location, mask)

            ems.append(
                EligibilityManager(db).create_group(
                    db_ephem,
                    station=station,
                    eligibilities=[
                        models.Eligibility(
                            id=None,
                            satellite=ephem.satellite,
                            station=station,
                            start=e.start,
                            end=e.end,
                        )
                        for e in eligibilities
                    ],
                    mask=mask,
                    interpolation_step=interpolation_step,
                    backend="celest",
                )
            )

    db.add_all(ems)
    db.commit()
