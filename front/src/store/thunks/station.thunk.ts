import { StationCreate, StationsService } from 'client/index';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import { IRootState } from 'store';
import { notificationsActions, stationsActions } from 'store/slices';

type IThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

export const FetchStations = (): IThunk => {
  return async (dispatch) => {
    dispatch(stationsActions.setLoading(true));

    try {
      const stations = await StationsService.listStations();

      if (stations.length === 0) {
        dispatch(notificationsActions.info('No stations found.'));
        dispatch(stationsActions.setLoading(false));
        return;
      }

      dispatch(stationsActions.setAll(stations));
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load stations.'));
    }
    dispatch(stationsActions.setLoading(false));
  };
};

export const AddNewStation = (station: StationCreate): IThunk => {
  return async (dispatch) => {
    dispatch(stationsActions.setLoading(true));

    try {
      const newStation = await StationsService.createStation(station);
      dispatch(stationsActions.addOne(newStation));
    } catch (err) {
      dispatch(notificationsActions.error('Cannot add new station.'));
    }
    dispatch(stationsActions.setLoading(false));
  };
};

export const ImportStations = (file: File): IThunk => {
  return async (dispatch) => {
    dispatch(stationsActions.setLoading(true));

    try {
      const newStation = await StationsService.importStations({
        file: file,
      });
      dispatch(stationsActions.addMany(newStation));
    } catch (err) {
      dispatch(notificationsActions.error('Cannot import new station.'));
    }
    dispatch(stationsActions.setLoading(false));
  };
};
