from datetime import datetime, timedelta
from typing import Literal

from .base import BaseSchema
from .horizon import Horizon


class Eligibility(BaseSchema):
    satellite_id: int
    """ID of the satellite corresponding to the eligibility."""

    station_id: int
    """ID of the station corresponding to the eligibility."""

    start: datetime
    """Start time of the eligibility."""

    end: datetime
    """End time of the eligibility."""


class EligibilityMask(BaseSchema):
    station_id: int
    """ID of the station the mask applies to."""

    azimuths_deg: list[float] | None = None
    """Azimuths threshold for which the elevation applies. None to apply always."""

    elevations_deg: list[float] | float
    """Minimum elevations corresponding to the azimuth thresholds, or a single value
    if the azimuth azimuths_deg is None."""


class EligibilityRequest(BaseSchema):
    satellite_ids: list[int]
    """List of satellites to compute eligibilities for."""

    station_with_masks: list[EligibilityMask]
    """Elevation masks to use for the stations."""

    horizon: Horizon
    """Horizon to compute eligibilities over."""

    step: timedelta | None = None
    """Step to use for interpolation of eligibilities, default to the horizon step."""

    cache: bool = True
    """Whether to use caching (database) for ephemeris and eligibilities."""

    backend: Literal["astropy", "celest"] = "celest"
    """Backend to use to compute eligibilities."""
