import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AuthFooter() {
  return (
    <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        SecLab. All rights reserved.
      </Typography>
    </Stack>
  );
}