import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import {
  createTopic,
  updateTopic,
  deleteTopic,
  createLearningLog,
  deleteLearningLog,
  createResource,
  deleteResource,
  fetchLearningLogs,
  fetchResources,
  fetchTopics
} from 'api/seclab';

import SummaryCards from './components/SummaryCards';
import CreateRecordsPanel from './components/CreateRecordsPanel';
import TopicManager from './components/TopicManager';
import LearningLogList from './components/LearningLogList';
import ResourceList from './components/ResourceList';

export default function UserDashboardPage() {
  const userId = Number(localStorage.getItem('seclab-user-id'));
  const role = localStorage.getItem('seclab-user-role') || 'user';
  const username = localStorage.getItem('seclab-user-username') || '';
  const email = localStorage.getItem('seclab-user-email') || '';

  const [topics, setTopics] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [resources, setResources] = useState([]);

  // Topic Create states
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');

  // Topic Edit states
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicDescription, setEditTopicDescription] = useState('');

  // Learning Log Create states
  const [logTopicId, setLogTopicId] = useState('');
  const [logTitle, setLogTitle] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Resource Create states
  const [resourceTopicId, setResourceTopicId] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState('documentation');
  const [resourceNotes, setResourceNotes] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
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
      setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  const handleCreateLearningLog = async (event) => {
    event.preventDefault();

    if (!logTopicId) {
      setError('Please select a topic for the learning log.');
      return;
    }

    const trimmedTitle = logTitle.trim();
    if (!trimmedTitle) {
      setError('Learning log title is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createLearningLog({
        user_id: userId,
        topic_id: Number(logTopicId),
        title: trimmedTitle,
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

    if (!resourceTopicId) {
      setError('Please select a topic for the resource.');
      return;
    }

    const trimmedTitle = resourceTitle.trim();
    const trimmedUrl = resourceUrl.trim();
    if (!trimmedTitle || !trimmedUrl) {
      setError('Resource title and URL are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await createResource({
        user_id: userId,
        topic_id: Number(resourceTopicId),
        title: trimmedTitle,
        url: trimmedUrl,
        resource_type: resourceType,
        notes: resourceNotes.trim() || null
      });

      setResourceTopicId('');
      setResourceTitle('');
      setResourceUrl('');
      setResourceType('documentation');
      setResourceNotes('');
      await loadUserData();
    } catch (createError) {
      console.error('Failed to create resource:', createError);
      setError('Could not create resource.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditTopic = (topic) => {
    setEditingTopicId(topic.id);
    setEditTopicName(topic.name);
    setEditTopicDescription(topic.description || '');
  };

  const handleCancelEditTopic = () => {
    setEditingTopicId(null);
    setEditTopicName('');
    setEditTopicDescription('');
  };

  const handleUpdateTopic = async (event, topicId) => {
    event.preventDefault();
    const trimmedName = editTopicName.trim();
    const trimmedDescription = editTopicDescription.trim();

    if (!trimmedName) {
      setError('Topic name is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateTopic(topicId, {
        name: trimmedName,
        description: trimmedDescription || null
      });

      handleCancelEditTopic();
      await loadUserData();
    } catch (updateError) {
      console.error('Failed to update topic:', updateError);
      setError('Could not update topic.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await deleteTopic(topicId);
      await loadUserData();
    } catch (deleteError) {
      console.error('Failed to delete topic:', deleteError);
      setError('Could not delete topic. Ensure no dependent logs or resources exist.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLearningLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this learning log?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await deleteLearningLog(logId);
      await loadUserData();
    } catch (deleteError) {
      console.error('Failed to delete learning log:', deleteError);
      setError('Could not delete learning log.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await deleteResource(resourceId);
      await loadUserData();
    } catch (deleteError) {
      console.error('Failed to delete resource:', deleteError);
      setError('Could not delete resource.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainCard title="My Learning Workspace">
        <CircularProgress size={24} />
      </MainCard>
    );
  }

  const displayName = username || email || 'User';

  return (
    <Stack spacing={3}>
      <MainCard title="My Learning Workspace">
        <Typography variant="body2">
          Signed in as <strong>{displayName}</strong> {email && `(${email})`} &bull; Role: {role}
        </Typography>
      </MainCard>

      {error && <Alert severity="error">{error}</Alert>}

      <SummaryCards
        topicsCount={topics.length}
        learningLogsCount={learningLogs.length}
        resourcesCount={resources.length}
      />

      <CreateRecordsPanel
        topics={topics}
        isSaving={isSaving}
        newTopicName={newTopicName}
        setNewTopicName={setNewTopicName}
        newTopicDescription={newTopicDescription}
        setNewTopicDescription={setNewTopicDescription}
        logTopicId={logTopicId}
        setLogTopicId={setLogTopicId}
        logTitle={logTitle}
        setLogTitle={setLogTitle}
        logNotes={logNotes}
        setLogNotes={setLogNotes}
        resourceTopicId={resourceTopicId}
        setResourceTopicId={setResourceTopicId}
        resourceTitle={resourceTitle}
        setResourceTitle={setResourceTitle}
        resourceUrl={resourceUrl}
        setResourceUrl={setResourceUrl}
        resourceType={resourceType}
        setResourceType={setResourceType}
        resourceNotes={resourceNotes}
        setResourceNotes={setResourceNotes}
        handleCreateTopic={handleCreateTopic}
        handleCreateLearningLog={handleCreateLearningLog}
        handleCreateResource={handleCreateResource}
      />

      <TopicManager
        topics={topics}
        editingTopicId={editingTopicId}
        editTopicName={editTopicName}
        editTopicDescription={editTopicDescription}
        setEditTopicName={setEditTopicName}
        setEditTopicDescription={setEditTopicDescription}
        isSaving={isSaving}
        handleStartEditTopic={handleStartEditTopic}
        handleCancelEditTopic={handleCancelEditTopic}
        handleUpdateTopic={handleUpdateTopic}
        handleDeleteTopic={handleDeleteTopic}
      />

      <LearningLogList
        learningLogs={learningLogs}
        isSaving={isSaving}
        handleDeleteLearningLog={handleDeleteLearningLog}
      />

      <ResourceList
        resources={resources}
        isSaving={isSaving}
        handleDeleteResource={handleDeleteResource}
      />
    </Stack>
  );
}
