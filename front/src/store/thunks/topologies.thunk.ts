import { TopologiesService, TopologyCreate } from 'client/index';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import { IRootState } from 'store';
import { notificationsActions, topologiesActions } from 'store/slices';
import { RunOption } from 'store/helpers';

type IThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

export const FetchTopologyOptions = (constId: number): IThunk => {
  return async (dispatch) => {
    dispatch(topologiesActions.setLoading(true));

    try {
      const options = await TopologiesService.listTopologiesForConstellation(constId);

      if (options.length === 0) {
        dispatch(
          notificationsActions.info('No topology found for this constellation.'),
        );
        dispatch(topologiesActions.setLoading(true));
        return;
      }

      dispatch(
        topologiesActions.setOptions({
          id: constId,
          options: options.map((el) => ({
            value: el.id,
            label: el.name,
          })),
        }),
      );
    } catch (err: any) {
      dispatch(
        notificationsActions.error('Cannot load topologies for this constellation.'),
      );
    }
    dispatch(topologiesActions.setLoading(false));
  };
};

export const FetchTopologyById = (
  option: RunOption | null,
  constId: number,
): IThunk => {
  return async (dispatch, getState) => {
    dispatch(topologiesActions.selectOption({ id: constId, option }));
    if (!option) return;

    const topologiesIds = getState().topologies.ids;

    if (topologiesIds.includes(option.value)) {
      return dispatch(notificationsActions.success('Topology loaded.'));
    }

    dispatch(topologiesActions.setLoading(true));

    try {
      const topology = await TopologiesService.getTopology(option.value);

      if (!topology) {
        dispatch(notificationsActions.warning('No topology found.'));
      } else {
        dispatch(topologiesActions.addOne({ ...topology, constId }));
        dispatch(notificationsActions.success('Topology loaded.'));
      }
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load topology.'));
    }
    dispatch(topologiesActions.setLoading(false));
  };
};

export const AddNewTopology = (topology: TopologyCreate): IThunk => {
  return async (dispatch) => {
    const id = topology.constellationId;
    dispatch(topologiesActions.setLoading(true));

    try {
      const newTopology = await TopologiesService.createTopology(topology);

      if (!newTopology) {
        dispatch(notificationsActions.warning('No topology added.'));
      } else {
        dispatch(topologiesActions.addOne({ ...newTopology, constId: id }));
        dispatch(
          topologiesActions.addOption({
            id,
            option: {
              value: newTopology.id,
              label: newTopology.name,
            },
          }),
        );
        dispatch(notificationsActions.success('Topology added.'));
      }
    } catch (err) {
      dispatch(notificationsActions.error('Cannot add new topology.'));
    }
    dispatch(topologiesActions.setLoading(false));
  };
};
