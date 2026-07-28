import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { changePassword, updateMyProfile } from 'api/seclab';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserProfilePage() {
  const storedUsername = localStorage.getItem('seclab-username') || localStorage.getItem('seclab-user-username') || 'SecLab User';
  const storedEmail = localStorage.getItem('seclab-user-email') || 'Signed in';
  const role = localStorage.getItem('seclab-user-role') || 'user';

  const [username, setUsername] = useState(storedUsername);
  const [email, setEmail] = useState(storedEmail);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername) {
      setError('Username is required.');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    try {
      setIsProfileSaving(true);

      const updatedUser = await updateMyProfile({
        username: trimmedUsername,
        email: trimmedEmail
      });

      localStorage.setItem('seclab-username', updatedUser.username);
      localStorage.setItem('seclab-user-username', updatedUser.username);
      localStorage.setItem('seclab-user-email', updatedUser.email);

      setUsername(updatedUser.username);
      setEmail(updatedUser.email);
      setMessage('Profile updated successfully.');
    } catch (profileError) {
      console.error('Profile update failed:', profileError);
      setError(profileError.message || 'Profile update failed.');
    } finally {
      setIsProfileSaving(false);
    }
  }

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
      setIsPasswordSaving(true);
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
      setIsPasswordSaving(false);
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

      {message && <Alert severity="success" onClose={() => setMessage(null)}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <MainCard title="Account Information">
        <Stack component="form" spacing={2} onSubmit={handleProfileSubmit}>
          <Typography variant="body1" color="text.secondary">
            Update your display name and email address.
          </Typography>

          <Divider />

          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            fullWidth
          />

          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={isProfileSaving} sx={{ py: 1.25 }}>
            {isProfileSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </Stack>
      </MainCard>

      <MainCard title="Password Reset">
        <Stack component="form" spacing={2} onSubmit={handlePasswordSubmit}>
          <Typography variant="body1" color="text.secondary">
            Update your account password when you know your current password.
          </Typography>

          <Divider />

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

          <Button type="submit" variant="contained" disabled={isPasswordSaving} sx={{ py: 1.25 }}>
            {isPasswordSaving ? 'Saving...' : 'Reset Password'}
          </Button>
        </Stack>
      </MainCard>
    </Stack>
  );
}
