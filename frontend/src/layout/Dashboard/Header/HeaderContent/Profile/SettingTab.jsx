import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import LockOutlined from '@ant-design/icons/LockOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

const settings = [
  {
    title: 'Hesap Bilgileri',
    description: 'Profil fotoğrafı, kullanıcı adı ve e-posta',
    icon: <UserOutlined />,
    segment: 'account'
  },
  {
    title: 'Şifre ve Güvenlik',
    description: 'Mevcut şifrenizi güvenli biçimde değiştirin',
    icon: <LockOutlined />,
    segment: 'security'
  },
  {
    title: 'Oturum Yönetimi',
    description: 'Aktif oturum süresini görüntüleyin veya çıkış yapın',
    icon: <ClockCircleOutlined />,
    segment: 'session'
  }
];

export default function SettingTab({ onClose }) {
  const navigate = useNavigate();
  const role = localStorage.getItem('seclab-user-role');
  const basePath = role === 'admin' ? '/admin/settings' : '/user/settings';

  const handleNavigate = (segment) => {
    onClose?.();
    navigate(`${basePath}/${segment}`);
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 34 } }}>
      {settings.map((setting) => (
        <ListItemButton key={setting.segment} onClick={() => handleNavigate(setting.segment)} sx={{ py: 1.25 }}>
          <ListItemIcon>{setting.icon}</ListItemIcon>
          <ListItemText primary={setting.title} secondary={setting.description} />
          <RightOutlined style={{ fontSize: 12 }} />
        </ListItemButton>
      ))}
    </List>
  );
}

SettingTab.propTypes = {
  onClose: PropTypes.func
};
