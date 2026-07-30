import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import * as Yup from 'yup';
import { Formik } from 'formik';

import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import { loginUser } from 'api/seclab';
import { saveAuthSession } from 'utils/authStorage';

import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';

export default function AuthLogin({ isDemo = false }) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loginError, setLoginError] = React.useState(null);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    setLoginError(null);

    try {
      const response = await loginUser({
        email: values.email.trim().toLowerCase(),
        password: values.password
      });

      saveAuthSession(response);

      if (response.role === 'admin') {
        navigate('/admin', { replace: true });
        return;
      }

      navigate('/user', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError(error.message || 'Giriş işlemi başarısız oldu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {loginError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {loginError}
        </Alert>
      )}

      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('E-posta zorunludur'),
          password: Yup.string()
            .required('Şifre zorunludur')
            .test('no-leading-trailing-whitespace', 'Şifre boşlukla başlayamaz veya bitemez', (value) => value === value.trim())
            .max(50, 'Şifre çok uzun')
        })}
        onSubmit={handleLoginSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-login">E-posta Adresi</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="example@gmail.com"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>

                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-login">Şifre</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="Şifre görünürlüğünü değiştir"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Şifrenizi girin"
                  />
                </Stack>

                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>

              <Grid
                size={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: -1
                }}
              >
                <Link component={RouterLink} to="/forgot-password" underline="hover" variant="body2" fontWeight={600}>
                  Şifremi Unuttum
                </Link>
              </Grid>

              <Grid size={12}>
                <AnimateButton>
                  <Button fullWidth size="large" type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Giriş Yapılıyor...' : 'SecLab Giriş'}
                  </Button>
                </AnimateButton>
              </Grid>

              <Grid size={12}>
                <Typography variant="body2" color="text.secondary" align="center">
                  Henüz hesabınız yok mu?{' '}
                  <Link component={RouterLink} to="/register" underline="hover" fontWeight={700}>
                    Kayıt Olun
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthLogin.propTypes = {
  isDemo: PropTypes.bool
};
