import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';

import { registerUser, verifyEmail } from 'api/seclab';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthRegister() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [fieldError, setFieldError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validateForm() {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername) {
      return 'Kullanıcı adı gereklidir.';
    }

    if (!emailPattern.test(trimmedEmail)) {
      return 'Geçerli bir e-posta adresi girin.';
    }

    if (password.length < 8) {
      return 'Şifre en az 8 karakter olmalıdır.';
    }

    if (password !== confirmPassword) {
      return 'Şifreler eşleşmiyor.';
    }

    return null;
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();
    setRegisterError(null);
    setFieldError(null);

    const validationError = validateForm();
    if (validationError) {
      setFieldError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);

      const user = await registerUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      localStorage.setItem('seclab-access-token', user.access_token);
      localStorage.setItem('seclab-user-role', user.role);
      localStorage.setItem('seclab-user-id', String(user.id));
      localStorage.setItem('seclab-user-username', user.username);
      localStorage.setItem('seclab-user-email', user.email);

      navigate(user.role === 'admin' ? '/admin' : '/user', { replace: true });
    } catch (error) {
      console.error('Registration failed:', error);
      setRegisterError(error.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleRegisterSubmit}>
      {registerError && <Alert severity="error">{registerError}</Alert>}
      {fieldError && <Alert severity="warning">{fieldError}</Alert>}

      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            label="Kullanıcı Adı"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            fullWidth
            autoComplete="username"
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="E-posta Adresi"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
            autoComplete="email"
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Şifre"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
            autoComplete="new-password"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((value) => !value)} edge="end">
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />
          <FormHelperText>Şifre en az 8 karakter olmalıdır.</FormHelperText>
        </Grid>

        <Grid size={12}>
          <TextField
            label="Şifre Tekrarı"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            fullWidth
            autoComplete="new-password"
          />
        </Grid>
      </Grid>

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
        {isSubmitting ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
      </Button>

      <Typography variant="body2" color="text.secondary" align="center">
        Zaten hesabınız var mı?{' '}
        <Link component={RouterLink} to="/login" underline="hover">
          Giriş yap
        </Link>
      </Typography>
    </Stack>
  );
}
