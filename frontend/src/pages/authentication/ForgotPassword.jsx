import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import AuthShell from 'sections/auth/AuthShell';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleRequestReset = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');
    setResetToken('');

    if (!email.trim()) {
      setError('E-posta adresi gereklidir.');
      return;
    }

    try {
      setIsRequesting(true);

      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || 'Sıfırlama kodu oluşturulamadı.');
      }

      setResetToken(data?.demo_reset_token || '');
      setMessage('Sıfırlama kodu oluşturuldu. Tamamlamak için yeni bir şifre girin.');
    } catch (requestError) {
      setError(requestError.message || 'Şifre sıfırlama isteği başarısız oldu.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!resetToken.trim() || !newPassword) {
      setError('Sıfırlama kodu ve yeni şifre gereklidir.');
      return;
    }

    try {
      setIsResetting(true);

      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken.trim(), password: newPassword })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || 'Şifre sıfırlanamadı.');
      }

      setNewPassword('');
      setMessage('Şifre başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz.');
    } catch (resetError) {
      setError(resetError.message || 'Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthShell title="Hesabınıza yeniden erişin" description="SecLab giriş akışından ayrılmadan demo sıfırlama kodu oluşturun ve yeni şifrenizi belirleyin.">
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3">Şifreyi Sıfırla</Typography>
          <Typography variant="body1" color="text.secondary">
            Sıfırlama kodu oluşturmak için hesap e-postanızı girin.
          </Typography>
        </Stack>

        {(error || message) && (
          <Stack spacing={1}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
          </Stack>
        )}

        <Stack component="form" spacing={2.25} onSubmit={handleRequestReset}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="reset-email">Hesap e-postası</InputLabel>
            <OutlinedInput
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
              fullWidth
              autoComplete="email"
            />
          </Stack>

          <Button disabled={isRequesting} fullWidth size="large" type="submit" variant="contained">
            Sıfırlama Kodu Oluştur
          </Button>
        </Stack>

        {resetToken && (
          <>
            <Divider />

            <Stack component="form" spacing={2.25} onSubmit={handleResetPassword}>
              <Stack spacing={0.75}>
                <Typography variant="h5">Şifre sıfırlamayı tamamlayın</Typography>
                <Typography variant="body2" color="text.secondary">
                  Demo modunda sıfırlama kodu ekranda gösterilir. Üretim ortamında bu kod e-postayla gönderilmelidir.
                </Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="reset-token">Demo sıfırlama kodu</InputLabel>
                <OutlinedInput
                  id="reset-token"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  fullWidth
                  sx={{ fontFamily: 'monospace', bgcolor: 'grey.50' }}
                />
                <FormHelperText>Bu kodu yalnızca yerel demo sıfırlama akışında kullanın.</FormHelperText>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="new-password">Yeni şifre</InputLabel>
                <OutlinedInput
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Yeni şifre"
                  fullWidth
                  autoComplete="new-password"
                />
              </Stack>

              <Button disabled={isResetting} fullWidth size="large" type="submit" variant="contained">
                Şifreyi Sıfırla
              </Button>
            </Stack>
          </>
        )}

        <Typography variant="body2" color="text.secondary">
          Şifrenizi hatırladınız mı?{' '}
          <Link component={RouterLink} to="/login">
            Giriş yap
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
