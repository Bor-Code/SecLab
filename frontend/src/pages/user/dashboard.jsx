import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function UserDashboardPage() {
  const role = localStorage.getItem('seclab-user-role') || 'user';

  return (
    <MainCard title="My Account">
      <Typography variant="body2">
        You are signed in as {role}. User learning views will be added here.
      </Typography>
    </MainCard>
  );
}
