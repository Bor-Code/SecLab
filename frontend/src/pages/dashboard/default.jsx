import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import { fetchDashboardRecentActivity, fetchDashboardSummary, fetchHealthStatus } from 'api/seclab';

// assets
import EllipsisOutlined from '@ant-design/icons/EllipsisOutlined';

// ==============================|| DASHBOARD - DEFAULT ||============================== //

export default function DashboardDefault() {
  const [orderMenuAnchor, setOrderMenuAnchor] = useState(null);

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
        setSummaryMessage('Backend unavailable');
      } finally {
        setIsSummaryLoading(false);
      }
    }

    async function loadRecentActivity() {
      setIsActivityLoading(true);
      setActivityMessage(null);
      try {
        const data = await fetchDashboardRecentActivity();
        setDashboardActivity(data);
      } catch (error) {
        console.error('Activity load error:', error);
        setActivityMessage('Activity unavailable');
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
        setHealthMessage('Health data unavailable');
      } finally {
        setIsHealthLoading(false);
      }
    }

    loadSummary();
    loadRecentActivity();
    loadHealthStatus();
  }, []);

  const handleOrderMenuClick = (event) => {
    setOrderMenuAnchor(event.currentTarget);
  };
  const handleOrderMenuClose = () => {
    setOrderMenuAnchor(null);
  };

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
      {/* row 1 */}
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
          title="Users"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.users_count ?? 0)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Topics"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.topics_count ?? 0)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Learning Logs"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.learning_logs_count ?? 0)}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Resources"
          count={isSummaryLoading ? '...' : String(dashboardSummary?.resources_count ?? 0)}
        />
      </Grid>

      <Grid sx={{ display: { sm: 'none', md: 'block', lg: 'none' } }} size={{ md: 8 }} />
      
      {/* row 2 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard />
      </Grid>
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">System Health</Typography>
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
      
      {/* row 3 */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Recent Activity</Typography>
          </Grid>
          <Grid>
            <IconButton onClick={handleOrderMenuClick}>
              <EllipsisOutlined style={{ fontSize: '1.25rem' }} />
            </IconButton>
            <Menu
              id="fade-menu"
              slotProps={{ list: { 'aria-labelledby': 'fade-button' } }}
              anchorEl={orderMenuAnchor}
              onClose={handleOrderMenuClose}
              open={Boolean(orderMenuAnchor)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleOrderMenuClose}>Export as CSV</MenuItem>
              <MenuItem onClick={handleOrderMenuClose}>Export as Excel</MenuItem>
              <MenuItem onClick={handleOrderMenuClose}>Print List</MenuItem>
            </Menu>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          {isActivityLoading ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Loading activity...
              </Typography>
            </Box>
          ) : dashboardActivity.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="textSecondary">
                No recent activity found.
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
              {dashboardActivity.map((item, index) => (
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

      {/* Next Focus Panel */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h5">Next Focus</Typography>
          </Grid>
        </Grid>
        <MainCard sx={{ mt: 2 }} content={false}>
          <List sx={{ p: 0, '& .MuiListItem-root': { py: 2, px: 3 } }}>
            <ListItem divider>
              <ListItemText primary="User management" />
            </ListItem>
            <ListItem divider>
              <ListItemText primary="Topic tracking" />
            </ListItem>
            <ListItem divider>
              <ListItemText primary="Learning log review" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Resource library" />
            </ListItem>
          </List>
        </MainCard>
      </Grid>
    </Grid>
  );
}