import AntennaAltIcon from '@mui/icons-material/SettingsInputAntenna';

import { useAppSelector } from 'store';

import EligibilityModal from './eligibilityModal';
import MenuCollapse from 'components/menuCollapse';
import { groundSegmentsSelectors } from 'store/slices';
import { Duration } from 'luxon';

function EgibilitySection() {
  const { progressOnGoing, progressCount, progressTotal } = useAppSelector(
    (state) => state.eligibilities,
  );
  const ephemeris = useAppSelector((state) => state.ephemeris.data);
  const groundSegment = useAppSelector(groundSegmentsSelectors.selectCurrent);

  return (
    <MenuCollapse
      sectionName="Eligibility"
      icon={AntennaAltIcon}
      disabled={!ephemeris || !groundSegment}
      isLoading={progressOnGoing}
      progress={
        progressTotal == 0
          ? undefined
          : Math.ceil((100 * progressCount) / progressTotal)
      }
    >
      <EligibilityModal
        disabled={progressOnGoing}
        defaultTimeStep={Duration.fromISO(ephemeris?.horizon.step!).toMillis() / 1000}
      />
    </MenuCollapse>
  );
}

export default EgibilitySection;
