import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import LearningLogList from './components/LearningLogList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function UserLearningLogsPage() {
  const [learningLogs, setLearningLogs] = useState([]);
  const [topics, setKonular] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const token = localStorage.getItem('seclab-access-token');
      const headers = { Authorization: `Bearer ${token}` };

      const [logsResponse, topicsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/learning-logs`, { headers }),
        fetch(`${API_BASE_URL}/topics`, { headers })
      ]);

      const logsData = await logsResponse.json().catch(() => []);
      const topicsData = await topicsResponse.json().catch(() => []);

      if (!logsResponse.ok) {
        throw new Error(logsData?.detail || 'Öğrenme kayıtları yüklenemedi.');
      }

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
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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
