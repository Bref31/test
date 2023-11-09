import { Typography, AppBar, Toolbar, Box } from '@mui/material';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="logo">Smart</Typography>
          <Typography variant="logo" color="secondary">
            Link
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
