import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoginError('');

    if (!email.trim() || !password) {
      setLoginError('Email and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || 'Invalid email or password.');
      }

      const expiresMs = Date.now() + 3600000;

      localStorage.setItem('seclab-access-token', data.access_token);
      localStorage.setItem('seclab-token-expires-at', String(expiresMs));
      localStorage.setItem('seclab-user-id', String(data.id));
      localStorage.setItem('seclab-user-role', data.role);
      localStorage.setItem('seclab-user-username', data.username || '');
      localStorage.setItem('seclab-user-email', data.email || '');

      if (data.role === 'admin') {
        localStorage.setItem('seclab-admin-auth', 'true');
        localStorage.setItem('seclab-admin-role', 'admin');
        window.location.assign('/free/admin');
        return;
      }

      localStorage.removeItem('seclab-admin-auth');
      localStorage.removeItem('seclab-admin-role');
      window.location.assign('/free/user');
    } catch (error) {
      setLoginError(error.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="h3">SecLab Login</Typography>
            <Link component={RouterLink} to="/register" variant="h5">
              Create account
            </Link>
          </Stack>
        </Grid>

        {loginError && (
          <Grid size={12}>
            <Alert severity="error">{loginError}</Alert>
          </Grid>
        )}

        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="email-login">Email Address</InputLabel>
            <OutlinedInput
              id="email-login"
              type="email"
              value={email}
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@gmail.com"
              fullWidth
              autoComplete="email"
            />
            <FormHelperText>
              <Link component={RouterLink} to="/forgot-password">
                Forgot Password?
              </Link>
            </FormHelperText>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Stack sx={{ gap: 1 }}>
            <InputLabel htmlFor="password-login">Password</InputLabel>
            <OutlinedInput
              id="password-login"
              type={showPassword ? 'text' : 'password'}
              value={password}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              fullWidth
              autoComplete="current-password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    color="secondary"
                  >
                    {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </Stack>
        </Grid>

        <Grid size={12}>
          <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
            SecLab Login
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
