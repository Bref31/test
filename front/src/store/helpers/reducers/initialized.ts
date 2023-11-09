import { loadingState } from './loading';

export interface initializeState extends loadingState {
  hasBeenInitialize: boolean;
}

export const initialize = (state: initializeState) => {
  state.hasBeenInitialize = true;
};
