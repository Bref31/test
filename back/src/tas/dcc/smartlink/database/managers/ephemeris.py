from datetime import datetime
from typing import Iterable, cast

from astropy.units import Quantity, km
from sqlalchemy import select
from sqlalchemy.orm import Session

from tas.dcc.orbits.coordinates import ITRS
from tas.dcc.orbits.utils.astropy import astropy_timerange
from tas.dcc.orbits.utils.units import km_per_s

from ... import models
from ...utils.time import ensure_utc
from ..models.ephemeris import Ephemeris
from .base import BaseManager
from .constellations import SatelliteManager
from .utils import timedelta_from_database, timedelta_to_database

_POS_Q = km
_SPE_Q = km_per_s
_NP_DTYPE = "<f8"


def _db2py(e: Ephemeris, h: models.Horizon | None = None) -> ITRS:
    import numpy as np

    data = np.frombuffer(e.data, dtype=_NP_DTYPE).reshape((-1, 6), order="C")

    # need to extract the range
    if h is not None:
        start, end, step = h.start, h.end, h.step

        idx_start = (h.start - ensure_utc(e.start)) // h.step
        idx_end = idx_start + (h.end - h.start) // h.step

        data = data[idx_start : idx_end + 1, :]
    else:
        start, end, step = e.start, e.end, timedelta_from_database(e.step)

    return ITRS(
        # ugly, maybe there is a better way?
        time=astropy_timerange(start, end, step),
        x=Quantity(data[:, 0], _POS_Q),
        y=Quantity(data[:, 1], _POS_Q),
        z=Quantity(data[:, 2], _POS_Q),
        d_x=Quantity(data[:, 3], _SPE_Q),
        d_y=Quantity(data[:, 4], _SPE_Q),
        d_z=Quantity(data[:, 5], _SPE_Q),
    )


def _py2db(e: models.Ephemeris) -> bytes:
    import numpy as np

    data = np.ascontiguousarray(
        np.stack(
            [
                e.itrs.x.to_value(_POS_Q),
                e.itrs.y.to_value(_POS_Q),
                e.itrs.z.to_value(_POS_Q),
                e.itrs.d_x.to_value(_SPE_Q),
                e.itrs.d_y.to_value(_SPE_Q),
                e.itrs.d_z.to_value(_SPE_Q),
            ]
        ).T.astype(_NP_DTYPE)
    )

    return np.copy(data, order="C").tobytes()  # type: ignore


class EphemerisManager(BaseManager[models.Ephemeris, Ephemeris, int]):
    # does not extends BaseManager currently because the primary key is a 4-tuples, so
    # it does not work properly

    def __init__(self, db: Session):
        super().__init__(db, Ephemeris, Ephemeris.id, lambda e: e.id)

        self._satellite_manager = SatelliteManager(db)

    def horizons(self, satellite_id: int) -> list[models.Horizon]:
        """
        Retrieve the available horizons for the given satellite ID.

        Args:
            satellite_id: Satellite to retrieve horizons for.

        Returns:
            The list of already computed (in the database) horizons.
        """

        return [
            models.Horizon(
                start=ensure_utc(start),
                end=ensure_utc(end),
                step=timedelta_from_database(step),
            )
            for start, end, step in cast(
                Iterable[tuple[datetime, datetime, int]],
                self._db.execute(
                    select(Ephemeris)
                    .where(Ephemeris.satellite_id == satellite_id)
                    .with_only_columns(Ephemeris.start, Ephemeris.end, Ephemeris.step)
                ).all(),
            )
        ]

    def convert_from_database(self, model: Ephemeris) -> models.Ephemeris:
        return models.Ephemeris(
            id=model.id,
            satellite=self._satellite_manager.convert_from_database(model.satellite),
            horizon=models.Horizon(
                start=ensure_utc(model.start),
                end=ensure_utc(model.end),
                step=timedelta_from_database(model.step),
            ),
            itrs=_db2py(model, None),
        )

    def convert_to_database(self, model: models.Ephemeris) -> Ephemeris:
        return Ephemeris(
            satellite=self._satellite_manager.store_or_load(
                model.satellite, commit=False
            ),
            start=ensure_utc(model.horizon.start),
            end=ensure_utc(model.horizon.end),
            step=timedelta_to_database(model.horizon.step),
            data=_py2db(model),
        )

    def extract(
        self, satellite: models.Satellite, horizon: models.Horizon, shrink: bool = True
    ) -> models.Ephemeris | None:
        """
        Retrieve appropriate ephemeris for the given satellite over the given horizon,
        using entries which are broader than the given horizon if necessary.

        This function can return a subset of an existing ephemeris from the database.

        Args:
            satellite: Satellite to retrieve ephemeris from (must be from the database).
            horizon: Horizon to retrieve ephemeris for.
            shrink: Whether the returned ephemeris should be over the input horizon
                (True) or over the database horizon (False).

        Returns:
            Convert ephemeris from the database, if found, or None.
        """

        ephemeris = self._db.scalars(
            select(Ephemeris).filter(
                Ephemeris.satellite_id == satellite.id,
                Ephemeris.start <= ensure_utc(horizon.start),
                Ephemeris.end >= ensure_utc(horizon.end),
                Ephemeris.step == timedelta_to_database(horizon.step),
            )
        ).first()

        if not ephemeris:
            return None

        if shrink:
            return models.Ephemeris(
                id=ephemeris.id,
                satellite=satellite,
                horizon=horizon,
                itrs=_db2py(ephemeris, horizon),
            )
        else:
            return self.convert_from_database(ephemeris)
