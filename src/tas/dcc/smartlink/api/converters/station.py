from tas.dcc.orbits.models import GroundLocation

from ... import models
from ...database.models import ground_segment as db_models
from .. import schemas


def station_database_to_schema(station: db_models.Station) -> schemas.Station:
    return schemas.Station(
        id=station.id,
        city=station.city,
        country=station.country,
        location=schemas.Location(
            longitude_deg=station.longitude,
            latitude_deg=station.latitude,
            height_m=station.height,
        ),
    )


def station_schema_to_model(
    station: schemas.Station | schemas.StationCreate,
) -> models.Station:
    import astropy.units as u

    return models.Station(
        id=station.id if isinstance(station, schemas.Station) else None,
        city=station.city,
        country=station.country,
        location=GroundLocation(
            longitude=u.Quantity(station.location.longitude_deg, u.deg),
            latitude=u.Quantity(station.location.latitude_deg, u.deg),
            height=u.Quantity(station.location.height_m, u.m),
        ),
    )
