import { useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export default function UserProfilePage() {
  const [avatar, setAvatar] = useState(localStorage.getItem('seclab-user-avatar') || '');
  const [username, setUsername] = useState(localStorage.getItem('seclab-user-username') || 'Kullanici 1');
  const [email, setEmail] = useState(localStorage.getItem('seclab-user-email') || 'deneme2@gmail.com');
  const role = localStorage.getItem('seclab-user-role') || 'user';
  const roleLabel = role === 'admin' ? 'Yönetici' : role === 'user' ? 'Kullanıcı' : role;

  useEffect(() => {
    localStorage.setItem('seclab-user-username', username);
    localStorage.setItem('seclab-user-email', email);
  }, [username, email]);

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      setAvatar(result);
      localStorage.setItem('seclab-user-avatar', result);
    };

    reader.readAsDataURL(file);
  };

  return (
    <Box className="seclab-dashboard-page">
      <Paper className="seclab-hero-card">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
          <Avatar src={avatar} sx={{ width: 96, height: 96, border: '4px solid #bfdbfe' }}>
            {username.slice(0, 1)}
          </Avatar>

          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography variant="h2">Profilim</Typography>
            <Typography color="text.secondary">Yerel SecLab profil fotoğrafınızı ve hesap görünüm bilgilerinizi yönetin.</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" component="label">
                Avatar Yükle
                <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Üst Alanı Yenile
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper className="seclab-panel">
        <Stack spacing={2}>
          <Typography variant="h4">Hesap Bilgileri</Typography>
          <TextField label="Kullanıcı Adı" value={username} onChange={(event) => setUsername(event.target.value)} />
          <TextField label="E-posta" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField label="Rol" value={roleLabel} disabled />
          <Typography color="text.secondary">
            Avatar yalnızca demo amacıyla bu cihazda saklanır. Backend avatar desteği sonraki aşamada eklenebilir.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}