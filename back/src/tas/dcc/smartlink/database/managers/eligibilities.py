import itertools
from datetime import datetime, timedelta
from typing import Literal, Sequence, cast

import sqlalchemy
from sqlalchemy import select
from sqlalchemy.orm import Session

from ... import models
from ...utils.collections import by_id
from ...utils.time import ensure_utc
from ..models.eligibility import Eligibility, EligibilityGroup
from ..models.ephemeris import Ephemeris
from .base import BaseManager
from .constellations import SatelliteManager
from .ephemeris import EphemerisManager
from .stations import StationManager
from .utils import timedelta_to_database


class EligibilityManager(BaseManager[models.Eligibility, Eligibility, int]):
    def __init__(self, db: Session):
        super().__init__(db, Eligibility, Eligibility.id, lambda e: e.id)

        self._satellite_manager = SatelliteManager(db)
        self._station_manager = StationManager(db)
        self._ephemeris_manager = EphemerisManager(db)

    def _encode_mask(self, mask: models.ElevationMask) -> bytes:
        import astropy.units as u
        import numpy as np

        az = np.ascontiguousarray(mask.azimuths.to_value(u.deg)).astype("<f8")
        el = np.ascontiguousarray(mask.elevations.to_value(u.deg)).astype("<f8")

        return az.tobytes() + el.tobytes()

    def convert_from_database(self, model: Eligibility) -> models.Eligibility:
        return models.Eligibility(
            id=model.id,
            satellite=self._satellite_manager.convert_from_database(
                model.group.ephemeris.satellite
            ),
            station=self._station_manager.convert_from_database(model.group.station),
            start=ensure_utc(model.start),
            end=ensure_utc(model.end),
        )

    def convert_to_database(self, model: models.Eligibility) -> Eligibility:
        raise NotImplementedError(
            "eligibilities cannot be converted independently to database entries, "
            "use store_group"
        )

    def store(self, model: models.Eligibility, commit: bool = True) -> Eligibility:
        raise NotImplementedError(
            "eligibilities cannot be stored independently in the database, "
            "use store_group"
        )

    # def list(self, satellites: list[models.Satellite], stations)

    def extract(
        self,
        satellites: models.Satellite | list[models.Satellite],
        stations: dict[models.Station, models.ElevationMask],
        horizon: models.Horizon,
        interpolation_step: timedelta,
        backend: Literal["celest", "astropy"],
        shrink: bool = True,
    ) -> dict[tuple[models.Satellite, models.Station], None | list[models.Eligibility]]:
        """
        Extract eligibilities between a satellite and a station over a given horizon,
        using eligibilities computed over a broader horizon if needed.

        Args:
            satellite: Satellite to find eligibilities for.
            station: Station to find eligibilities for.
            horizon: Horizon to find eligibilities for. If an eligibility group for a
                broader horizon exists, it will be used.
            mask: Mask used to compute eligibilities.
            interpolation_step: Interpolation step used to compute eligibilities.
            backend: Backend used to compute eligibilities.
            shrink: Set to True (default) to shrink eligibilities to fit in the given
                horizon if computed from a broader horizon, False to returned the
                original eligibility.
        """
        if not isinstance(satellites, list):
            satellites = [satellites]

        satellites_by_id = by_id(satellites, lambda s: s.id)
        stations_by_id = by_id(stations.keys(), lambda s: s.id)

        db_eligibilities = cast(
            Sequence[tuple[Eligibility | None, EligibilityGroup]],
            self._db.execute(
                select(Eligibility, EligibilityGroup)
                .select_from(EligibilityGroup)
                .join(
                    Eligibility,
                    EligibilityGroup.id == Eligibility.group_id,
                    isouter=True,
                )
                .join(Ephemeris, Ephemeris.id == EligibilityGroup.ephemeris_id)
                .where(
                    Ephemeris.satellite_id.in_([s.id for s in satellites]),
                    Ephemeris.start <= ensure_utc(horizon.start),
                    Ephemeris.end >= ensure_utc(horizon.end),
                    Ephemeris.step == timedelta_to_database(horizon.step),
                    sqlalchemy.tuple_(
                        EligibilityGroup.station_id, EligibilityGroup.mask
                    ).in_(
                        [
                            (station.id, self._encode_mask(mask))
                            for station, mask in stations.items()
                        ]
                    ),
                    EligibilityGroup.backend == backend,
                    EligibilityGroup.step == timedelta_to_database(interpolation_step),
                )
            ).all(),
        )

        db_eligibilities_by_link: dict[
            tuple[models.Satellite, models.Station],
            list[tuple[int, datetime, datetime]],
        ] = {
            (satellites_by_id[satellite_id], stations_by_id[station_id]): [
                (
                    e.id,
                    ensure_utc(e.start),
                    ensure_utc(e.end),
                )
                for e, _ in values
                if e is not None
            ]
            for (satellite_id, station_id), values in itertools.groupby(
                db_eligibilities,
                key=lambda e_and_g: (
                    e_and_g[1].ephemeris.satellite_id,
                    e_and_g[1].station_id,
                ),
            )
        }

        eligibilities: dict[
            tuple[models.Satellite, models.Station], None | list[models.Eligibility]
        ] = {
            (satellite, station): None
            for satellite in satellites
            for station in stations
        }

        if shrink:
            eligibilities.update(
                {
                    (satellite, station): [
                        models.Eligibility(
                            id=id,
                            satellite=satellite,
                            station=station,
                            start=max(horizon.start, start),
                            end=min(horizon.end, end),
                        )
                        for id, start, end in db_eligibilities
                        if start >= horizon.start and end <= horizon.end
                    ]
                    for (
                        satellite,
                        station,
                    ), db_eligibilities in db_eligibilities_by_link.items()
                }
            )
        else:
            eligibilities.update(
                {
                    (satellite, station): [
                        models.Eligibility(
                            id=id,
                            satellite=satellite,
                            station=station,
                            start=start,
                            end=end,
                        )
                        for id, start, end in db_eligibilities
                    ]
                    for (
                        satellite,
                        station,
                    ), db_eligibilities in db_eligibilities_by_link.items()
                }
            )

        return eligibilities

    def create_group(
        self,
        ephemeris: models.Ephemeris | Ephemeris,
        station: models.Station,
        eligibilities: Sequence[models.Eligibility],
        mask: models.ElevationMask,
        interpolation_step: timedelta,
        backend: Literal["celest", "astropy"],
    ) -> EligibilityGroup:
        """
        Create a group of eligibilities computed together for a single station.

        Args:
            ephemeris: Ephemeris used to compute eligibilities. Will be stored in the
                database if not already.
            station: Station corresponding to the eligibilities.
            eligibilities: Computed eligibilities. Should all be for the given ephemeris
                and station.
            mask: Mask used for eligibility computation.
            interpolation_step: Step used for interpolation of eligibilities.
            backend: Backend used for compute of eligibilities.

        Returns:
            For each station, the corresponding eligibility group.
        """

        if isinstance(ephemeris, models.Ephemeris):
            ephemeris_db = self._ephemeris_manager.store_or_load(ephemeris)
        else:
            ephemeris_db = ephemeris

        station_db = self._station_manager.store_or_load(station)

        # create the groups
        group = EligibilityGroup(
            ephemeris=ephemeris_db,
            station=station_db,
            mask=self._encode_mask(mask),
            step=timedelta_to_database(interpolation_step),
            backend=backend,
            eligibilities=[
                Eligibility(
                    id=eligibility.id,
                    start=eligibility.start,
                    end=eligibility.end,
                )
                for eligibility in eligibilities
            ],
        )

        return group
