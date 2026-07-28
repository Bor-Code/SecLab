import PropTypes from 'prop-types';
import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

import { changePassword } from 'api/seclab';

export default function ProfileTab({ onLogout }) {
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
      setMessage('Password changed successfully.');
    } catch (changeError) {
      console.error('Password change failed:', changeError);
      setError('Password change failed. Check your current password.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Stack sx={{ gap: 1.5 }}>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 36 } }}>
        <ListItemButton>
          <ListItemIcon>
            <UserOutlined />
          </ListItemIcon>
          <ListItemText primary={username} secondary={`${email} ? ${role}`} />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <DashboardOutlined />
          </ListItemIcon>
          <ListItemText primary="Workspace" secondary="Topics, logs, and resources" />
        </ListItemButton>

        <ListItemButton onClick={onLogout}>
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      <Divider />

      <Stack component="form" onSubmit={handlePasswordSubmit} sx={{ gap: 1.25, px: 2, pb: 2 }}>
        <Typography variant="subtitle1">Change Password</Typography>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Current password"
          type="password"
          size="small"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />

        <TextField
          label="New password"
          type="password"
          size="small"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />

        <TextField
          label="Confirm new password"
          type="password"
          size="small"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />

        <Button type="submit" variant="contained" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Update Password'}
        </Button>
      </Stack>
    </Stack>
  );
}

ProfileTab.propTypes = {
  onLogout: PropTypes.func
};
