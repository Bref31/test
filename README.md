# SmartLink Backend

## Getting Started

This project requires Python >= 3.10 and [`poetry`](https://python-poetry.org).

Install the project in a virtual environment

```bash
# [optional] activate your virtual environment, otherwise poetry will create its own
. ./venv/bin/activate

# login to Artifactory TDP (required for TAS/DCC internal tools)
poetry config http-basic.artifactory-tdp [MAIL]

# install with poetry
poetry install
```
## Run locally

### 1. Create the database

The backend requires a working database listening on port 3306 on localhost (default
for MySQL / MariaDB).
To start a MariaDB database with docker, simply run:

```bash
cd mariadb
docker compose up -d
```

Note: If you want to use your own database, check the parameters in the compose file.

To populate the database, you can either:

```bash
# (recommended) run the populate script, this is slower than the second option but
# should be up-to-date
cd mariadb
python populate.py

# or, import the database from tests
cat tests/smartlink.sql | \
    docker exec -i tests-db-1 sh -c 'mariadb -usmartlink -psmartlink smartlink'
```

### 2. Start the server

To start the server, simply use `uvicorn`:

```bash
uvicorn tas.dcc.smartlink.api.main:app --reload
```
