import { ModalTitle, SectionModal } from 'components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldError, FieldErrors, useForm } from 'react-hook-form';
import s from 'components/modal/modal.module.css';
import { ConstellationsService } from 'client/services/ConstellationsService'; // Utilisez le chemin correct vers votre service

import constellationSchema from './schema';
import { Box, Button, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useAppDispatch } from 'store';
import { AddNewConstellation } from 'store/thunks/constellation.thunk';
import {
  ConstellationCreate,
  TelesatOrbitParameters,
  TrueAnomalyShiftOrbitParameters,
  WalkerOrbitParameters,
} from 'client/index';
import { DateTime } from 'luxon';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}

function ConstellationModal({ open, setOpen }: Props) {
  const dispatch = useAppDispatch();
  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    trigger,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(constellationSchema),

    mode: 'onTouched',
  });

  const watchMode = watch('orbitParameters.mode', 'telesat');

  const onSubmit = (data: ConstellationCreate) => {
    dispatch(AddNewConstellation(data));
    reset();
    setOpen(false);
  };

  useEffect(() => {
    console.log(isValid);
    console.log(errors);
  }, [isValid]);

  return (
    <SectionModal open={open} setOpen={setOpen}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: '70vw', maxWidth: '70vw' }}
      >
        <ModalTitle title="New constellation" />
        <Box className={s.split_container}>
          <Box className={s.split_child}>
            <Typography variant="h5" sx={{ m: '0 auto 20px' }}>
              Global parameters
            </Typography>
            <TextField
              label="Name"
              error={!!errors.name}
              helperText={errors?.name?.message}
              sx={{ mb: 3 }}
              {...register(`name`)}
            />
            <TextField
              label="Number of planes"
              error={!!errors.nPlanes}
              helperText={errors?.nPlanes?.message}
              sx={{ mb: 3 }}
              {...register(`nPlanes`)}
            />
            <TextField
              label="Number of satellite/plane"
              error={!!errors.nPerPlane}
              helperText={errors?.nPerPlane?.message}
              {...register(`nPerPlane`)}
            />
          </Box>
          <Box className={s.split_child}>
            <Typography variant="h5" sx={{ m: '0 auto 20px' }}>
              Orbital parameters
            </Typography>
            <Select
              defaultValue="telesat"
              sx={{ mb: 3 }}
              {...register(`orbitParameters.mode`)}
            >
              <MenuItem value="telesat">Telesat</MenuItem>
              <MenuItem value="walker">Walker</MenuItem>
              <MenuItem value="true-anomaly-shift">True Anomaly Shift</MenuItem>
            </Select>
            <TextField
              label="Semi-major axis (km)"
              required={true}
              inputProps={{ min: 0 }}
              error={!!errors.orbitParameters?.semiMajorAxisKm}
              helperText={errors?.orbitParameters?.semiMajorAxisKm?.message}
              sx={{ mb: 3 }}
              {...register(`orbitParameters.semiMajorAxisKm`)}
            />
            <TextField
              label="Inclination (deg)"
              required={true}
              error={!!errors.orbitParameters?.inclinationDeg}
              helperText={errors?.orbitParameters?.inclinationDeg?.message}
              sx={{ mb: 3 }}
              {...register(`orbitParameters.inclinationDeg`)}
            />
            {watchMode == 'telesat' && (
              <TextField
                label="True Anomaly Period (deg)"
                required={watchMode == 'telesat'}
                inputProps={{ min: -360, max: 360 }}
                error={
                  !!(
                    errors.orbitParameters as
                      | FieldErrors<TelesatOrbitParameters>
                      | undefined
                  )?.trueAnomalyPeriodDeg
                }
                helperText={
                  (
                    errors.orbitParameters as
                      | FieldErrors<TelesatOrbitParameters>
                      | undefined
                  )?.trueAnomalyPeriodDeg?.message
                }
                sx={{ mb: 3 }}
                {...register(`orbitParameters.trueAnomalyPeriodDeg`)}
              />
            )}
            {watchMode == 'walker' && (
              <TextField
                label="Relative Spacing"
                required={watchMode == 'walker'}
                defaultValue={1}
                error={
                  !!(
                    errors.orbitParameters as
                      | FieldErrors<WalkerOrbitParameters>
                      | undefined
                  )?.relativeSpacing
                }
                helperText={
                  (
                    errors.orbitParameters as
                      | FieldErrors<WalkerOrbitParameters>
                      | undefined
                  )?.relativeSpacing?.message
                }
                sx={{ mb: 3 }}
                {...register(`orbitParameters.relativeSpacing`)}
              />
            )}
            {watchMode == 'true-anomaly-shift' && (
              <TextField
                label="True anomaly delta (Deg)"
                required={watchMode == 'true-anomaly-shift'}
                error={
                  !!(
                    errors.orbitParameters as
                      | FieldErrors<TrueAnomalyShiftOrbitParameters>
                      | undefined
                  )?.trueAnomalyDeltaDeg
                }
                helperText={
                  (
                    errors.orbitParameters as
                      | FieldErrors<TrueAnomalyShiftOrbitParameters>
                      | undefined
                  )?.trueAnomalyDeltaDeg?.message
                }
                sx={{ mb: 3 }}
                {...register(`orbitParameters.trueAnomalyDeltaDeg`)}
              />
            )}
            <TextField
              label="Eccentricity"
              required={true}
              inputProps={{ min: 0, max: 1 }}
              defaultValue={0}
              error={!!errors.orbitParameters?.eccentricity}
              helperText={errors?.orbitParameters?.eccentricity?.message}
              sx={{ mb: 3 }}
              {...register(`orbitParameters.eccentricity`)}
            />
            <TextField
              label="Argument of Perigee (deg)"
              required={true}
              defaultValue={0}
              error={!!errors.orbitParameters?.argumentOfPerigeeDeg}
              helperText={errors?.orbitParameters?.argumentOfPerigeeDeg?.message}
              sx={{ mb: 3 }}
              {...register(`orbitParameters.argumentOfPerigeeDeg`)}
            />
            <DateTimePicker
              label="Epoch"
              required={true}
              timezone="UTC"
              format="yyyy-MM-dd HH:mm:ss+00:00"
              defaultValue={DateTime.utc().set({
                minute: 0,
                second: 0,
                millisecond: 0,
              })}
              {...register('orbitParameters.epoch')}
              onChange={(date) => {
                setValue('orbitParameters.epoch', date ? date.toISO()! : '');
                trigger('orbitParameters.epoch');
              }}
              slotProps={{
                textField: {
                  error: !!errors.orbitParameters?.epoch,
                  helperText: errors.orbitParameters?.epoch?.message,
                },
              }}
            />
            <TextField
              label="RAAN Base (deg)"
              required={true}
              defaultValue={0}
              error={!!errors.orbitParameters?.raanBaseDeg}
              helperText={errors?.orbitParameters?.raanBaseDeg?.message}
              sx={{ mb: 3 }}
              {...register(`orbitParameters.raanBaseDeg`)}
            />
            <TextField
              label="RAAN Spacing (deg)"
              error={!!errors.orbitParameters?.raanSpacingDeg}
              helperText={errors?.orbitParameters?.raanSpacingDeg?.message}
              {...register(`orbitParameters.raanSpacingDeg`)}
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="success"
          sx={{ mt: 3 }}
          fullWidth
          type="submit"
          disabled={!isValid}
        >
          Create Constellation
        </Button>
        <button onClick={() => deleteConstellation(constellationId)}>Supprimer</button>


      </form>

    </SectionModal>
  );
}

export default ConstellationModal;
