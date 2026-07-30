import PropTypes from 'prop-types';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

export default function ProfilimTab({ onLogout }) {
  const username =
    localStorage.getItem('seclab-username') ||
    localStorage.getItem('seclab-user-username') ||
    'SecLab Kullanıcısı';

  const email = localStorage.getItem('seclab-user-email') || 'Oturum açık';
  const role = localStorage.getItem('seclab-user-role') || 'user';
  const roleLabel = role === 'admin' ? 'Y?netici' : 'Kullan?c?';

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary={username} secondary={`${email} · ${roleLabel}`} />
      </ListItemButton>

      <ListItemButton>
        <ListItemIcon>
          <DashboardOutlined />
        </ListItemIcon>
        <ListItemText primary="Çalışma Alanı" secondary="Konular, kay?tlar ve kaynaklar" />
      </ListItemButton>

      <ListItemButton onClick={onLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Çıkış Yap" />
      </ListItemButton>
    </List>
  );
}

ProfilimTab.propTypes = {
  onLogout: PropTypes.func
};