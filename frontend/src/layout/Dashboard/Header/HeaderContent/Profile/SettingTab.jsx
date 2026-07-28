import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SettingTab() {
  return (
    <Stack sx={{ gap: 1.25, p: 2 }}>
      <Typography variant="subtitle1">Account</Typography>
      <Typography variant="body2" color="text.secondary">
        Manage your profile and workspace access from SecLab.
      </Typography>
    </Stack>
  );
}