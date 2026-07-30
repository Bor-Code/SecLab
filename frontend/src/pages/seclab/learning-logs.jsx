import { useEffect, useState } from 'react';

// material-ui
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// project imports
import MainCard from 'components/MainCard';
import {
  fetchLearningLogs,
  createLearningLog,
  updateLearningLog,
  deleteLearningLog,
  fetchUsers,
  fetchTopics
} from 'api/seclab';

// ==============================|| LEARNING LOGS PAGE ||============================== //

export default function LearningLogsPage() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [topics, setKonular] = useState([]);

  // Create form state
  const [userId, setUserId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  // Edit form state
  const [editingLogId, setEditingLogId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // Sil dialog state
  const [deleteTargetLog, setSilTargetLog] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state
  const [logSearch, setLogSearch] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadData() {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedKonular, fetchedLogs] = await Promise.all([
        fetchUsers(),
        fetchTopics(),
        fetchLearningLogs()
      ]);
      setUsers(fetchedUsers);
      setKonular(fetchedKonular);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error('Failed to load data:', error);
      setErrorMessage('Veriler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateLog(event) {
    event.preventDefault();
    setIsCreating(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const createdLog = await createLearningLog({
        user_id: Number(userId),
        topic_id: Number(topicId),
        title,
        notes: notes || null
      });
      setLogs((prevLogs) => [...prevLogs, createdLog]);
      setTitle('');
      setNotes('');
      setLogSearch('');
      setMessage('Öğrenme kaydı başarıyla oluşturuldu.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setIsCreating(false);
    }
  }

  function startEditingLog(log) {
    setEditingLogId(log.id);
    setEditingTitle(log.title);
    setEditingNotes(log.notes || '');
    setMessage(null);
    setErrorMessage(null);
  }

  function cancelEditingLog() {
    setEditingLogId(null);
    setEditingTitle('');
    setEditingNotes('');
  }

  async function handleUpdateLog(event) {
    event.preventDefault();
    if (editingLogId === null) return;

    try {
      const updatedLog = await updateLearningLog(editingLogId, {
        title: editingTitle,
        notes: editingNotes || null
      });
      setLogs((prevLogs) =>
        prevLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log))
      );
      cancelEditingLog();
      setMessage('Öğrenme kaydı başarıyla güncellendi.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.');
    }
  }

  function openSilDialog(log) {
    setSilTargetLog(log);
    setMessage(null);
    setErrorMessage(null);
  }

  function closeSilDialog() {
    setSilTargetLog(null);
  }

  async function confirmSilLog() {
    if (!deleteTargetLog) return;

    setIsDeleting(true);
    try {
      await deleteLearningLog(deleteTargetLog.id);
      setLogs((prevLogs) => prevLogs.filter((log) => log.id !== deleteTargetLog.id));
      setMessage('Öğrenme kaydı başarıyla silindi.');
      closeSilDialog();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.');
      closeSilDialog();
    } finally {
      setIsDeleting(false);
    }
  }

  function getUserName(id) {
    const user = users.find((u) => u.id === id);
    return user ? user.username : `Kullanıcı #${id}`;
  }

  function getTopicName(id) {
    const topic = topics.find((t) => t.id === id);
    return topic ? topic.name : `Konu #${id}`;
  }

  const filteredLogs = logs.filter((log) => {
    const search = logSearch.toLowerCase();
    const userName = getUserName(log.user_id).toLowerCase();
    const topicName = getTopicName(log.topic_id).toLowerCase();
    const titleMatch = log.title.toLowerCase().includes(search);
    const notesMatch = (log.notes || '').toLowerCase().includes(search);

    return titleMatch || notesMatch || userName.includes(search) || topicName.includes(search);
  });

  return (
    <MainCard title="Öğrenme Kayıtları">
      <Typography variant="body2" sx={{ mb: 3 }}>
        Record and review your study notes. Select a user and topic, then add your log entry.
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      {editingLogId !== null ? (
        <form onSubmit={handleUpdateLog}>
          <Grid container spacing={2} sx={{ mb: 4 }} alignItems="flex-start">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Başlık"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="Notlar"
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                multiline
                rows={1}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" fullWidth sx={{ height: '41px' }}>
                  Save
                </Button>
                <Button variant="outlined" fullWidth sx={{ height: '41px' }} onClick={cancelEditingLog}>
                  İptal
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      ) : (
        <form onSubmit={handleCreateLog}>
          <Grid container spacing={2} sx={{ mb: 4 }} alignItems="flex-start">
            <Grid item xs={12} sm={2}>
              <TextField
                select
                fullWidth
                label="Kullanıcı"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.username}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Konu"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                required
              >
                {topics.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Başlık"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Notlar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={1}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating || users.length === 0 || topics.length === 0}
                fullWidth
                sx={{ height: '41px' }}
              >
                {isCreating ? 'Oluşturuluyor...' : 'Kayıt Oluştur'}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      <TextField
        fullWidth
        label="Öğrenme kaydı ara"
        value={logSearch}
        onChange={(e) => setLogSearch(e.target.value)}
        placeholder="Başlık, not, kullanıcı veya konuya göre ara"
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>Konu</TableCell>
              <TableCell>Başlık</TableCell>
              <TableCell>Notlar</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Veriler yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Öğrenme kaydı bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{getUserName(log.user_id)}</TableCell>
                  <TableCell>{getTopicName(log.topic_id)}</TableCell>
                  <TableCell>{log.title}</TableCell>
                  <TableCell>{log.notes || '-'}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString('tr-TR')}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => startEditingLog(log)}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => openSilDialog(log)}>
                        Sil
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteTargetLog !== null} onClose={closeSilDialog}>
        <DialogTitle>Öğrenme Kaydını Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu öğrenme kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSilDialog} color="primary" disabled={isDeleting}>
            İptal
          </Button>
          <Button onClick={confirmSilLog} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}