from fastapi import FastAPI

from .routers import (
    constellations,
    eligibilities,
    ephemeris,
    ground_segments,
    stations,
    systems,
    topologies,
)

app = FastAPI()

app.include_router(router=systems.router)
app.include_router(router=constellations.router)
app.include_router(router=topologies.router)
app.include_router(router=ephemeris.router)
app.include_router(router=stations.router)
app.include_router(router=ground_segments.router)
app.include_router(router=eligibilities.router)
