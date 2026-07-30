import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fetchHealthStatus, fetchLearningLogs, fetchResources, fetchTopics, fetchUsers } from 'api/seclab';

const emptySummary = {
  users: 0,
  topics: 0,
  learningLogs: 0,
  resources: 0
};

export default function DashboardDefault() {
  const [summary, setSummary] = useState(emptySummary);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setIsLoading(true);
      setError('');

      try {
        const [usersResult, topicsResult, logsResult, resourcesResult, healthResult] = await Promise.allSettled([
          fetchUsers(),
          fetchTopics(),
          fetchLearningLogs(),
          fetchResources(),
          fetchHealthStatus()
        ]);

        if (!active) return;

        setSummary({
          users: usersResult.status === 'fulfilled' && Array.isArray(usersResult.value) ? usersResult.value.length : 0,
          topics: topicsResult.status === 'fulfilled' && Array.isArray(topicsResult.value) ? topicsResult.value.length : 0,
          learningLogs: logsResult.status === 'fulfilled' && Array.isArray(logsResult.value) ? logsResult.value.length : 0,
          resources: resourcesResult.status === 'fulfilled' && Array.isArray(resourcesResult.value) ? resourcesResult.value.length : 0
        });

        if (healthResult.status === 'fulfilled') {
          setHealth(healthResult.value);
        }

        const failed = [usersResult, topicsResult, logsResult, resourcesResult, healthResult].some(
          (result) => result.status === 'rejected'
        );

        if (failed) {
          setError('Bazı yönetim verileri yüklenemedi. Backend bağlantısını kontrol edin.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h3">Yönetim Paneli</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Kullanıcıları, kayıtları ve sistem bağlantısını tek ekrandan takip edin.
          </Typography>
        </Paper>

        {error && <Alert severity="warning">{error}</Alert>}

        {isLoading ? (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress size={34} />
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 2
              }}
            >
              {[
                ['Kullanıcılar', summary.users],
                ['Konular', summary.topics],
                ['Öğrenme Kayıt Yönetimiı', summary.learningLogs],
                ['Kaynaklar', summary.resources]
              ].map(([label, value]) => (
                <Paper key={label} sx={{ p: 2.5 }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h3" sx={{ mt: 1 }}>
                    {value}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  Sistem Durumu
                </Typography>
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemText primary="API" secondary={health?.status || 'Bilinmiyor'} />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="Veritabanı" secondary={health?.database || 'Bilinmiyor'} />
                  </ListItem>
                </List>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 1.5 }}>
                  Yönetim Alanları
                </Typography>
                <List disablePadding>
                  <ListItem disableGutters>
                    <ListItemText primary="Kullanıcı Yönetimi" secondary="Hesapları oluşturun ve yönetin." />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemText primary="Kayıt Yönetimi" secondary="Konu, öğrenme kaydı ve kaynakları inceleyin." />
                  </ListItem>
                </List>
              </Paper>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
