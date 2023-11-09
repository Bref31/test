import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store';
import {
  FetchSystemById,
  FetchSystemOptions,
} from 'store/thunks/systems.thunk';

import SystemModal from './systemModal';
import PublicAltIcon from '@mui/icons-material/Public';
import { Autocomplete, TextField } from '@mui/material';
import MenuCollapse from 'components/menuCollapse';

function SystemSection() {
  const dispatch = useAppDispatch();
  const { options, selectedOption, isLoading } = useAppSelector(
    (state) => state.systems,
  );

  useEffect(() => {
    dispatch(FetchSystemOptions());
    // eslint-disable-next-line
  }, []);

  return (
    <MenuCollapse
      sectionName="System"
      icon={PublicAltIcon}
      isLoading={isLoading}
    >
      <Autocomplete
        disabled={isLoading}
        options={options}
        value={selectedOption}
        fullWidth
        onChange={async (_, o) => {
          dispatch(FetchSystemById(o));
        }}
        renderInput={(params) => (
          <TextField {...params} label="Choose a system to load" />
        )}
      />
      <SystemModal disabled={isLoading} />
    </MenuCollapse>
  );
}

export default SystemSection;
