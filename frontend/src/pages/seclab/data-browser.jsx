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
import { fetchUsers, fetchTopics, fetchLearningLogs, fetchResources } from 'api/seclab';

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
      const [fUsers, fKonular, fLogs, fResources] = await Promise.all([fetchUsers(), fetchTopics(), fetchLearningLogs(), fetchResources()]);
      setUsers(fUsers);
      setKonular(fKonular);
      setLogs(fLogs);
      setResources(fResources);
    } catch (error) {
      console.error('Failed to load database records:', error);
      setErrorMessage('Veritabanı kayıtları yüklenemedi.');
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
    <MainCard title="Veri Tarayıcısı">
      <Typography variant="body2" sx={{ mb: 3 }}>
        Temel sistem tablolarını incelemek için salt okunur veritabanı tarayıcısı.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="data browser tables">
          <Tab label={`Kullanıcılar (${users.length})`} />
          <Tab label={`Konular (${topics.length})`} />
          <Tab label={`Öğrenme Kayıt Yönetimiı (${logs.length})`} />
          <Tab label={`Kaynaklar (${resources.length})`} />
        </Tabs>
      </Box>

      {/* Users Tab */}
      {tabIndex === 0 && (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Kullanıcı Adı</TableCell>
                <TableCell>E-posta</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Kullanıcılar yükleniyor...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Kullanıcı bulunamadı.
                  </TableCell>
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
                <TableCell>Kullanıcı ID</TableCell>
                <TableCell>Ad</TableCell>
                <TableCell>Açıklama</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Konular yükleniyor...
                  </TableCell>
                </TableRow>
              ) : topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Konu bulunamadı.
                  </TableCell>
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
                <TableCell>Kullanıcı ID</TableCell>
                <TableCell>Konu ID</TableCell>
                <TableCell>Başlık</TableCell>
                <TableCell>Çalışma Tarihi</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Öğrenme kayıtları yükleniyor...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Öğrenme kaydı bulunamadı.
                  </TableCell>
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
                <TableCell>Kullanıcı ID</TableCell>
                <TableCell>Konu ID</TableCell>
                <TableCell>Başlık</TableCell>
                <TableCell>Tür</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Kaynaklar yükleniyor...
                  </TableCell>
                </TableRow>
              ) : resources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Kaynak bulunamadı.
                  </TableCell>
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
