from __future__ import annotations

from abc import abstractmethod
from typing import Any, Callable, Generic, Literal, Sequence, Type, TypeVar, overload

from sqlalchemy import delete, select
from sqlalchemy.orm import Mapped, Session

from ..models.base import Base

_Model = TypeVar("_Model")
_DatabaseModel = TypeVar("_DatabaseModel", bound=Base)
_Identifier = TypeVar("_Identifier")

_T = TypeVar("_T")


class BaseManager(Generic[_Model, _DatabaseModel, _Identifier]):

    """
    Base class for all database manager. A database manager exposes useful functions
    to create, update and/or delete entries in a table of the database.
    """

    def __init__(
        self,
        db: Session,
        model: Type[_DatabaseModel],
        id_field: Mapped[_Identifier],
        model_id: Callable[[_Model], _Identifier | None],
    ):
        """
        Args:
            db: The database session to use for requests.
            model: The model corresponding to the table to edit.
            id_field: The column used to identify entry.
        """
        self._db = db
        self._model = model
        self._id_field = id_field
        self._model_id = model_id

    @overload
    def by(self, column: Mapped[_T], value: _T) -> _DatabaseModel | None:
        ...

    @overload
    def by(
        self, column: tuple[Mapped[Any], ...], value: tuple[Any, ...]
    ) -> _DatabaseModel | None:
        ...

    def by(
        self, column: Mapped[_T] | tuple[Mapped[Any], ...], value: _T | tuple[Any, ...]
    ) -> _DatabaseModel | None:
        """
        Retrieve the entry from the database with the given column matching.

        Args:
            column: Column to use for matching.
            value: Value to look for.

        Returns:
            The first entry found in the database with `column` equals to `value`, or
            None if no such entry exists.
        """
        if not isinstance(column, tuple):
            column = (column,)

        if not isinstance(value, tuple):
            value = (value,)

        assert len(value) == len(column)

        return self._db.scalars(
            select(self._model).filter(*(c == v for c, v in zip(column, value)))
        ).first()

    def by_id(self, id: _Identifier) -> _DatabaseModel | None:
        """
        Retrieve the entry with the given ID.

        Args:
            id: ID of the entry to retrieve.

        Returns:
            The database entry with the given ID, or None if no such entry exists.
        """
        return self.by(self._id_field, id)

    @overload
    def all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
        convert: Literal[False] = False,
    ) -> Sequence[_DatabaseModel]:
        ...

    @overload
    def all(
        self,
        *,
        offset: int = 0,
        limit: int | None = None,
        convert: Literal[True] = True,
    ) -> Sequence[_Model]:
        ...

    def all(
        self, *, offset: int = 0, limit: int | None = None, convert: bool = True
    ) -> Sequence[_DatabaseModel] | Sequence[_Model]:
        """
        List all entries from the given model.

        Args:
            offset: Offset to start listing from.
            limit: Maximum number of entries to return.

        Returns:
            The list of entries from the underlying model.
        """
        query = select(self._model).offset(offset)

        if limit is not None:
            query = query.limit(limit)

        db_models = self._db.scalars(query).all()

        if not convert:
            return db_models

        return [self.convert_from_database(m) for m in db_models]

    @abstractmethod
    def convert_to_database(self, model: _Model) -> _DatabaseModel:
        """
        Convert the given model to a database model.

        Args:
            model: Model to convert.

        Returns:
            The converted model.
        """

    @abstractmethod
    def convert_from_database(self, model: _DatabaseModel) -> _Model:
        """
        Create a model frm a database entry.

        Args:
            model: Database entry to convert.

        Returns:
            The converted model.
        """

    def store(self, model: _Model, commit: bool = True) -> _DatabaseModel:
        """
        Store the given model in the database and return the corresponding database
        entry.

        Args:
            model: Model to store.

        Returns:
            The database entry corresponding to the model.
        """
        db_model = self.convert_to_database(model)
        self._db.add(db_model)
        if commit:
            self._db.commit()
        return db_model

    @overload
    def load(self, id: _Identifier, convert: Literal[True] = True) -> _Model | None:
        ...

    @overload
    def load(
        self, id: _Identifier, convert: Literal[False] = False
    ) -> _DatabaseModel | None:
        ...

    def load(
        self, id: _Identifier, convert: bool = True
    ) -> _Model | _DatabaseModel | None:
        """
        Load the entry with the given id from the database.

        Args:
            id: ID of the entry to load.
            convert: True (default) to convert the database entry to a model, False
                to directly return the entry.

        Returns:
            The model from the database (convert or not), or None if no model exists
            with the given ID.
        """
        db_model = self.by_id(id)

        if db_model is None:
            return None

        if not convert:
            return db_model

        return self.convert_from_database(db_model)

    def store_or_load(self, model: _Model, commit: bool = True) -> _DatabaseModel:
        """
        Check if the given model has a corresponding entry in the database, if it does,
        returns the entry, otherwise create a new entry and return it.

        Args:
            model: Model to store or load.
            commit: Whether or not to commit change if the object was stored.

        Returns:
            The entry corresponding to the model from the database.
        """
        id = self._model_id(model)

        if id is None:
            return self.store(model, commit=commit)

        db_model = self.by_id(id)

        if db_model is None:
            return self.store(model, commit=commit)

        return db_model

    def delete(self, id: _Identifier) -> _DatabaseModel | None:
        """
        Delete the entry with the given ID.

        Since the entry is deleted before being returned, trying to access lazy-loaded
        attributes will fail.

        Args:
            id: ID of the entry to delete.

        Returns:
            The deleted entry, or None if no such entry exists.
        """

        entry = self.by_id(id)

        if entry is None:
            return None

        self._db.execute(delete(self._model).where(self._id_field == id))
        self._db.commit()

        return entry
