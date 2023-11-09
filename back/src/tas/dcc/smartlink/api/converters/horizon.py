from ... import models
from ...utils.time import ensure_utc
from .. import schemas

# note: both models are identical except that one is a Pydantic model and the other one
# a dataclass, so conversion from dataclass to Pydantic is by default (since we have
# proper model configs)


def horizon_schema_to_model(horizon: schemas.Horizon) -> models.Horizon:
    """
    Convert an API horizon model to a smartlink Horizon model.

    Args:
        horizon: Model to convert.

    Returns:
        The converted model.
    """
    return models.Horizon(
        start=ensure_utc(horizon.start), end=ensure_utc(horizon.end), step=horizon.step
    )
