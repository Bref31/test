import { PayloadAction as PA } from '@reduxjs/toolkit';

export interface progressState {
  progressOnGoing: boolean;
  progressCount: number;
  progressTotal: number;
}

export const progressReducers = {
  startProgress: (state: progressState, action: PA<number | undefined>) => {
    state.progressOnGoing = true;
    state.progressCount = 0;
    state.progressTotal = action.payload ?? 0;
  },

  stepProgress: (state: progressState) => {
    state.progressCount = state.progressCount + 1;
  },

  stopProgress: (state: progressState) => {
    state.progressOnGoing = false;
  },
};

export const progressInitialState: progressState = {
  progressOnGoing: false,
  progressCount: 0,
  progressTotal: 0,
};
