import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import MainCard from 'components/MainCard';
import { fetchCachedJson } from 'api/userWorkspaceCache';

import ResourceList from './components/ResourceList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const resourceTypes = ['documentation', 'tool', 'article', 'video', 'other'];

const resourceTypeLabels = {
  documentation: 'Dokümantasyon',
  tool: 'Araç',
  article: 'Makale',
  video: 'Video',
  other: 'Diğer'
};

export default function UserResourcesPage() {
  const [resources, setResources] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resourceTopicId, setResourceTopicId] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceType, setResourceType] = useState('documentation');
  const [resourceNotes, setResourceNotes] = useState('');
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editResourceTitle, setEditResourceTitle] = useState('');
  const [editResourceUrl, setEditResourceUrl] = useState('');
  const [editResourceType, setEditResourceType] = useState('documentation');
  const [editResourceNotes, setEditResourceNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadData(force = false) {
    try {
      setError('');
      const token = localStorage.getItem('seclab-access-token');

      const [resourcesData, topicsData] = await Promise.all([
        fetchCachedJson(API_BASE_URL + '/resources', token, force),
        fetchCachedJson(API_BASE_URL + '/topics', token)
      ]);

      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (loadError) {
      setError(loadError.message || 'Kaynaklar yüklenemedi.');
      setResources([]);
      setTopics([]);
    }
  }

  async function handleCreateResource(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const token = localStorage.getItem('seclab-access-token');
      const userId = Number(localStorage.getItem('seclab-user-id'));

      if (!userId) {
        throw new Error('Oturum bilgisi bulunamadı.');
      }

      const response = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          topic_id: Number(resourceTopicId),
          title: resourceTitle.trim(),
          url: resourceUrl.trim(),
          resource_type: resourceType,
          notes: resourceNotes.trim() || null
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.detail || 'Kaynak oluşturulamadı.');
      }

      setResourceTopicId('');
      setResourceTitle('');
      setResourceUrl('');
      setResourceType('documentation');
      setResourceNotes('');
      await loadData(true);
      setMessage('Kaynak başarıyla eklendi.');
    } catch (createError) {
      setError(createError.message || 'Kaynak oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartEditResource(resource) {
    setEditingResourceId(resource.id);
    setEditResourceTitle(resource.title || '');
    setEditResourceUrl(resource.url || '');
    setEditResourceType(resource.resource_type || 'documentation');
    setEditResourceNotes(resource.notes || '');
  }

  function handleCancelEditResource() {
    setEditingResourceId(null);
    setEditResourceTitle('');
    setEditResourceUrl('');
    setEditResourceType('documentation');
    setEditResourceNotes('');
  }

  async function handleUpdateResource(event, resourceId) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('seclab-access-token');
      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editResourceTitle.trim(),
          url: editResourceUrl.trim(),
          resource_type: editResourceType,
          notes: editResourceNotes.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || 'Kaynak güncellenemedi.');
      }

      await loadData(true);
      handleCancelEditResource();
    } catch (updateError) {
      setError(updateError.message || 'Kaynak güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteResource(resourceId) {
    if (!window.confirm('Bu kaynağı silmek istediğinize emin misiniz?')) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('seclab-access-token');
      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || 'Kaynak silinemedi.');
      }

      await loadData(true);
      handleCancelEditResource();
    } catch (deleteError) {
      setError(deleteError.message || 'Kaynak silinemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      <MainCard title="Yeni Kaynak" sx={{ mb: 2 }}>
        <Stack component="form" spacing={2} onSubmit={handleCreateResource}>
          <TextField
            select
            required
            label="Konu"
            value={resourceTopicId}
            onChange={(event) => setResourceTopicId(event.target.value)}
            disabled={isSaving}
            fullWidth
          >
            {topics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            label="Kaynak Başlığı"
            value={resourceTitle}
            onChange={(event) => setResourceTitle(event.target.value)}
            disabled={isSaving}
            fullWidth
          />

          <TextField
            required
            type="url"
            label="URL"
            value={resourceUrl}
            onChange={(event) => setResourceUrl(event.target.value)}
            disabled={isSaving}
            fullWidth
          />

          <TextField
            select
            label="Tür"
            value={resourceType}
            onChange={(event) => setResourceType(event.target.value)}
            disabled={isSaving}
            fullWidth
          >
            {resourceTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {resourceTypeLabels[type] || type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Notlar"
            value={resourceNotes}
            onChange={(event) => setResourceNotes(event.target.value)}
            disabled={isSaving}
            multiline
            minRows={2}
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSaving || topics.length === 0}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaynak Oluştur'}
          </Button>
        </Stack>
      </MainCard>

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
    </Box>
  );
}