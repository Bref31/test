import { Allotment } from 'allotment';
import Allocation from 'sections/allocation';
import Eligibility from 'sections/eligibility';
import Ephemeris from 'sections/ephemeris';
import GroundSegment from 'sections/groundSegment';
import System from 'sections/system';
import Station from 'sections/station';
import Topology from 'sections/topology';
import UserRequest from 'sections/userRequest';

import s from './app.module.css';
import { Box, Paper } from '@mui/material';
import { CesiumViewer } from 'components/cesium';
import Navbar from 'components/navbar';
import { useAppSelector } from 'store';
import { useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';

function App() {
  const { message, status } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (message) {
      enqueueSnackbar(message, { variant: status, autoHideDuration: 2000 });
    }
    // eslint-disable-next-line
  }, [status, message]);

  return (
    <Box className={s.app}>
      <Navbar />
      <Allotment>
        <CesiumViewer />
        <Allotment.Pane
          preferredSize={500}
          minSize={300}
          className={s.sectionPanel}
        >
          <Paper sx={{ overflowY: 'auto' }}>
            <System />
            <Ephemeris />
            <Topology />
            <Station />
            <GroundSegment />
            <Eligibility />
            <UserRequest />
            <Allocation />
          </Paper>
        </Allotment.Pane>
      </Allotment>
    </Box>
  );
}

export default App;
