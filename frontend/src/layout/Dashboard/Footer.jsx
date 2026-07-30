import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  const role = localStorage.getItem('seclab-user-role') || 'user';
  const workspaceLabel = role === 'admin' ? 'SecLab admin ?al??ma alan?' : 'SecLab kullanıcı çalışma alanı';

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {workspaceLabel}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Demo ortamı
      </Typography>
    </Stack>
  );
}