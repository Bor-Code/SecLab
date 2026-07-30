import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { changeCurrentUserPassword } from 'api/seclab';
import { clearAuthStorage } from 'utils/authStorage';

export default function SecuritySettingsPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Tüm şifre alanlarını doldurun.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Yeni şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Yeni şifre ile şifre tekrarı eşleşmiyor.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('Yeni şifre mevcut şifreden farklı olmalıdır.');
      return;
    }

    try {
      setIsSaving(true);
      await changeCurrentUserPassword({
        currentPassword,
        newPassword
      });
      clearAuthStorage();
      navigate('/login', {
        replace: true,
        state: { message: 'Şifreniz değiştirildi. Yeni şifrenizle tekrar giriş yapın.' }
      });
    } catch (saveError) {
      setError(saveError.message || 'Şifre değiştirilemedi.');
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

      <Paper className="seclab-hero-card">
        <Stack spacing={1}>
          <Typography variant="h2">Şifre ve Güvenlik</Typography>
          <Typography color="text.secondary">Hesabınızı korumak için şifrenizi düzenli olarak güncelleyin.</Typography>
        </Stack>
      </Paper>

      <Paper className="seclab-panel" component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Mevcut Şifre"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            disabled={isSaving}
          />
          <TextField
            label="Yeni Şifre"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            helperText="En az 8 karakter kullanın."
            disabled={isSaving}
          />
          <TextField
            label="Yeni Şifre Tekrar"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            disabled={isSaving}
          />
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isSaving ? 'Şifre Değiştiriliyor...' : 'Şifreyi Değiştir'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
