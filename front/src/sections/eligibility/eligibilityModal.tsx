import { ModalTitle, SectionModal } from '../../components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import schema from './schema';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { useAppDispatch } from 'store';
import { ComputeEligibility, EligibilityForm } from 'store/thunks/eligibility.thunk';
import { EligibilityRequest } from 'client/index';

interface Props {
  disabled: boolean;
  defaultTimeStep?: number;
}

function EligibilityModal({ disabled, defaultTimeStep }: Props) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: EligibilityForm) => {
    dispatch(ComputeEligibility(data));
    setOpen(false);
  };

  return (
    <SectionModal
      btnTxt="Create an eligibility"
      open={open}
      setOpen={setOpen}
      disabled={disabled}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalTitle title="New eligibility" />
        <TextField
          label="Stations elevation *"
          type="number"
          inputProps={{ min: 1 }}
          error={!!errors.stationWithMasks}
          helperText={errors.stationWithMasks?.message}
          {...register('stationWithMasks')}
        />
        <TextField
          label="Steps (en secondes)"
          type="number"
          inputProps={{ min: 1 }}
          defaultValue={defaultTimeStep}
          error={!!errors.step}
          helperText={errors.step?.message}
          {...register('step')}
        />
        <FormControl fullWidth>
          <InputLabel id="eligibility-backend">Backend</InputLabel>
          <Select
            defaultValue={EligibilityRequest.backend.CELEST}
            fullWidth
            sx={{ mb: 3 }}
            labelId="eligibility-backend"
            label="Backend"
            error={!!errors.backend}
            {...register('backend')}
          >
            {(Object.values(EligibilityRequest.backend) as Array<string>).map((key) => (
              <MenuItem value={key} key={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box>
          <FormControlLabel
            control={<Switch />}
            label="Use velocity"
            {...register('cache')}
          />
        </Box>
        <Button
          variant="outlined"
          color="success"
          sx={{ mt: 3 }}
          fullWidth
          type="submit"
          disabled={!isValid}
        >
          Save eligibility
        </Button>
      </form>
    </SectionModal>
  );
}

export default EligibilityModal;
