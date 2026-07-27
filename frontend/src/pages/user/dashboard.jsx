import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import { createLearningLog, createResource, createTopic, fetchLearningLogs, fetchResources, fetchTopics } from 'api/seclab';

export default function UserDashboardPage() {
  const userId = Number(localStorage.getItem('seclab-user-id'));
  const role = localStorage.getItem('seclab-user-role') || 'user';

  const [topics, setTopics] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [resources, setResources] = useState([]);

  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');

  const [logTopicId, setLogTopicId] = useState('');
  const [logTitle, setLogTitle] = useState('');
  const [logNotes, setLogNotes] = useState('');

  const [resourceTopicId, setResourceTopicId] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState('article');
  const [resourceNotes, setResourceNotes] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
    if (!userId) return;

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

    if (!newTopicName.trim()) {
      setError('Topic name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createTopic({
        user_id: userId,
        name: newTopicName.trim(),
        description: newTopicDescription.trim() || null
      });

      setNewTopicName('');
      setNewTopicDescription('');
      await loadUserData();
    } catch (createError) {
      console.error('Failed to create topic:', createError);
      setError('Could not create topic.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLearningLog = async (event) => {
    event.preventDefault();

    if (!logTopicId || !logTitle.trim()) {
      setError('Topic and learning log title are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createLearningLog({
        user_id: userId,
        topic_id: Number(logTopicId),
        title: logTitle.trim(),
        notes: logNotes.trim() || null
      });

      setLogTopicId('');
      setLogTitle('');
      setLogNotes('');
      await loadUserData();
    } catch (createError) {
      console.error('Failed to create learning log:', createError);
      setError('Could not create learning log.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateResource = async (event) => {
    event.preventDefault();

    if (!resourceTopicId || !resourceTitle.trim() || !resourceUrl.trim()) {
      setError('Topic, resource title, and URL are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createResource({
        user_id: userId,
        topic_id: Number(resourceTopicId),
        title: resourceTitle.trim(),
        url: resourceUrl.trim(),
        resource_type: resourceType,
        notes: resourceNotes.trim() || null
      });

      setResourceTopicId('');
      setResourceTitle('');
      setResourceUrl('');
      setResourceType('article');
      setResourceNotes('');
      await loadUserData();
    } catch (createError) {
      console.error('Failed to create resource:', createError);
      setError('Could not create resource.');
    } finally {
      setIsSaving(false);
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

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Create Topic">
            <Stack component="form" spacing={2} onSubmit={handleCreateTopic}>
              <TextField label="Topic name" value={newTopicName} onChange={(event) => setNewTopicName(event.target.value)} fullWidth />
              <TextField
                label="Description"
                value={newTopicDescription}
                onChange={(event) => setNewTopicDescription(event.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
              <Button type="submit" variant="contained" disabled={isSaving}>
                Create Topic
              </Button>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Create Learning Log">
            <Stack component="form" spacing={2} onSubmit={handleCreateLearningLog}>
              <TextField select label="Topic" value={logTopicId} onChange={(event) => setLogTopicId(event.target.value)} fullWidth disabled={!topics.length}>
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Title" value={logTitle} onChange={(event) => setLogTitle(event.target.value)} fullWidth />
              <TextField label="Notes" value={logNotes} onChange={(event) => setLogNotes(event.target.value)} fullWidth multiline minRows={2} />
              <Button type="submit" variant="contained" disabled={isSaving || !topics.length}>
                Create Learning Log
              </Button>
            </Stack>
          </MainCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <MainCard title="Create Resource">
            <Stack component="form" spacing={2} onSubmit={handleCreateResource}>
              <TextField
                select
                label="Topic"
                value={resourceTopicId}
                onChange={(event) => setResourceTopicId(event.target.value)}
                fullWidth
                disabled={!topics.length}
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Title" value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} fullWidth />
              <TextField label="URL" value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} fullWidth />
              <TextField select label="Type" value={resourceType} onChange={(event) => setResourceType(event.target.value)} fullWidth>
                <MenuItem value="article">Article</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="course">Course</MenuItem>
                <MenuItem value="documentation">Documentation</MenuItem>
                <MenuItem value="tool">Tool</MenuItem>
              </TextField>
              <TextField label="Notes" value={resourceNotes} onChange={(event) => setResourceNotes(event.target.value)} fullWidth multiline minRows={2} />
              <Button type="submit" variant="contained" disabled={isSaving || !topics.length}>
                Create Resource
              </Button>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

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