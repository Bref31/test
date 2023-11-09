from datetime import timezone

from poliastro.twobody import Orbit
from sqlalchemy.orm import Session

from ... import models
from ..models import Constellation, Plane, Satellite, SatelliteOrbit
from .base import BaseManager


def _orbit(orbit: SatelliteOrbit) -> Orbit:
    import astropy.units as u
    from astropy.time import Time
    from poliastro.bodies import Earth

    return Orbit.from_classical(
        attractor=Earth,
        a=u.Quantity(orbit.semi_major_axis, u.km),
        ecc=u.Quantity(orbit.eccentricity, u.one),
        inc=u.Quantity(orbit.inclination, u.deg),
        raan=u.Quantity(orbit.raan, u.deg),
        argp=u.Quantity(orbit.argument_of_perigee, u.deg),
        nu=u.Quantity(orbit.true_anomaly, u.deg),
        epoch=Time(orbit.epoch),
    )


def convert_from_db(value: Constellation) -> models.Constellation:
    return models.Constellation(
        id=value.id,
        name=value.name,
        planes=[
            models.Plane(
                index=plane.index,
                satellites=[
                    models.Satellite(
                        id=satellite.id,
                        index=satellite.index,
                        orbit=_orbit(satellite.orbit),
                    )
                    for satellite in plane.satellites
                ],
            )
            for plane in value.planes
        ],
    )


class SatelliteManager(BaseManager[models.Satellite, Satellite, int]):
    def __init__(self, db: Session):
        super().__init__(db, Satellite, Satellite.id, lambda s: s.id)

    def convert_from_database(self, model: Satellite) -> models.Satellite:
        return models.Satellite(
            id=model.id,
            index=model.index,
            orbit=_orbit(model.orbit),
        )

    def convert_to_database(self, model: models.Satellite) -> Satellite:
        import astropy.units as u

        db_orbit = SatelliteOrbit(
            epoch=model.orbit.epoch.to_datetime(timezone=timezone.utc),
            semi_major_axis=model.orbit.a.to_value(u.km),
            eccentricity=model.orbit.ecc.to_value(u.one),
            inclination=model.orbit.inc.to_value(u.deg),
            argument_of_perigee=model.orbit.argp.to_value(u.deg),
            true_anomaly=model.orbit.nu.to_value(u.deg),
            raan=model.orbit.raan.to_value(u.deg),
        )
        return Satellite(id=model.id, index=model.index, orbit=db_orbit)


class ConstellationManager(BaseManager[models.Constellation, Constellation, int]):
    def __init__(self, db: Session):
        super().__init__(db, Constellation, Constellation.id, lambda c: c.id)

        self._satellite_manager = SatelliteManager(db)

    def convert_from_database(self, model: Constellation) -> models.Constellation:
        return convert_from_db(model)

    def convert_to_database(self, model: models.Constellation) -> Constellation:
        return Constellation(
            id=model.id,
            name=model.name,
            planes=[
                Plane(
                    index=plane.index,
                    satellites=[
                        self._satellite_manager.store_or_load(s, commit=False)
                        for s in plane.satellites
                    ],
                )
                for plane in model.planes
            ],
        )
