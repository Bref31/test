from src.tas.dcc.smartlink.api import EphemerisInfos, GroundSegmentInfos, SystemInfos
from src.tas.dcc.smartlink.compute import (
    CelestEligibilityComputation,
    ElevationMask,
    EligibilityComputationParameters,
)
from src.tas.dcc.smartlink.converters import (
    StationConverter,
    SystemConverter,
    SystemEphemerisConverter,
)

# System.
system_converter = SystemConverter(need_database=True)
system_list_infos = [
    SystemInfos(
        id=system_converter.id_to_string(id=document["_id"]), name=document["name"]
    )
    for document in system_converter.tables["System"].find({}, {"_id": 1, "name": 1})
]
system_id = system_list_infos[0].id
system = system_converter.system_from_database(
    id=system_converter.id_from_string(id=system_id)
)
system_converter.client.close()

# Ephemeris.
system_ephemeris_converter = SystemEphemerisConverter(need_database=True)
documents = system_ephemeris_converter.tables["SystemEphemeris"].find(
    {"system": system_id}, {}
)
horizon = system_ephemeris_converter.horizon_from_database(
    id=system_ephemeris_converter.id_from_string(documents[0]["horizon"])
)
system_ephemeris_list_infos = [
    EphemerisInfos(
        id=system_ephemeris_converter.id_to_string(id=document["_id"]),
        horizon=system_ephemeris_converter.horizon_to_server(
            horizon=system_ephemeris_converter.horizon_from_database(
                id=system_ephemeris_converter.id_from_string(document["horizon"])
            )
        ),
    )
    for document in documents
]
system_ephemeris_id = system_ephemeris_list_infos[0].id
system_ephemeris = system_ephemeris_converter.system_ephemeris_from_database(
    id=system_ephemeris_converter.id_from_string(id=system_ephemeris_id)
)
system_ephemeris_converter.client.close()

# Stations.
station_converter = StationConverter(need_database=True)
ground_segment_list_infos = [
    GroundSegmentInfos(
        id=station_converter.id_to_string(document["_id"]), name=document["name"]
    )
    for document in station_converter.tables["GroundSegment"].find({}, {"_id", "name"})
]
ground_segment_id = ground_segment_list_infos[0].id
ground_segment = station_converter.ground_segment_from_database(
    id=station_converter.id_from_string(id=ground_segment_id)
)
station_converter.client.close()

eligibilities_computation = CelestEligibilityComputation(
    system_ephemeris=system_ephemeris, ground_segment=ground_segment
)

eligibilities_computation.compute_all(
    eligibility_computation_parameters=EligibilityComputationParameters(
        altitudes=0,
        elevation_masks=ElevationMask(azimuths=[0, 359], elevations=[30, 30]),
    ),
    progress=True,
)
