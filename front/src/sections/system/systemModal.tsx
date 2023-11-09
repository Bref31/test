import { ModalTitle, SectionModal } from 'components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import CircularProgress from '@mui/material/CircularProgress';
import systemSchema from './schema';
import { Button, TextField } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'store';
import { AddNewSystem } from 'store/thunks/systems.thunk';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ConstellationToolbar from './constellationToolbar';
import ConstellationModal from 'sections/constellation/constellationModal';
import { FetchConstellations } from 'store/thunks/constellation.thunk';
import { shallowEqual } from 'react-redux';
import { SystemCreate } from 'client/index';

interface Props {
  disabled: boolean;
}

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 220 },
];

function SystemModal({ disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [openNewSystem, setOpenNewSystem] = useState(false);
  const constellations = useAppSelector(
    (state) => state.constellations,
    shallowEqual,
  );
  const [isFilter, setIsFilter] = useState(false);
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(systemSchema),
  });

  function handleOpen(state: boolean) {
    setOpen(state);

    if (!constellations.hasBeenInitialize) {
      dispatch(FetchConstellations());
    }
  }

  const onSubmit = (data: SystemCreate) => {
    dispatch(AddNewSystem(data));
    reset();
    setOpen(false);
  };

  function getConstellationsRows() {
    if (!isFilter) return constellations.data;
    const selectedConstId = getValues().constellationIds;

    if (!selectedConstId) return [];
    return constellations.data.filter((c) => selectedConstId.includes(c.id));
  }

  return (
    <SectionModal
      btnTxt="Add a system"
      open={open}
      setOpen={handleOpen}
      disabled={disabled}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ width: '70vw', maxWidth: '70vw' }}
      >
        <ModalTitle title="New system" />
        <TextField
          label="System's name"
          fullWidth
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name')}
        />
        <Button
          sx={{ float: 'right', mb: 3 }}
          variant="outlined"
          color="success"
          type="button"
          onClick={() => setOpenNewSystem(true)}
        >
          Add new constellation
        </Button>
        <Button
          sx={{ float: 'right', mb: 3, mr: 3 }}
          variant="outlined"
          color="info"
          type="button"
          disabled={constellations.isLoading}
          onClick={() => setIsFilter((oldValue) => !oldValue)}
        >
          {isFilter ? 'Show all' : 'Show selected'}
        </Button>
        {constellations.isLoading ? (
          <CircularProgress />
        ) : (
          <DataGrid
            rows={getConstellationsRows()}
            columns={columns}
            checkboxSelection
            sx={{ width: '100%' }}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            slots={{ toolbar: ConstellationToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            onRowSelectionModelChange={(ids) => {
              setValue('constellationIds', ids as number[]);
              trigger('constellationIds');
            }}
          />
        )}
        <Button
          variant="outlined"
          color="success"
          sx={{ mt: 3 }}
          type="submit"
          fullWidth
          disabled={!isValid}
        >
          Save system
        </Button>
      </form>
      <ConstellationModal open={openNewSystem} setOpen={setOpenNewSystem} />
    </SectionModal>
  );
}

export default SystemModal;
