from dataclasses import dataclass
from typing import cast

from .constellation import Constellation, Plane, Satellite


@dataclass(frozen=True)
class Topology:
    id: int | None
    """ID of the topology."""

    name: str
    """Name of the topology."""

    neighbors: dict[str, dict[Satellite, list[Satellite]]]
    """For each neighboring group (intra-plane, inter-plane, etc.), the list of
    neighbors of each satellite."""

    def types(self) -> list[str]:
        """
        Returns:
            The type of neighbors satellites can have.
        """
        return list(self.neighbors.keys())

    def neighbors_of(self, satellite: Satellite, type: str | None) -> list[Satellite]:
        """
        Retrieve neighbors of the given satellite.

        Args:
            satellite: Satellite to retrieve neighbors from.
            type: Type of neighbors to retrieve, or None to retrieve all neighbors.

        Returns:
            The list of neighbouring satellites.
        """
        neighbors_: list[Satellite] = []
        if type is not None:
            neighbors_ = self.neighbors[type][satellite]
        else:
            for neighbors_of_type in self.neighbors.values():
                neighbors_.extend(neighbors_of_type[satellite])

        return neighbors_

    @property
    def constellation(self) -> Constellation:
        return cast(
            Plane, next(iter(next(iter(self.neighbors.values())).keys())).plane
        ).constellation
