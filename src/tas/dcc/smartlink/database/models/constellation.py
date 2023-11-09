from datetime import datetime

from sqlalchemy import DateTime, Double, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class SatelliteOrbit(Base):
    __tablename__ = "satellite_orbits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    epoch: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    """Epoch of the orbit."""

    semi_major_axis: Mapped[float] = mapped_column(Double, nullable=False)
    """Semi-major axis in km."""

    eccentricity: Mapped[float] = mapped_column(Double, nullable=False)
    """Eccentricity."""

    inclination: Mapped[float] = mapped_column(Double, nullable=False)
    """Inclination in degrees."""

    argument_of_perigee: Mapped[float] = mapped_column(Double, nullable=False)
    """Argument of perigee of the orbit in degrees."""

    true_anomaly: Mapped[float] = mapped_column(Double, nullable=False)
    """True anomaly of the orbit in degrees."""

    raan: Mapped[float] = mapped_column(Double, nullable=False)
    """Right Ascension of the Ascending Node (RAAN) in degrees."""


class ConstellationParameters(Base):
    __tablename__ = "constellation_parameters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    n_planes: Mapped[int] = mapped_column(Integer, nullable=False)
    n_per_plane: Mapped[int] = mapped_column(Integer, nullable=False)

    epoch: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    """Epoch of the orbit."""

    semi_major_axis: Mapped[float] = mapped_column(Double, nullable=False)
    """Semi-major axis in km."""

    eccentricity: Mapped[float] = mapped_column(Double, nullable=False)
    """Eccentricity."""

    inclination: Mapped[float] = mapped_column(Double, nullable=False)
    """Inclination in degrees."""

    argument_of_perigee: Mapped[float] = mapped_column(Double, nullable=False)
    """Argument of perigee of the orbit in degrees."""

    true_anomaly_period: Mapped[float] = mapped_column(Double, nullable=False)
    """True anomaly period in degrees."""

    raan_base: Mapped[float] = mapped_column(Double, nullable=False)
    """Right Ascension of the Ascending Node (RAAN) of the first plane in degrees."""

    raan_spacing: Mapped[float] = mapped_column(Double, nullable=False)
    """Spacing between RAAN of consecutive plane, in degrees."""


class Satellite(Base):
    __tablename__ = "satellites"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    index: Mapped[int] = mapped_column(Integer, nullable=False)
    """Index of the satellite in the plane."""

    plane_id: Mapped[int] = mapped_column(ForeignKey("planes.id", ondelete="CASCADE"))

    orbit_id: Mapped[int] = mapped_column(
        ForeignKey("satellite_orbits.id", ondelete="CASCADE")
    )
    orbit: Mapped[SatelliteOrbit] = relationship()


class Plane(Base):
    __tablename__ = "planes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    index: Mapped[int] = mapped_column(Integer, nullable=False)
    """Index of the plane."""

    constellation_id: Mapped[int] = mapped_column(
        ForeignKey("constellations.id", ondelete="CASCADE")
    )
    satellites: Mapped[list[Satellite]] = relationship(collection_class=list)


class Constellation(Base):
    __tablename__ = "constellations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)

    parameters_id: Mapped[int] = mapped_column(
        ForeignKey("constellation_parameters.id"), nullable=True
    )
    parameters: Mapped[ConstellationParameters | None] = relationship()

    planes: Mapped[list[Plane]] = relationship(collection_class=list)
