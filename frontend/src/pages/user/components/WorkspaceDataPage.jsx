import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const pageConfig = {
  progress: {
    title: 'İlerlemem',
    eyebrow: 'İlerleme Kontrol Merkezi',
    description: 'Öğrenme ivmesini, çalışma alanı kapsamını ve son çalışma düzenini takip edin.',
    mainLabel: 'Çalışma alanı skoru',
    actionTitle: 'Sonraki en iyi adım',
    actionText: 'İlerlemenin daha doğru hesaplanması için her çalışma oturumundan sonra bir öğrenme kaydı ekleyin.'
  },
  plan: {
    title: 'Çalışma Planı',
    eyebrow: 'Çalışma Kontrol Merkezi',
    description: 'Son konu ve öğrenme kayıtlarınızı kullanarak bir sonraki çalışma adımını planlayın.',
    mainLabel: 'Çalışma hazırlığı',
    actionTitle: 'Sonraki çalışma adımı',
    actionText: 'Son konuyu bugünün odağı olarak kullanın, ardından sonucu bir öğrenme kaydı olarak ekleyin.'
  },
  notes: {
    title: 'Notlar',
    eyebrow: 'Bilgi Panosu',
    description: 'Son öğrenme ve kaynak notlarınızı düzenli bir panoda inceleyin.',
    mainLabel: 'Kaydedilen notlar',
    actionTitle: 'Tekrar alışkanlığı',
    actionText: 'Kısa notları daha sonra işe yarayacak özetlere dönüştür.'
  },
  activity: {
    title: 'Aktivite',
    eyebrow: 'Çalışma Alanı Zaman Akışı',
    description: 'Gerçek veritabanı kayıtlarından oluşturulan son çalışma alanı aktivitelerini takip edin.',
    mainLabel: 'Son aktiviteler',
    actionTitle: 'Bildirim kaynağı',
    actionText: 'Bu aktivite akışı sonraki geliştirmede gerçek bildirim menüsünü besleyecek.'
  }
};

const demoData = {
  user: {
    username: localStorage.getItem('seclab-user-username') || 'Demo Kullanıcısı',
    email: localStorage.getItem('seclab-user-email') || 'demo@seclab.local',
    role: localStorage.getItem('seclab-user-role') || 'user'
  },
  counts: {
    topics: 1,
    learning_logs: 1,
    resources: 1,
    total_records: 3
  },
  progress: {
    completion_score: 65,
    active_days: 1,
    last_study_date: new Date().toISOString().slice(0, 10)
  },
  latest: {
    topic: { name: 'SecLab Test Konusu', description: 'Kullanıcı çalışma alanı için geçici CRUD test konusu' },
    learning_log: { title: 'SecLab Test Kaydı', notes: 'Arayüz testi için geçici öğrenme kaydı notu' },
    resource: {
      title: 'SecLab Test Kaynağı',
      resource_type: 'Dokümantasyon',
      url: 'https://fastapi.tiangolo.com/',
      notes: 'Arayüz testi için geçici kaynak notu'
    }
  },
  activity: [
    { title: 'Son konu', description: 'SecLab Test Konusu' },
    { title: 'Son öğrenme kaydı', description: 'SecLab Test Kaydı' },
    { title: 'Son kaynak', description: 'SecLab Test Kaynağı' }
  ],
  notifications: [],
  unread_notifications: 0
};

function formatValue(value) {
  if (value === 0) return '0';
  if (!value) return 'Not available';
  return String(value);
}

async function fetchWorkspaceData(token) {
  const urls = [
    `${API_BASE_URL}/dashboard/user-workspace`,
    `${API_BASE_URL}/dashboard/dashboard/user-workspace`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data) {
        return { data, source: 'live' };
      }
    } catch {
      // fallback below
    }
  }

  return { data: demoData, source: 'demo' };
}

