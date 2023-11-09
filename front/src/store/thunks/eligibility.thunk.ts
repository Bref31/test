import { EligibilitiesService, EligibilityRequest } from 'client/index';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';

import { IRootState } from 'store';
import { eligibilitiesActions, notificationsActions } from 'store/slices';
import { JulianDate } from 'cesium';
import { chunk } from 'lodash';

type IThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

export type EligibilityForm = Omit<
  EligibilityRequest,
  'satelliteIds' | 'horizon' | 'stationWithMasks'
> & {
  stationWithMasks: number;
};

const MIN_SATELLITES_PER_CALL = 9;

export const ComputeEligibility = (eligibility: EligibilityForm): IThunk => {
  return async (dispatch, getState) => {
    const systemId = getState().systems.selectedOption?.value;
    const groundSegmentId = getState().groundSegments.selectedOption?.value;
    const horizon = getState().ephemeris.data?.horizon;
    if (!systemId || !groundSegmentId || !horizon) return;

    const system = getState().systems.entities[systemId];
    if (!system) return;

    const groundSegments = getState().groundSegments.entities[groundSegmentId];
    if (!groundSegments) return;

    const satelliteBatches = chunk(system.satelliteIds, MIN_SATELLITES_PER_CALL);
    dispatch(eligibilitiesActions.startProgress(satelliteBatches.length));

    try {
      const newEligibility = await Promise.all(
        satelliteBatches.map(async (satelliteBatch) => {
          const batchEligibilities = await EligibilitiesService.computeEligibilities({
            ...eligibility,
            horizon,
            cache: true,
            step: eligibility.step ? `PT${eligibility.step}S` : null,
            satelliteIds: satelliteBatch,
            stationWithMasks: groundSegments.stations.map((s) => ({
              stationId: s.id,
              elevationsDeg: eligibility.stationWithMasks,
            })),
          });
          dispatch(eligibilitiesActions.stepProgress());
          return batchEligibilities;
        }),
      ).then((eligibilities) => eligibilities.flat(1));

      dispatch(
        eligibilitiesActions.setOne(
          newEligibility.map((elig) => ({
            ...elig,
            start: JulianDate.fromIso8601(elig.start),
            end: JulianDate.fromIso8601(elig.end),
          })),
        ),
      );
      dispatch(notificationsActions.success('Eligibility loaded.'));
    } catch (err) {
      dispatch(notificationsActions.error('Cannot add new eligibility.'));
    }
    dispatch(eligibilitiesActions.stopProgress());
  };
};
