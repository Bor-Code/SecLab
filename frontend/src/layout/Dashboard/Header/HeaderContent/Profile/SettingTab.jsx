import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SettingTab() {
  return (
    <Stack sx={{ gap: 1.5, p: 2 }}>
      <Typography variant="subtitle1">Session & Access</Typography>
      <Typography variant="body2" color="text.secondary">
        Your SecLab session gives access to your workspace records.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Admin users manage the full system. Standard users manage their own topics, logs, and resources.
      </Typography>
    </Stack>
  );
}