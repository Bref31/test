import { EntityState } from '@reduxjs/toolkit';
import { optionState } from '../reducers';

interface SingleOptEntityState<T> extends EntityState<T>, optionState {}

export const selectCurrent = <T>(state: SingleOptEntityState<T>) => {
  const currentId = state.selectedOption?.value;
  if (!currentId) return undefined;

  return state.entities[currentId];
};
