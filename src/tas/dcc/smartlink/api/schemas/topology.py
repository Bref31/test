from typing import Annotated, Literal

from pydantic import Field

from .base import BaseSchema


class SimpleTopologyParameters(BaseSchema):
    mode: Literal["simple"]

    intra_plane: bool
    """Include intra-plane links or not."""

    inter_plane: bool
    """Include inter-plane links or not."""

    shift_index: int | None = None
    """Shift-index for inter-plane links, must be non-null if inter-plane are
    included."""

    exclude_seam: bool | None = None
    """Exclude inter-plane links around the seam (between last and first planes)."""


class TopologyCreate(BaseSchema):
    constellation_id: int
    """ID of the constellation to create a topology for."""

    name: str
    """Name of the topology."""

    parameters: Annotated[SimpleTopologyParameters, Field(discriminator="mode")]
    """Parameters to construct the topology."""


class TopologyInfo(BaseSchema):
    id: int
    """ID of the topology."""

    name: str
    """Name of the topology."""


class Topology(TopologyInfo):
    neighbors: dict[str, list[tuple[int, int]]]
    """List of links, for each topological group."""
