import { useEffect, useState } from 'react';

import { useAppSelector } from 'store';

import TopologyField from './topologyField';
import TopologyModal from './topologyModal';
import HubIcon from '@mui/icons-material/Hub';
import { Box } from '@mui/material';
import MenuCollapse from 'components/menuCollapse';
import { systemsSelectors } from 'store/slices';

const Topology = () => {
  const constellations = useAppSelector(
    (state) => systemsSelectors.selectCurrent(state)?.constellations || [],
  );
  const isLoading = useAppSelector((state) => state.topologies.isLoading);

  return (
    <MenuCollapse
      icon={HubIcon}
      sectionName="Topology"
      disabled={constellations.length == 0}
      isLoading={isLoading}
    >
      <Box>
        {constellations.map((c) => (
          <TopologyField constId={c.id} name={c.name} key={c.id} disabled={isLoading} />
        ))}
      </Box>
      {constellations.length > 0 && (
        <TopologyModal constellations={constellations} disabled={isLoading} />
      )}
    </MenuCollapse>
  );
};

export default Topology;
