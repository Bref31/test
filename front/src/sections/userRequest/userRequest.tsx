import UserRequestModal from './userRequestModal';
import GroupAltIcon from '@mui/icons-material/Group';
import MenuCollapse from 'components/menuCollapse';

function UserRequestSection() {
  return (
    <MenuCollapse
      sectionName="User request"
      icon={GroupAltIcon}
      disabled={true}
    >
      <UserRequestModal />
    </MenuCollapse>
  );
}

export default UserRequestSection;
