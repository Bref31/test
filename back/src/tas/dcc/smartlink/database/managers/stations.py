import astropy.units as u
from sqlalchemy.orm import Session

from tas.dcc.orbits.models import GroundLocation

from ... import models
from ..models.ground_segment import Station
from .base import BaseManager


class StationManager(BaseManager[models.Station, Station, int]):
    def __init__(self, db: Session):
        super().__init__(db, Station, Station.id, lambda s: s.id)

    def convert_from_database(self, model: Station) -> models.Station:
        return models.Station(
            id=model.id,
            country=model.country,
            city=model.city,
            location=GroundLocation(
                longitude=u.Quantity(model.longitude, u.deg),
                latitude=u.Quantity(model.latitude, u.deg),
                height=u.Quantity(model.height, u.m),
            ),
        )

    def convert_to_database(self, model: models.Station) -> Station:
        return Station(
            id=model.id,
            city=model.city,
            country=model.country,
            longitude=model.location.longitude.to_value(u.deg),
            latitude=model.location.latitude.to_value(u.deg),
            height=model.location.height.to_value(u.m),
        )
