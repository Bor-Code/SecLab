import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { fetchCachedJson } from 'api/userWorkspaceCache';

import LearningLogList from './components/LearningLogList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function UserLearningLogsPage() {
  const [learningLogs, setLearningLogs] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState('');
  const [editingLogId, setEditingLogId] = useState(null);
  const [editLogTitle, setEditLogTitle] = useState('');
  const [editLogNotes, setEditLogNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function loadData(force = false) {
    try {
      setError('');
      const token = localStorage.getItem('seclab-access-token');

      const [logsData, topicsData] = await Promise.all([
        fetchCachedJson(API_BASE_URL + '/learning-logs', token, force),
        fetchCachedJson(API_BASE_URL + '/topics', token)
      ]);

      setLearningLogs(Array.isArray(logsData) ? logsData : []);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
    } catch (loadError) {
      setError(loadError.message || 'Öğrenme kayıtları yüklenemedi.');
      setLearningLogs([]);
      setTopics([]);
    }
  }

  function handleStartEditLearningLog(log) {
    setEditingLogId(log.id);
    setEditLogTitle(log.title || '');
    setEditLogNotes(log.notes || '');
  }

  function handleCancelEditLearningLog() {
    setEditingLogId(null);
    setEditLogTitle('');
    setEditLogNotes('');
  }

  async function handleUpdateLearningLog(event, logId) {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('seclab-access-token');
      const response = await fetch(`${API_BASE_URL}/learning-logs/${logId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: editLogTitle.trim(),
          notes: editLogNotes.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || 'Öğrenme kaydı güncellenemedi.');
      }

      await loadData(true);
      handleCancelEditLearningLog();
    } catch (updateError) {
      setError(updateError.message || 'Öğrenme kaydı güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteLearningLog(logId) {
    if (!window.confirm('Bu öğrenme kaydını silmek istediğinize emin misiniz?')) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('seclab-access-token');
      const response = await fetch(`${API_BASE_URL}/learning-logs/${logId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || 'Öğrenme kaydı silinemedi.');
      }

      await loadData(true);
      handleCancelEditLearningLog();
    } catch (deleteError) {
      setError(deleteError.message || 'Öğrenme kaydı silinemedi.');
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
    </Box>
  );
}
