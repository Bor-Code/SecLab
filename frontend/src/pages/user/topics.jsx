import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { fetchCachedJson } from 'api/userWorkspaceCache';

import TopicManager from './components/TopicManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function UserTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicDescription, setEditTopicDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadTopics(force = false) {
    try {
      setError('');
      const token = localStorage.getItem('seclab-access-token');
      const data = await fetchCachedJson(
        API_BASE_URL + '/topics',
        token,
        force
      );

      setTopics(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || 'Konular yüklenemedi.');
      setTopics([]);
    }
  }

  function handleStartEditTopic(topic) {
    setEditingTopicId(topic.id);
    setEditTopicName(topic.name || '');
    setEditTopicDescription(topic.description || '');
  }

  function handleCancelEditTopic() {
    setEditingTopicId(null);
    setEditTopicName('');
    setEditTopicDescription('');
  }

  async function handleUpdateTopic(event, topicId) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('seclab-access-token');
      const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editTopicName.trim(),
          description: editTopicDescription.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || 'Konu güncellenemedi.');
      }

      await loadTopics(true);
      handleCancelEditTopic();
    } catch (updateError) {
      setError(updateError.message || 'Konu güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTopic(topicId) {
    if (!window.confirm('Bu konuyu silmek istediğinize emin misiniz?')) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('seclab-access-token');
      const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || 'Konu silinemedi.');
      }

      await loadTopics(true);
      handleCancelEditTopic();
    } catch (deleteError) {
      setError(deleteError.message || 'Konu silinemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
    </Box>
  );
}
