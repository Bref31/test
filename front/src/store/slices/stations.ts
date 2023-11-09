import { Station } from 'client/index';
import { PayloadAction as PA, createSlice } from '@reduxjs/toolkit';
import { loadingState, setLoading } from 'store/helpers';

interface StoredStations extends loadingState {
  data: Station[];
}

const initialState: StoredStations = {
  data: [],
  isLoading: false,
};

const stationsSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    setLoading,
    setAll: (state, action: PA<Station[]>) => {
      state.data = action.payload;
      state.isLoading = false;
    },
    addOne: (state, action: PA<Station>) => {
      state.data = [...state.data, action.payload];
      state.isLoading = false;
    },
    addMany: (state, action: PA<Station[]>) => {
      state.data = [...state.data, ...action.payload];
      state.isLoading = false;
    },
  },
});

const stationsActions = stationsSlice.actions;

export { stationsActions };
export default stationsSlice;
