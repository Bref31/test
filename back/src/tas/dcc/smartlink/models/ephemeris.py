from dataclasses import dataclass

from tas.dcc.orbits.coordinates import ITRS

from .constellation import Satellite
from .horizon import Horizon


@dataclass(frozen=True)
class Ephemeris:
    id: int | None
    """ID of the ephemeris in the database."""

    satellite: Satellite
    """Satellite for these ephemeris."""

    horizon: Horizon
    """Horizon over which ephemeris are computed."""

    itrs: ITRS
    """Actual ephemeris."""
