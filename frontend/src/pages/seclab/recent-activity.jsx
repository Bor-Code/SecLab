import { useEffect, useState } from 'react';

import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

import MainCard from 'components/MainCard';

const activityTypeLabels = {
  'auth.login': 'Kullanıcı girişi',
  'learning_log.update': 'Öğrenme kaydı güncelleme',
  'learning_log.delete': 'Öğrenme kaydı silme',
  'resource.update': 'Kaynak güncelleme',
  'resource.delete': 'Kaynak silme',
  'topic.delete': 'Konu silme',
  'users.reset_password': 'Şifre sıfırlama',
  'users.delete': 'Kullanıcı silme'
};

function formatActivityType(activityType) {
  if (!activityType) {
    return '-';
  }

  return activityTypeLabels[activityType] || activityType;
}
import { fetchDashboardRecentActivity } from 'api/seclab';

export default function RecentActivityPage() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadActivity() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchDashboardRecentActivity();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      setErrorMessage('Son aktiviteler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadActivity();
  }, []);

  const filteredActivities = (Array.isArray(activities) ? activities : []).filter((item) => {
    const query = search.toLowerCase();
    const typeMatch = (item.activity_type || '').toLowerCase().includes(query);
    const titleMatch = (item.title || '').toLowerCase().includes(query);
    const descMatch = (item.description || '').toLowerCase().includes(query);
    
    return typeMatch || titleMatch || descMatch;
  });

  return (
    <MainCard title="Son Aktiviteler">
      <Typography variant="body2" sx={{ mb: 3 }}>
        Platformdaki son işlemleri ve güncellemeleri inceleyin.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Aktivitelerde ara"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tür, başlık veya açıklamaya göre ara"
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tür</TableCell>
              <TableCell>Başlık</TableCell>
              <TableCell>Açıklama</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aktiviteler yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Son aktivite bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {formatActivityType(item.activity_type)}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.description || '-'}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleString('tr-TR')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}