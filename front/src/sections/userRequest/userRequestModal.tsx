import { ModalTitle, SectionModal } from '../../components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import schema from './schema';
import { Box, Button } from '@mui/material';
import FileUpload from 'components/fileUpload/FileUpload';
// import { useAppDispatch } from 'store';

function UserRequestModal() {
  const [open, setOpen] = useState(false);
  // const dispatch = useAppDispatch();
  const {
    trigger,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    // dispatch(AddNewUserRequest({ data }));
    reset();
    setOpen(false);
  };

  return (
    <SectionModal btnTxt="Select user request" open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalTitle title="New user request" />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <FileUpload
            accept=".csv"
            onFileChange={(file) => {
              setValue('userRequest', file as any);
              trigger('userRequest');
            }}
          />
          <Button
            variant="outlined"
            color="success"
            sx={{ mt: 3 }}
            type="submit"
            disabled={!isValid}
          >
            Save user request
          </Button>
        </Box>
      </form>
    </SectionModal>
  );
}

export default UserRequestModal;
