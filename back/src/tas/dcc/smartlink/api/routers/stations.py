from typing import Annotated, Iterable, Protocol, cast

from astropy.units import Quantity, deg
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from tas.dcc.orbits.models import GroundLocation

from ... import models
from ...database import get_database
from ...database.managers import StationManager
from ..converters.station import station_database_to_schema, station_schema_to_model
from ..schemas import ErrorMessage
from ..schemas.station import Station, StationCreate

router = APIRouter(prefix="/stations", tags=["stations"])


@router.get(
    "/",
    responses={200: {"model": list[Station]}},
    operation_id="list_stations",
)
async def list_stations(db: Annotated[Session, Depends(get_database)]):
    # location units are identical between API and database
    return [
        station_database_to_schema(station)
        for station in StationManager(db).all(convert=False)
    ]


@router.get(
    "/{station_id}",
    responses={200: {"model": Station}},
    operation_id="get_station",
)
async def get_station(station_id: int, db: Annotated[Session, Depends(get_database)]):
    station = StationManager(db).by_id(station_id)

    if station is None:
        raise HTTPException(
            status_code=404, detail={"message": f"station {station_id} not found"}
        )

    return station_database_to_schema(station)


@router.post(
    "/create",
    responses={200: {"model": Station}},
    operation_id="create_station",
)
async def create_station(
    station: StationCreate, db: Annotated[Session, Depends(get_database)]
):
    return station_database_to_schema(
        StationManager(db).store(station_schema_to_model(station))
    )


@router.post(
    "/create-many",
    responses={200: {"model": list[Station]}, 422: {"model": ErrorMessage}},
    operation_id="create_stations",
)
async def create_stations(
    request: list[StationCreate], db: Annotated[Session, Depends(get_database)]
):
    manager = StationManager(db)
    db_stations = [
        manager.store(station_schema_to_model(station), commit=False)
        for station in request
    ]
    db.commit()

    return list(map(station_database_to_schema, db_stations))


@router.post(
    "/import",
    responses={200: {"model": list[Station]}, 422: {"model": ErrorMessage}},
    operation_id="import_stations",
)
async def import_stations(
    db: Annotated[Session, Depends(get_database)],
    file: UploadFile = File(),
):
    import pandas as pd

    class _StationTableRow(Protocol):
        country: str
        city: str
        latitude: float
        longitude: float

    assert file.filename is not None
    if file.filename.endswith(".csv"):
        stations_df = pd.read_csv(file.file)
    else:
        stations_df = pd.read_excel(file.file)

    stations = [
        models.Station(
            id=None,
            country=tup.country,
            city=tup.city,
            location=GroundLocation(
                longitude=Quantity(tup.longitude, deg),
                latitude=Quantity(tup.latitude, deg),
            ),
        )
        for tup in cast(Iterable[_StationTableRow], stations_df.itertuples())
    ]

    manager = StationManager(db)
    db_stations = [manager.store(station, commit=False) for station in stations]
    db.commit()

    return list(map(station_database_to_schema, db_stations))
