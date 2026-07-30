import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fetchLearningLogs, fetchResources, fetchTopics } from 'api/seclab';

const pageConfig = {
  progress: {
    title: 'İlerlemem',
    description: 'Konu, öğrenme kaydı ve kaynak sayılarınıza göre çalışma ilerlemenizi takip edin.'
  },
  plan: {
    title: 'Çalışma Planı',
    description: 'Son kayıtlarınıza göre bir sonraki çalışma adımınızı düzenleyin.'
  },
  notes: {
    title: 'Notlar',
    description: 'Öğrenme kayıtlarınız ve kaynaklarınızdaki son notları görüntüleyin.'
  },
  activity: {
    title: 'Aktivite',
    description: 'Çalışma alanınızdaki son kayıt hareketlerini kronolojik olarak inceleyin.'
  }
};

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function formatDate(value) {
  if (!value) return 'Tarih yok';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('tr-TR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

export default function WorkspaceDataPage({ type }) {
  const [topics, setTopics] = useState([]);
  const [learningLogs, setLearningLogs] = useState([]);
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const config = pageConfig[type] || pageConfig.progress;

  useEffect(() => {
    let active = true;

    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        const [topicData, learningLogData, resourceData] = await Promise.all([fetchTopics(), fetchLearningLogs(), fetchResources()]);

        if (!active) return;

        setTopics(toArray(topicData));
        setLearningLogs(toArray(learningLogData));
        setResources(toArray(resourceData));
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Çalışma alanı verileri yüklenemedi.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const totalRecords = topics.length + learningLogs.length + resources.length;
  const progressScore = Math.min(100, topics.length * 20 + learningLogs.length * 15 + resources.length * 10);

  const activityRows = useMemo(() => {
    const topicRows = topics.map((item) => ({
      title: `Konu: ${item.name}`,
      detail: item.description || 'Açıklama eklenmedi.',
      date: item.created_at
    }));
    const learningRows = learningLogs.map((item) => ({
      title: `Öğrenme kaydı: ${item.title}`,
      detail: item.notes || 'Not eklenmedi.',
      date: item.study_date || item.created_at
    }));
    const resourceRows = resources.map((item) => ({
      title: `Kaynak: ${item.title}`,
      detail: item.notes || item.url || 'Açıklama eklenmedi.',
      date: item.created_at
    }));

    return [...topicRows, ...learningRows, ...resourceRows]
      .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
      .slice(0, 12);
  }, [learningLogs, resources, topics]);

  const noteRows = useMemo(() => {
    const learningNotes = learningLogs
      .filter((item) => item.notes)
      .map((item) => ({ title: item.title, detail: item.notes, date: item.study_date || item.created_at }));
    const resourceNotes = resources
      .filter((item) => item.notes)
      .map((item) => ({ title: item.title, detail: item.notes, date: item.created_at }));

    return [...learningNotes, ...resourceNotes].slice(0, 12);
  }, [learningLogs, resources]);

  const planRows = [
    {
      title: '1. Konuyu belirle',
      detail: topics[0]?.name || 'Önce çalışma alanınıza bir konu ekleyin.'
    },
    {
      title: '2. Çalışmayı kaydet',
      detail: learningLogs[0]?.title || 'Çalışma sonrasında bir öğrenme kaydı oluşturun.'
    },
    {
      title: '3. Kaynak ekle',
      detail: resources[0]?.title || 'Kullandığınız bağlantı veya dokümanı kaynaklara ekleyin.'
    }
  ];

  let rows = activityRows;

  if (type === 'notes') rows = noteRows;
  if (type === 'plan') rows = planRows;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack spacing={1}>
            <Typography variant="h3">{config.title}</Typography>
            <Typography color="text.secondary">{config.description}</Typography>
          </Stack>
        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {isLoading ? (
          <Paper sx={{ p: 5, textAlign: 'center' }}>
            <CircularProgress size={34} />
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Veriler yükleniyor...
            </Typography>
          </Paper>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 2
              }}
            >
              {[
                ['Konular', topics.length],
                ['Öğrenme Kayıt Yönetimiı', learningLogs.length],
                ['Kaynaklar', resources.length],
                ['Toplam Kayıt', totalRecords]
              ].map(([label, value]) => (
                <Paper key={label} sx={{ p: 2.5 }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography variant="h3" sx={{ mt: 1 }}>
                    {value}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {type === 'progress' ? (
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5">Çalışma ilerleme puanı</Typography>
                    <Chip label={`%${progressScore}`} color="primary" />
                  </Stack>
                  <LinearProgress variant="determinate" value={progressScore} sx={{ height: 10, borderRadius: 10 }} />
                  <Typography color="text.secondary">Düzenli konu, kayıt ve kaynak ekledikçe bu puan yükselir.</Typography>
                </Stack>
              </Paper>
            ) : (
              <Paper>
                <List disablePadding>
                  {rows.length === 0 ? (
                    <ListItem sx={{ py: 3 }}>
                      <ListItemText
                        primary="Henüz gösterilecek kayıt yok"
                        secondary="Çalışma alanına veri eklediğinizde bu bölüm otomatik güncellenir."
                      />
                    </ListItem>
                  ) : (
                    rows.map((item, index) => (
                      <Box key={`${item.title}-${index}`}>
                        <ListItem sx={{ py: 2 }}>
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {item.detail}
                                </Typography>
                                {item.date && (
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(item.date)}
                                  </Typography>
                                )}
                              </Stack>
                            }
                          />
                        </ListItem>
                        {index < rows.length - 1 && <Divider />}
                      </Box>
                    ))
                  )}
                </List>
              </Paper>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}

WorkspaceDataPage.propTypes = {
  type: PropTypes.oneOf(['progress', 'plan', 'notes', 'activity']).isRequired
};
