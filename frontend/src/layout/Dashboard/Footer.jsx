import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
      <Typography variant="caption" color="text.secondary">
        SecLab admin workspace
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Demo environment
      </Typography>
    </Stack>
  );
}