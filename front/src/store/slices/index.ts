import { combineReducers } from '@reduxjs/toolkit';
import eligibilitiesSlice from './eligibilities';
import ephemerisSlice from './ephemeris';
import stationsSlice from './stations';
import systemsSlice from './systems';
import topologiesSlice from './topologies';
import groundSegmentsSlice from './groundSegments';
import constellationsSlice from './constellations';
import notificationsSlice from './notifications';

const reducers = combineReducers({
  notifications: notificationsSlice.reducer,
  systems: systemsSlice.reducer,
  ephemeris: ephemerisSlice.reducer,
  topologies: topologiesSlice.reducer,
  eligibilities: eligibilitiesSlice.reducer,
  stations: stationsSlice.reducer,
  constellations: constellationsSlice.reducer,
  groundSegments: groundSegmentsSlice.reducer,
});

export * from './notifications';
export * from './systems';
export * from './ephemeris';
export * from './topologies';
export * from './eligibilities';
export * from './stations';
export * from './groundSegments';
export * from './constellations';
export default reducers;
