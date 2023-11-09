import { Eligibility } from 'client/index';
import { PayloadAction as PA, createSlice } from '@reduxjs/toolkit';

import {
  loadingState,
  progressInitialState,
  progressReducers,
  progressState,
  setLoading,
} from 'store/helpers';
import { JulianDate } from 'cesium';

export interface JulianEligibility {
  satelliteId: number;
  stationId: number;
  start: JulianDate;
  end: JulianDate;
}

export interface StoredEligibility extends progressState {
  data: JulianEligibility[] | undefined;
}

const initialState: StoredEligibility = {
  data: undefined,
  ...progressInitialState,
};

const eligibilitiesSlice = createSlice({
  name: 'eligibilities',
  initialState,
  reducers: {
    ...progressReducers,
    setOne: (state, action: PA<JulianEligibility[] | undefined>) => {
      state.data = action.payload;
      state.progressOnGoing = false;
    },
  },
});

const eligibilitiesActions = eligibilitiesSlice.actions;

export { eligibilitiesActions };
export default eligibilitiesSlice;
