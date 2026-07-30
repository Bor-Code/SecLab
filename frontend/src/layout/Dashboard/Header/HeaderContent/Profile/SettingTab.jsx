import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SettingTab() {
  return (
    <Stack sx={{ gap: 1.5, p: 2 }}>
      <Typography variant="subtitle1">SecLab Workspace</Typography>
      <Typography variant="body2" color="text.secondary">
        Admin and user workspace demo environment.
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Backend health, user records, topics, learning logs, and resources are managed from this workspace.
      </Typography>
    </Stack>
  );
}