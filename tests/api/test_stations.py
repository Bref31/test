from tas.dcc.smartlink.api.schemas.ground_segment import (
    GroundSegment,
    GroundSegmentCreate,
    GroundSegmentInfo,
)
from tas.dcc.smartlink.api.schemas.station import Location, Station, StationCreate

from .client import get, post


def test_list_stations():
    stations = get(list[Station], "/stations/")
    assert len(stations) == 35


def test_list_ground_segments():
    ground_segments = get(list[GroundSegmentInfo], "/ground-segments/")
    assert len(ground_segments) == 1
    assert ground_segments[0].name == "default-ground-segment"
    assert ground_segments[0].nb_stations == 35


def test_get_ground_segment():
    ground_segment = get(GroundSegment, "/ground-segments/1")
    assert ground_segment.name == "default-ground-segment"
    assert len(ground_segment.stations) == 35


def test_create_ground_segment():
    stations = get(list[Station], "/stations/")
    assert len(stations) == 35

    # note: this generated a warning but is fine, probably linked to
    # https://github.com/pydantic/pydantic/issues/6422
    ground_segment = post(
        GroundSegment,
        "/ground-segments/create",
        GroundSegmentCreate(
            name="test-ground-segment",
            stations=[
                stations[1],
                stations[4],
                StationCreate(
                    city="the-city",
                    country="the-country",
                    location=Location(longitude_deg=3, latitude_deg=43),
                ),
                stations[32],
                StationCreate(
                    city="the-other-city",
                    country="the-other-country",
                    location=Location(longitude_deg=48, latitude_deg=-12),
                ),
            ],
        ),
    )
    assert ground_segment.name == "test-ground-segment"
    assert len(ground_segment.stations) == 5

    stations = get(list[Station], "/stations/")
    assert len(stations) == 37
