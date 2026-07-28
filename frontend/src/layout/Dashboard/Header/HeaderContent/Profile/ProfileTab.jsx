import PropTypes from 'prop-types';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

export default function ProfileTab({ onLogout }) {
  const username = localStorage.getItem('seclab-username') || 'SecLab User';
  const email = localStorage.getItem('seclab-user-email') || 'Signed in';
  const role = localStorage.getItem('seclab-user-role') || 'user';

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 36 } }}>
      <ListItemButton>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary={username} secondary={`${email} ? ${role}`} />
      </ListItemButton>

      <ListItemButton>
        <ListItemIcon>
          <DashboardOutlined />
        </ListItemIcon>
        <ListItemText primary="Workspace" secondary="Topics, logs, and resources" />
      </ListItemButton>

      <ListItemButton onClick={onLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = {
  onLogout: PropTypes.func
};
