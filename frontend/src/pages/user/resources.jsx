import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import ResourceList from './components/ResourceList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function UserResourcesPage() {
  const [resources, setResources] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const token = localStorage.getItem('seclab-access-token');
      const headers = { Authorization: `Bearer ${token}` };

      const [resourcesResponse, topicsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/resources`, { headers }),
        fetch(`${API_BASE_URL}/topics`, { headers })
      ]);

      const resourcesData = await resourcesResponse.json().catch(() => []);
      const topicsData = await topicsResponse.json().catch(() => []);

      if (!resourcesResponse.ok) {
        throw new Error(resourcesData?.detail || 'Resources could not be loaded.');
      }

      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (loadError) {
      setError(loadError.message || 'Resources could not be loaded.');
      setResources([]);
      setTopics([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <ResourceList
        resources={resources}
        setResources={setResources}
        topics={topics}
        onChange={loadData}
      />
    </Box>
  );
}
