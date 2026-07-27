// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

// project import
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthRegister from 'sections/auth/AuthRegister';

// ================================|| AUTH - REGISTER ||================================ //

export default function Register() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h3">Create Account</Typography>
            <Typography component={Link} to="/login" variant="body1" sx={{ textDecoration: 'none', color: 'primary.main' }}>
              Back to login
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthRegister />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}
