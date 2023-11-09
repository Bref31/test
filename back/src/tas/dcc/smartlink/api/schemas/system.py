from .base import BaseSchema
from .constellation import Constellation


class SystemInfo(BaseSchema):
    id: int
    """System's ID given by MongoDB."""

    name: str
    """Name of the system."""


class System(SystemInfo):
    constellations: list[Constellation]
    """Sequence of all the constellations within the system."""


class SystemCreate(BaseSchema):
    name: str
    """Name of the system."""

    constellation_ids: list[int]
    """ID of the constellations to include in the system."""
