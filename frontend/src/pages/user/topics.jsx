import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import TopicManager from './components/TopicManager';
import { fetchTopics } from 'api/seclab';

export default function UserKonularPage() {
  const [topics, setKonular] = useState([]);
  const [error, setError] = useState('');

  async function loadKonular() {
    try {
      const data = await fetchTopics();

      setKonular(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || 'Konular yüklenemedi.');
      setKonular([]);
    }
  }

  useEffect(() => {
    loadKonular();
  }, []);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TopicManager topics={topics} setKonular={setKonular} onChange={loadKonular} />
    </Box>
  );
}
