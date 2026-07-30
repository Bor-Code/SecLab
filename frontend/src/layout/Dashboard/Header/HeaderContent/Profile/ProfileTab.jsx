import { useEffect, useState } from 'react';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import HourglassOutlined from '@ant-design/icons/HourglassOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';

function formatDateTime(value) {
  if (!value || Number.isNaN(value)) return 'Yeniden girişte kaydedilecek';

  return new Date(value).toLocaleString('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

function formatRemaining(expiresAt, now) {
  if (!expiresAt || Number.isNaN(expiresAt)) return 'Bilinmiyor';

  const remainingMs = expiresAt - now;
  if (remainingMs <= 0) return 'Oturum sona erdi';

  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours} saat ${minutes} dakika`;
  return `${minutes} dakika`;
}

export default function ProfileTab() {
  const email = localStorage.getItem('seclab-user-email') || 'Bilinmiyor';
  const role = localStorage.getItem('seclab-user-role') || 'user';
  const startedAt = Number(localStorage.getItem('seclab-session-started-at'));
  const expiresAt = Number(localStorage.getItem('seclab-token-expires-at'));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const information = [
    {
      label: 'E-posta',
      value: email,
      icon: <MailOutlined />
    },
    {
      label: 'Yetki',
      value: role === 'admin' ? 'Yönetici' : 'Kullanıcı',
      icon: <SafetyCertificateOutlined />
    },
    {
      label: 'Oturum Açılışı',
      value: formatDateTime(startedAt),
      icon: <ClockCircleOutlined />
    },
    {
      label: 'Oturum Bitişi',
      value: formatDateTime(expiresAt),
      icon: <ClockCircleOutlined />
    },
    {
      label: 'Kalan Süre',
      value: formatRemaining(expiresAt, now),
      icon: <HourglassOutlined />
    }
  ];

  return (
    <List component="div" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      {information.map((item) => (
        <ListItem key={item.label} sx={{ py: 1 }}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} secondary={item.value} />
        </ListItem>
      ))}
    </List>
  );
}
