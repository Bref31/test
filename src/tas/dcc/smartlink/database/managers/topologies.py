import itertools
from typing import Callable, Sequence, TypeVar

from sqlalchemy.orm import Session

from ... import models
from ..models import Topology, TopologyLink, TopologyLinkGroup
from .base import BaseManager

_Key = TypeVar("_Key")


class TopologyManager(BaseManager[models.Topology, Topology, int]):
    def __init__(self, db: Session, constellation: models.Constellation | None):
        super().__init__(db, Topology, Topology.id, lambda t: t.id)

        self._constellation = constellation
        self._satellites = {}
        if constellation is not None:
            self._satellites = {
                s.id: s for p in constellation.planes for s in p.satellites
            }
            assert None not in self._satellites

    @staticmethod
    def for_constellation(db: Session, constellation_id: int) -> Sequence[Topology]:
        from sqlalchemy import select

        return db.scalars(
            select(Topology).where(Topology.constellation_id == constellation_id)
        ).all()

    @staticmethod
    def make_mapping(
        group: TopologyLinkGroup, key_fn: Callable[[int], _Key]
    ) -> dict[_Key, list[_Key]]:
        """
        Construct a mapping for the given group.

        Args:
            group: Group to construct a Python mapping from.
            key_fn: Key function to apply to origin/destination ID in the links.

        Returns:
            A mapping from origin to destinations.
        """
        return {
            key_fn(origin_id): [key_fn(link.destination_id) for link in links]
            for origin_id, links in itertools.groupby(
                group.links, key=lambda link: link.origin_id
            )
        }

    def convert_to_database(self, model: models.Topology) -> Topology:
        if model.constellation.id is None:
            raise ValueError("cannot store topology for a non-existing constellation")

        return Topology(
            name=model.name,
            constellation_id=model.constellation.id,
            groups=[
                TopologyLinkGroup(
                    name=g_name,
                    links=[
                        TopologyLink(origin_id=origin.id, destination_id=destination.id)
                        for origin in g_links
                        for destination in g_links[origin]
                    ],
                )
                for g_name, g_links in model.neighbors.items()
            ],
        )

    def convert_from_database(self, model: Topology) -> models.Topology:
        if self._constellation is None:
            raise ValueError("cannot load topology without associated constellation")

        return models.Topology(
            id=model.id,
            name=model.name,
            neighbors={
                group.name: TopologyManager.make_mapping(
                    group, key_fn=self._satellites.__getitem__
                )
                for group in model.groups
            },
        )
