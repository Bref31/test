from dataclasses import dataclass

from .constellation import Constellation


@dataclass(frozen=True)
class System:
    id: int | None
    """ID of the system in the database."""

    name: str
    """System's name."""

    constellations: list[Constellation]
    """Sequence of all the constellations within the system."""
