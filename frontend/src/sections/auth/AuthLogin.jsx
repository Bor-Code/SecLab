import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { loginUser } from 'api/seclab';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ isDemo = false }) {
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
        email: values.email,
        password: values.password
      });

      const expiresMs = response.expires_at ? new Date(response.expires_at).getTime() : new Date().getTime() + 3600000;

      localStorage.setItem('seclab-access-token', response.access_token);
      localStorage.setItem('seclab-token-expires-at', String(expiresMs));
      localStorage.setItem('seclab-user-id', String(response.id));
      localStorage.setItem('seclab-user-role', response.role);
      localStorage.setItem('seclab-user-username', response.username || '');
      localStorage.setItem('seclab-user-email', response.email || '');

      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
      if (response.role === 'admin') {
        localStorage.setItem('seclab-admin-auth', 'true');
        localStorage.setItem('seclab-admin-role', response.role);
        window.location.href = `${baseUrl}/admin`;
        return;
      }

      localStorage.removeItem('seclab-admin-auth');
      localStorage.removeItem('seclab-admin-role');
      window.location.href = `${baseUrl}/user`;
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Invalid email or password.');
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
          email: 'admin@seclab.local',
          password: 'admin123',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().max(255).required('Email is required'),
          password: Yup.string()
            .required('Password is required')
            .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim())
            .max(50, 'Password is too long')
        })}
        onSubmit={handleLoginSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-login">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
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
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="-password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <AnimateButton>
                  <Button fullWidth size="large" type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Authenticating...' : 'SecLab Login'}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
