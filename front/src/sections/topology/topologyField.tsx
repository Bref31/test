import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store';
import { FetchTopologyById, FetchTopologyOptions } from 'store/thunks/topologies.thunk';

import { Autocomplete, TextField } from '@mui/material';
import { topologiesSelectors } from 'store/slices';

interface Props {
  constId: number;
  name: string;
  disabled: boolean;
}

function TopologyField({ constId, name, disabled }: Props) {
  const dispatch = useAppDispatch();
  const topology = useAppSelector((state) =>
    topologiesSelectors.selectCurrent(state, constId),
  );

  useEffect(() => {
    if (constId) {
      dispatch(FetchTopologyOptions(constId));
    }
    // eslint-disable-next-line
  }, [constId]);

  return !topology ? null : (
    <Autocomplete
      disabled={disabled}
      options={topology.options}
      value={topology.selectedOption}
      fullWidth
      onChange={(_, o) => {
        dispatch(FetchTopologyById(o, constId));
      }}
      renderInput={(params) => (
        <TextField {...params} label={`Constellation ${name}`} />
      )}
    />
  );
}

export default TopologyField;
