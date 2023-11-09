from datetime import datetime
from typing import Annotated, Literal

from pydantic import Field

from .base import BaseSchema


class BaseOrbit(BaseSchema):
    semi_major_axis_km: float
    """Semi-major axis of the orbit (km)."""

    inclination_deg: float
    """Inclination of the orbit (deg)."""

    eccentricity: float
    """Eccentricity of the orbit (unitless)."""

    argument_of_perigee_deg: float
    """Argument of perigee for the orbit (deg)."""

    epoch: datetime
    """Epoch of the orbit parameters."""


class SatelliteOrbit(BaseOrbit):

    """
    Class representing the orbit of a single satellite.
    """

    true_anomaly_deg: float
    """True Anomaly of the satellite."""

    raan_deg: float
    """Right Ascension of the Ascending Node (RAAN) of the satellite (deg)."""


class ConstellationBase(BaseSchema):
    name: str
    """Sub-constellation's name. Typically 'inclined' or 'polar'."""

    n_planes: int
    """Number of planes."""

    n_per_plane: int
    """Number of satellites per plane."""


class ConstellationInfo(ConstellationBase):
    id: int
    """ID of the constellation."""


class BaseConstellationOrbitParameters(BaseOrbit):
    raan_base_deg: float
    """Right Ascension of the Ascending Node (RAAN) of the first plane (deg)."""

    raan_spacing_deg: float | None = None
    """Spacing between Right Ascension of Ascending Nodes (deg)."""


class TelesatOrbitParameters(BaseConstellationOrbitParameters):

    """
    Class representing the template orbit for a constellation of satellites based on
    Telesat system.
    """

    mode: Literal["telesat"]

    true_anomaly_period_deg: float
    """True Anomaly period between satellites in the same plane (deg)."""


class WalkerOrbitParameters(BaseConstellationOrbitParameters):

    """
    Class representing the template orbit for a constellation of satellites based on
    Telesat system.
    """

    mode: Literal["walker"]

    relative_spacing: int = 1
    """Relative spacing between satellites in adjacent planes."""


class TrueAnomalyShiftOrbitParameters(BaseConstellationOrbitParameters):

    """
    Class representing the template orbit for a constellation of satellites based on
    Telesat system.
    """

    mode: Literal["true-anomaly-shift"]

    true_anomaly_delta_deg: float
    """Different between true anomaly for sibling satellites in adjacent planes."""


ConstellationOrbitParameters = Annotated[
    TelesatOrbitParameters | WalkerOrbitParameters | TrueAnomalyShiftOrbitParameters,
    Field(discriminator="mode"),
]


class ConstellationCreate(ConstellationBase):

    """
    Schema used for creating a constellation.
    """

    orbit_parameters: ConstellationOrbitParameters
    """Parameters to construct the orbits of satellites in this constellation."""


class Satellite(BaseSchema):

    """
    Schema representing an existing satellite.
    """

    id: int
    """ID (unique) of the satellite."""

    orbit: SatelliteOrbit
    """Orbit of the satellite."""


class Constellation(ConstellationBase):
    id: int
    """Constellation's id in database."""

    orbit: ConstellationOrbitParameters | None
    """Parameters that were used to construct the constellation."""

    satellites: list[list[Satellite]]
    """Sequence of all satellites, organized by plane."""
