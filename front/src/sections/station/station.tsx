import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from 'store';

import StationModal from './stationModal';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MenuCollapse from 'components/menuCollapse';
import { FetchStations } from 'store/thunks/station.thunk';

function StationSection() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.stations);

  useEffect(() => {
    dispatch(FetchStations());
    // eslint-disable-next-line
  }, []);

  return (
    <MenuCollapse
      sectionName="Stations"
      icon={LocationCityIcon}
      isLoading={isLoading}
    >
      <StationModal disabled={isLoading} />
    </MenuCollapse>
  );
}

export default StationSection;
