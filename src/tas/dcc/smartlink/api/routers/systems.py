from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from ... import models
from ...database import get_database
from ...database.managers import ConstellationManager, SystemManager
from ..converters.constellation import constellation_schema_from_model
from ..schemas import ErrorMessage, System, SystemCreate, SystemInfo

router = APIRouter(prefix="/systems", tags=["systems"])


@router.get(
    "/",
    responses={200: {"model": list[SystemInfo]}},
    operation_id="list_systems",
)
async def list_systems(db: Annotated[Session, Depends(get_database)]):
    return [SystemInfo(id=s.id, name=s.name) for s in SystemManager(db).all()]


@router.get(
    "/{system_id}",
    responses={200: {"model": System}, 404: {"model": ErrorMessage}},
    operation_id="get_system",
)
async def get_system(system_id: int, db: Annotated[Session, Depends(get_database)]):
    system = SystemManager(db).load(system_id)

    if system is None:
        raise HTTPException(
            status_code=404,
            detail={"message": f"system {system_id} not found"},
        )
    return System(
        id=system_id,
        name=system.name,
        constellations=[
            constellation_schema_from_model(c) for c in system.constellations
        ],
    )


@router.post(
    "/create",
    responses={200: {"model": System}, 422: {"model": ErrorMessage}},
    operation_id="create_system",
)
async def create_system(
    system: SystemCreate, db: Annotated[Session, Depends(get_database)]
):
    cm = ConstellationManager(db)
    constellations: list[models.Constellation] = []

    for constellation_id in system.constellation_ids:
        constellation = cm.load(constellation_id)

        if constellation is None:
            raise HTTPException(
                status_code=422,
                detail={"message": f"no constellation with ID {constellation_id}"},
            )

        constellations.append(constellation)

    try:
        system_db = SystemManager(db).store(
            models.System(
                id=None,
                name=system.name,
                constellations=constellations,
            )
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail={"message": str(e)},
        )

    return await get_system(system_db.id, db)


@router.delete(
    "/delete/{system_id}",
    responses={204: {"model": None}, 404: {"model": ErrorMessage}},
    operation_id="delete_system",
)
async def delete_system(system_id: int, db: Annotated[Session, Depends(get_database)]):
    system = SystemManager(db).delete(system_id)

    if system is None:
        raise HTTPException(
            status_code=404, detail={"message": f"system {system_id} not found"}
        )

    return Response(status_code=200)
