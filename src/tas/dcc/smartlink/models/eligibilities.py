from dataclasses import dataclass
from datetime import datetime

from astropy.units import Quantity, deg

from tas.dcc.orbits.models import ElevationMask

from .constellation import Satellite
from .stations import Station


@dataclass(frozen=True)
class Eligibility:
    id: int | None
    """ID corresponding to the eligibility."""

    satellite: Satellite
    """Satellite for the eligibility."""

    station: Station
    """Station for the eligibility."""

    start: datetime
    """Start time of the eligibility."""

    end: datetime
    """End time of the eligibility."""

    elevations: Quantity[deg] | None = None
    """Elevations over time for this eligibility, matching the time steps used for
    computation."""

    azimuths: Quantity[deg] | None = None
    """Azimuths over time for this eligibility, matching the time steps used for
    computation."""


__all__ = ["ElevationMask", "Eligibility"]
