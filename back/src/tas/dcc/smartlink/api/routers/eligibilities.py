from typing import Annotated, Sequence

import astropy.units as u
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from tas.dcc.orbits.compute.azel import astropy_compute_azel, celest_compute_azel
from tas.dcc.orbits.compute.eligibilities.base import EligibilityComputation
from tas.dcc.orbits.compute.ephemeris import PoliastroPropagator
from tas.dcc.orbits.utils.coordinates import astropy_gcrs_to_itrs
from tas.dcc.orbits.utils.eligibilities import make_constant_mask

from ...database import get_database
from ...database.managers import (
    EligibilityManager,
    EphemerisManager,
    SatelliteManager,
    StationManager,
)
from ...database.models.base import Base
from ...models import ElevationMask, Eligibility, Ephemeris, Satellite, Station
from .. import schemas
from ..converters.eligibility import eligibility_model_to_schema
from ..converters.horizon import horizon_schema_to_model
from ..schemas import EligibilityRequest, ErrorMessage

router = APIRouter(prefix="/eligibilities", tags=["eligibilities"])


@router.post(
    "/compute",
    responses={200: {"model": list[schemas.Eligibility]}, 422: {"model": ErrorMessage}},
    operation_id="compute_eligibilities",
)
async def api_compute_eligibilities(
    request: EligibilityRequest, db: Annotated[Session, Depends(get_database)]
):
    # load satellites and stations with masks
    satellite_manager = SatelliteManager(db)
    satellites: list[Satellite] = []

    for satellite_id in request.satellite_ids:
        satellite = satellite_manager.load(satellite_id)

        if satellite is None:
            raise HTTPException(
                status_code=422,
                detail={"message": f"satellite {satellite_id} not found"},
            )

        satellites.append(satellite)

    station_manager = StationManager(db)
    stations: dict[Station, ElevationMask] = {}
    for station_with_mask in request.station_with_masks:
        station = station_manager.load(station_with_mask.station_id)

        if station is None:
            raise HTTPException(
                status_code=422,
                detail={"message": f"station {station_with_mask.station_id} not found"},
            )

        if station_with_mask.azimuths_deg is None:
            if not isinstance(station_with_mask.elevations_deg, float):
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": "cannot specify multiple elevations without azimuths"
                    },
                )
            mask = make_constant_mask(
                u.Quantity(station_with_mask.elevations_deg, u.deg)
            )
        else:
            if not isinstance(station_with_mask.elevations_deg, list) or len(
                station_with_mask.elevations_deg
            ) != len(station_with_mask.azimuths_deg):
                raise HTTPException(
                    status_code=422,
                    detail={
                        "message": "azimuths and elevations should contain the same "
                        "number of values"
                    },
                )

            mask = ElevationMask(
                azimuths=u.Quantity(station_with_mask.azimuths_deg, u.deg),
                elevations=u.Quantity(station_with_mask.elevations_deg, u.deg),
            )

        stations[station] = mask

    # convert horizon
    horizon = horizon_schema_to_model(request.horizon)
    interpolation_step = request.step or horizon.step

    # fetch existing eligibilities
    ephemeris_manager = EphemerisManager(db)
    eligibility_manager = EligibilityManager(db)
    eligibilities: dict[Satellite, dict[Station, Sequence[Eligibility]]] = {
        satellite: {} for satellite in satellites
    }
    if request.cache:
        cached_eligibilities = eligibility_manager.extract(
            satellites,
            stations,
            horizon,
            interpolation_step,
            request.backend,
        )

        for (
            satellite,
            station,
        ), eligibilities_for_link in cached_eligibilities.items():
            if eligibilities_for_link is None:
                continue
            eligibilities[satellite][station] = eligibilities_for_link

    azel_fn = {"astropy": astropy_compute_azel, "celest": celest_compute_azel}[
        request.backend
    ]

    # compute eligibilities
    propagator = PoliastroPropagator(propagation_step=horizon.step)
    db_models: list[Base] = []
    for satellite in satellites:
        missing_stations = {
            station: mask
            for station, mask in stations.items()
            if station not in eligibilities[satellite]
        }

        if not missing_stations:
            continue

        # load or compute ephemeris
        ephemeris: Ephemeris | None = None
        if request.cache:
            ephemeris = ephemeris_manager.extract(satellite, horizon)

        if ephemeris is None:
            gcrs = propagator.propagate(
                satellite,
                horizon.start,
                horizon.end,
            )
            ephemeris = Ephemeris(
                id=None,
                satellite=satellite,
                horizon=horizon,
                itrs=astropy_gcrs_to_itrs(gcrs),
            )

            if request.cache:
                db_models.append(ephemeris_manager.convert_to_database(ephemeris))

        eligibility_computation = EligibilityComputation(
            satellite=satellite,
            ephemeris=ephemeris.itrs,
            azel_fn=azel_fn,
            interpolation="linear",
            interpolation_step=interpolation_step,
        )

        for station, mask in missing_stations.items():
            orbit_eligibilities = eligibility_computation.compute(
                station.location, mask
            )

            eligibilities[satellite][station] = [
                Eligibility(
                    id=None,
                    satellite=satellite,
                    station=station,
                    start=eligibility.start,
                    end=eligibility.end,
                )
                for eligibility in orbit_eligibilities
            ]

        if request.cache:
            db_models.extend(
                [
                    eligibility_manager.create_group(
                        ephemeris,
                        station,
                        eligibilities[satellite][station],
                        stations[station],
                        interpolation_step=interpolation_step,
                        backend=request.backend,
                    )
                    for station in missing_stations
                ]
            )

    if request.cache and db_models:
        db.add_all(db_models)
        db.commit()

    return [
        eligibility_model_to_schema(e)
        for satellite_eligibilities in eligibilities.values()
        for station_eligibilities in satellite_eligibilities.values()
        for e in station_eligibilities
    ]
