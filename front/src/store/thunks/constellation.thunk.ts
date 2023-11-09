import { ConstellationCreate, ConstellationsService } from 'client/index';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import { IRootState } from 'store';
import { constellationsActions, notificationsActions } from 'store/slices';

type IThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

export const FetchConstellations = (): IThunk => {
  return async (dispatch) => {
    dispatch(constellationsActions.setLoading(true));

    try {
      const constellations = await ConstellationsService.listConstellations();
      dispatch(constellationsActions.initialize());

      if (constellations.length === 0) {
        dispatch(notificationsActions.info('No constellation found.'));
        dispatch(constellationsActions.setLoading(false));
        return;
      }

      dispatch(constellationsActions.setAll(constellations));
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load constellation.'));
    }
    dispatch(constellationsActions.setLoading(false));
  };
};

export const AddNewConstellation = (
  constellation: ConstellationCreate,
): IThunk => {
  return async (dispatch) => {
    dispatch(constellationsActions.setLoading(true));

    try {
      const newConstellation = await ConstellationsService.createConstellation(
        constellation,
      );
      dispatch(constellationsActions.addOne(newConstellation));
    } catch (err) {
      dispatch(notificationsActions.error('Cannot add new constellation.'));
      dispatch(constellationsActions.setLoading(false));
    }
  };
};
