from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    VARBINARY,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .ephemeris import Ephemeris
from .ground_segment import Station


class Eligibility(Base):
    __tablename__ = "eligibilities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    group_id: Mapped[int] = mapped_column(
        ForeignKey("eligibility_groups.id", ondelete="CASCADE")
    )
    group: Mapped[EligibilityGroup] = relationship(back_populates="eligibilities")

    start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class EligibilityGroup(Base):

    """
    Represent a group of eligibility.
    """

    __tablename__ = "eligibility_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    ephemeris_id: Mapped[int] = mapped_column(
        ForeignKey("ephemeris.id", ondelete="CASCADE"), nullable=False
    )
    ephemeris: Mapped[Ephemeris] = relationship()

    station_id: Mapped[int] = mapped_column(
        ForeignKey("stations.id", ondelete="CASCADE"), nullable=False
    )
    station: Mapped[Station] = relationship()

    mask: Mapped[bytes] = mapped_column(VARBINARY(length=2048))
    step: Mapped[int] = mapped_column(Integer, nullable=False)
    backend: Mapped[str] = mapped_column(String(64), nullable=False)

    eligibilities: Mapped[list[Eligibility]] = relationship(back_populates="group")

    __table_args__ = (UniqueConstraint(ephemeris_id, station_id, mask, step, backend),)
