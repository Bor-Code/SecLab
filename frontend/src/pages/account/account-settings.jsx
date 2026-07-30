import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import avatar1 from 'assets/images/users/avatar-1.png';
import { fetchCurrentUser, updateCurrentUser } from 'api/seclab';
import { getUserStorageKey } from 'utils/authStorage';

export default function AccountSettingsPage() {
  const avatarStorageKey = useMemo(() => getUserStorageKey('seclab-user-avatar'), []);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [avatar, setAvatar] = useState(() => localStorage.getItem(avatarStorageKey) || avatar1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        setUsername(user.username);
        setEmail(user.email);
        setRole(user.role);
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Hesap bilgileri yüklenemedi.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
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
      setError('Profil fotoğrafı en fazla 2 MB olabilir.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      localStorage.setItem(avatarStorageKey, result);
      setAvatar(result);
      window.dispatchEvent(new CustomEvent('seclab-user-avatar-updated', { detail: result }));
      setMessage('Profil fotoğrafı güncellendi.');
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
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
      window.dispatchEvent(new CustomEvent('seclab-user-profile-updated', { detail: updatedUser }));
      setMessage('Hesap bilgileri kaydedildi.');
    } catch (saveError) {
      setError(saveError.message || 'Hesap bilgileri güncellenemedi.');
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
        <Stack spacing={1}>
          <Typography variant="h2">Hesap Bilgileri</Typography>
          <Typography color="text.secondary">Profil fotoğrafınızı ve temel hesap bilgilerinizi yönetin.</Typography>
        </Stack>
      </Paper>

      <Paper className="seclab-panel">
        <Stack spacing={3}>
          <Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={2}
  sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
>
            <Avatar src={avatar} sx={{ width: 88, height: 88 }}>
              {username.slice(0, 1).toUpperCase()}
            </Avatar>
            <Stack spacing={1}>
              <Button variant="outlined" component="label" disabled={isLoading || isSaving}>
                Profil Fotoğrafı Seç
                <input hidden accept="image/png,image/jpeg,image/webp" type="file" onChange={handleAvatarUpload} />
              </Button>
              <Typography variant="caption" color="text.secondary">
                PNG, JPG veya WEBP. En fazla 2 MB.
              </Typography>
            </Stack>
          </Stack>

          <TextField
            label="Kullanıcı Adı"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={isLoading || isSaving}
          />
          <TextField
            label="E-posta"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isLoading || isSaving}
          />
          <TextField label="Yetki" value={role === 'admin' ? 'Yönetici' : 'Kullanıcı'} disabled />
          <Button variant="contained" onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
