import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

import tas.dcc.smartlink.database as database

_is_ci = os.getenv("CI") == "true"

_host = "mariadb" if _is_ci else "localhost"
_port = 3306 if _is_ci else 3307

database.engine = create_engine(
    f"mariadb+mariadbconnector://smartlink:smartlink@{_host}:{_port}/smartlink"
)
database.SessionLocal = sessionmaker(
    autocommit=False, expire_on_commit=False, autoflush=False, bind=database.engine
)

if not _is_ci:
    with database.engine.connect() as conn:
        conn.execute(text("CALL INITIALIZE_DATABASE();"))
