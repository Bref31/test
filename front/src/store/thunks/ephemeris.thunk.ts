import {
  EphemerisPosition,
  EphemerisRequest,
  EphemerisResponse,
  EphemerisService,
  Horizon,
} from 'client/index';
import { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { Cartesian3, JulianDate, SampledPositionProperty } from 'cesium';
import { isEqual, chunk } from 'lodash';

import { IRootState } from 'store';
import {
  SmartSatEphemeris,
  eligibilitiesActions,
  ephemerisActions,
  notificationsActions,
} from 'store/slices';
import { RunOption } from 'store/helpers';
import { DateTime, Duration } from 'luxon';
import { lexicographicCompare } from 'utils';

type IThunk = ThunkAction<void, IRootState, unknown, AnyAction>;

const MIN_SATELLITES_PER_CALL = 9;

const decodeBinary = (encoded: Blob) =>
  new Float32Array(
    Uint8Array.from(atob(encoded as any), (c) => c.charCodeAt(0)).buffer,
  );

const horizonToOption = (index: number, horizon: Horizon): RunOption => {
  const start = DateTime.fromISO(horizon.start);
  const end = DateTime.fromISO(horizon.end);
  const step = Duration.fromISO(horizon.step);
  return {
    value: index,
    label: `${start.toUTC().toLocaleString(DateTime.DATETIME_MED)}, ${end
      .diff(start)
      .rescale()
      .toHuman({
        compactDisplay: 'short',
        unitDisplay: 'short',
      })} (${step.toHuman({
      compactDisplay: 'short',
      unitDisplay: 'short',
    })})`,
    data: horizon,
  };
};

const compareHorizon = (lhs: Horizon, rhs: Horizon) => {
  return lexicographicCompare(
    [DateTime.fromISO(lhs.start), DateTime.fromISO(lhs.end), lhs.step],
    [DateTime.fromISO(rhs.start), DateTime.fromISO(rhs.end), lhs.step],
  );
};

const calculatePositionOverTime = (
  encodedPosition: EphemerisPosition,
  startTime: JulianDate,
  stopTime: JulianDate,
) => {
  const positionOverTime = new SampledPositionProperty();

  const position = {
    x: decodeBinary(encodedPosition.xKm),
    y: decodeBinary(encodedPosition.yKm),
    z: decodeBinary(encodedPosition.zKm),
  };
  const nStep = position.x.length;

  for (let tStep = 0; tStep < nStep; tStep++) {
    const currentPosition = Cartesian3.fromElements(
      position.x[tStep] * 1000,
      position.y[tStep] * 1000,
      position.z[tStep] * 1000,
    );

    const time = JulianDate.addSeconds(
      startTime,
      (tStep * JulianDate.secondsDifference(stopTime, startTime)) / (nStep - 1),
      new JulianDate(),
    );

    positionOverTime.addSample(time, currentPosition);
  }
  return positionOverTime;
};

const convertToStore = (ephemeris: EphemerisResponse[]) => {
  // TODO: handle case where ephemeris is empty, although should never happen
  const firstEphemeris = ephemeris[0];

  const startTime = JulianDate.fromIso8601(firstEphemeris.horizon.start);
  const endTime = JulianDate.fromIso8601(firstEphemeris.horizon.end);

  let newEphemeris: Record<string, SmartSatEphemeris> = {};
  for (const response of ephemeris) {
    for (const [key, value] of Object.entries(response.ephemeris)) {
      newEphemeris[key] = {
        position: calculatePositionOverTime(value.position, startTime, endTime),
        // TODO
        velocity: null,
      };
    }
  }
  return {
    ...firstEphemeris,
    ephemeris: newEphemeris,
  };
};

export type EphemerisForm = Omit<EphemerisRequest, 'satelliteIds' | 'format'>;

export const ComputeEphemeris = (ephemeris: EphemerisForm): IThunk => {
  return async (dispatch, getState) => {
    const systemId = getState().systems.selectedOption?.value;
    if (!systemId) return;

    const system = getState().systems.entities[systemId];
    if (!system) return;

    // Used to removed opened section that depends on that data
    dispatch(eligibilitiesActions.setOne());
    // dispatch(allocationsActions.setOne())

    const horizon = {
      ...ephemeris.horizon,
      // https://docs.pydantic.dev/latest/usage/types/datetime/
      step: ephemeris.horizon.step.startsWith('PT')
        ? ephemeris.horizon.step
        : `PT${ephemeris.horizon.step}S`,
    };

    // if we are "computing" an existing ephemeris (i.e., loading), select it before
    // starting the call for better UX
    const existingEphemerisOptions = getState().ephemeris.options;
    const toSelectOptions = existingEphemerisOptions.filter((e) =>
      isEqual(e.data, horizon),
    );
    if (toSelectOptions.length > 0) {
      dispatch(ephemerisActions.selectOption(toSelectOptions[0]));
    }

    const satelliteBatches = chunk(system.satelliteIds, MIN_SATELLITES_PER_CALL);

    // TODO: parallel handling of ephemeris computation - this works but is currently
    // slower than doing a single call, at least for pre-computed ephemeris
    dispatch(ephemerisActions.startProgress(satelliteBatches.length));
    // dispatch(ephemerisActions.startProgress());

    try {
      const newSatelliteEphemeris = await Promise.all(
        satelliteBatches.map(async (satelliteBatch) => {
          const satelliteEphemeris = await EphemerisService.computeEphemeris({
            ...ephemeris,
            horizon: horizon,
            cache: true,
            backend: 'poliastro',
            satelliteIds: satelliteBatch,
          });
          dispatch(ephemerisActions.stepProgress());
          return satelliteEphemeris;
        }),
      );

      dispatch(ephemerisActions.setOne(convertToStore(newSatelliteEphemeris)));

      if (
        existingEphemerisOptions.filter((e) => isEqual(e.data, horizon)).length == 0
      ) {
        const options = existingEphemerisOptions
          .map((e) => e.data as Horizon)
          .concat(horizon)
          .sort(compareHorizon)
          .map((h, i) => horizonToOption(i, h));
        dispatch(ephemerisActions.setOptions(options));

        const selectedOption = getState().ephemeris.options.filter((o) =>
          isEqual(o.data, horizon),
        )[0];
        dispatch(ephemerisActions.selectOption(selectedOption));
      }

      dispatch(notificationsActions.success('Ephemeris loaded.'));
    } catch (err) {
      dispatch(notificationsActions.error('Cannot add new ephemeris.'));
    }
    dispatch(ephemerisActions.stopProgress());
  };
};

export const FetchEphemerisOptions = (systemId: number): IThunk => {
  return async (dispatch) => {
    dispatch(ephemerisActions.startProgress());

    try {
      const options =
        await EphemerisService.getComputedEphemerisHorizonsBySystemId(systemId);

      if (options.length === 0) {
        dispatch(notificationsActions.info('No ground segment found.'));
        dispatch(ephemerisActions.stopProgress());
        return;
      }

      dispatch(
        ephemerisActions.setOptions(
          options.sort(compareHorizon).map((el, idx) => horizonToOption(idx, el)),
        ),
      );
      dispatch(ephemerisActions.stopProgress());
    } catch (err: any) {
      dispatch(notificationsActions.error('Cannot load any ephemeris.'));
      dispatch(ephemerisActions.stopProgress());
    }
  };
};

export const FetchEphemerisByHorizon = (option: RunOption | null): IThunk => {
  return async (dispatch, getState) => {
    if (option == null) {
      dispatch(ephemerisActions.setOne());
    } else {
      dispatch(
        ComputeEphemeris({
          horizon: option!.data as Horizon,
          backend: 'poliastro',
          cache: true,
        }),
      );
    }
  };
};
