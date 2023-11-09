import { GridToolbarContainer, GridToolbarQuickFilter } from '@mui/x-data-grid';

function ConstellationToolbar() {
  return (
    <GridToolbarContainer
      sx={{ display: 'flex', justifyContent: 'space-between' }}
    >
      <GridToolbarQuickFilter sx={{ m: 1, width: '100%' }} />
      {/* <Box>
        <Button variant="outlined" color="info" type="button">
          Show selected
        </Button>
        <Button variant="outlined" color="success" type="button" sx={{ ml: 2 }}>
          Add new constellation
        </Button>
      </Box> */}
    </GridToolbarContainer>
  );
}

export default ConstellationToolbar;
