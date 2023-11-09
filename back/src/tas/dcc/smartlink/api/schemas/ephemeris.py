from typing import Literal

from .base import BaseSchema
from .horizon import Horizon
from .utils import FloatDataFormat


class EphemerisPosition(BaseSchema):

    """
    Class representing position over time. Each attributes is a float array encoded.

    The encoding depends on the format used (see FloatDataFormat).
    """

    x_km: bytes
    """X position over time, as base64 encoded array of float."""

    y_km: bytes
    """Y position over time, as base64 encoded array of float."""

    z_km: bytes
    """Z position over time, as base64 encoded array of float."""


class EphemerisVelocity(BaseSchema):

    """
    Class representing velocity over time. See EphemerisPosition for details on the
    encoding.
    """

    dx_km_per_s: bytes
    """X velocity over time, as base64 encoded array of float."""

    dy_km_per_s: bytes
    """Y velocity over time, as base64 encoded array of float."""

    dz_km_per_s: bytes
    """Z velocity over time, as base64 encoded array of float."""


class Ephemeris(BaseSchema):
    """
    Class representing the ephemeris of a single satellite.
    """

    position: EphemerisPosition
    """Position of the satellite over time."""

    velocity: EphemerisVelocity | None = None
    """Velocity of the satellite over time, only if requested."""


class _EphemerisRequestResponse(BaseSchema):
    horizon: Horizon
    """Horizon of the ephemeris."""

    velocity: bool = False
    """Whether the ephemeris contains or will contain velocity."""

    format: FloatDataFormat = FloatDataFormat()
    """Float data format of the ephemeris."""


class EphemerisRequest(_EphemerisRequestResponse):
    satellite_ids: list[int]
    """ID of the satellites for which ephemeris are requested."""

    cache: bool = True
    """Whether to check the cache before computing and to store computed ephemeris in
    the cache after computation."""

    backend: Literal["poliastro"] = "poliastro"
    """Backend to use to compute ephemeris."""


class EphemerisResponse(_EphemerisRequestResponse):
    ephemeris: dict[int, Ephemeris]
    """Mapping between satellite ID and ephemeris."""
