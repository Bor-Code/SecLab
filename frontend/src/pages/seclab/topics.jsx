import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import MainCard from 'components/MainCard';
import { createTopic, deleteTopic, fetchKonular, fetchUsers, updateTopic } from 'api/seclab';

export default function KonularPage() {
  const [topics, setKonular] = useState([]);
  const [users, setUsers] = useState([]);

  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const [deleteTargetTopic, setSilTargetTopic] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [topicSearch, setTopicSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadPageData() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [topicsData, usersData] = await Promise.all([fetchKonular(), fetchUsers()]);
      setKonular(topicsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load topics page:', error);
      setErrorMessage('Failed to load topics page data.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  function getUserLabel(topicUserId) {
    const user = users.find((item) => item.id === topicUserId);
    return user ? `${user.username} (${user.email})` : `User #${topicUserId}`;
  }

  async function handleCreateTopic(event) {
    event.preventDefault();
    setIsCreating(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const createdTopic = await createTopic({
        user_id: Number(userId),
        name,
        description: description || null
      });

      setKonular((prevKonular) => [...prevKonular, createdTopic]);
      setUserId('');
      setName('');
      setDescription('');
      setTopicSearch('');
      setMessage('Topic created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
    } finally {
      setIsCreating(false);
    }
  }

  function startEditingTopic(topic) {
    setEditingTopicId(topic.id);
    setEditingName(topic.name);
    setEditingDescription(topic.description || '');
    setMessage(null);
    setErrorMessage(null);
  }

  function cancelEditingTopic() {
    setEditingTopicId(null);
    setEditingName('');
    setEditingDescription('');
  }

  async function handleUpdateTopic(event) {
    event.preventDefault();
    if (editingTopicId === null) return;

    try {
      const updatedTopic = await updateTopic(editingTopicId, {
        name: editingName,
        description: editingDescription || null
      });

      setKonular((prevKonular) => prevKonular.map((topic) => (topic.id === updatedTopic.id ? updatedTopic : topic)));
      cancelEditingTopic();
      setMessage('Topic updated successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
    }
  }

  function openSilDialog(topic) {
    setSilTargetTopic(topic);
    setMessage(null);
    setErrorMessage(null);
  }

  function closeSilDialog() {
    setSilTargetTopic(null);
  }

  async function confirmSilTopic() {
    if (!deleteTargetTopic) return;

    setIsDeleting(true);
    try {
      await deleteTopic(deleteTargetTopic.id);
      setKonular((prevKonular) => prevKonular.filter((topic) => topic.id !== deleteTargetTopic.id));
      setMessage('Topic deleted successfully.');
      closeSilDialog();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
      closeSilDialog();
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredKonular = topics.filter((topic) => {
    const searchValue = topicSearch.toLowerCase();
    return topic.name.toLowerCase().includes(searchValue) || (topic.description || '').toLowerCase().includes(searchValue);
  });

  return (
    <MainCard title="Konular">
      <Typography variant="body2" sx={{ mb: 3 }}>
        Create, update, search, and delete learning topics assigned to SecLab users.
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
      {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}

      {editingTopicId !== null ? (
        <form onSubmit={handleUpdateTopic}>
          <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField fullWidth label="Topic name" value={editingName} onChange={(event) => setEditingName(event.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField fullWidth label="Description" value={editingDescription} onChange={(event) => setEditingDescription(event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" fullWidth>Save</Button>
                <Button variant="outlined" fullWidth onClick={cancelEditingTopic}>İptal</Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      ) : (
        <form onSubmit={handleCreateTopic}>
          <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField select fullWidth label="User" value={userId} onChange={(event) => setUserId(event.target.value)} required>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Topic name" value={name} onChange={(event) => setName(event.target.value)} required />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button type="submit" variant="contained" disabled={isCreating || users.length === 0} fullWidth>
                {isCreating ? 'Creating...' : 'Create topic'}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      <TextField fullWidth label="Konu ara" value={topicSearch} onChange={(event) => setTopicSearch(event.target.value)} sx={{ mb: 3 }} />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading topics...</TableCell></TableRow>
            ) : filteredKonular.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No topics found.</TableCell></TableRow>
            ) : (
              filteredKonular.map((topic) => (
                <TableRow key={topic.id} hover>
                  <TableCell>{topic.id}</TableCell>
                  <TableCell>{getUserLabel(topic.user_id)}</TableCell>
                  <TableCell>{topic.name}</TableCell>
                  <TableCell>{topic.description || '-'}</TableCell>
                  <TableCell>{new Date(topic.created_at).toLocaleString('tr-TR')}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => startEditingTopic(topic)}>Edit</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => openSilDialog(topic)}>Sil</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteTargetTopic !== null} onClose={closeSilDialog}>
        <DialogTitle>Sil topic</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this topic? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSilDialog} color="primary" disabled={isDeleting}>
            İptal
          </Button>
          <Button onClick={confirmSilTopic} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}