import { PayloadAction as PA } from '@reduxjs/toolkit';

export interface loadingState {
  isLoading: boolean;
}

export const setLoading = (state: loadingState, action: PA<boolean>) => {
  state.isLoading = action.payload;
};
