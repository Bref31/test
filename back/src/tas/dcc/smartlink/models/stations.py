from dataclasses import dataclass

from tas.dcc.orbits.models import GroundLocation


@dataclass(frozen=True)
class Station:
    id: int | None

    city: str
    country: str

    location: GroundLocation

    def __hash__(self) -> int:
        return hash(self.id)


@dataclass(frozen=True)
class GroundSegment:
    id: int | None

    name: str
    """Name of the ground segment."""

    stations: list[Station]
    """Stations in the ground segment."""
