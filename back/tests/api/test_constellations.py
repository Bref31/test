from datetime import datetime, timezone

from tas.dcc.smartlink.api.schemas.constellation import (
    Constellation,
    ConstellationCreate,
    ConstellationInfo,
    TelesatOrbitParameters,
)

from .client import get, post


def test_list_constellations():
    systems = get(list[ConstellationInfo], "/constellations/")
    assert systems == [
        ConstellationInfo(id=1, name="inclined", n_planes=20, n_per_plane=11),
        ConstellationInfo(id=2, name="polar", n_planes=6, n_per_plane=13),
    ]


def test_get_constellation():
    constellation = get(Constellation, "/constellations/1")
    assert constellation.id == 1
    assert constellation.name == "inclined"
    assert len(constellation.satellites) == 20
    assert all(len(plane) == 11 for plane in constellation.satellites)


def test_create_constellation():
    constellation = post(
        Constellation,
        "/constellations/create",
        ConstellationCreate(
            name="test-constellation",
            n_planes=2,
            n_per_plane=10,
            orbit_parameters=TelesatOrbitParameters(
                mode="telesat",
                semi_major_axis_km=7000,
                inclination_deg=53,
                eccentricity=0.001,
                argument_of_perigee_deg=78,
                true_anomaly_period_deg=40,
                raan_base_deg=12,
                raan_spacing_deg=None,
                epoch=datetime(2023, 7, 1),
            ),
        ),
    )
    assert len(constellation.satellites) == 2
    assert all(len(plane) == 10 for plane in constellation.satellites)
    assert constellation.name == "test-constellation"

    for i_plane, plane in enumerate(constellation.satellites):
        for i_satellite, satellite in enumerate(plane):
            assert satellite.orbit.semi_major_axis_km == 7000
            assert satellite.orbit.inclination_deg == 53
            assert satellite.orbit.eccentricity == 0.001
            assert satellite.orbit.raan_deg == 12 + i_plane * 180
            assert satellite.orbit.epoch == datetime(2023, 7, 1, tzinfo=timezone.utc)

            # values are extracted from the builder code since the goal here is not
            # to test the builder computation but rather that the proper values are
            # stored and returned by the API
            assert (
                satellite.orbit.true_anomaly_deg
                == ((-i_satellite * 36 + i_plane * 40) + 102) % 360 - 180
            )
