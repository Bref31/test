from tas.dcc.smartlink.api.schemas.system import System, SystemCreate, SystemInfo

from .client import delete, get, post


def test_list_systems():
    systems = get(list[SystemInfo], "/systems/")
    assert systems == [SystemInfo(id=1, name="telesat-2021")]


def test_get_system():
    system = get(System, "/systems/1")
    assert system.id == 1
    assert system.name == "telesat-2021"
    assert len(system.constellations) == 2
    assert system.constellations[0].id == 1
    assert system.constellations[1].id == 2


def test_create_then_delete_system():
    system = post(
        System,
        "/systems/create",
        SystemCreate(name="telesat-2021-inclined", constellation_ids=[1]),
    )
    assert system.id == 2
    assert len(system.constellations) == 1
    assert system.constellations[0].id == 1

    systems = get(list[SystemInfo], "/systems/")
    systems = sorted(systems, key=lambda s: s.id)
    assert systems == [
        SystemInfo(id=1, name="telesat-2021"),
        SystemInfo(id=2, name="telesat-2021-inclined"),
    ]

    delete("/systems/delete/2")
    systems = get(list[SystemInfo], "/systems/")
    assert systems == [SystemInfo(id=1, name="telesat-2021")]
