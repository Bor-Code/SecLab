import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { fetchDashboardRecentActivity, fetchDashboardSummary, fetchHealthStatus } from 'api/seclab';

export default function DashboardDefault() {
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryMessage, setSummaryMessage] = useState(null);

  const [dashboardActivity, setDashboardActivity] = useState([]);
  const [isActivityLoading, setIsActivityLoading] = useState(true);
  const [activityMessage, setActivityMessage] = useState(null);

  const [healthStatus, setHealthStatus] = useState(null);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [healthMessage, setHealthMessage] = useState(null);

  useEffect(() => {
    async function loadSummary() {
      setIsSummaryLoading(true);
      setSummaryMessage(null);
      try {
        const data = await fetchDashboardSummary();
        setDashboardSummary(data);
      } catch (error) {
        console.error('Summary load error:', error);
        setSummaryMessage('Backend kullanılamıyor');
      } finally {
        setIsSummaryLoading(false);
      }
    }

    async function loadRecentActivity() {
      setIsActivityLoading(true);
      setActivityMessage(null);
      try {
        const data = await fetchDashboardRecentActivity();
        setDashboardActivity(Array.isArray(data) ? data : data?.items || data?.activities || data?.recent_activity || []);
      } catch (error) {
        console.error('Activity load error:', error);
        setActivityMessage('Aktivite verileri kullanılamıyor');
      } finally {
        setIsActivityLoading(false);
      }
    }

    async function loadHealthStatus() {
      setIsHealthLoading(true);
      setHealthMessage(null);
      try {
        const data = await fetchHealthStatus();
        setHealthStatus(data);
      } catch (error) {
        console.error('Health status load error:', error);
        setHealthMessage('Sistem durumu verileri kullanılamıyor');
      } finally {
        setIsHealthLoading(false);
      }
    }

    loadSummary();
    loadRecentActivity();
    loadHealthStatus();
  }, []);

  function formatActivityDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatActivityType(type) {
    if (!type) return '';
    return type.replace('_', ' ');
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Dashboard</Typography>
        {summaryMessage && (
          <Typography variant="caption" color="error">
            {summaryMessage}
          </Typography>
        )}
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Kullanıcılar"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.users_count ?? dashboardSummary?.users ?? 0)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Konular"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.topics_count ?? dashboardSummary?.topics ?? 0)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Öğrenme Kayıtları"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.learning_logs_count ?? dashboardSummary?.learning_logs ?? 0)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Kaynaklar"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.resources_count ?? dashboardSummary?.resources ?? 0)}
        />
      </Grid>

      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Kayıtların Genel Görünümü</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItem-root': { py: 2, px: 3 } }}>
            <ListItem divider>
              <ListItemText
                primary={<Typography variant="subtitle1">Kullanıcılar</Typography>}
                secondary="Sistem erişimini yönetin, yeni hesaplar oluşturun ve kullanıcı aktivitelerini inceleyin."
              />
            </ListItem>
            <ListItem divider>
              <ListItemText
                primary={<Typography variant="subtitle1">Konular</Typography>}
                secondary="Organize learning domains and categorize core focus areas."
              />
            </ListItem>
            <ListItem divider>
              <ListItemText
                primary={<Typography variant="subtitle1">Öğrenme Kayıtları</Typography>}
                secondary="Track daily progress and record detailed study notes."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={<Typography variant="subtitle1">Kaynaklar</Typography>}
                secondary="Maintain a centralized library of external links, documentation, and tools."
              />
            </ListItem>
          </List>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Sistem Durumu</Typography>
          </Grid>
          <Grid />
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          {isHealthLoading ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Loading system status...
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, '& .MuiListItem-root': { py: 2.5, px: 3 } }}>
              <ListItem divider>
                <ListItemText primary="API" />
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {healthStatus?.status ?? 'unknown'}
                </Typography>
              </ListItem>
              <ListItem divider>
                <ListItemText primary="Database" />
                <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                  {healthStatus?.database ?? 'unknown'}
                </Typography>
              </ListItem>
              <ListItem>
                <ListItemText primary="Last checked" />
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {healthStatus?.checked_at_utc ? formatActivityDate(healthStatus.checked_at_utc) : '-'}
                </Typography>
              </ListItem>
            </List>
          )}
          {healthMessage && (
            <Box sx={{ px: 3, pb: 2 }}>
              <Typography variant="caption" color="error">
                {healthMessage}
              </Typography>
            </Box>
          )}
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Son Aktiviteler</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          {isActivityLoading ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Loading activity...
              </Typography>
            </Box>
          ) : (!Array.isArray(dashboardActivity) || dashboardActivity.length === 0) ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="textSecondary">
                No recent activity found.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
              {(Array.isArray(dashboardActivity) ? dashboardActivity : []).map((item, index) => (
                <ListItemButton divider={index !== dashboardActivity.length - 1} key={index}>
                  <ListItemText
                    primary={item.title}
                    secondary={item.description}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                  />
                  <Stack sx={{ alignItems: 'flex-end' }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                      {formatActivityType(item.activity_type)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'secondary.main' }} noWrap>
                      {formatActivityDate(item.created_at)}
                    </Typography>
                  </Stack>
                </ListItemButton>
              ))}
            </List>
          )}
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Admin Workflow</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItem-root': { py: 2, px: 3 } }}>
            <ListItem divider>
              <ListItemText primary="Kullanıcıları incele" />
            </ListItem>
            <ListItem divider>
              <ListItemText primary="Konuları düzenle" />
            </ListItem>
            <ListItem divider>
              <ListItemText primary="Öğrenme kayıtlarını takip et" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Kaynakları yönet" />
            </ListItem>
          </List>
        </MainCard>
      </Grid>
    </Grid>
  );
}