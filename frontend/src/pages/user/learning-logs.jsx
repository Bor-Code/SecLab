import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import LearningLogList from './components/LearningLogList';
import { fetchLearningLogs, fetchTopics } from 'api/seclab';

export default function UserLearningLogsPage() {
  const [learningLogs, setLearningLogs] = useState([]);
  const [topics, setKonular] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [logsData, topicsData] = await Promise.all([fetchLearningLogs(), fetchTopics()]);

      setLearningLogs(Array.isArray(logsData) ? logsData : []);
      setKonular(Array.isArray(topicsData) ? topicsData : []);
    } catch (loadError) {
      setError(loadError.message || 'Öğrenme kayıtları yüklenemedi.');
      setLearningLogs([]);
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
      <LearningLogList
        learningLogs={learningLogs}
        logs={learningLogs}
        setLearningLogs={setLearningLogs}
        topics={topics}
        onChange={loadData}
      />
    </Box>
  );
}
