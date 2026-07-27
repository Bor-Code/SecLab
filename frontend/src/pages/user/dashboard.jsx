import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { createTopic, fetchLearningLogs, fetchResources, fetchTopics } from 'api/seclab';

export default function UserDashboardPage() {
  const userId = Number(localStorage.getItem('seclab-user-id'));
  const role = localStorage.getItem('seclab-user-role') || 'user';

  const [topics, setTopics] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [resources, setResources] = useState([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
    if (!userId) {
      return;
    }

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
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleCreateTopic = async (event) => {
    event.preventDefault();

    const trimmedName = newTopicName.trim();
    const trimmedDescription = newTopicDescription.trim();

    if (!trimmedName) {
      setError('Topic name is required.');
      return;
    }

    try {
      setIsCreatingTopic(true);
      setError(null);

      await createTopic({
        user_id: userId,
        name: trimmedName,
        description: trimmedDescription || null
      });

      setNewTopicName('');
      setNewTopicDescription('');
      await loadUserData();
    } catch (createError) {
      console.error('Failed to create topic:', createError);
      setError('Could not create topic.');
    } finally {
      setIsCreatingTopic(false);
    }
  };

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

      <MainCard title="Create Topic">
        <Stack component="form" spacing={2} onSubmit={handleCreateTopic}>
          <TextField
            label="Topic name"
            value={newTopicName}
            onChange={(event) => setNewTopicName(event.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={newTopicDescription}
            onChange={(event) => setNewTopicDescription(event.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Button type="submit" variant="contained" disabled={isCreatingTopic}>
            {isCreatingTopic ? 'Creating...' : 'Create Topic'}
          </Button>
        </Stack>
      </MainCard>

      <MainCard title="My Topics">
        {topics.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No topics yet.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {topics.slice(0, 5).map((topic) => (
              <Stack key={topic.id} spacing={0.5}>
                <Typography variant="subtitle1">{topic.name}</Typography>
                {topic.description && (
                  <Typography variant="body2" color="text.secondary">
                    {topic.description}
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </MainCard>

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
