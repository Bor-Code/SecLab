import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';

import MainCard from 'components/MainCard';
import { fetchUsers, fetchKonular, fetchLearningLogs, fetchResources } from 'api/seclab';

export default function DataBrowserPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const [topics, setKonular] = useState([]);
  const [logs, setLogs] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  async function loadData() {
    setIsLoading(true);
    try {
      const [fUsers, fKonular, fLogs, fResources] = await Promise.all([
        fetchUsers(),
        fetchKonular(),
        fetchLearningLogs(),
        fetchResources()
      ]);
      setUsers(fUsers);
      setKonular(fKonular);
      setLogs(fLogs);
      setResources(fResources);
    } catch (error) {
      console.error('Failed to load database records:', error);
      setErrorMessage('Failed to load database records.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleTabChange = (_event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <MainCard title="Data Browser">
      <Typography variant="body2" sx={{ mb: 3 }}>
        Read-only database browser for inspecting core system tables.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="data browser tables">
          <Tab label={`Users (${users.length})`} />
          <Tab label={`Konular (${topics.length})`} />
          <Tab label={`LearningLogs (${logs.length})`} />
          <Tab label={`Resources (${resources.length})`} />
        </Tabs>
      </Box>

      {/* Users Tab */}
      {tabIndex === 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading users...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{row.role}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleString('tr-TR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Konular Tab */}
      {tabIndex === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Loading topics...</TableCell>
                </TableRow>
              ) : topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No topics found.</TableCell>
                </TableRow>
              ) : (
                topics.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.user_id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.description || '-'}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleString('tr-TR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* LearningLogs Tab */}
      {tabIndex === 2 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Topic ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Study Date</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading learning logs...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No learning logs found.</TableCell>
                </TableRow>
              ) : (
                logs.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.user_id}</TableCell>
                    <TableCell>{row.topic_id}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.study_date}</TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleString('tr-TR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Resources Tab */}
      {tabIndex === 3 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Topic ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading resources...</TableCell>
                </TableRow>
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No resources found.</TableCell>
                </TableRow>
              ) : (
                resources.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.user_id}</TableCell>
                    <TableCell>{row.topic_id}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{row.resource_type}</TableCell>
                    <TableCell>
                      <Link href={row.url} target="_blank" rel="noopener noreferrer">
                        Open
                      </Link>
                    </TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleString('tr-TR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}