from sqlalchemy.orm import Session

from ... import models
from ..models import System
from .base import BaseManager
from .constellations import ConstellationManager, convert_from_db


class SystemManager(BaseManager[models.System, System, int]):
    def __init__(self, db: Session):
        super().__init__(db, System, System.id, lambda s: s.id)

        self._cm = ConstellationManager(db)

    def convert_to_database(self, model: models.System) -> System:
        return System(
            name=model.name,
            constellations=[self._cm.store_or_load(c) for c in model.constellations],
        )

    def convert_from_database(self, model: System) -> models.System:
        return models.System(
            id=model.id,
            name=model.name,
            constellations=[convert_from_db(c) for c in model.constellations],
        )
