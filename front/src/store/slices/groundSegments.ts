import { GroundSegment, GroundSegmentInfo } from 'client/index';
import {
  EntityState,
  createDraftSafeSelector,
  createEntityAdapter,
  createSlice,
} from '@reduxjs/toolkit';

import { IRootState } from 'store';
import {
  setLoading,
  loadingState,
  optionState,
  selectCurrent,
  makeOptionsReducers,
  makeOptionInitialState,
} from 'store/helpers';

interface StoredGroundSegment
  extends EntityState<GroundSegment>,
    optionState<GroundSegmentInfo>,
    loadingState {}

const groundSegmentsAdapter = createEntityAdapter<GroundSegment>();

const initialState: StoredGroundSegment = {
  isLoading: false,
  ...groundSegmentsAdapter.getInitialState(),
  ...makeOptionInitialState<GroundSegmentInfo>(),
};

const groundSegmentsSlice = createSlice({
  name: 'groundSegments',
  initialState,
  reducers: {
    ...makeOptionsReducers<GroundSegmentInfo>(),
    setLoading,
    addOne: groundSegmentsAdapter.addOne,
  },
});

const selectState = (state: IRootState) => state.groundSegments;
const groundSegmentsActions = groundSegmentsSlice.actions;
const groundSegmentsSelectors = {
  ...groundSegmentsAdapter.getSelectors(selectState),
  selectCurrent: createDraftSafeSelector(selectState, selectCurrent<GroundSegment>),
};

export { groundSegmentsActions, groundSegmentsSelectors };
export default groundSegmentsSlice;
