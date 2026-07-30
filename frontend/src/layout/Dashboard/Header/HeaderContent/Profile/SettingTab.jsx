import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SettingTab() {
  return (
    <Stack sx={{ gap: 1.25, p: 2 }}>
      <Typography variant="subtitle1">Çalışma Alanı Erişimi</Typography>
      <Typography variant="body2" color="text.secondary">
        SecLab çalışma alanın bu hesaba bağlı.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Konuları, öğrenme kayıtlarını, kaynakları, ilerlemeyi, notları ve aktiviteleri sol menüden yönet.
      </Typography>
    </Stack>
  );
}
