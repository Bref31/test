from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .constellation import Constellation

_association_table = Table(
    "systems_and_constellations",
    Base.metadata,
    Column("system_id", ForeignKey("systems.id", ondelete="CASCADE")),
    Column("constellation_id", ForeignKey("constellations.id")),
)


class System(Base):
    """
    The user table contains information about users.
    """

    __tablename__ = "systems"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)

    constellations: Mapped[list[Constellation]] = relationship(
        secondary=_association_table
    )
