import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store';

import GroundSegmentModal from './groundSegmentModal';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { Autocomplete, TextField } from '@mui/material';
import MenuCollapse from 'components/menuCollapse';
import {
  FetchGroundSegmentById,
  FetchGroundSegmentOptions,
} from 'store/thunks/groundSegment.thunk.';

function GroundSegmentSection() {
  const dispatch = useAppDispatch();
  const stations = useAppSelector((state) => state.stations.data);
  const { options, selectedOption, isLoading } = useAppSelector(
    (state) => state.groundSegments,
  );

  useEffect(() => {
    dispatch(FetchGroundSegmentOptions());
    // eslint-disable-next-line
  }, []);

  return (
    <MenuCollapse
      sectionName="Ground segment"
      icon={LocationCityIcon}
      disabled={stations.length === 0}
      isLoading={isLoading}
    >
      <Autocomplete
        disabled={isLoading}
        options={options}
        value={selectedOption}
        fullWidth
        onChange={(_, o) => {
          dispatch(FetchGroundSegmentById(o));
        }}
        renderInput={(params) => (
          <TextField {...params} label="Choose a ground segment to load" />
        )}
      />
      <GroundSegmentModal stations={stations} disabled={isLoading} />
    </MenuCollapse>
  );
}

export default GroundSegmentSection;
