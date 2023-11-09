from typing import cast

from ... import models
from .. import schemas


def eligibility_model_to_schema(eligibility: models.Eligibility) -> schemas.Eligibility:
    return schemas.Eligibility(
        satellite_id=cast(int, eligibility.satellite.id),
        station_id=cast(int, eligibility.station.id),
        start=eligibility.start,
        end=eligibility.end,
    )
