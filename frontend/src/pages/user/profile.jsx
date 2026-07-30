import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { fetchCurrentUser, updateCurrentUser } from 'api/seclab';
import { getUserStorageKey } from 'utils/authStorage';

export default function UserProfilePage() {
  const avatarStorageKey = useMemo(() => getUserStorageKey('seclab-user-avatar'), []);
  const [avatar, setAvatar] = useState(() => localStorage.getItem(avatarStorageKey) || '');
  const [username, setUsername] = useState(() => localStorage.getItem('seclab-user-username') || '');
  const [email, setEmail] = useState(() => localStorage.getItem('seclab-user-email') || '');
  const [role, setRole] = useState(() => localStorage.getItem('seclab-user-role') || 'user');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
        localStorage.setItem('seclab-user-username', user.username);
        localStorage.setItem('seclab-user-email', user.email);
        localStorage.setItem('seclab-user-role', user.role);
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message || 'Profil bilgileri yüklenemedi.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function handleAvatarUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError(null);
    setMessage(null);

    if (!file.type.startsWith('image/')) {
      setError('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Avatar dosyası en fazla 2 MB olabilir.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || '');
      setAvatar(result);
      localStorage.setItem(avatarStorageKey, result);
      window.dispatchEvent(
        new CustomEvent('seclab-user-avatar-updated', {
          detail: result
        })
      );
      setMessage('Avatar güncellendi.');
    };

    reader.readAsDataURL(file);
  }

  async function handleSaveProfile() {
    setError(null);
    setMessage(null);

    if (!username.trim() || !email.trim()) {
      setError('Kullanıcı adı ve e-posta zorunludur.');
      return;
    }

    try {
      setIsSaving(true);
      const updatedUser = await updateCurrentUser({
        username: username.trim(),
        email: email.trim().toLowerCase()
      });

      setUsername(updatedUser.username);
      setEmail(updatedUser.email);
      setRole(updatedUser.role);
      localStorage.setItem('seclab-user-username', updatedUser.username);
      localStorage.setItem('seclab-user-email', updatedUser.email);
      localStorage.setItem('seclab-user-role', updatedUser.role);
      window.dispatchEvent(
        new CustomEvent('seclab-user-profile-updated', {
          detail: updatedUser
        })
      );
      setMessage('Profil bilgileri kaydedildi.');
    } catch (saveError) {
      setError(saveError.message || 'Profil güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Box className="seclab-dashboard-page">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper className="seclab-hero-card">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'center' }}>
          <Avatar
            src={avatar}
            sx={{
              width: 96,
              height: 96,
              border: '4px solid #bfdbfe'
            }}
          >
            {username.slice(0, 1).toUpperCase()}
          </Avatar>

          <Stack spacing={1} sx={{ flex: 1 }}>
            <Typography variant="h2">Profil</Typography>
            <Typography color="text.secondary">Profil resminizi ve gerçek hesap bilgilerinizi yönetin.</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" component="label">
                Avatar Yükle
                <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper className="seclab-panel">
        <Stack spacing={2}>
          <Typography variant="h4">Hesap Bilgileri</Typography>
          <TextField label="Kullanıcı Adı" value={username} onChange={(event) => setUsername(event.target.value)} disabled={isSaving} />
          <TextField label="E-posta" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSaving} />
          <TextField label="Rol" value={role === 'admin' ? 'Yönetici' : 'Kullanıcı'} disabled />
          <Button variant="contained" onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : 'Bilgileri Kaydet'}
          </Button>
          <Typography color="text.secondary">Hesap bilgileri veritabanında, avatar ise bu tarayıcıda kullanıcıya özel saklanır.</Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
