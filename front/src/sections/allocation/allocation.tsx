import RecordVoiceOverAltIcon from '@mui/icons-material/RecordVoiceOver';
import MenuCollapse from 'components/menuCollapse';
import AllocationModal from './allocationModal';

function AllocationSection() {
  return (
    <MenuCollapse
      sectionName="Allocation"
      icon={RecordVoiceOverAltIcon}
      disabled={true}
    >
      <AllocationModal />
    </MenuCollapse>
  );
}

export default AllocationSection;
