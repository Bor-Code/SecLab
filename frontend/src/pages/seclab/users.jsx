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

// project imports
import MainCard from 'components/MainCard';
import { fetchUsers, createUser, updateUser, deleteUser } from 'api/seclab';

// ==============================|| USERS PAGE ||============================== //

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUsername, setEditingUsername] = useState('');
  const [editingEmail, setEditingEmail] = useState('');

  const [userSearch, setUserSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      setErrorMessage('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(event) {
    event.preventDefault();
    setIsCreating(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const createdUser = await createUser({ username, email });
      setUsers((prevUsers) => [...prevUsers, createdUser]);
      setUsername('');
      setEmail('');
      setUserSearch('');
      setMessage('User created successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
    } finally {
      setIsCreating(false);
    }
  }

  function startEditingUser(user) {
    setEditingUserId(user.id);
    setEditingUsername(user.username);
    setEditingEmail(user.email);
    setMessage(null);
    setErrorMessage(null);
  }

  function cancelEditingUser() {
    setEditingUserId(null);
    setEditingUsername('');
    setEditingEmail('');
  }

  async function handleUpdateUser(event) {
    event.preventDefault();
    if (editingUserId === null) return;

    try {
      const updatedUser = await updateUser(editingUserId, {
        username: editingUsername,
        email: editingEmail,
      });
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      );
      cancelEditingUser();
      setMessage('User updated successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm('Delete this user?')) return;

    try {
      await deleteUser(userId);
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));
      setMessage('User deleted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <MainCard title="Users">
      <Typography variant="body2" sx={{ mb: 3 }}>
        Create and manage application users. Use the form below to add a new user to the system.
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

      {editingUserId !== null ? (
        <form onSubmit={handleUpdateUser}>
          <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Username"
                value={editingUsername}
                onChange={(e) => setEditingUsername(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={editingEmail}
                onChange={(e) => setEditingEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Stack direction="row" spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{ height: '41px' }}
                >
                  Save changes
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ height: '41px' }}
                  onClick={cancelEditingUser}
                >
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      ) : (
        <form onSubmit={handleCreateUser}>
          <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                disabled={isCreating}
                fullWidth
                sx={{ height: '41px' }}
              >
                {isCreating ? 'Creating...' : 'Create user'}
              </Button>
            </Grid>
          </Grid>
        </form>
      )}

      <TextField
        fullWidth
        label="Search users"
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        placeholder="Search by username or email"
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleString('tr-TR')}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => startEditingUser(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}