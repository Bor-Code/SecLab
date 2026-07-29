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
      setError('Email address is required.');
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
        throw new Error(data?.detail || 'Could not create reset token.');
      }

      setResetToken(data?.demo_reset_token || '');
      setMessage('Reset token created. Enter a new password to finish.');
    } catch (requestError) {
      setError(requestError.message || 'Şifre reset request failed.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!resetToken.trim() || !newPassword) {
      setError('Reset token and new password are required.');
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
        throw new Error(data?.detail || 'Could not reset password.');
      }

      setNewPassword('');
      setMessage('Şifre reset successfully. You can now log in.');
    } catch (resetError) {
      setError(resetError.message || 'Şifre reset failed.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthShell title="Recover access quickly" description="Generate a demo reset token and set a new password without leaving the SecLab auth flow.">
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h3">Reset Şifre</Typography>
          <Typography variant="body1" color="text.secondary">
            Enter your account email to create a reset token.
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
            <InputLabel htmlFor="reset-email">Account email</InputLabel>
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
            Sıfırlama Tokenı Oluştur
          </Button>
        </Stack>

        {resetToken && (
          <>
            <Divider />

            <Stack component="form" spacing={2.25} onSubmit={handleResetPassword}>
              <Stack spacing={0.75}>
                <Typography variant="h5">Finish password reset</Typography>
                <Typography variant="body2" color="text.secondary">
                  Demo mode shows the token on screen. Production should send it by email.
                </Typography>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="reset-token">Demo reset token</InputLabel>
                <OutlinedInput
                  id="reset-token"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  fullWidth
                  sx={{ fontFamily: 'monospace', bgcolor: 'grey.50' }}
                />
                <FormHelperText>Use this token only for the local demo reset flow.</FormHelperText>
              </Stack>

              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="new-password">New password</InputLabel>
                <OutlinedInput
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="New password"
                  fullWidth
                  autoComplete="new-password"
                />
              </Stack>

              <Button disabled={isResetting} fullWidth size="large" type="submit" variant="contained">
                Reset Şifre
              </Button>
            </Stack>
          </>
        )}

        <Typography variant="body2" color="text.secondary">
          Remembered your password?{' '}
          <Link component={RouterLink} to="/login">
            Logine dön
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
}
