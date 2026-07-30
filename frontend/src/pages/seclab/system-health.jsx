import { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';

import MainCard from 'components/MainCard';
import { fetchHealthStatus } from 'api/seclab';

const statusLabels = {
  ok: 'Normal',
  degraded: 'Kısıtlı',
  connected: 'Bağlı',
  disconnected: 'Bağlantı yok'
};

function formatStatus(status) {
  return statusLabels[status] || status;
}

export default function SystemHealthPage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadHealth() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchHealthStatus();
      setHealthStatus(data);
    } catch (error) {
      console.error('Failed to load health status:', error);
      setErrorMessage('Backend kullanılamıyor veya sağlık kontrolü başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <MainCard title="Sistem Sağlığı">
      <Typography variant="body2" sx={{ mb: 3 }}>
        SecLab API ve veritabanının mevcut çalışma durumunu izleyin.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Sistem durumu yükleniyor...
          </Typography>
        </Box>
      ) : healthStatus ? (
        <List sx={{ p: 0, '& .MuiListItem-root': { py: 2, px: 0 } }}>
          <ListItem divider>
            <ListItemText primary="API Durumu" />
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {formatStatus(healthStatus.status)}
            </Typography>
          </ListItem>
          <ListItem divider>
            <ListItemText primary="Veritabanı Durumu" />
            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
              {formatStatus(healthStatus.database)}
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary="Son Kontrol" />
            <Typography variant="subtitle1">
              {new Date(healthStatus.checked_at_utc).toLocaleString('tr-TR')}
            </Typography>
          </ListItem>
        </List>
      ) : null}
    </MainCard>
  );
}