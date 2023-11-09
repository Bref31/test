from sqlalchemy import Double, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class GroupGroundSegmentAssociation(Base):
    __tablename__ = "stations_and_ground_segments"

    station_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("stations.id"), primary_key=True
    )
    ground_segment_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("ground_segments.id", ondelete="CASCADE"),
        primary_key=True,
    )


class Station(Base):
    __tablename__ = "stations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    city: Mapped[str] = mapped_column(String(256), nullable=False, default="")
    country: Mapped[str] = mapped_column(String(256), nullable=False, default="")

    longitude: Mapped[float] = mapped_column(Double, nullable=False)
    latitude: Mapped[float] = mapped_column(Double, nullable=False)
    height: Mapped[float] = mapped_column(Double, nullable=False, default=0)


class GroundSegment(Base):
    __tablename__ = "ground_segments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False, unique=True)

    stations: Mapped[list[Station]] = relationship(
        secondary="stations_and_ground_segments"
    )
