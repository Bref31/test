import { PropsWithChildren, ReactElement } from 'react';

import s from './modal.module.css';
import { Box, Button, IconButton, Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props extends PropsWithChildren {
  btnTxt?: string;
  open: boolean;
  disabled?: boolean;
  sectionContent?: ReactElement | null;
  setOpen: (open: boolean) => void;
  keepMounted?: boolean;
}

function SectionModal({
  children,
  btnTxt,
  open,
  sectionContent,
  setOpen,
  disabled = false,
  keepMounted = false,
}: Props) {
  return (
    <>
      {btnTxt && (
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          {btnTxt}
        </Button>
      )}
      {sectionContent && sectionContent}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        className={s.modal}
        keepMounted={keepMounted}
      >
        <Box sx={{ bgcolor: 'background.paper' }} className={s.box}>
          <IconButton
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          {children}
        </Box>
      </Modal>
    </>
  );
}

export default SectionModal;
