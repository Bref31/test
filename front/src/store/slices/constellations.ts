import { ConstellationInfo } from 'client/index';
import { PayloadAction as PA, createSlice } from '@reduxjs/toolkit';
import { initializeState, initialize, setLoading } from 'store/helpers';

interface StoredConstellations extends initializeState {
  data: ConstellationInfo[];
}

const initialState: StoredConstellations = {
  data: [],
  isLoading: false,
  hasBeenInitialize: false,
};

const constellationsSlice = createSlice({
  name: 'constellations',
  initialState,
  reducers: {
    setLoading,
    initialize,
    setAll: (state, action: PA<ConstellationInfo[]>) => {
      state.data = action.payload;
      state.isLoading = false;
    },
    addOne: (state, action: PA<ConstellationInfo>) => {
      state.data = [...state.data, action.payload];
      state.isLoading = false;
    },
  },
});

const constellationsActions = constellationsSlice.actions;

export { constellationsActions };
export default constellationsSlice;
