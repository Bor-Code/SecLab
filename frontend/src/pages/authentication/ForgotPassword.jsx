import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || 'Could not create reset token.');
      }

      setResetToken(data?.demo_reset_token || '');
      setMessage('Demo reset token created. Enter a new password below.');
    } catch (requestError) {
      setError(requestError.message || 'Password reset request failed.');
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: resetToken.trim(),
          password: newPassword
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || 'Could not reset password.');
      }

      setNewPassword('');
      setMessage('Password reset successfully. You can now log in.');
    } catch (resetError) {
      setError(resetError.message || 'Password reset failed.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h3">Reset Password</Typography>
          <Link component={RouterLink} to="/login" variant="h5">
            Back to login
          </Link>
        </Stack>
      </Grid>

      {error && (
        <Grid size={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {message && (
        <Grid size={12}>
          <Alert severity="success">{message}</Alert>
        </Grid>
      )}

      <Grid size={12}>
        <Stack component="form" spacing={2} onSubmit={handleRequestReset}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="reset-email">Email Address</InputLabel>
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
            Create Reset Token
          </Button>
        </Stack>
      </Grid>

      {resetToken && (
        <Grid size={12}>
          <Stack component="form" spacing={2} onSubmit={handleResetPassword}>
            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="reset-token">Demo Reset Token</InputLabel>
              <OutlinedInput
                id="reset-token"
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
                fullWidth
              />
              <FormHelperText>
                Demo ortam?nda token ekranda g?sterilir. Ger?ek sistemde bu token e-posta ile g?nderilir.
              </FormHelperText>
            </Stack>

            <Stack sx={{ gap: 1 }}>
              <InputLabel htmlFor="new-password">New Password</InputLabel>
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
              Reset Password
            </Button>
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}
