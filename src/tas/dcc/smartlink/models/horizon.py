from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass(frozen=True)
class Horizon:
    start: datetime
    """Start time of the horizon."""

    end: datetime
    """End time of the horizon."""

    step: timedelta
    """Step of the horizon."""
