import { ModalTitle, SectionModal } from '../../components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import schema from './schema';
import { Button } from '@mui/material';
// import { useAppDispatch } from 'store';

function AllocationModal() {
  const [open, setOpen] = useState(false);
  // const dispatch = useAppDispatch();
  const {
    // register,
    handleSubmit,
    reset,
    formState: { /*errors, */ isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    // dispatch(AddNewAllocation(data));
    reset();
    setOpen(false);
  };

  return (
    <SectionModal btnTxt="Create an allocation" open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalTitle title="New allocation" />
        <Button
          variant="outlined"
          color="success"
          sx={{ mt: 3 }}
          type="submit"
          disabled={!isValid}
        >
          Save allocation
        </Button>
      </form>
    </SectionModal>
  );
}

export default AllocationModal;
