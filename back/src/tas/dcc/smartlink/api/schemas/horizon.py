from datetime import datetime, timedelta

from .base import BaseSchema


class Horizon(BaseSchema):
    start: datetime
    """Start of the horizon."""

    end: datetime
    """End of the horizon."""

    step: timedelta
    """Step of the horizon, as a """
