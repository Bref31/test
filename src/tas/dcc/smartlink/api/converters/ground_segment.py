from ...database.models import ground_segment as db_models
from .. import schemas
from .station import station_database_to_schema


def ground_segment_database_to_info(
    ground_segment: db_models.GroundSegment,
) -> schemas.GroundSegmentInfo:
    return schemas.GroundSegmentInfo(
        id=ground_segment.id,
        name=ground_segment.name,
        nb_stations=len(ground_segment.stations),
    )


def ground_segment_database_to_schema(
    ground_segment: db_models.GroundSegment,
) -> schemas.GroundSegment:
    return schemas.GroundSegment(
        id=ground_segment.id,
        name=ground_segment.name,
        stations=[
            station_database_to_schema(station) for station in ground_segment.stations
        ],
    )
