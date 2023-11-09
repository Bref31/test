import { ModalTitle, SectionModal } from '../../components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import schema from './schema';
import { Button, TextField } from '@mui/material';
import { useAppDispatch } from 'store';
import { AddNewGroundSegment } from 'store/thunks/groundSegment.thunk.';
import { GroundSegmentCreate, Station } from 'client/index';

interface Props {
  stations: Station[];
  disabled: boolean;
}

const columns: GridColDef[] = [
  { field: 'country', headerName: 'Country', width: 220 },
  { field: 'city', headerName: 'City', width: 200 },
  {
    field: 'location.latitudeDeg',
    headerName: 'Latitude',
    type: 'number',
    width: 100,
    valueGetter: (params) => params.row.location.latitudeDeg,
  },
  {
    field: 'location.longitudeDeg',
    headerName: 'Longitude',
    type: 'number',
    width: 100,
    valueGetter: (params) => params.row.location.longitudeDeg,
  },
  {
    field: 'location.heightM',
    headerName: 'Height',
    type: 'number',
    width: 100,
    valueGetter: (params) => params.row.location.heightM,
  },
];

function GroundSegmentModal({ stations, disabled }: Props) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: GroundSegmentCreate) => {
    dispatch(AddNewGroundSegment(data));
    reset();
    setOpen(false);
  };

  if (!stations || stations.length === 0) return null;

  return (
    <SectionModal
      btnTxt="Create a ground segment"
      open={open}
      setOpen={setOpen}
      disabled={disabled}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalTitle title="New ground segment" />
        <TextField
          label="Ground segment's name"
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name')}
        />
        <DataGrid
          rows={stations}
          columns={columns}
          checkboxSelection
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pageSizeOptions={[5, 10, 25]}
          onRowSelectionModelChange={(ids) => {
            setValue(
              'stations',
              stations.filter((s) => ids.includes(s.id)),
            );
            trigger('stations');
          }}
        />
        <Button
          variant="outlined"
          color="success"
          sx={{ mt: 3 }}
          type="submit"
          fullWidth
          disabled={!isValid}
        >
          Save station
        </Button>
      </form>
    </SectionModal>
  );
}

export default GroundSegmentModal;
