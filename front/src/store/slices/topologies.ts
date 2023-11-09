import { Topology } from 'client/index';
import {
  EntityState,
  createDraftSafeSelector,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';

import { IRootState } from 'store';
import {
  getSubId,
  loadingState,
  multiOptionInitialState,
  multiOptionState,
  multiOptionsReducer,
  selectAllMultiCurrent,
  selectMultiCurrent,
  setLoading,
} from 'store/helpers';

export type TopoWithConstId = Topology & { constId: number };

interface StoredTopology
  extends EntityState<TopoWithConstId>,
    multiOptionState,
    loadingState {}

const topologiesAdapter = createEntityAdapter<TopoWithConstId>();

const initialState: StoredTopology = {
  ...topologiesAdapter.getInitialState(),
  ...multiOptionInitialState,
  isLoading: false,
};

const topologiesSlice = createSlice({
  name: 'topologies',
  initialState,
  reducers: {
    ...multiOptionsReducer,
    setLoading,
    addOne: topologiesAdapter.addOne,
  },
});

const selectState = (state: IRootState) => state.topologies;
const topologiesActions = topologiesSlice.actions;
const topologiesSelectors = {
  ...topologiesAdapter.getSelectors(selectState),
  selectCurrent: createDraftSafeSelector(
    selectState,
    getSubId,
    selectMultiCurrent<TopoWithConstId>,
  ),
  selectAllCurrent: createDraftSafeSelector(
    selectState,
    selectAllMultiCurrent<TopoWithConstId>,
  ),
};

export { topologiesActions, topologiesSelectors };
export default topologiesSlice;
