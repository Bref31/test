import { ModalTitle, SectionModal } from 'components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import s from 'components/modal/modal.module.css';

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
import { AddNewTopology } from 'store/thunks/topologies.thunk';
import { ConstellationInfo, TopologyCreate } from 'client/index';

interface Props {
  constellations: ConstellationInfo[];
  disabled: boolean;
}

function TopologyModal({ constellations, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      parameters: {
        mode: 'simple',
      },
    },
  });

  const onSubmit = (data: TopologyCreate) => {
    dispatch(AddNewTopology(data));
    reset();
    setOpen(false);
  };

  return (
    <SectionModal
      btnTxt="Add a topology"
      open={open}
      setOpen={setOpen}
      disabled={disabled}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '500px' }}>
        <ModalTitle title="New topology" />
        <FormControl fullWidth>
          <InputLabel id="topo-const-new">Constellation *</InputLabel>
          <Select
            sx={{ mb: 3 }}
            labelId="topo-const-new"
            label="Constellation *"
            defaultValue=""
            error={!!errors.constellationId}
            {...register('constellationId')}
          >
            {constellations.map((c) => (
              <MenuItem value={c.id} key={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Topology name *"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Shift index"
          type="number"
          error={!!errors.parameters?.shiftIndex}
          helperText={errors.parameters?.shiftIndex?.message}
          {...register('parameters.shiftIndex', {
            valueAsNumber: true,
          })}
          sx={{ mb: 3 }}
        />
        <Box className={s.switch_container}>
          <FormControlLabel
            control={<Switch />}
            label="Intra plane"
            {...register('parameters.intraPlane')}
          />
          <FormControlLabel
            control={<Switch />}
            label="Inter plane"
            {...register('parameters.interPlane')}
          />
        </Box>
        <Box>
          <FormControlLabel
            control={<Switch />}
            label="Exclude seam"
            {...register('parameters.excludeSeam')}
          />
        </Box>
        <Button
          variant="outlined"
          color="success"
          sx={{ mt: 3 }}
          type="submit"
          disabled={!isValid}
        >
          Save topology
        </Button>
      </form>
    </SectionModal>
  );
}

export default TopologyModal;
