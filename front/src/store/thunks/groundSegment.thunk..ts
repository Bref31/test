import { GroundSegmentCreate, GroundSegmentsService } from 'client/index';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import { IRootState } from 'store';
import {
  eligibilitiesActions,
  groundSegmentsActions,
  notificationsActions,
} from 'store/slices';
import { RunOption } from 'store/helpers';

type IThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

export const FetchGroundSegmentOptions = (): IThunk => {
  return async (dispatch) => {
    dispatch(groundSegmentsActions.setLoading(true));

    try {
      const options = await GroundSegmentsService.listGroundSegments();

      if (options.length === 0) {
        dispatch(notificationsActions.info('No ground segment found.'));
        dispatch(groundSegmentsActions.setLoading(false));
        return;
      }

      dispatch(
        groundSegmentsActions.setOptions(
          options.map((el) => ({
            value: el.id,
            label: el.name,
            data: el,
          })),
        ),
      );
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load any ground segment.'));
    }
    dispatch(groundSegmentsActions.setLoading(false));
  };
};

export const FetchGroundSegmentById = (option: RunOption | null): IThunk => {
  return async (dispatch, getState) => {
    if (option?.value !== getState().groundSegments.selectedOption?.value) {
      dispatch(eligibilitiesActions.setOne());
    }

    dispatch(groundSegmentsActions.selectOption(option));

    if (!option) return;

    const groundSegmentsIds = getState().groundSegments.ids;

    if (groundSegmentsIds.includes(option.value)) {
      return dispatch(notificationsActions.success('Ground segment loaded.'));
    }

    dispatch(groundSegmentsActions.setLoading(true));

    try {
      const groundSegment = await GroundSegmentsService.getGroundSegment(option.value);

      if (!groundSegment) {
        dispatch(notificationsActions.warning('No ground segment found.'));
      } else {
        dispatch(groundSegmentsActions.addOne(groundSegment));
        dispatch(notificationsActions.success('Ground segment loaded.'));
      }
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load ground segment.'));
    }
    dispatch(groundSegmentsActions.setLoading(false));
  };
};

export const AddNewGroundSegment = (groundSegment: GroundSegmentCreate): IThunk => {
  return async (dispatch) => {
    dispatch(groundSegmentsActions.setLoading(true));

    try {
      const newGroundSegment =
        await GroundSegmentsService.createGroundSegment(groundSegment);

      if (!groundSegment) {
        dispatch(notificationsActions.warning('No ground segment added.'));
        dispatch(groundSegmentsActions.setLoading(false));
        return;
      }

      dispatch(groundSegmentsActions.addOne(newGroundSegment));
      dispatch(
        groundSegmentsActions.addOption({
          value: newGroundSegment.id,
          label: newGroundSegment.name,
        }),
      );
      dispatch(groundSegmentsActions.setLoading(false));
      dispatch(notificationsActions.success('Ground segment added.'));
    } catch (err) {
      dispatch(notificationsActions.error('Cannot add new ground segment.'));
      dispatch(groundSegmentsActions.setLoading(false));
    }
  };
};
