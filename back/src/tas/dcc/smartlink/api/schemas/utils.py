from typing import Literal

from .base import BaseSchema

"""
Provides schema to encode data array as proper API types. The final array is always
base64-encoded, but the underlying bytes depends on the format used.

To decode the array from Javascript, one can use (as an example):

    new Float32Array(Uint8Array.from(atob(blob), c => c.charCodeAt(0)).buffer)

Where `blob` is the encoded array (Float32Array should be changed to the appropriate
requested type).

This only works for non-compressed format (default), and if the endianess of the client
is 'little' (should be the case, most of the time).
If the endianess is not 'little', the easiest way to deal with it is to send the
required endianess in the request to the server since endianess conversion is much
easier on the server-side.

If the data is compressed, one simply has to use an appropriate frontend library, e.g.,
pako (https://github.com/nodeca/pako).

    new Float32Array(
        pako.inflate(Uint8Array.from(atob(blob), c => c.charCodeAt(0))
    ).buffer)

"""


class _DataFormat(BaseSchema):
    endianess: Literal["little", "big"] = "little"
    """Endianess to use."""

    order: Literal["C", "F"] = "C"
    """Memory order of the data."""

    compress: Literal["gzip", "zlib"] | None = None
    """Whether data are compressed or not."""


class IntDataFormat(_DataFormat):
    type: Literal["int8", "int32", "int64"] = "int32"


class FloatDataFormat(_DataFormat):
    type: Literal["float16", "float32", "float64"] = "float32"
