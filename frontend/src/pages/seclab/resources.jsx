import { useEffect, useState } from 'react';

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
import Link from '@mui/material/Link';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import MainCard from 'components/MainCard';
import {
  fetchResources,
  createResource,
  updateResource,
  deleteResource,
  fetchUsers,
  fetchTopics
} from 'api/seclab';

const RESOURCE_TYPES = ['documentation', 'video', 'article', 'course', 'tool', 'other'];

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [topics, setKonular] = useState([]);

  const [userId, setUserId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [resourceType, setResourceType] = useState('documentation');
  const [notes, setNotes] = useState('');

  const [editingResourceId, setEditingResourceId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingUrl, setEditingUrl] = useState('');
  const [editingResourceType, setEditingResourceType] = useState('documentation');
  const [editingNotes, setEditingNotes] = useState('');

  const [deleteTargetResource, setSilTargetResource] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [resourceSearch, setResourceSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadData() {
    setIsLoading(true);
    try {
      const [fetchedUsers, fetchedKonular, fetchedResources] = await Promise.all([
        fetchUsers(),
        fetchTopics(),
        fetchResources()
      ]);
      setUsers(fetchedUsers);
      setKonular(fetchedKonular);
      setResources(fetchedResources);
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

  async function handleCreateResource(event) {
    event.preventDefault();
    setIsCreating(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const createdResource = await createResource({
        user_id: Number(userId),
        topic_id: Number(topicId),
        title,
        url,
        resource_type: resourceType,
        notes: notes || null
      });
      setResources((prevResources) => [...prevResources, createdResource]);
      setUserId('');
      setTopicId('');
      setTitle('');
      setUrl('');
      setResourceType('documentation');
      setNotes('');
      setResourceSearch('');
      setMessage('Kaynak başarıyla oluşturuldu.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.');
    } finally {
      setIsCreating(false);
    }
  }

  function startEditingResource(resource) {
    setEditingResourceId(resource.id);
    setEditingTitle(resource.title);
    setEditingUrl(resource.url);
    setEditingResourceType(resource.resource_type);
    setEditingNotes(resource.notes || '');
    setMessage(null);
    setErrorMessage(null);
  }

  function cancelEditingResource() {
    setEditingResourceId(null);
    setEditingTitle('');
    setEditingUrl('');
    setEditingResourceType('documentation');
    setEditingNotes('');
  }

  async function handleUpdateResource(event) {
    event.preventDefault();
    if (editingResourceId === null) return;

    try {
      const updatedResource = await updateResource(editingResourceId, {
        title: editingTitle,
        url: editingUrl,
        resource_type: editingResourceType,
        notes: editingNotes || null
      });
      setResources((prevResources) =>
        prevResources.map((res) => (res.id === updatedResource.id ? updatedResource : res))
      );
      cancelEditingResource();
      setMessage('Kaynak başarıyla güncellendi.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.');
    }
  }

  function openSilDialog(resource) {
    setSilTargetResource(resource);
    setMessage(null);
    setErrorMessage(null);
  }

  function closeSilDialog() {
    setSilTargetResource(null);
  }

  async function confirmSilResource() {
    if (!deleteTargetResource) return;

    setIsDeleting(true);
    try {
      await deleteResource(deleteTargetResource.id);
      setResources((prevResources) => prevResources.filter((res) => res.id !== deleteTargetResource.id));
      setMessage('Kaynak başarıyla silindi.');
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

  const filteredResources = resources.filter((resource) => {
    const search = resourceSearch.toLowerCase();
    const userName = getUserName(resource.user_id).toLowerCase();
    const topicName = getTopicName(resource.topic_id).toLowerCase();
    const titleMatch = resource.title.toLowerCase().includes(search);
    const urlMatch = resource.url.toLowerCase().includes(search);
    const typeMatch = resource.resource_type.toLowerCase().includes(search);
    const notesMatch = (resource.notes || '').toLowerCase().includes(search);

    return (
      titleMatch ||
      urlMatch ||
      typeMatch ||
      notesMatch ||
      userName.includes(search) ||
      topicName.includes(search)
    );
  });

  return (
    <MainCard title="Kaynaklar">
      <Typography variant="body2" sx={{ mb: 3 }}>
        Manage external links, tools, and learning materials.
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

      {editingResourceId !== null ? (
        <form onSubmit={handleUpdateResource}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Başlık"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="url"
                label="URL"
                value={editingUrl}
                onChange={(e) => setEditingUrl(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Kaynak Türü"
                value={editingResourceType}
                onChange={(e) => setEditingResourceType(e.target.value)}
                required
              >
                {RESOURCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={9}>
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
                <Button variant="outlined" fullWidth sx={{ height: '41px' }} onClick={cancelEditingResource}>
                  İptal
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      ) : (
        <form onSubmit={handleCreateResource}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={3}>
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
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Kaynak Türü"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                required
              >
                {RESOURCE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="url"
                label="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
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
                {isCreating ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      <TextField
        fullWidth
        label="Kaynak ara"
        value={resourceSearch}
        onChange={(e) => setResourceSearch(e.target.value)}
        placeholder="Başlık, URL, tür, not, kullanıcı veya konuya göre ara"
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
              <TableCell>Tür</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Notlar</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell align="right">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Veriler yükleniyor...
                </TableCell>
              </TableRow>
            ) : filteredResources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  Kaynak bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              filteredResources.map((resource) => (
                <TableRow key={resource.id} hover>
                  <TableCell>{resource.id}</TableCell>
                  <TableCell>{getUserName(resource.user_id)}</TableCell>
                  <TableCell>{getTopicName(resource.topic_id)}</TableCell>
                  <TableCell>{resource.title}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>
                    {resource.resource_type}
                  </TableCell>
                  <TableCell>
                    <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                      Open
                    </Link>
                  </TableCell>
                  <TableCell>{resource.notes || '-'}</TableCell>
                  <TableCell>{new Date(resource.created_at).toLocaleString('tr-TR')}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" onClick={() => startEditingResource(resource)}>
                        Edit
                      </Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => openSilDialog(resource)}>
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

      <Dialog open={deleteTargetResource !== null} onClose={closeSilDialog}>
        <DialogTitle>Kaynağı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu kaynağı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSilDialog} color="primary" disabled={isDeleting}>
            İptal
          </Button>
          <Button onClick={confirmSilResource} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}