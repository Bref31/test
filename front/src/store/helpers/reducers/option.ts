import { PayloadAction as PA } from '@reduxjs/toolkit';

export interface RunOption<T = any> {
  value: number;
  label: string;
  data?: T;
}

export interface optionState<T> {
  options: RunOption<T>[];
  selectedOption: RunOption<T> | null;
}

export const makeOptionsReducers = <T>() => ({
  setOptions: (state: optionState<T>, action: PA<RunOption<T>[]>) => {
    state.options = action.payload;
    state.selectedOption = null;
  },

  addOption: (state: optionState<T>, action: PA<RunOption<T>>) => {
    state.options.push(action.payload);
    state.selectedOption = action.payload;
  },
  selectOption: (state: optionState<T>, action: PA<RunOption<T> | null>) => {
    state.selectedOption = action.payload;
  },
});

export const makeOptionInitialState = <T>(): {
  options: RunOption<T>[];
  selectedOption: RunOption<T> | null;
} => ({
  options: [],
  selectedOption: null,
});
