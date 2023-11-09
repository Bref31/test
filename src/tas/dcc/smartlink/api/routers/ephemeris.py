from typing import Annotated, cast

from astropy.units import km
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from tas.dcc.orbits.compute.ephemeris import PoliastroPropagator
from tas.dcc.orbits.utils.coordinates import celest_gcrs_to_itrs
from tas.dcc.orbits.utils.units import km_per_s

from ...database import get_database
from ...database.managers import (
    ConstellationManager,
    EphemerisManager,
    SatelliteManager,
    SystemManager,
)
from ...models import Ephemeris, Horizon, Satellite
from .. import schemas
from ..converters.horizon import horizon_schema_to_model
from ..converters.utils import quantity_to_schema
from ..schemas import EphemerisRequest, EphemerisResponse, ErrorMessage
from ..schemas.ephemeris import FloatDataFormat

router = APIRouter(prefix="/ephemeris", tags=["ephemeris"])


def _convert_ephemeris(
    ephemeris: Ephemeris, with_velocity: bool, format: FloatDataFormat
) -> schemas.Ephemeris:
    # convert xyz
    position = schemas.EphemerisPosition(
        x_km=quantity_to_schema(ephemeris.itrs.x, format=format, unit=km),
        y_km=quantity_to_schema(ephemeris.itrs.y, format=format, unit=km),
        z_km=quantity_to_schema(ephemeris.itrs.z, format=format, unit=km),
    )

    velocity: schemas.EphemerisVelocity | None = None
    if with_velocity:
        velocity = schemas.EphemerisVelocity(
            dx_km_per_s=quantity_to_schema(
                ephemeris.itrs.d_x, format=format, unit=km_per_s
            ),
            dy_km_per_s=quantity_to_schema(
                ephemeris.itrs.d_y, format=format, unit=km_per_s
            ),
            dz_km_per_s=quantity_to_schema(
                ephemeris.itrs.d_z, format=format, unit=km_per_s
            ),
        )

    return schemas.Ephemeris(position=position, velocity=velocity)


def _get_common_horizons(satellites: list[Satellite], db: Session) -> list[Horizon]:
    ephem_m = EphemerisManager(db)

    horizons_per_satellite = {
        satellite: ephem_m.horizons(satellite.id) if satellite.id is not None else []
        for satellite in satellites
    }

    horizons = horizons_per_satellite[satellites[0]]
    for satellite in satellites[1:]:
        horizons = [
            horizon
            for horizon in horizons
            if any(
                s_horizon == horizon for s_horizon in horizons_per_satellite[satellite]
            )
        ]

    return horizons


@router.get(
    "/list/satellite/{satellite_id}",
    response_model=list[schemas.Horizon],
    operation_id="get_computed_ephemeris_horizons_by_satellite_id",
)
async def get_horizons_by_satellite_id(
    satellite_id: int, db: Annotated[Session, Depends(get_database)]
):
    return EphemerisManager(db).horizons(satellite_id)


@router.get(
    "/list/constellation/{constellation_id}",
    response_model=list[schemas.Horizon],
    operation_id="get_computed_ephemeris_horizons_by_constellation_id",
)
async def get_horizons_by_constellation_id(
    constellation_id: int, db: Annotated[Session, Depends(get_database)]
):
    constellation = ConstellationManager(db).load(constellation_id)

    if constellation is None:
        raise HTTPException(
            status_code=404,
            detail={"message": f"constellation {constellation_id} not found"},
        )

    return _get_common_horizons(
        [satellite for plane in constellation for satellite in plane], db
    )


@router.get(
    "/list/system/{system_id}",
    response_model=list[schemas.Horizon],
    operation_id="get_computed_ephemeris_horizons_by_system_id",
)
async def get_horizons_by_system_id(
    system_id: int, db: Annotated[Session, Depends(get_database)]
):
    system = SystemManager(db).load(system_id)

    if system is None:
        raise HTTPException(
            status_code=404,
            detail={"message": f"system {system_id} not found"},
        )

    return _get_common_horizons(
        [
            satellite
            for constellation in system.constellations
            for plane in constellation
            for satellite in plane
        ],
        db,
    )


@router.post(
    "/compute",
    responses={200: {"model": EphemerisResponse}, 422: {"model": ErrorMessage}},
    operation_id="compute_ephemeris",
)
async def compute_ephemeris(
    request: EphemerisRequest, db: Annotated[Session, Depends(get_database)]
):
    satellites: list[Satellite] = []

    satellite_m = SatelliteManager(db)
    for satellite_id in request.satellite_ids:
        satellite = satellite_m.load(satellite_id)

        if satellite is None:
            raise HTTPException(
                status_code=422,
                detail={"message": f"satellite {satellite_id} does  not exist"},
            )

        satellites.append(satellite)

    ephemeris_m = EphemerisManager(db)
    horizon = horizon_schema_to_model(request.horizon)
    ephemeris: dict[Satellite, Ephemeris | None] = {
        satellite: None for satellite in satellites
    }

    if request.cache:
        for satellite in satellites:
            ephemeris[satellite] = ephemeris_m.extract(satellite, horizon)

    propagator = PoliastroPropagator(propagation_step=horizon.step)
    for satellite in satellites:
        if ephemeris[satellite] is not None:
            continue

        gcrs = propagator.propagate(satellite, horizon.start, horizon.end)
        ephem = Ephemeris(
            id=None,
            satellite=satellite,
            horizon=horizon,
            itrs=celest_gcrs_to_itrs(gcrs),
        )
        ephemeris[satellite] = ephem

        if request.cache:
            ephemeris_m.store(ephem)

    return EphemerisResponse(
        ephemeris={
            cast(int, satellite.id): _convert_ephemeris(
                cast(Ephemeris, s_ephemeris),
                with_velocity=request.velocity,
                format=request.format,
            )
            for satellite, s_ephemeris in ephemeris.items()
        },
        velocity=request.velocity,
        horizon=request.horizon,
        format=request.format,
    )
