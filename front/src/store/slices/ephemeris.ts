import { EphemerisResponse, Horizon } from 'client/index';
import { PayloadAction as PA, createSlice } from '@reduxjs/toolkit';
import { SampledPositionProperty } from 'cesium';

import {
  progressState,
  makeOptionInitialState,
  optionState,
  makeOptionsReducers,
  progressInitialState,
  progressReducers,
} from 'store/helpers';

export type SmartEphemerisVelocity = {
  dxKmPerS: number[];
  dyKmPerS: number[];
  dzKmPerS: number[];
};

export type SmartSatEphemeris = {
  position: SampledPositionProperty;
  velocity?: SmartEphemerisVelocity | null;
};

export interface SmartEphemeris extends Omit<EphemerisResponse, 'ephemeris'> {
  ephemeris: Record<string, SmartSatEphemeris>;
}

export interface StoredEphemeris extends progressState, optionState<Horizon> {
  data: SmartEphemeris | undefined;
}

const initialState: StoredEphemeris = {
  data: undefined,
  ...makeOptionInitialState<Horizon>(),
  ...progressInitialState,
};

const ephemerisSlice = createSlice({
  name: 'ephemeris',
  initialState,
  reducers: {
    ...makeOptionsReducers<Horizon>(),
    ...progressReducers,
    setOne: (state: StoredEphemeris, action: PA<SmartEphemeris | undefined>) => {
      state.data = action.payload;
      state.progressOnGoing = false;
    },
  },
});

const ephemerisActions = ephemerisSlice.actions;

export { ephemerisActions };
export default ephemerisSlice;
