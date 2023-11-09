from __future__ import annotations

import abc
from dataclasses import dataclass
from datetime import datetime
from typing import cast

import numpy as np
from astropy import units as u
from astropy.time import Time
from poliastro.bodies import Earth
from poliastro.twobody import Orbit

from ...models import Constellation, Plane, Satellite

_180deg = u.Quantity(180, u.deg)
_360deg = u.Quantity(360, u.deg)


@dataclass(frozen=True, kw_only=True)
class OrbitParameters(abc.ABC):
    semi_major_axis: u.Quantity[u.km]
    """Semi-major axis of the orbit (km)."""

    inclination: u.Quantity[u.deg]
    """Inclination of the orbit (deg)."""

    eccentricity: u.Quantity[u.one]
    """Eccentricity of the orbit (unitless)."""

    argument_of_perigee: u.Quantity[u.deg]
    """Argument of perigee for the orbit (deg)."""

    raan_base: u.Quantity[u.deg]
    """Right Ascension of the Ascending Node (RAAN) of the first plane (deg)."""

    raan_spacing: u.Quantity[u.deg] | None = None
    """Spacing between Right Ascension of Ascending Nodes (deg)."""

    epoch: datetime
    """Epoch for the orbits."""

    @abc.abstractmethod
    def build_orbits(self, n_planes: int, n_per_plane: int) -> list[list[Orbit]]:
        """
        Creates Orbit objects for all satellites in this constellation.

        Returns:
            2D array O where O[p][s] is the Orbit object for the satellite s on plane p.
        """
        ...


@dataclass(frozen=True, kw_only=True)
class TelesatOrbitParameters(OrbitParameters):
    true_anomaly_period: u.Quantity[u.deg]
    """True Anomaly period between satellites in the different planes (deg)."""

    def build_orbits(self, n_planes: int, n_per_plane: int) -> list[list[Orbit]]:
        def _nspmal(
            p: np.ndarray[tuple[int, int], np.dtype[np.int_]],
            s: np.ndarray[tuple[int, int], np.dtype[np.int_]],
        ) -> u.Quantity[u.deg]:
            """
            Nominal Short Period Mean Argument of Latitude (Inclined Orbit).

            Args:
                p: Plane, between 1 and nplanes.
                s: Satellite position (within plane) between 1 and nperplane.
                tap: True Anomaly Period.
            """
            delta_phi0 = _360deg / n_per_plane / 2 + self.true_anomaly_period
            delta_phi = (
                -(s - 1) * _360deg / n_per_plane
                - (p - 1) * _360deg / n_per_plane / 2
                + (p - 1) * delta_phi0
            )
            return cast(u.Quantity[u.deg], delta_phi)

        def true_anomalies() -> u.Quantity[u.deg]:
            """
            Computes true anomalies for all the satellites in this constellation.

            Returns:
                A 2D array nu where nu[p][s] is the true anomaly for satellite s on
                plane p, according to the requirements.
            """
            planes = np.arange(0, n_planes, dtype=int) + 1
            satellites = np.arange(0, n_per_plane, dtype=int) + 1
            planes, satellites = np.meshgrid(planes, satellites)

            planes, satellites = planes.T, satellites.T

            # compute argument of latitude and substract argument of perigee to get true
            # anomaly
            true_anomalies = _nspmal(planes, satellites) - self.argument_of_perigee

            # wrap values between -pi and pi (to avoid warnings later)
            true_anomalies = (true_anomalies + _180deg) % _360deg - _180deg

            return cast(u.Quantity[u.deg], true_anomalies)

        if self.raan_spacing is not None:
            raan_spacing = self.raan_spacing
        else:
            raan_spacing = _360deg / n_planes

        return [
            [
                Orbit.from_classical(
                    attractor=Earth,
                    a=self.semi_major_axis,
                    ecc=self.eccentricity,
                    inc=self.inclination,
                    raan=self.raan_base + raan_spacing * plane_index,
                    argp=self.argument_of_perigee,
                    nu=true_anomaly,
                    epoch=Time(self.epoch),
                )
                for true_anomaly in true_anomalies_per_satellite
            ]
            for plane_index, true_anomalies_per_satellite in enumerate(true_anomalies())
        ]


@dataclass(frozen=True, kw_only=True)
class TrueAnomalyShiftOrbitParameters(OrbitParameters):
    true_anomaly_delta: u.Quantity[u.deg]
    """True Anomaly between sibling satellites subsequent planes."""

    def build_orbits(self, n_planes: int, n_per_plane: int) -> list[list[Orbit]]:
        if self.raan_spacing is not None:
            raan_spacing = self.raan_spacing
        else:
            raan_spacing = _360deg / n_planes

        true_anomaly_spacing = _360deg / n_per_plane

        return [
            [
                Orbit.from_classical(
                    attractor=Earth,
                    a=self.semi_major_axis,
                    ecc=self.eccentricity,
                    inc=self.inclination,
                    raan=self.raan_base + raan_spacing * plane_index,
                    argp=self.argument_of_perigee,
                    nu=self.true_anomaly_delta * plane_index
                    + index * true_anomaly_spacing,
                    epoch=Time(self.epoch),
                )
                for index in range(n_per_plane)
            ]
            for plane_index in range(n_planes)
        ]


@dataclass(frozen=True, kw_only=True)
class WalkerDeltaOrbitParameters(OrbitParameters):
    relative_spacing: int
    """Relative spacing between sibling satellites in subsequent planes."""

    def build_orbits(self, n_planes: int, n_per_plane: int) -> list[list[Orbit]]:
        """
        Creates Orbit objects for all satellites in this constellation.

        Returns:
            2D array O where O[p][s] is the Orbit object for the satellite s on plane p.
        """

        if self.raan_spacing is not None:
            raan_spacing = self.raan_spacing
        else:
            raan_spacing = _360deg / n_planes

        true_anomaly_delta = self.relative_spacing * _360deg / (n_per_plane * n_planes)
        true_anomaly_spacing = _360deg / n_per_plane

        return [
            [
                Orbit.from_classical(
                    attractor=Earth,
                    a=self.semi_major_axis,
                    ecc=self.eccentricity,
                    inc=self.inclination,
                    raan=self.raan_base + raan_spacing * plane_index,
                    argp=self.argument_of_perigee,
                    nu=true_anomaly_delta * plane_index + index * true_anomaly_spacing,
                    epoch=Time(self.epoch),
                )
                for index in range(n_per_plane)
            ]
            for plane_index in range(n_planes)
        ]


def make_constellation(
    name: str, n_planes: int, n_per_plane: int, orbit_parameters: OrbitParameters
) -> Constellation:
    """
    Args:
        name: Name of the constellation.
        n_planes: Number of planes.
        n_per_plane: Number of satellites per plane.
        orbit_parameters: Parameters defining the constellation.
    """
    orbits = orbit_parameters.build_orbits(n_planes, n_per_plane)

    return Constellation(
        id=None,
        name=name,
        planes=[
            Plane(
                index=p_index,
                satellites=[
                    Satellite(id=None, index=s_index, orbit=s_orbit)
                    for s_index, s_orbit in enumerate(p_orbits)
                ],
            )
            for p_index, p_orbits in enumerate(orbits)
        ],
    )
