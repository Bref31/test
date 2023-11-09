import base64
from datetime import datetime, timedelta, timezone

import numpy as np
from pytest_unordered import unordered

from tas.dcc.smartlink.api.schemas.ephemeris import (
    EphemerisRequest,
    EphemerisResponse,
    Horizon,
)

from .client import get, post


def test_list_ephemeris():
    assert get(list[Horizon], "/ephemeris/list/satellite/1") == [
        Horizon(
            start=datetime(2023, 7, 1, tzinfo=timezone.utc),
            end=datetime(2023, 7, 1, 2, tzinfo=timezone.utc),
            step=timedelta(seconds=30),
        )
    ]
    assert get(list[Horizon], "/ephemeris/list/constellation/1") == [
        Horizon(
            start=datetime(2023, 7, 1, tzinfo=timezone.utc),
            end=datetime(2023, 7, 1, 2, tzinfo=timezone.utc),
            step=timedelta(seconds=30),
        )
    ]


def test_compute():
    def convert(data: bytes) -> np.ndarray[tuple[int], np.dtype[np.float32]]:
        return np.frombuffer(base64.b64decode(data), dtype=np.float32)

    ephemeris = post(
        EphemerisResponse,
        "/ephemeris/compute",
        EphemerisRequest(
            satellite_ids=[1, 12],
            horizon=Horizon(
                start=datetime(2023, 7, 1, tzinfo=timezone.utc),
                end=datetime(2023, 7, 1, 2, tzinfo=timezone.utc),
                step=timedelta(seconds=30),
            ),
            velocity=True,
        ),
    )

    assert set(ephemeris.ephemeris.keys()) == {1, 12}

    # simple check the distance between satellite and center of earth
    x, y, z = (
        convert(ephemeris.ephemeris[1].position.x_km),
        convert(ephemeris.ephemeris[1].position.y_km),
        convert(ephemeris.ephemeris[1].position.z_km),
    )
    assert x.shape == (240,)
    assert (
        np.abs(np.sqrt(x**2 + y**2 + z**2) - 7703.137 * np.ones_like(x)).max()
        < 100
    )

    # sub-query
    ephemeris = post(
        EphemerisResponse,
        "/ephemeris/compute",
        EphemerisRequest(
            satellite_ids=[1, 12],
            horizon=Horizon(
                start=datetime(2023, 7, 1, 0, 30, tzinfo=timezone.utc),
                end=datetime(2023, 7, 1, 1, 30, tzinfo=timezone.utc),
                step=timedelta(seconds=30),
            ),
            velocity=True,
        ),
    )
    x = convert(ephemeris.ephemeris[1].position.x_km)
    assert x.shape == (121,)

    # check that now new horizon was created
    horizons = get(list[Horizon], "/ephemeris/list/satellite/1")
    assert horizons == unordered(
        [
            Horizon(
                start=datetime(2023, 7, 1, tzinfo=timezone.utc),
                end=datetime(2023, 7, 1, 2, tzinfo=timezone.utc),
                step=timedelta(seconds=30),
            )
        ]
    )

    # trigger a new compute
    ephemeris = post(
        EphemerisResponse,
        "/ephemeris/compute",
        EphemerisRequest(
            satellite_ids=[1, 12],
            horizon=Horizon(
                start=datetime(2023, 7, 1, tzinfo=timezone.utc),
                end=datetime(2023, 7, 1, 0, 10, tzinfo=timezone.utc),
                step=timedelta(seconds=10),
            ),
            velocity=True,
        ),
    )
    assert ephemeris.horizon == Horizon(
        start=datetime(2023, 7, 1, tzinfo=timezone.utc),
        end=datetime(2023, 7, 1, 0, 10, tzinfo=timezone.utc),
        step=timedelta(seconds=10),
    )

    horizons = get(list[Horizon], "/ephemeris/list/satellite/1")
    assert horizons == unordered(
        [
            Horizon(
                start=datetime(2023, 7, 1, tzinfo=timezone.utc),
                end=datetime(2023, 7, 1, 2, tzinfo=timezone.utc),
                step=timedelta(seconds=30),
            ),
            Horizon(
                start=datetime(2023, 7, 1, tzinfo=timezone.utc),
                end=datetime(2023, 7, 1, 0, 10, tzinfo=timezone.utc),
                step=timedelta(seconds=10),
            ),
        ]
    )