export default function WorkspaceDataPage({ type = 'progress' }) {
  const [data, setData] = useState(demoData);
  const [source, setSource] = useState('loading');
  const [isLoading, setIsLoading] = useState(true);

  const config = pageConfig[type] || pageConfig.progress;

  useEffect(() => {
    let active = true;

    async function loadWorkspaceData() {
      setIsLoading(true);

      const token = localStorage.getItem('seclab-access-token');
      const result = await fetchWorkspaceData(token);

      if (active) {
        setData(result.data || demoData);
        setSource(result.source);
        setIsLoading(false);
      }
    }

    loadWorkspaceData();

    return () => {
      active = false;
    };
  }, []);

  const counts = data?.counts || {};
  const progress = data?.progress || {};
  const latest = data?.latest || {};
  const score = Number(progress.completion_score || 0);

  const metrics = useMemo(
    () => [
      {
        label: 'Konular',
        value: counts.topics ?? 0,
        helper: 'Öğrenme konuları',
        percent: Math.min(100, Number(counts.topics || 0) * 25)
      },
      {
        label: 'Logs',
        value: counts.learning_logs ?? 0,
        helper: 'Çalışma kayıtları',
        percent: Math.min(100, Number(counts.learning_logs || 0) * 25)
      },
      {
        label: 'Kaynaklar',
        value: counts.resources ?? 0,
        helper: 'Kaydedilen materyaller',
        percent: Math.min(100, Number(counts.resources || 0) * 25)
      }
    ],
    [counts]
  );

  const focusCards = [
    {
      label: 'Son Konu',
      title: latest.topic?.name || 'Henüz konu yok',
      text: latest.topic?.description || 'Çalışma alanınızı oluşturmaya başlamak için bir konu ekleyin.'
    },
    {
      label: 'Son Öğrenme Kaydı',
      title: latest.learning_log?.title || 'Henüz öğrenme kaydı yok',
      text: latest.learning_log?.notes || 'Çalışma oturumunuzdan sonra bir öğrenme kaydı ekleyin.'
    },
    {
      label: 'Son Kaynak',
      title: latest.resource?.title || 'Henüz kaynak yok',
      text: latest.resource?.notes || 'Dokümanları, bağlantıları ve referansları kaydedin.'
    }
  ];

  const detailRows = useMemo(() => {
    if (type === 'plan') {
      return [
        ['Son konu', latest.topic?.name],
        ['Konu açıklaması', latest.topic?.description],
        ['Son öğrenme kaydı', latest.learning_log?.title],
        ['Son çalışma tarihi', progress.last_study_date],
        ['Aktif çalışma günleri', progress.active_days]
      ];
    }

    if (type === 'notes') {
      return [
        ['Son kayıt notları', latest.learning_log?.notes],
        ['Son kaynak notları', latest.resource?.notes],
        ['Son kaynak', latest.resource?.title],
        ['Kaynak türü', latest.resource?.resource_type],
        ['Kaynak URL', latest.resource?.url]
      ];
    }

    if (type === 'activity') {
      const rows = data?.activity || [];
      return rows.length ? rows.map((item) => [item.title, item.description]) : [['Aktivite durumu', 'Henüz aktivite kaydı yok']];
    }

    return [
      ['Toplam kayıt', counts.total_records],
      ['Aktif çalışma günleri', progress.active_days],
      ['Son çalışma tarihi', progress.last_study_date],
      ['Son konu', latest.topic?.name],
      ['Son kaynak', latest.resource?.title]
    ];
  }, [counts, data, latest, progress, type]);

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 96px)',
        mx: { xs: -2, md: -3 },
        my: { xs: -2, md: -3 },
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 4 },
        background:
          'linear-gradient(135deg, #dfe6ef 0%, #f7f9fc 42%, #e7edf5 100%)'
      }}
    >
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            color: 'common.white',
            bgcolor: '#101828',
            boxShadow: '0 24px 70px rgba(15,23,42,0.22)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 82% 12%, rgba(56,189,248,0.36), transparent 26%), radial-gradient(circle at 18% 85%, rgba(34,197,94,0.18), transparent 30%), linear-gradient(135deg, #101828 0%, #1e293b 58%, #0f766e 100%)'
            }}
          />

          <Stack spacing={3} sx={{ position: 'relative' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.72)', letterSpacing: 1 }}>
                  {config.eyebrow}
                </Typography>
                <Typography variant="h2">{config.title}</Typography>
                <Typography sx={{ maxWidth: 720, color: 'rgba(255,255,255,0.76)' }}>
                  {config.description}
                </Typography>
              </Stack>

              <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <Chip
                  label={source === 'live' ? 'Canlı veritabanı' : source === 'loading' ? 'Yükleniyor' : 'Demo verisi'}
                  sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.38)' }}
                  variant="outlined"
                />
                <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>{data?.user?.email}</Typography>
              </Stack>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Stack spacing={1.5}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>{config.mainLabel}</Typography>
                    <Typography variant="h1" sx={{ color: 'white' }}>
                      {score}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={score}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: 'rgba(255,255,255,0.22)',
                        '& .MuiLinearProgress-bar': { bgcolor: '#38bdf8' }
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                      {isLoading ? 'Canlı çalışma alanı verileri yükleniyor...' : `${counts.total_records ?? 0} çalışma alanı kaydı`}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Grid container spacing={1.5}>
                  {metrics.map((metric) => (
                    <Grid key={metric.label} size={{ xs: 12, sm: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          height: '100%',
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.10)',
                          border: '1px solid rgba(255,255,255,0.16)'
                        }}
                      >
                        <Stack spacing={0.75}>
                          <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>{metric.label}</Typography>
                          <Typography variant="h3" sx={{ color: 'white' }}>
                            {metric.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.66)' }}>
                            {metric.helper}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Stack>
        </Paper>

        <Grid container spacing={2.5}>
          {focusCards.map((card) => (
            <Grid key={card.label} size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 2,
                  border: '1px solid rgba(148,163,184,0.28)',
                  bgcolor: 'rgba(255,255,255,0.96)',
                  boxShadow: '0 18px 46px rgba(15,23,42,0.08)'
                }}
              >
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h5">{card.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.text}
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                border: '1px solid rgba(148,163,184,0.28)',
                bgcolor: 'rgba(255,255,255,0.96)',
                boxShadow: '0 18px 46px rgba(15,23,42,0.08)'
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="h5">Canlı Detaylar</Typography>
                  <Chip label={source === 'live' ? 'Bağlı' : 'Geçici veri'} color={source === 'live' ? 'success' : 'warning'} variant="outlined" />
                </Stack>

                <Divider />

                {detailRows.map(([label, value]) => (
                  <Stack
                    key={label}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{
                      justifyContent: 'space-between',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      pb: 1.25
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 760, textAlign: { sm: 'right' } }}>
                      {formatValue(value)}
                    </Typography>
                  </Stack>
                ))}

                <Box>
                  <Button variant="contained" onClick={() => window.location.reload()}>
                    Veriyi Yenile
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                height: '100%',
                borderRadius: 2,
                color: 'white',
                bgcolor: '#0f766e',
                boxShadow: '0 18px 46px rgba(15,23,42,0.14)',
                background:
                  'radial-gradient(circle at top right, rgba(255,255,255,0.22), transparent 32%), linear-gradient(135deg, #0f766e, #0f172a)'
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                  {config.actionTitle}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.76)' }}>{config.actionText}</Typography>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.18)' }} />

                <Stack spacing={1}>
                  <Chip label={`Toplam kayıt: ${counts.total_records ?? 0}`} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.34)' }} variant="outlined" />
                  <Chip label={`Aktif gün: ${progress.active_days ?? 0}`} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.34)' }} variant="outlined" />
                  <Chip label={`Son çalışma: ${formatValue(progress.last_study_date)}`} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.34)' }} variant="outlined" />
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}