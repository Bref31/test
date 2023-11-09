import { ModalTitle, SectionModal } from 'components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import schema from './schema';
import { Button, TextField } from '@mui/material';
import { useAppDispatch } from 'store';
import { AddNewStation } from 'store/thunks/station.thunk';
import { StationCreate } from 'client/index';
import StationImport from './stationImport';

interface Props {
  disabled: boolean;
}

function StationModal({ disabled }: Props) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: StationCreate) => {
    dispatch(AddNewStation(data));
    reset();
    setOpen(false);
  };

  return (
    <SectionModal
      btnTxt="Create a new station"
      open={open}
      setOpen={setOpen}
      disabled={disabled}
      sectionContent={<StationImport disabled={disabled} />}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '500px' }}>
        <ModalTitle title="New station" />
        <TextField
          label="Country"
          error={!!errors.country}
          helperText={errors.country?.message}
          {...register('country')}
        />
        <TextField
          label="City"
          error={!!errors.city}
          helperText={errors.city?.message}
          {...register('city')}
        />
        <TextField
          label="Longitude *"
          type="number"
          inputProps={{ min: 0, max: 180 }}
          error={!!errors.location?.longitudeDeg}
          helperText={errors.location?.longitudeDeg?.message}
          {...register('location.longitudeDeg')}
        />
        <TextField
          label="Latitude *"
          type="number"
          inputProps={{ min: -90, max: 90 }}
          error={!!errors.location?.latitudeDeg}
          helperText={errors.location?.latitudeDeg?.message}
          {...register('location.latitudeDeg')}
        />
        <TextField
          label="Height"
          type="number"
          inputProps={{ min: 0 }}
          error={!!errors.location?.heightM}
          helperText={errors.location?.heightM?.message}
          {...register('location.heightM')}
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

export default StationModal;
