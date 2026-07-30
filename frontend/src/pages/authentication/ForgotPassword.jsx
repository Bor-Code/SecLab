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
import { requestPasswordReset, resetPassword } from 'api/seclab';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleRequestReset(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');

    if (!email.trim()) {
      setError('E-posta adresi zorunludur.');
      return;
    }

    try {
      setIsRequesting(true);

      const data = await requestPasswordReset(email.trim().toLowerCase());

      setResetToken(data.demo_reset_token || '');
      setMessage('Sıfırlama kodu oluşturuldu. Yeni şifrenizi belirleyebilirsiniz.');
    } catch (requestError) {
      setError(requestError.message || 'Şifre sıfırlama isteği başarısız oldu.');
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!resetToken.trim()) {
      setError('Şifre sıfırlama kodu bulunamadı.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Yeni şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler birbiriyle eşleşmiyor.');
      return;
    }

    try {
      setIsResetting(true);

      await resetPassword(resetToken.trim(), newPassword);

      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.');
    } catch (resetError) {
      setError(resetError.message || 'Şifre sıfırlama işlemi başarısız oldu.');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <AuthShell title="Hesabınıza Yeniden Erişin" description="E-posta adresinizle sıfırlama kodu oluşturun ve yeni şifrenizi belirleyin.">
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3">Şifremi Unuttum</Typography>
          <Typography variant="body1" color="text.secondary">
            Hesabınıza kayıtlı e-posta adresini girin.
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
            <InputLabel htmlFor="reset-email">Hesap E-postası</InputLabel>
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
            {isRequesting ? 'Kod oluşturuluyor...' : 'Sıfırlama Kodu Oluştur'}
          </Button>
        </Stack>

        {resetToken && (
          <>
            <Divider />

            <Stack component="form" spacing={2.25} onSubmit={handleResetPassword}>
              <Stack spacing={0.75}>
                <Typography variant="h5">Yeni Şifrenizi Belirleyin</Typography>
                <Typography variant="body2" color="text.secondary">
                  Demo ortamında sıfırlama kodu ekranda gösterilir.
                </Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="reset-token">Demo Sıfırlama Kodu</InputLabel>
                <OutlinedInput
                  id="reset-token"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  fullWidth
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: 'grey.50'
                  }}
                />
                <FormHelperText>Bu kod 15 dakika süreyle geçerlidir.</FormHelperText>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="new-password">Yeni Şifre</InputLabel>
                <OutlinedInput
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="En az 8 karakter"
                  fullWidth
                  autoComplete="new-password"
                />
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="confirm-password">Yeni Şifre Tekrar</InputLabel>
                <OutlinedInput
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Yeni şifrenizi tekrar girin"
                  fullWidth
                  autoComplete="new-password"
                />
              </Stack>

              <Button disabled={isResetting} fullWidth size="large" type="submit" variant="contained">
                {isResetting ? 'Şifre sıfırlanıyor...' : 'Şifreyi Sıfırla'}
              </Button>
            </Stack>
          </>
        )}

        <Typography variant="body2" color="text.secondary">
          Şifrenizi hatırladınız mı?{' '}
          <Link component={RouterLink} to="/login">
            Giriş sayfasına dön
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
