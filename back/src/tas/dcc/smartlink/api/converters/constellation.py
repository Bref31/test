from datetime import datetime, timezone
from typing import cast

from poliastro.twobody import Orbit

from ... import models
from ...utils.builder.constellation import (
    OrbitParameters,
    TelesatOrbitParameters,
    TrueAnomalyShiftOrbitParameters,
    WalkerDeltaOrbitParameters,
)
from .. import schemas


def orbit_schema_to_model(
    orbit: schemas.ConstellationOrbitParameters,
) -> OrbitParameters:
    from astropy import units as u

    if isinstance(orbit, schemas.TelesatOrbitParameters):
        return TelesatOrbitParameters(
            semi_major_axis=u.Quantity(orbit.semi_major_axis_km, u.km),
            inclination=u.Quantity(orbit.inclination_deg, u.deg),
            eccentricity=u.Quantity(orbit.eccentricity, u.one),
            true_anomaly_period=u.Quantity(orbit.true_anomaly_period_deg, u.deg),
            argument_of_perigee=u.Quantity(orbit.argument_of_perigee_deg, u.deg),
            raan_base=u.Quantity(orbit.raan_base_deg, u.deg),
            raan_spacing=u.Quantity(orbit.raan_spacing_deg, u.deg)
            if orbit.raan_spacing_deg is not None
            else None,
            epoch=orbit.epoch,
        )
    elif isinstance(orbit, schemas.TrueAnomalyShiftOrbitParameters):
        return TrueAnomalyShiftOrbitParameters(
            semi_major_axis=u.Quantity(orbit.semi_major_axis_km, u.km),
            inclination=u.Quantity(orbit.inclination_deg, u.deg),
            eccentricity=u.Quantity(orbit.eccentricity, u.one),
            true_anomaly_delta=u.Quantity(orbit.true_anomaly_delta_deg, u.deg),
            argument_of_perigee=u.Quantity(orbit.argument_of_perigee_deg, u.deg),
            raan_base=u.Quantity(orbit.raan_base_deg, u.deg),
            raan_spacing=u.Quantity(orbit.raan_spacing_deg, u.deg)
            if orbit.raan_spacing_deg is not None
            else None,
            epoch=orbit.epoch,
        )
    else:
        return WalkerDeltaOrbitParameters(
            semi_major_axis=u.Quantity(orbit.semi_major_axis_km, u.km),
            inclination=u.Quantity(orbit.inclination_deg, u.deg),
            eccentricity=u.Quantity(orbit.eccentricity, u.one),
            relative_spacing=orbit.relative_spacing,
            argument_of_perigee=u.Quantity(orbit.argument_of_perigee_deg, u.deg),
            raan_base=u.Quantity(orbit.raan_base_deg, u.deg),
            raan_spacing=u.Quantity(orbit.raan_spacing_deg, u.deg)
            if orbit.raan_spacing_deg is not None
            else None,
            epoch=orbit.epoch,
        )


def orbit_model_to_schema(orbit: Orbit) -> schemas.SatelliteOrbit:
    from astropy import units as u

    return schemas.SatelliteOrbit(
        epoch=cast(datetime, orbit.epoch.to_datetime(timezone=timezone.utc)),
        semi_major_axis_km=orbit.a.to_value(u.km),
        eccentricity=orbit.ecc.to_value(u.one),
        inclination_deg=orbit.inc.to_value(u.deg),
        argument_of_perigee_deg=orbit.argp.to_value(u.deg),
        true_anomaly_deg=orbit.nu.to_value(u.deg),
        raan_deg=orbit.raan.to_value(u.deg),
    )


def constellation_schema_from_model(
    constellation: models.Constellation,
) -> schemas.Constellation:
    return schemas.Constellation(
        id=cast(int, constellation.id),  # should never be None here
        name=constellation.name,
        n_planes=len(constellation.planes),
        n_per_plane=len(constellation.planes[0].satellites),
        orbit=None,
        satellites=[
            [
                schemas.Satellite(
                    id=cast(int, satellite.id),
                    orbit=orbit_model_to_schema(satellite.orbit),
                )
                for satellite in plane.satellites
            ]
            for plane in constellation.planes
        ],
    )
