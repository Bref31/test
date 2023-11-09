from sqlalchemy.orm import Session

from ... import models
from ..models.ground_segment import GroundSegment
from .base import BaseManager
from .stations import StationManager


class GroundSegmentManager(BaseManager[models.GroundSegment, GroundSegment, int]):
    def __init__(self, db: Session):
        super().__init__(db, GroundSegment, GroundSegment.id, lambda g: g.id)

        self._station_manager = StationManager(db)

    def convert_from_database(self, model: GroundSegment) -> models.GroundSegment:
        return models.GroundSegment(
            id=model.id,
            name=model.name,
            stations=[
                self._station_manager.convert_from_database(station)
                for station in model.stations
            ],
        )

    def convert_to_database(self, model: models.GroundSegment) -> GroundSegment:
        return GroundSegment(
            id=model.id,
            name=model.name,
            stations=[
                self._station_manager.store_or_load(station, commit=False)
                if station.id is None
                else self._station_manager.by_id(station.id)
                for station in model.stations
            ],
        )
