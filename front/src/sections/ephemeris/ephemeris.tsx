import { useAppDispatch, useAppSelector } from 'store';
import EphemerisModal from './ephemerisModal';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import MenuCollapse from 'components/menuCollapse';
import { systemsSelectors } from 'store/slices';
import { DateTime } from 'luxon';
import { Autocomplete, Box, TextField } from '@mui/material';
import {
  FetchEphemerisByHorizon,
  FetchEphemerisOptions,
} from 'store/thunks/ephemeris.thunk';
import { useEffect } from 'react';

function Ephemeris() {
  const dispatch = useAppDispatch();

  const system = useAppSelector(systemsSelectors.selectCurrent);
  const { options, selectedOption, progressOnGoing, progressCount, progressTotal } =
    useAppSelector((state) => state.ephemeris);

  useEffect(() => {
    if (system) {
      dispatch(FetchEphemerisOptions(system.id));
    }
    // eslint-disable-next-line
  }, [system]);

  const getDefaultStartTime = () => {
    if (!system) return DateTime.invalid('missing system');

    return system.constellations
      .flatMap((c) =>
        c.satellites.flatMap((p) => p.map((s) => DateTime.fromISO(s.orbit.epoch))),
      )
      .reduce((lhs, rhs) => (lhs < rhs ? lhs : rhs));
  };

  return (
    <MenuCollapse
      sectionName="Ephemeris"
      icon={SatelliteAltIcon}
      disabled={!system}
      isLoading={progressOnGoing}
      progress={
        progressTotal == 0
          ? undefined
          : Math.ceil((100 * progressCount) / progressTotal)
      }
    >
      <>
        {system && (
          <Autocomplete
            disabled={progressOnGoing}
            options={options}
            value={selectedOption}
            fullWidth
            onChange={(_, o) => {
              dispatch(FetchEphemerisByHorizon(o));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Choose existing ephemeris to load" />
            )}
          />
        )}
        {system && (
          <EphemerisModal
            disabled={progressOnGoing}
            defaultStartTime={getDefaultStartTime()}
          />
        )}
      </>
    </MenuCollapse>
  );
}

export default Ephemeris;
