from typing import Any, Literal, cast

import numpy as np
from astropy import units as u

from ..schemas.utils import FloatDataFormat, IntDataFormat


def _make_dtype(
    type: Literal["int8", "int16", "int32", "int64", "float16", "float32", "float64"],
    endianess: Literal["little", "big"],
) -> np.dtype[Any]:
    return np.dtype(type).newbyteorder(endianess)  # type: ignore


def numpy_to_schema(
    value: np.ndarray[tuple[int, ...], Any], format: FloatDataFormat | IntDataFormat
) -> bytes:
    """
    Convert a numpy array to a base-64 encoded byte array according to the given format.

    Args:
        value: Value to convert.
        format: Format to convert to.

    Returns:
        A base64-encoded array containing the given numpy array, according to the
        specified format.
    """

    import base64

    v_bytes = value.astype(_make_dtype(format.type, format.endianess)).tobytes(
        order=format.order
    )

    if format.compress == "zlib":
        import zlib

        v_bytes = zlib.compress(v_bytes)
    elif format.compress == "gzip":
        import gzip

        v_bytes = gzip.compress(v_bytes)

    return base64.b64encode(v_bytes)


def quantity_to_schema(
    value: u.Quantity, unit: u.UnitBase, format: FloatDataFormat
) -> bytes:
    """
    Convert a quantity to a base64 encoded string suitable for an API response.

    Args:
        value: Quantity to convert.
        unit: Unit to convert to before encoding.
        format: Format to use for encoding.

    Returns:
        A base64-encoded string containing the encoded value according to format.
    """
    return numpy_to_schema(
        cast(np.ndarray[tuple[int, ...], Any], value.to_value(unit)), format
    )
