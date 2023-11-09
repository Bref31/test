from typing import Callable, Iterable, TypeVar

_T = TypeVar("_T")
_I = TypeVar("_I")


def by_id(values: Iterable[_T], key: Callable[[_T], _I]) -> dict[_I, _T]:
    if not values:
        return {}

    return {key(v): v for v in values}
