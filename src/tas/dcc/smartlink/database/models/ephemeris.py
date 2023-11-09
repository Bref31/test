from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, LargeBinary, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .constellation import Satellite


class Ephemeris(Base):
    __tablename__ = "ephemeris"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    satellite_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("satellites.id", ondelete="CASCADE"), nullable=False
    )
    satellite: Mapped[Satellite] = relationship()

    start: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    step: Mapped[int] = mapped_column(Integer, nullable=False)
    """Step of the ephemeris, in milliseconds."""

    data: Mapped[bytes] = mapped_column(
        LargeBinary(length=(2**32) - 1), nullable=False
    )
    """Binary data, as IEEE 64-bts float of shape Nx6, where N is the number of time
    steps, and the 6 components are x, y, z and vx, vy, vz. Positions are stored in
    kilometers and speeds in kilometers per second."""

    __table_args__ = (UniqueConstraint(satellite_id, start, end, step),)
