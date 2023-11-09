from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterator

from tas.dcc.orbits import models as orbit_models


@dataclass(frozen=True)
class Satellite(orbit_models.Satellite):
    id: int | None
    """ID of the satellite, if present."""

    index: int
    """Index of the satellite, within the plane (>= 0 & <= n_per_plane)."""

    plane: Plane | None = field(init=False, default=None)
    """Plane of the satellite, if part of a constellation."""

    def __repr__(self) -> str:
        p_index = self.plane.index if self.plane else -1
        return f"Satellite(id={self.id}, index={self.index}, plane={p_index})"

    def __hash__(self) -> int:
        if self.plane is None:
            assert self.id is not None
            return hash(self.id)
        return hash((self.plane.constellation.name, self.plane.index, self.index))


@dataclass(frozen=True)
class Plane:
    index: int
    """Plane index within th constellation."""

    constellation: Constellation = field(init=False, repr=False)
    """Constellation this plane belongs to."""

    satellites: list[Satellite]
    """List of all the satellites within the plane."""

    def __post_init__(self):
        self.satellites.sort(key=lambda s: s.index)
        for satellite in self.satellites:
            object.__setattr__(satellite, "plane", self)

    def __hash__(self) -> int:
        return hash((self.constellation.name, self.index))

    def __iter__(self) -> Iterator[Satellite]:
        return iter(self.satellites)

    def __len__(self) -> int:
        return len(self.satellites)


@dataclass(frozen=True)
class Constellation:
    id: int | None
    """ID of the constellation, if present."""

    name: str
    """Name of the constellation."""

    planes: list[Plane]
    """Sequence of all the planes within the constellation"""

    def __post_init__(self):
        self.planes.sort(key=lambda p: p.index)
        for plane in self.planes:
            object.__setattr__(plane, "constellation", self)

    def __iter__(self) -> Iterator[Plane]:
        return iter(self.planes)

    def __len__(self) -> int:
        return len(self.planes)
