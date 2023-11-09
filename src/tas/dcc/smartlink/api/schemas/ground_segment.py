from .base import BaseSchema
from .station import Station, StationCreate


class GroundSegmentBase(BaseSchema):
    id: int
    """ID of the ground segment."""

    name: str
    """Name of the ground segment."""


class GroundSegmentInfo(GroundSegmentBase):
    nb_stations: int
    """Number of stations in the ground segment."""


class GroundSegment(GroundSegmentBase):
    stations: list[Station]
    """Stations in the ground segment."""


class GroundSegmentCreate(BaseSchema):
    name: str
    """Name of the ground segment."""

    stations: list[Station | StationCreate]
    """Stations in the ground segment, existing or to be created."""
