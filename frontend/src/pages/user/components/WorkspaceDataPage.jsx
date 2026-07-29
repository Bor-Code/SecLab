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
    title: 'My Progress',
    eyebrow: 'Progress Command Center',
    description: 'Track learning momentum, workspace coverage, and recent study consistency.',
    mainLabel: 'Workspace score',
    actionTitle: 'Best next move',
    actionText: 'Add a learning log after each study session so progress becomes more accurate.'
  },
  plan: {
    title: 'Study Plan',
    eyebrow: 'Study Control Room',
    description: 'Plan the next study step using your latest topic and learning records.',
    mainLabel: 'Study readiness',
    actionTitle: 'Next study step',
    actionText: 'Use the latest topic as today focus, then record the result as a learning log.'
  },
  notes: {
    title: 'Notes',
    eyebrow: 'Knowledge Board',
    description: 'Review your latest learning notes and resource notes in one clean board.',
    mainLabel: 'Captured notes',
    actionTitle: 'Review habit',
    actionText: 'Turn short notes into useful summaries so they stay valuable later.'
  },
  activity: {
    title: 'Activity',
    eyebrow: 'Workspace Timeline',
    description: 'Follow recent workspace actions generated from real database records.',
    mainLabel: 'Recent activity',
    actionTitle: 'Notification source',
    actionText: 'This activity feed will power the real notification menu in the next pass.'
  }
};

const demoData = {
  user: {
    username: localStorage.getItem('seclab-user-username') || 'Demo User',
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
    topic: { name: 'SecLab Test Topic', description: 'Temporary CRUD test topic for user workspace' },
    learning_log: { title: 'SecLab Test Log', notes: 'Temporary learning log note for UI testing' },
    resource: {
      title: 'SecLab Test Resource',
      resource_type: 'Documentation',
      url: 'https://fastapi.tiangolo.com/',
      notes: 'Temporary resource note for UI testing'
    }
  },
  activity: [
    { title: 'Latest topic', description: 'SecLab Test Topic' },
    { title: 'Latest learning log', description: 'SecLab Test Log' },
    { title: 'Latest resource', description: 'SecLab Test Resource' }
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
        label: 'Topics',
        value: counts.topics ?? 0,
        helper: 'Learning subjects',
        percent: Math.min(100, Number(counts.topics || 0) * 25)
      },
      {
        label: 'Logs',
        value: counts.learning_logs ?? 0,
        helper: 'Study records',
        percent: Math.min(100, Number(counts.learning_logs || 0) * 25)
      },
      {
        label: 'Resources',
        value: counts.resources ?? 0,
        helper: 'Saved material',
        percent: Math.min(100, Number(counts.resources || 0) * 25)
      }
    ],
    [counts]
  );

  const focusCards = [
    {
      label: 'Latest Topic',
      title: latest.topic?.name || 'No topic yet',
      text: latest.topic?.description || 'Create a topic to start building your workspace.'
    },
    {
      label: 'Latest Log',
      title: latest.learning_log?.title || 'No log yet',
      text: latest.learning_log?.notes || 'Add a learning log after your study session.'
    },
    {
      label: 'Latest Resource',
      title: latest.resource?.title || 'No resource yet',
      text: latest.resource?.notes || 'Save documentation, links, and references.'
    }
  ];

  const detailRows = useMemo(() => {
    if (type === 'plan') {
      return [
        ['Latest topic', latest.topic?.name],
        ['Topic description', latest.topic?.description],
        ['Latest learning log', latest.learning_log?.title],
        ['Last study date', progress.last_study_date],
        ['Active study days', progress.active_days]
      ];
    }

    if (type === 'notes') {
      return [
        ['Latest log notes', latest.learning_log?.notes],
        ['Latest resource notes', latest.resource?.notes],
        ['Latest resource', latest.resource?.title],
        ['Resource type', latest.resource?.resource_type],
        ['Resource URL', latest.resource?.url]
      ];
    }

    if (type === 'activity') {
      const rows = data?.activity || [];
      return rows.length ? rows.map((item) => [item.title, item.description]) : [['Activity status', 'No activity records yet']];
    }

    return [
      ['Total records', counts.total_records],
      ['Active study days', progress.active_days],
      ['Last study date', progress.last_study_date],
      ['Latest topic', latest.topic?.name],
      ['Latest resource', latest.resource?.title]
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
                  label={source === 'live' ? 'Live DB' : source === 'loading' ? 'Loading' : 'Demo data'}
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
                      {isLoading ? 'Loading live workspace data...' : `${counts.total_records ?? 0} total records in this workspace`}
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
                  <Typography variant="h5">Live Details</Typography>
                  <Chip label={source === 'live' ? 'Connected' : 'Fallback'} color={source === 'live' ? 'success' : 'warning'} variant="outlined" />
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
                    Refresh Data
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
                  <Chip label={`Total records: ${counts.total_records ?? 0}`} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.34)' }} variant="outlined" />
                  <Chip label={`Active days: ${progress.active_days ?? 0}`} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.34)' }} variant="outlined" />
                  <Chip label={`Last study: ${formatValue(progress.last_study_date)}`} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.34)' }} variant="outlined" />
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}