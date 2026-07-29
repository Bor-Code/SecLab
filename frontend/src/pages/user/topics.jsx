import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import TopicManager from './components/TopicManager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function UserTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');

  async function loadTopics() {
    try {
      const token = localStorage.getItem('seclab-access-token');

      const response = await fetch(`${API_BASE_URL}/topics`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data?.detail || 'Topics could not be loaded.');
      }

      setTopics(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || 'Topics could not be loaded.');
      setTopics([]);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TopicManager topics={topics} setTopics={setTopics} onChange={loadTopics} />
    </Box>
  );
}
