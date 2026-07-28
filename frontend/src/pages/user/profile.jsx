import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { changePassword } from 'api/seclab';

export default function UserProfilePage() {
  const username = localStorage.getItem('seclab-username') || 'SecLab User';
  const email = localStorage.getItem('seclab-user-email') || 'Signed in';
  const role = localStorage.getItem('seclab-user-role') || 'user';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Fill all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    try {
      setIsSaving(true);
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Password updated successfully.');
    } catch (changeError) {
      console.error('Password update failed:', changeError);
      setError('Password update failed. Check your current password.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <MainCard title="My Profile">
        <Stack spacing={2}>
          <Typography variant="h4">{username}</Typography>
          <Typography variant="body1" color="text.secondary">
            {email}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={`Role: ${role}`} color="primary" variant="outlined" />
            <Chip label="Session active" variant="outlined" />
          </Stack>
        </Stack>
      </MainCard>

      <MainCard title="Password Reset">
        <Stack component="form" spacing={2} onSubmit={handlePasswordSubmit}>
          <Typography variant="body1" color="text.secondary">
            Update your account password without leaving the workspace.
          </Typography>

          <Divider />

          {message && <Alert severity="success" onClose={() => setMessage(null)}>{message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

          <TextField
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            fullWidth
          />

          <TextField
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            fullWidth
          />

          <TextField
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={isSaving} sx={{ py: 1.25 }}>
            {isSaving ? 'Saving...' : 'Reset Password'}
          </Button>
        </Stack>
      </MainCard>
    </Stack>
  );
}
