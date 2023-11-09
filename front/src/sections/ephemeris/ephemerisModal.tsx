import { ModalTitle, SectionModal } from 'components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import schema from './schema';
import { Button, TextField, Typography } from '@mui/material';
import { useAppDispatch } from 'store';
import {
  ComputeEphemeris,
  EphemerisForm,
  FetchEphemerisOptions,
} from 'store/thunks/ephemeris.thunk';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

interface Props {
  disabled: boolean;
  defaultStartTime: DateTime;
}

function EphemerisModal({ disabled, defaultStartTime }: Props) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      horizon: {
        // @ts-ignore
        start: defaultStartTime,
      },
      backend: 'astropy',
    },
  });

  const onSubmit = (data: EphemerisForm) => {
    dispatch(ComputeEphemeris(data));
    setOpen(false);
  };

  return (
    <SectionModal
      btnTxt="Add an ephemeris"
      open={open}
      setOpen={setOpen}
      disabled={disabled}
      keepMounted
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: '70vw', maxWidth: '500px' }}
      >
        <ModalTitle title="New ephemeris" />
        <Typography variant="h5" sx={{ m: '0 auto 20px' }}>
          Horizon
        </Typography>
        <DateTimePicker
          label="Start"
          timezone="UTC"
          defaultValue={defaultStartTime}
          {...register('horizon.start')}
          onChange={(date) => {
            // @ts-ignore
            setValue('horizon.start', date ? date.toISO() : '');
            trigger('horizon.start');
          }}
          slotProps={{
            textField: {
              error: !!errors.horizon?.start,
              helperText: errors.horizon?.start?.message,
            },
          }}
        />
        <DateTimePicker
          label="End"
          defaultValue={DateTime.invalid('default date')}
          timezone="UTC"
          {...register('horizon.end')}
          onChange={(date) => {
            // @ts-ignore
            setValue('horizon.end', date ? date.toISO() : '');
            trigger('horizon.end');
          }}
          slotProps={{
            textField: {
              error: !!errors.horizon?.end,
              helperText: errors.horizon?.end?.message,
            },
          }}
        />
        <TextField
          label="Steps (en secondes)"
          type="number"
          inputProps={{ min: 1 }}
          error={!!errors.horizon?.step}
          helperText={errors.horizon?.step?.message}
          {...register('horizon.step')}
        />
        <Button
          variant="outlined"
          color="success"
          sx={{ mt: 3 }}
          fullWidth
          type="submit"
          disabled={!isValid}
        >
          Save ephemeris
        </Button>
      </form>
    </SectionModal>
  );
}

export default EphemerisModal;
