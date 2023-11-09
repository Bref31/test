from datetime import timedelta


def timedelta_to_database(dt: timedelta) -> int:
    return round(dt.total_seconds() * 1000)


def timedelta_from_database(dt: int) -> timedelta:
    return timedelta(microseconds=1000 * dt)
