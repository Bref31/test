import { SystemCreate, SystemsService } from 'client/index';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import { IRootState } from 'store';
import {
  eligibilitiesActions,
  ephemerisActions,
  notificationsActions,
  systemsActions,
  topologiesActions,
} from 'store/slices';
import { RunOption } from 'store/helpers';

type IThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

export const FetchSystemOptions = (): IThunk => {
  return async (dispatch) => {
    dispatch(systemsActions.setLoading(true));

    try {
      const options = await SystemsService.listSystems();

      if (options.length === 0) {
        dispatch(notificationsActions.info('No system found.'));
        dispatch(systemsActions.setLoading(false));
        return;
      }

      dispatch(
        systemsActions.setOptions(
          options.map((el) => ({ value: el.id, label: el.name })),
        ),
      );
      dispatch(systemsActions.setLoading(false));
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load any system.'));
      dispatch(systemsActions.setLoading(false));
    }
  };
};

export const FetchSystemById = (option: RunOption | null): IThunk => {
  return async (dispatch, getState) => {
    if (option?.value !== getState().systems.selectedOption?.value) {
      // Used to removed opened section that depends on that data
      dispatch(ephemerisActions.setOne());
      dispatch(ephemerisActions.setOptions([]));
      dispatch(topologiesActions.resetOptions());
      dispatch(eligibilitiesActions.setOne());
      // dispatch(allocationsActions.setOne())
    }

    dispatch(systemsActions.selectOption(option));

    if (!option) return;

    const systemsIds = getState().systems.ids;

    if (systemsIds.includes(option.value)) {
      dispatch(
        topologiesActions.createSelect(
          getState().systems.entities[option.value]!.constellations.map((c) => c.id),
        ),
      );
      return dispatch(notificationsActions.success('System loaded.'));
    }

    dispatch(systemsActions.setLoading(true));

    try {
      const system = await SystemsService.getSystem(option.value);

      if (!system) {
        dispatch(notificationsActions.warning('No system found.'));
        dispatch(systemsActions.setLoading(false));
        return;
      }
      const satelliteIds: number[] = [];

      for (const constellation of system.constellations) {
        for (const satellite of constellation.satellites) {
          for (const sat of satellite) {
            satelliteIds.push(sat.id);
          }
        }
      }

      dispatch(topologiesActions.createSelect(system.constellations.map((c) => c.id)));
      dispatch(systemsActions.addOne({ ...system, satelliteIds }));
      dispatch(notificationsActions.success('System loaded.'));
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load system.'));
    }
    dispatch(systemsActions.setLoading(false));
  };
};

export const AddNewSystem = (systemCreate: SystemCreate): IThunk => {
  return async (dispatch) => {
    dispatch(systemsActions.setLoading(true));

    try {
      const newSystem = await SystemsService.createSystem(systemCreate);

      if (!newSystem) {
        dispatch(notificationsActions.warning('No system added.'));
        dispatch(systemsActions.setLoading(false));
        return;
      }
      const satelliteIds: number[] = [];

      for (const constellation of newSystem.constellations) {
        for (const satellite of constellation.satellites) {
          for (const sat of satellite) {
            satelliteIds.push(sat.id);
          }
        }
      }

      dispatch(
        topologiesActions.createSelect(newSystem.constellations.map((c) => c.id)),
      );
      dispatch(systemsActions.addOne({ ...newSystem, satelliteIds }));
      dispatch(
        systemsActions.addOption({
          value: newSystem.id,
          label: newSystem.name,
        }),
      );
      dispatch(notificationsActions.success('System added.'));
    } catch (err) {
      dispatch(notificationsActions.error('Cannot add new system.'));
    }
    dispatch(systemsActions.setLoading(false));
  };
};
