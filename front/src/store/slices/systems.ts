import { System, SystemInfo } from 'client/index';
import {
  EntityState,
  createDraftSafeSelector,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';

import { IRootState } from 'store';
import {
  makeOptionInitialState,
  optionState,
  makeOptionsReducers,
  loadingState,
  selectCurrent,
  setLoading,
} from 'store/helpers';

type SmartSystem = System & { satelliteIds: number[] };

interface StoredSystem
  extends EntityState<SmartSystem>,
    optionState<SystemInfo>,
    loadingState {}

const systemsAdapter = createEntityAdapter<SmartSystem>();

const initialState: StoredSystem = {
  isLoading: false,
  ...systemsAdapter.getInitialState(),
  ...makeOptionInitialState<SystemInfo>(),
};

const systemsSlice = createSlice({
  name: 'systems',
  initialState,
  reducers: {
    ...makeOptionsReducers<SystemInfo>(),
    setLoading,
    addOne: systemsAdapter.addOne,
  },
});

const selectState = (state: IRootState) => state.systems;
const systemsActions = systemsSlice.actions;
const systemsSelectors = {
  ...systemsAdapter.getSelectors(selectState),
  selectCurrent: createDraftSafeSelector(selectState, selectCurrent<SmartSystem>),
};

export { systemsActions, systemsSelectors };
export default systemsSlice;
