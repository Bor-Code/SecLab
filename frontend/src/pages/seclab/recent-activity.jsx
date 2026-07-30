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
        Review the latest actions and updates across the platform.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Aktivite ara"
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
                  Loading activity...
                </TableCell>
              </TableRow>
            ) : filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No recent activity found.
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {(item.activity_type || '').replace('_', ' ')}
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