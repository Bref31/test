from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...database import get_database
from ...database.managers.constellations import ConstellationManager
from ..converters.constellation import (
    constellation_schema_from_model,
    orbit_schema_to_model,
)
from ..schemas import (
    Constellation,
    ConstellationCreate,
    ConstellationInfo,
    ErrorMessage,
)

router = APIRouter(prefix="/constellations", tags=["constellations"])


@router.get(
    "/",
    responses={200: {"model": list[ConstellationInfo]}, 500: {"model": ErrorMessage}},
    operation_id="list_constellations",
)
async def list_constellations(db: Annotated[Session, Depends(get_database)]):
    return [
        ConstellationInfo(
            id=c.id,
            name=c.name,
            n_planes=len(c.planes),
            n_per_plane=len(c.planes[0].satellites),
        )
        for c in ConstellationManager(db).all()
    ]


@router.get(
    "/{constellation_id}",
    responses={200: {"model": Constellation}, 404: {"model": ErrorMessage}},
    operation_id="get_constellation",
)
async def get_constellation_by_id(
    constellation_id: int, db: Annotated[Session, Depends(get_database)]
):
    constellation = ConstellationManager(db).load(constellation_id)

    if constellation is None:
        raise HTTPException(
            status_code=404,
            detail={"message": f"constellation {constellation_id} not found"},
        )

    return constellation_schema_from_model(constellation)


@router.post(
    "/create",
    responses={200: {"model": Constellation}, 422: {"model": ErrorMessage}},
    operation_id="create_constellation",
)
async def create_constellation(
    request: ConstellationCreate, db: Annotated[Session, Depends(get_database)]
):
    from ...utils.builder import make_constellation

    try:
        manager = ConstellationManager(db)
        constellation_db = manager.store(
            make_constellation(
                name=request.name,
                n_planes=request.n_planes,
                n_per_plane=request.n_per_plane,
                orbit_parameters=orbit_schema_to_model(request.orbit_parameters),
            )
        )
        constellation = manager.load(constellation_db.id)
        assert constellation is not None
        return constellation_schema_from_model(constellation)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail={"message": str(e)},
        )
