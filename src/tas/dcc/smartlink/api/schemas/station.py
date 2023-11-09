from .base import BaseSchema


class Location(BaseSchema):
    longitude_deg: float
    """Longitude of the station."""

    latitude_deg: float
    """Latitude of the station."""

    height_m: float = 0
    """Height of the station (above sea level)."""


class StationBase(BaseSchema):
    city: str = ""
    """City of the station."""

    country: str = ""
    """Country of the station."""

    location: Location
    """Location of the station."""


class Station(StationBase):
    id: int
    """ID of the station."""


class StationCreate(StationBase):
    pass
