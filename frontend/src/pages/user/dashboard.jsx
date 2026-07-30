import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
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
import ProductivityPanel from './components/ProductivityPanel';
import InsightsPanel from './components/InsightsPanel';
import WorkspaceHero from './components/WorkspaceHero';

async function fetchWithRetry(request, remainingRetries = 1) {
  try {
    return await request();
  } catch (error) {
    if (remainingRetries <= 0) {
      throw error;
    }

    await new Promise((resolve) => {
      window.setTimeout(resolve, 450);
    });

    return fetchWithRetry(request, remainingRetries - 1);
  }
}

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

  // Öğrenme Kaydı Create states
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
      setError('Oturum bilgisi bulunamadı. Lütfen yeniden giriş yapın.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        fetchWithRetry(() => fetchTopics({ user_id: userId })),
        fetchWithRetry(() => fetchLearningLogs({ user_id: userId })),
        fetchWithRetry(() => fetchResources({ user_id: userId }))
      ]);

      const [topicsResult, logsResult, resourcesResult] = results;
      const failedResults = results.filter(
        (result) => result.status === 'rejected'
      );

      if (failedResults.length === results.length) {
        throw failedResults[0].reason;
      }

      setTopics(
        topicsResult.status === 'fulfilled' ? topicsResult.value : []
      );
      setLearningLogs(
        logsResult.status === 'fulfilled' ? logsResult.value : []
      );
      setResources(
        resourcesResult.status === 'fulfilled' ? resourcesResult.value : []
      );

      if (failedResults.length > 0) {
        setError(
          'Bazı çalışma alanı verileri yüklenemedi. Sayfayı yenileyerek tekrar deneyin.'
        );
      }
    } catch (loadError) {
      console.error('Failed to load user dashboard:', loadError);
      setError('Öğrenme verileriniz yüklenemedi.');
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
      setError('Konu adı zorunludur.');
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
      setError('Konu oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLearningLog = async (event) => {
    event.preventDefault();

    if (!logTopicId) {
      setError('Öğrenme kaydı için bir konu seçin.');
      return;
    }

    const trimmedTitle = logTitle.trim();
    if (!trimmedTitle) {
      setError('Öğrenme kaydı başlığı zorunludur.');
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
      setError('Öğrenme kaydı oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateResource = async (event) => {
    event.preventDefault();

    if (!resourceTopicId) {
      setError('Kaynak için bir konu seçin.');
      return;
    }

    const trimmedTitle = resourceTitle.trim();
    const trimmedUrl = resourceUrl.trim();
    if (!trimmedTitle || !trimmedUrl) {
      setError('Kaynak başlığı ve URL alanı zorunludur.');
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
      setError('Kaynak oluşturulamadı.');
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
      setError('Konu adı zorunludur.');
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
      setError('Konu güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Bu konuyu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await deleteTopic(topicId);
      await loadUserData();
    } catch (deleteError) {
      console.error('Failed to delete topic:', deleteError);
      setError('Konu silinemedi. Konuya bağlı kayıt veya kaynak bulunmadığından emin olun.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLearningLog = async (logId) => {
    if (!window.confirm('Bu öğrenme kaydını silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await deleteLearningLog(logId);
      await loadUserData();
    } catch (deleteError) {
      console.error('Failed to delete learning log:', deleteError);
      setError('Öğrenme kaydı silinemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Bu kaynağı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      await deleteResource(resourceId);
      await loadUserData();
    } catch (deleteError) {
      console.error('Failed to delete resource:', deleteError);
      setError('Kaynak silinemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainCard title="Öğrenme Çalışma Alanım">
        <CircularProgress size={24} />
      </MainCard>
    );
  }

  const displayName = username || email || 'Kullanıcı';

  return (
    <Stack className="seclab-workspace-stack" spacing={3}>
      <WorkspaceHero
        displayName={displayName}
        email={email}
        role={role}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Box className="seclab-dashboard-section seclab-dashboard-section--summary">
        <SummaryCards
          topicsCount={topics.length}
          learningLogsCount={learningLogs.length}
          resourcesCount={resources.length}
        />
      </Box>

      <Box
        id="workspace-productivity"
        className="seclab-dashboard-section"
      >
        <ProductivityPanel />
      </Box>

      <Box
        id="workspace-insights"
        className="seclab-dashboard-section"
      >
        <InsightsPanel
          topics={topics}
          learningLogs={learningLogs}
          resources={resources}
        />
      </Box>

      <Box
        id="workspace-records"
        className="seclab-dashboard-section"
      >
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
      </Box>

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
