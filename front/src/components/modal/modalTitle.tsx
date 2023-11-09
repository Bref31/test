import { Typography } from '@mui/material';

const ModalTitle = ({ title }: { title: string }) => (
  <Typography
    variant="h4"
    sx={{ m: '0 auto 20px', width: '100%', textAlign: 'center' }}
  >
    {title}
  </Typography>
);

export default ModalTitle;
