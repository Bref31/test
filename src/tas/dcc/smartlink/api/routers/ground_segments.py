from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ... import models
from ...database import get_database
from ...database.managers import GroundSegmentManager
from ..converters.ground_segment import (
    ground_segment_database_to_info,
    ground_segment_database_to_schema,
)
from ..converters.station import station_schema_to_model
from ..schemas import ErrorMessage
from ..schemas.ground_segment import (
    GroundSegment,
    GroundSegmentCreate,
    GroundSegmentInfo,
)

router = APIRouter(prefix="/ground-segments", tags=["ground-segments"])


@router.get(
    "/",
    responses={200: {"model": list[GroundSegmentInfo]}},
    operation_id="list_ground_segments",
)
async def list_ground_segments(db: Annotated[Session, Depends(get_database)]):
    return [
        ground_segment_database_to_info(gs) for gs in GroundSegmentManager(db).all()
    ]


@router.get(
    "/{ground_segment_id}",
    responses={200: {"model": GroundSegment}, 404: {"model": ErrorMessage}},
    operation_id="get_ground_segment",
)
async def get_ground_segment(
    ground_segment_id: int, db: Annotated[Session, Depends(get_database)]
):
    ground_segment = GroundSegmentManager(db).by_id(ground_segment_id)

    if ground_segment is None:
        raise HTTPException(
            status_code=404,
            detail={"message": f"ground segment {ground_segment_id} not found"},
        )
    return ground_segment_database_to_schema(ground_segment)


@router.post(
    "/create",
    responses={200: {"model": GroundSegment}},
    operation_id="create_ground_segment",
)
async def create_ground_segment(
    ground_segment: GroundSegmentCreate, db: Annotated[Session, Depends(get_database)]
):
    return ground_segment_database_to_schema(
        GroundSegmentManager(db).store(
            models.GroundSegment(
                id=None,
                name=ground_segment.name,
                stations=[
                    station_schema_to_model(station)
                    for station in ground_segment.stations
                ],
            )
        )
    )
