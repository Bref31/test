from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .constellation import Constellation, Satellite


class TopologyLink(Base):
    __tablename__ = "topology_links"

    group_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("topology_groups.id", ondelete="CASCADE"), primary_key=True
    )

    origin_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("satellites.id", ondelete="CASCADE"), primary_key=True
    )
    origin: Mapped[Satellite] = relationship(foreign_keys=[origin_id])

    destination_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("satellites.id", ondelete="CASCADE"), primary_key=True
    )
    destination: Mapped[Satellite] = relationship(foreign_keys=[destination_id])


class TopologyLinkGroup(Base):
    __tablename__ = "topology_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=False)

    topology_id: Mapped[int] = mapped_column(
        ForeignKey("topologies.id", ondelete="CASCADE")
    )

    links: Mapped[list[TopologyLink]] = relationship(collection_class=list)


class Topology(Base):
    __tablename__ = "topologies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, unique=True)

    constellation_id: Mapped[int] = mapped_column(
        ForeignKey("constellations.id", ondelete="CASCADE")
    )
    constellation: Mapped[Constellation] = relationship()

    groups: Mapped[list[TopologyLinkGroup]] = relationship(collection_class=list)
