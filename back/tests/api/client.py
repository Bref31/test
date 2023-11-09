from typing import TypeVar

from fastapi.testclient import TestClient
from httpx._types import QueryParamTypes
from pydantic import BaseModel, TypeAdapter

from tas.dcc.smartlink.api.main import app

CLIENT = TestClient(app)

_T = TypeVar("_T")


def get(model: type[_T], path: str, params: QueryParamTypes | None = None) -> _T:
    response = CLIENT.get(path, params=params)
    content = response.read()
    assert response.status_code == 200, content

    return TypeAdapter(model).validate_json(content)


def post(
    model: type[_T], path: str, data: BaseModel, params: QueryParamTypes | None = None
) -> _T:
    response = CLIENT.post(path, params=params, content=data.model_dump_json())
    content = response.read()
    assert response.status_code == 200, content

    return TypeAdapter(model).validate_json(content)


def delete(path: str, params: QueryParamTypes | None = None) -> None:
    response = CLIENT.delete(path, params=params)
    content = response.read()
    assert response.status_code == 200, content
