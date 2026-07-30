import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import ResourceList from './components/ResourceList';
import { fetchResources, fetchTopics } from 'api/seclab';

export default function UserResourcesPage() {
  const [resources, setResources] = useState([]);
  const [topics, setKonular] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [resourcesData, topicsData] = await Promise.all([fetchResources(), fetchTopics()]);

      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setKonular(Array.isArray(topicsData) ? topicsData : []);
    } catch (loadError) {
      setError(loadError.message || 'Kaynaklar yüklenemedi.');
      setResources([]);
      setKonular([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <ResourceList resources={resources} setResources={setResources} topics={topics} onChange={loadData} />
    </Box>
  );
}
