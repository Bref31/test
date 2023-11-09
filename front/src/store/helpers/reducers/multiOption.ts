import { PayloadAction as PA } from '@reduxjs/toolkit';
import { RunOption, optionState } from './option';

export interface multiOptionState {
  select: {
    [id: string]: optionState<any>;
  };
}

export const multiOptionsReducer = {
  resetOptions: (state: multiOptionState) => {
    state.select = {};
  },

  createSelect: (state: multiOptionState, action: PA<number[]>) => {
    for (const id of action.payload) {
      state.select[id] = {
        options: [],
        selectedOption: null,
      };
    }
  },

  setOptions: (
    state: multiOptionState,
    action: PA<{ options: RunOption[]; id: number }>,
  ) => {
    const { options, id } = action.payload;

    state.select[id].options = options;
  },

  addOption: (
    state: multiOptionState,
    action: PA<{ option: RunOption; id: number }>,
  ) => {
    const { option, id } = action.payload;

    state.select[id].options.push(option);
    state.select[id].selectedOption = option;
  },
  selectOption: (
    state: multiOptionState,
    action: PA<{ option: RunOption | null; id: number }>,
  ) => {
    const { option, id } = action.payload;
    state.select[id].selectedOption = option;
  },
};

export const multiOptionInitialState = {
  select: {},
};
