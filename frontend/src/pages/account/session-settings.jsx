import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { clearAuthStorage } from 'utils/authStorage';

function formatDateTime(value) {
  if (!value || Number.isNaN(value)) return 'Yeniden girişte kaydedilecek';
  return new Date(value).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'medium' });
}

function formatRemaining(expiresAt, now) {
  if (!expiresAt || Number.isNaN(expiresAt)) return 'Bilinmiyor';

  const remainingMs = expiresAt - now;
  if (remainingMs <= 0) return 'Oturum sona erdi';

  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} saat ${minutes} dakika` : `${minutes} dakika`;
}

export default function SessionSettingsPage() {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const startedAt = Number(localStorage.getItem('seclab-session-started-at'));
  const expiresAt = Number(localStorage.getItem('seclab-token-expires-at'));
  const username = localStorage.getItem('seclab-user-username') || 'Bilinmiyor';
  const email = localStorage.getItem('seclab-user-email') || 'Bilinmiyor';
  const role = localStorage.getItem('seclab-user-role') || 'user';

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  function handleLogout() {
    clearAuthStorage();
    navigate('/login', { replace: true });
  }

  return (
    <Box className="seclab-dashboard-page">
      <Alert severity="info" sx={{ mb: 2 }}>
        SecLab şu anda bu tarayıcıdaki aktif oturumu gösterir. Çıkış yaptığınızda yerel oturum bilgileri temizlenir.
      </Alert>

      <Paper className="seclab-hero-card">
        <Stack spacing={1}>
          <Typography variant="h2">Oturum Yönetimi</Typography>
          <Typography color="text.secondary">Aktif oturumunuzu görüntüleyin ve gerektiğinde güvenli biçimde kapatın.</Typography>
        </Stack>
      </Paper>

      <Paper className="seclab-panel">
        <Stack spacing={2}>
          <TextField label="Kullanıcı" value={username} disabled />
          <TextField label="E-posta" value={email} disabled />
          <TextField label="Yetki" value={role === 'admin' ? 'Yönetici' : 'Kullanıcı'} disabled />
          <TextField label="Oturum Açılışı" value={formatDateTime(startedAt)} disabled />
          <TextField label="Oturum Bitişi" value={formatDateTime(expiresAt)} disabled />
          <TextField label="Kalan Süre" value={formatRemaining(expiresAt, now)} disabled />
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Bu Cihazdaki Oturumu Kapat
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
