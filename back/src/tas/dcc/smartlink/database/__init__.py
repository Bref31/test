from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

engine = create_engine(
    "mariadb+mariadbconnector://smartlink:smartlink@localhost:3306/smartlink",
    echo=False,
)
SessionLocal = sessionmaker(
    autocommit=False, expire_on_commit=False, autoflush=False, bind=engine
)


def get_database():
    """
    Open a database connection and returns it as a generator. Should only be used as
    a FastAPI dependency:

    ```
    db: AsyncSession = Depends(get_database)
    ```
    """
    db: Session = SessionLocal()
    yield db
    db.close()
