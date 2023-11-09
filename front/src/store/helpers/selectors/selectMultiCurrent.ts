import { EntityState } from '@reduxjs/toolkit';
import { multiOptionState } from '../reducers/multiOption';

interface MultiOptEntityState<T> extends EntityState<T>, multiOptionState {}

export const getSubId = (_: any, subId: number | null) => {
  return subId;
};

export const selectMultiCurrent = <T>(
  state: MultiOptEntityState<T>,
  subId: number | null,
) => {
  if (!subId) return;

  return state.select[subId];
};

export const selectAllMultiCurrent = <T extends { constId: number }>(
  state: MultiOptEntityState<T>,
) => {
  const allSelected: { [constId: string]: T } = {};

  for (const value of Object.values(state.select)) {
    const id = value.selectedOption?.value;
    if (!id || !state.entities[id]) continue;

    const topo = state.entities[id] as T;

    allSelected[topo.constId] = topo;
  }
  return allSelected;
};
