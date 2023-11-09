from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_database
from ...database.managers import ConstellationManager, TopologyManager
from ..schemas import ErrorMessage, Topology, TopologyCreate, TopologyInfo

router = APIRouter(prefix="/topologies", tags=["topologies"])


@router.get(
    "/list",
    responses={
        200: {
            "model": list[TopologyInfo],
        }
    },
    operation_id="list_topologies_for_constellation",
)
async def list_topologies_for_constellation(
    constellation_id: int, db: Annotated[Session, Depends(get_database)]
):
    return [
        TopologyInfo(id=t.id, name=t.name)
        for t in TopologyManager.for_constellation(db, constellation_id)
    ]


@router.get(
    "/{topology_id}",
    responses={200: {"model": Topology}, 404: {"model": ErrorMessage}},
    operation_id="get_topology",
)
async def get_topology(topology_id: int, db: Annotated[Session, Depends(get_database)]):
    topology = TopologyManager(db, None).by_id(topology_id)

    if topology is None:
        raise HTTPException(
            status_code=404,
            detail={"message": f"topology {topology_id} not found"},
        )

    return Topology(
        id=topology.id,
        name=topology.name,
        neighbors={
            group.name: [
                (origin, destination)
                for origin, destinations in TopologyManager.make_mapping(
                    group, lambda k: k
                ).items()
                for destination in destinations
            ]
            for group in topology.groups
        },
    )


@router.post(
    "/create",
    responses={200: {"model": Topology}, 422: {"model": ErrorMessage}},
    operation_id="create_topology",
)
async def create_topology(
    topology: TopologyCreate, db: Annotated[Session, Depends(get_database)]
):
    from ...utils.builder import make_simple_topology

    constellation = ConstellationManager(db).load(topology.constellation_id)

    if constellation is None:
        raise HTTPException(
            status_code=422,
            detail={"message": f"constellation {topology.constellation_id} not found"},
        )

    # not needed for now because there is only one type
    #
    # if not isinstance(topology.parameters, SimpleTopologyParameters):
    #     raise HTTPException(
    #         status_code=400,
    #              detail={"message": "only 'simple' mode supported"},
    #     )

    if topology.parameters.inter_plane and (
        topology.parameters.shift_index is None
        or topology.parameters.exclude_seam is None
    ):
        raise HTTPException(
            status_code=422,
            detail={
                "message": (
                    "`shift_index` and `exclude_seam` cannot be null " "for inter plane"
                )
            },
        )

    topology_db = TopologyManager(db, constellation).store(
        make_simple_topology(
            name=topology.name,
            constellation=constellation,
            intra=topology.parameters.intra_plane,
            inter=topology.parameters.inter_plane,  # type: ignore
            shift=topology.parameters.shift_index,  # type: ignore
            seam=topology.parameters.exclude_seam,  # type: ignore
        )
    )

    return await get_topology(topology_db.id, db)
