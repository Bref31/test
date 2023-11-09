from typing import TypeVar

from fastapi import HTTPException

from ...database.managers.base import Base, BaseManager

_Model = TypeVar("_Model")
_DatabaseModel = TypeVar("_DatabaseModel", bound=Base)
_Identifier = TypeVar("_Identifier")


def http_except_if_not_found(
    manager: BaseManager[_Model, _DatabaseModel, _Identifier],
    identifier: _Identifier,
    name: str,
    status_code: int = 422,
) -> _Model:
    model = manager.load(identifier)

    if model is None:
        raise HTTPException(
            status_code=status_code,
            detail={"message": f"{name} {identifier} not found"},
        )

    return model
