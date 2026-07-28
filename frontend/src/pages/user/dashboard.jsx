import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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
  updateLearningLog,
  deleteLearningLog,
  createResource,
  updateResource,
  deleteResource,
  fetchLearningLogs,
  fetchResources,
  fetchTopics
} from 'api/seclab';

import CreateRecordsPanel from './components/CreateRecordsPanel';
import TopicManager from './components/TopicManager';
import LearningLogList from './components/LearningLogList';
import ResourceList from './components/ResourceList';

const sectionCopy = {
  topics: {
    title: 'Topics',
    description: 'Create and organize your learning topics.'
  },
  'learning-logs': {
    title: 'Learning Logs',
    description: 'Track study notes and weekly learning progress.'
  },
  resources: {
    title: 'Resources',
    description: 'Save useful links, references, and documentation.'
  }
};

export default function UserDashboardPage() {
  const location = useLocation();
  const activeSection = location.pathname.includes('/topics')
    ? 'topics'
    : location.pathname.includes('/learning-logs')
      ? 'learning-logs'
      : location.pathname.includes('/resources')
        ? 'resources'
        : null;

  const userId = Number(localStorage.getItem('seclab-user-id'));
  const role = localStorage.getItem('seclab-user-role') || 'user';
  const username = localStorage.getItem('seclab-user-username') || 'User';
  const email = localStorage.getItem('seclab-user-email') || 'unknown';

  const [topics, setTopics] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [resources, setResources] = useState([]);

  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');

  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicDescription, setEditTopicDescription] = useState('');

  const [logTopicId, setLogTopicId] = useState('');
  const [logTitle, setLogTitle] = useState('');
  const [logNotes, setLogNotes] = useState('');

  const [resourceTopicId, setResourceTopicId] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState('documentation');
  const [resourceNotes, setResourceNotes] = useState('');

  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogTitle, setEditLogTitle] = useState('');
  const [editLogNotes, setEditLogNotes] = useState('');

  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editResourceTitle, setEditResourceTitle] = useState('');
  const [editResourceUrl, setEditResourceUrl] = useState('');
  const [editResourceType, setEditResourceType] = useState('documentation');
  const [editResourceNotes, setEditResourceNotes] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadUserData = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);

      const [topicsData, logsData, resourcesData] = await Promise.all([
        fetchTopics({ user_id: userId }),
        fetchLearningLogs({ user_id: userId }),
        fetchResources({ user_id: userId })
      ]);

      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setLearningLogs(Array.isArray(logsData) ? logsData : []);
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
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
      setSuccess('Topic created.');
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
      setSuccess('Learning log created.');
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
      setSuccess('Resource created.');
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
    if (!window.confirm('Delete this topic?')) return;

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

  const handleStartEditLearningLog = (log) => {
    setEditingLogId(log.id);
    setEditLogTitle(log.title);
    setEditLogNotes(log.notes || '');
  };

  const handleCancelEditLearningLog = () => {
    setEditingLogId(null);
    setEditLogTitle('');
    setEditLogNotes('');
  };

  const handleUpdateLearningLog = async (event, logId) => {
    event.preventDefault();

    const trimmedTitle = editLogTitle.trim();

    if (!trimmedTitle) {
      setError('Learning log title is required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateLearningLog(logId, {
        title: trimmedTitle,
        notes: editLogNotes.trim() || null
      });

      handleCancelEditLearningLog();
      await loadUserData();
      setSuccess('Learning log updated.');
    } catch (updateError) {
      console.error('Failed to update learning log:', updateError);
      setError('Could not update learning log.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditResource = (resource) => {
    setEditingResourceId(resource.id);
    setEditResourceTitle(resource.title);
    setEditResourceUrl(resource.url);
    setEditResourceType(resource.resource_type || 'documentation');
    setEditResourceNotes(resource.notes || '');
  };

  const handleCancelEditResource = () => {
    setEditingResourceId(null);
    setEditResourceTitle('');
    setEditResourceUrl('');
    setEditResourceType('documentation');
    setEditResourceNotes('');
  };

  const handleUpdateResource = async (event, resourceId) => {
    event.preventDefault();

    const trimmedTitle = editResourceTitle.trim();
    const trimmedUrl = editResourceUrl.trim();

    if (!trimmedTitle || !trimmedUrl) {
      setError('Resource title and URL are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await updateResource(resourceId, {
        title: trimmedTitle,
        url: trimmedUrl,
        resource_type: editResourceType,
        notes: editResourceNotes.trim() || null
      });

      handleCancelEditResource();
      await loadUserData();
      setSuccess('Resource updated.');
    } catch (updateError) {
      console.error('Failed to update resource:', updateError);
      setError('Could not update resource.');
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteLearningLog = async (logId) => {
    if (!window.confirm('Delete this learning log?')) return;

    try {
      setIsSaving(true);
      setError(null);
      await deleteLearningLog(logId);
      await loadUserData();
      setSuccess('Learning log deleted.');
    } catch (deleteError) {
      console.error('Failed to delete learning log:', deleteError);
      setError('Could not delete learning log.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;

    try {
      setIsSaving(true);
      setError(null);
      await deleteResource(resourceId);
      await loadUserData();
      setSuccess('Resource deleted.');
    } catch (deleteError) {
      console.error('Failed to delete resource:', deleteError);
      setError('Could not delete resource.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainCard>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress size={22} />
          <Typography variant="body1">Loading workspace...</Typography>
        </Stack>
      </MainCard>
    );
  }

  return (
    <Stack spacing={3}>
      {!activeSection && (
        <MainCard
          sx={{
            borderRadius: 2,
            borderColor: 'primary.light',
            background: 'linear-gradient(135deg, #f8fbff 0%, #ffffff 70%)'
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Welcome, {username}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {role}
            </Typography>
            <Typography variant="body1" sx={{ pt: 1, fontWeight: 500 }}>
              No active task yet. Choose Topics, Learning Logs, or Resources from the sidebar.
            </Typography>
          </Stack>
        </MainCard>
      )}

      {activeSection && (
        <MainCard
          sx={{
            borderRadius: 2,
            backgroundColor: '#f8fafc',
            borderColor: 'divider'
          }}
        >
          <Stack spacing={0.75}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {sectionCopy[activeSection].title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {sectionCopy[activeSection].description}
            </Typography>
          </Stack>
        </MainCard>
      )}

      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      {activeSection && (
        <CreateRecordsPanel
          activeSection={activeSection}
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
      )}

      {activeSection === 'topics' && (
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
      )}

      {activeSection === 'learning-logs' && (
        <LearningLogList
          learningLogs={learningLogs}
          isSaving={isSaving}
          editingLogId={editingLogId}
          editLogTitle={editLogTitle}
          editLogNotes={editLogNotes}
          setEditLogTitle={setEditLogTitle}
          setEditLogNotes={setEditLogNotes}
          handleStartEditLearningLog={handleStartEditLearningLog}
          handleCancelEditLearningLog={handleCancelEditLearningLog}
          handleUpdateLearningLog={handleUpdateLearningLog}
          handleDeleteLearningLog={handleDeleteLearningLog}
        />
      )}

      {activeSection === 'resources' && (
        <ResourceList
          resources={resources}
          isSaving={isSaving}
          editingResourceId={editingResourceId}
          editResourceTitle={editResourceTitle}
          editResourceUrl={editResourceUrl}
          editResourceType={editResourceType}
          editResourceNotes={editResourceNotes}
          setEditResourceTitle={setEditResourceTitle}
          setEditResourceUrl={setEditResourceUrl}
          setEditResourceType={setEditResourceType}
          setEditResourceNotes={setEditResourceNotes}
          handleStartEditResource={handleStartEditResource}
          handleCancelEditResource={handleCancelEditResource}
          handleUpdateResource={handleUpdateResource}
          handleDeleteResource={handleDeleteResource}
        />
      )}
    </Stack>
  );
}