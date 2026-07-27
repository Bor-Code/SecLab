import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { fetchLearningLogs, fetchResources, fetchTopics } from 'api/seclab';

export default function UserDashboardPage() {
  const userId = Number(localStorage.getItem('seclab-user-id'));
  const role = localStorage.getItem('seclab-user-role') || 'user';

  const [topics, setTopics] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoading(true);
        setError(null);

        const [topicsData, logsData, resourcesData] = await Promise.all([
          fetchTopics({ user_id: userId }),
          fetchLearningLogs({ user_id: userId }),
          fetchResources({ user_id: userId })
        ]);

        setTopics(topicsData);
        setLearningLogs(logsData);
        setResources(resourcesData);
      } catch (loadError) {
        console.error('Failed to load user dashboard:', loadError);
        setError('Could not load your learning data.');
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      loadUserData();
    }
  }, [userId]);

  if (isLoading) {
    return (
      <MainCard title="My Account">
        <CircularProgress size={24} />
      </MainCard>
    );
  }

  return (
    <Stack spacing={3}>
      <MainCard title="My Account">
        <Typography variant="body2">You are signed in as {role}.</Typography>
      </MainCard>

      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Topics">
            <Typography variant="h3">{topics.length}</Typography>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Learning Logs">
            <Typography variant="h3">{learningLogs.length}</Typography>
          </MainCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Resources">
            <Typography variant="h3">{resources.length}</Typography>
          </MainCard>
        </Grid>
      </Grid>

      <MainCard title="Recent Learning Logs">
        {learningLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No learning logs yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {learningLogs.slice(0, 5).map((log) => (
              <Typography key={log.id} variant="body2">
                {log.title}
              </Typography>
            ))}
          </Stack>
        )}
      </MainCard>

      <MainCard title="Saved Resources">
        {resources.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No resources yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {resources.slice(0, 5).map((resource) => (
              <Typography key={resource.id} variant="body2">
                {resource.title}
              </Typography>
            ))}
          </Stack>
        )}
      </MainCard>
    </Stack>
  );
}
