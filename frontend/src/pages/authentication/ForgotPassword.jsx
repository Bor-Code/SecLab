import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Paper from '@mui/material/Paper';
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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 5
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 640,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          boxShadow: '0 8px 28px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden'
        }}
      >
        <Stack spacing={0}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              px: { xs: 3, sm: 4 },
              pt: { xs: 3, sm: 4 },
              pb: 3
            }}
          >
            <Stack spacing={0.75}>
              <Typography variant="h3">Reset Password</Typography>
              <Typography variant="body1" color="text.secondary">
                Create a demo reset token and choose a new password.
              </Typography>
            </Stack>

            <Link component={RouterLink} to="/login" variant="subtitle1" sx={{ whiteSpace: 'nowrap' }}>
              Back to login
            </Link>
          </Stack>

          <Divider />

          <Stack spacing={3} sx={{ px: { xs: 3, sm: 4 }, py: { xs: 3, sm: 4 } }}>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

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

            {resetToken && (
              <>
                <Divider />

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
                      In demo mode, the reset token is shown on screen. In production, this token will be sent by email.
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
              </>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}