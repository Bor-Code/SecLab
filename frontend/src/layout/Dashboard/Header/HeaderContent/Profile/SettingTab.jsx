import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SettingTab() {
  return (
    <Stack sx={{ gap: 1.25, p: 2 }}>
      <Typography variant="subtitle1">Workspace Access</Typography>
      <Typography variant="body2" color="text.secondary">
        Your SecLab workspace is linked to this account.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Use the sidebar to manage topics, learning logs, resources, progress, notes, and activity.
      </Typography>
    </Stack>
  );
}
