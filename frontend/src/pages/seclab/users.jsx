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
import TablePagination from '@mui/material/TablePagination';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import MainCard from 'components/MainCard';
import { fetchUsers, createUser, updateUser, deleteUser,
  resetUserPassword } from 'api/seclab';

export default function UsersPage() {
  const currentUserId = Number(localStorage.getItem('seclab-user-id') || 0);
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUsername, setEditingUsername] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [editingRole, setEditingRole] = useState('user');

  const [userSearch, setUserSearch] = useState('');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [deleteTargetUser, setDeleteTargetUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const createdUser = await createUser({ username, email, role });
      setUsers((prevUsers) => [...prevUsers, createdUser]);
      setUsername('');
      setEmail('');
      setRole('user');
      setUserSearch('');
      setPage(0);
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
    setEditingRole(user.role || 'user');
    setMessage(null);
    setErrorMessage(null);
  }

  function cancelEditingUser() {
    setEditingUserId(null);
    setEditingUsername('');
    setEditingEmail('');
    setEditingRole('user');
  }

  async function handleUpdateUser(event) {
    event.preventDefault();
    if (editingUserId === null) return;

    try {
      const updatedUser = await updateUser(editingUserId, {
        username: editingUsername,
        email: editingEmail,
        role: editingRole,
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

  function openDeleteDialog(user) {
    setDeleteTargetUser(user);
    setMessage(null);
    setErrorMessage(null);
  }

  function closeDeleteDialog() {
    setDeleteTargetUser(null);
      setEditingUserId(null);
  }



  async function handleResetUserPassword(user) {
    if (!window.confirm(`Reset password for ${user.email}?`)) {
      return;
    }

    try {
      setErrorMessage(null);
      const response = await resetUserPassword(user.id);
      setSuccessMessage(`Temporary password: ${response.temporary_password}`);
    } catch (error) {
      console.error('Failed to reset user password:', error);
      setErrorMessage(error.message || 'Could not reset user password.');
    }
  }

  async function confirmDeleteUser() {
    if (!deleteTargetUser) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(deleteTargetUser.id);
      setUsers((prevUsers) => prevUsers.filter((u) => u.id !== deleteTargetUser.id));
      setMessage('User deleted successfully.');
      closeDeleteDialog();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
      closeDeleteDialog();
    } finally {
      setIsDeleting(false);
    }
  }

  function handleChangePage(_event, newPage) {
    setPage(newPage);
  }

  function handleChangeRowsPerPage(event) {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (user.role || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Username"
                value={editingUsername}
                onChange={(e) => setEditingUsername(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={editingEmail}
                onChange={(e) => setEditingEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                fullWidth
                label="Role"
                value={editingRole}
                onChange={(e) => setEditingRole(e.target.value)}
                required
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
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
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                fullWidth
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
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
        onChange={(e) => {
          setUserSearch(e.target.value);
          setPage(0);
        }}
        placeholder="Search by username, email, or role"
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
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
                        disabled={user.role === "admin"} onClick={() => openDeleteDialog(user)}
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
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <Dialog open={deleteTargetUser !== null} onClose={closeDeleteDialog}>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary" disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}