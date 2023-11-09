from typing import Literal, overload

from ...models import Constellation, Plane, Satellite, Topology


def _simple_intra_plane_neighbors(
    plane: Plane, satellite: Satellite
) -> list[Satellite]:
    prev_index = (satellite.index - 1) % len(plane.satellites)
    next_index = (satellite.index + 1) % len(plane.satellites)
    return [
        plane.satellites[prev_index],
        plane.satellites[next_index],
    ]


def _simple_inter_plane_neighbors(
    plane: Plane, satellite: Satellite, shift: int, seam: bool, planes: list[Plane]
) -> list[Satellite]:
    neighbors: list[Satellite] = []
    n_per_plane = len(plane.satellites)
    if plane.index > 0:
        next_index = (satellite.index - shift) % n_per_plane
        neighbors.append(planes[plane.index - 1].satellites[next_index])
    elif not seam:
        neighbors.append(planes[-1].satellites[satellite.index])
    if plane.index < len(planes) - 1:
        prev_index = (satellite.index + shift) % n_per_plane
        neighbors.append(planes[plane.index + 1].satellites[prev_index])
    elif not seam:
        neighbors.append(planes[0].satellites[satellite.index])
    return neighbors


@overload
def make_simple_topology(
    name: str, constellation: Constellation, intra: bool, inter: Literal[False]
) -> Topology:
    ...


@overload
def make_simple_topology(
    name: str,
    constellation: Constellation,
    intra: bool,
    inter: Literal[True],
    shift: int,
    seam: bool,
) -> Topology:
    ...


def make_simple_topology(
    name: str,
    constellation: Constellation,
    intra: bool,
    inter: bool,
    shift: int | None = None,
    seam: bool = False,
) -> Topology:
    """
    Construct a simple topological pattern with intra-plane and inter-plane links.

    Args:
        name: Name of the pattern.
        constellation: Constellation containing the pattern.
        intra: True to include intra-plane links, False otherwise.
        inter: True to include inter-plane links, False otherwise.
        shift: Shift for inter-plan links, satellite S in plane P is connected to
            satellite S + shift in plane P + 1.
        seam: True to create a seam in the inter-plane, i.e., excluding links across
            the last and first plane.
    """
    neighbors: dict[str, dict[Satellite, list[Satellite]]] = {}

    if intra:
        neighbors["intra-plane"] = {
            satellite: _simple_intra_plane_neighbors(plane, satellite)
            for plane in constellation.planes
            for satellite in plane.satellites
        }

    if inter:
        assert shift is not None

        neighbors["inter-plane"] = {
            satellite: _simple_inter_plane_neighbors(
                plane, satellite, shift, seam, constellation.planes
            )
            for plane in constellation.planes
            for satellite in plane.satellites
        }

    return Topology(id=None, name=name, neighbors=neighbors)
