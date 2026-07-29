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
            <Typography variant="h2">Profile</Typography>
            <Typography color="text.secondary">Manage your local SecLab profile picture and account display details.</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" component="label">
                Upload Avatar
                <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
              </Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>
                Refresh Header
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper className="seclab-panel">
        <Stack spacing={2}>
          <Typography variant="h4">Account Details</Typography>
          <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
          <TextField label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField label="Role" value={role} disabled />
          <Typography color="text.secondary">
            Avatar is stored locally for demo use. Backend avatar persistence can be added in the next pass.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
