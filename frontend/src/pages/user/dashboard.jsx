import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const WORKSPACE_CACHE_KEY = 'seclab-user-workspace-cache';

const demoData = {
  user: {
    username: localStorage.getItem('seclab-user-username') || 'Kullanici 1',
    email: localStorage.getItem('seclab-user-email') || 'deneme2@gmail.com',
    role: localStorage.getItem('seclab-user-role') || 'user'
  },
  counts: {
    topics: 2,
    learning_logs: 2,
    resources: 2
  },
  progress_score: 100,
  latest_topic: {
    name: 'SecLab Test Konusu',
    description: 'Kullanıcı çalışma alanı için geçici CRUD test konusu'
  },
  latest_learning_log: {
    title: 'SecLab Test Kaydı',
    notes: 'Arayüz testi için geçici öğrenme kaydı notu',
    study_date: '2026-07-29'
  },
  latest_resource: {
    title: 'SecLab Test Kaynağı',
    resource_type: 'Dokümantasyon',
    notes: 'Geçici kaynak notu'
  },
  activity: [
    { title: 'Konu oluşturuldu', detail: 'SecLab Test Konusu eklendi.' },
    { title: 'Öğrenme kaydı kaydedildi', detail: 'SecLab Test Kaydı kaydedildi.' },
    { title: 'Kaynak eklendi', detail: 'SecLab Test Kaynağı kaydedildi.' }
  ]
};

function getCachedWorkspaceData() {
  try {
    const cached = sessionStorage.getItem(WORKSPACE_CACHE_KEY);
    return cached ? JSON.parse(cached) : demoData;
  } catch {
    return demoData;
  }
}

function saveCachedWorkspaceData(data) {
  try {
    sessionStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Cache is best-effort only.
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('seclab-access-token');

  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};
}

function normalizeWorkspaceData(payload) {
  const user = payload.user || payload.current_user || demoData.user;
  const counts = payload.counts || payload.summary || {};

  const topicsCount = counts.topics ?? payload.topics_count ?? payload.topics ?? demoData.counts.topics;
  const logsCount =
    counts.learning_logs ?? payload.learning_logs_count ?? payload.learning_logs ?? demoData.counts.learning_logs;
  const resourcesCount = counts.resources ?? payload.resources_count ?? payload.resources ?? demoData.counts.resources;

  return {
    user,
    counts: {
      topics: Number(topicsCount) || 0,
      learning_logs: Number(logsCount) || 0,
      resources: Number(resourcesCount) || 0
    },
    progress_score: Number(payload.progress_score ?? payload.score ?? demoData.progress_score) || 0,
    latest_topic: payload.latest_topic || demoData.latest_topic,
    latest_learning_log: payload.latest_learning_log || payload.latest_log || demoData.latest_learning_log,
    latest_resource: payload.latest_resource || demoData.latest_resource,
    activity: Array.isArray(payload.activity) && payload.activity.length ? payload.activity : demoData.activity
  };
}

async function fetchWorkspaceData() {
  const endpoints = ['/dashboard/user-workspace', '/dashboard/dashboard/user-workspace'];

  const requests = endpoints.map(async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Workspace endpoint failed: ${endpoint}`);
    }

    const payload = await response.json();
    return normalizeWorkspaceData(payload);
  });

  return Promise.any(requests);
}

function MetricCard({ label, value, helper, progress }) {
  return (
    <Paper className="seclab-metric-card">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h3">{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {helper}
      </Typography>
      <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ mt: 1.5, height: 6, borderRadius: 0 }} />
    </Paper>
  );
}

function ModuleCard({ title, description, path, meta }) {
  return (
    <Paper className="seclab-module-card">
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h4">{title}</Typography>
          <Chip label={meta} size="small" />
        </Stack>
        <Typography color="text.secondary">{description}</Typography>
        <Button component={RouterLink} to={path} variant="contained">
          Aç
        </Button>
      </Stack>
    </Paper>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box className="seclab-detail-row">
      <Typography fontWeight={700}>{label}</Typography>
      <Typography color="text.secondary">{value || 'Not available'}</Typography>
    </Box>
  );
}

export default function UserDashboardPage() {
  const [workspace, setWorkspace] = useState(() => getCachedWorkspaceData());
  const [status, setStatus] = useState(() => (sessionStorage.getItem(WORKSPACE_CACHE_KEY) ? 'cached' : 'loading'));
  const [query, setQuery] = useState('');

  const loadData = async () => {
    setStatus('loading');

    try {
      const data = await fetchWorkspaceData();
      setWorkspace(data);
      saveCachedWorkspaceData(data);
      setStatus('live');
    } catch {
      setWorkspace(demoData);
      setStatus('demo');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRecords = workspace.counts.topics + workspace.counts.learning_logs + workspace.counts.resources;
  const activeDays = workspace.latest_learning_log?.study_date ? 1 : 0;

  const checklist = [
    { label: 'Konu oluştur', done: workspace.counts.topics > 0 },
    { label: 'Öğrenme kaydı ekle', done: workspace.counts.learning_logs > 0 },
    { label: 'Kaynak kaydet', done: workspace.counts.resources > 0 },
    { label: 'Profili güncel tut', done: Boolean(workspace.user?.email) }
  ];

  const filteredActivity = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return workspace.activity;

    return workspace.activity.filter((item) => {
      return `${item.title || ''} ${item.detail || ''}`.toLowerCase().includes(value);
    });
  }, [query, workspace.activity]);

  const userName = workspace.user?.username || demoData.user.username;
  const userEmail = workspace.user?.email || demoData.user.email;

  return (
    <Box className="seclab-dashboard-page">
      <Paper className="seclab-hero-card">
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', gap: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip label="SecLab Çalışma Alanı" color="primary" variant="outlined" />
                <Chip label={status === 'live' ? 'Canlı veritabanı verisi' : status === 'cached' ? 'Önbellekteki veritabanı verisi' : status === 'loading' ? 'Veriler yükleniyor' : 'Demo verisi'} />
              </Stack>
              <Typography variant="h2">Hoş geldin, {userName}</Typography>
              <Typography color="text.secondary">{userEmail}</Typography>
              <Typography fontWeight={700}>Çalışma alanınız canlı öğrenme kayıtlarına bağlı.</Typography>
            </Stack>

            <Box className="seclab-score-ring">
              <Typography variant="caption">Çalışma alanı skoru</Typography>
              <Typography variant="h2">{workspace.progress_score}%</Typography>
            </Box>
          </Stack>

          <Box className="seclab-quick-actions">
            <Button component={RouterLink} to="/user/topics" variant="contained">
              Konu Oluştur
            </Button>
            <Button component={RouterLink} to="/user/learning-logs" variant="outlined">
              Öğrenme Kaydı Ekle
            </Button>
            <Button component={RouterLink} to="/user/resources" variant="outlined">
              Kaynak Ekle
            </Button>
            <Button component={RouterLink} to="/user/profile" variant="outlined">
              Profilim
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Box className="seclab-metric-grid">
        <MetricCard label="Konular" value={workspace.counts.topics} helper="Oluşturulan konular" progress={workspace.counts.topics * 25} />
        <MetricCard label="Öğrenme Kayıtları" value={workspace.counts.learning_logs} helper="Çalışma kayıtları" progress={workspace.counts.learning_logs * 25} />
        <MetricCard label="Kaynaklar" value={workspace.counts.resources} helper="Kaydedilen kaynaklar" progress={workspace.counts.resources * 25} />
        <MetricCard label="İlerleme puanı" value={`${workspace.progress_score}%`} helper="Çalışma alanı kapsamı" progress={workspace.progress_score} />
      </Box>

      <Box className="seclab-two-col">
        <Paper className="seclab-panel">
          <Typography variant="h4">Bugün / Bu Hafta</Typography>
          <Divider sx={{ my: 2 }} />
          <DetailRow label="Toplam kayıt" value={totalRecords} />
          <DetailRow label="Aktif çalışma günleri" value={activeDays} />
          <DetailRow label="Son çalışma tarihi" value={workspace.latest_learning_log?.study_date} />
          <DetailRow label="Son odak" value={workspace.latest_topic?.name} />
        </Paper>

        <Paper className="seclab-panel">
          <Typography variant="h4">Çalışma Alanı Kontrol Listesi</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.25}>
            {checklist.map((item) => (
              <Box key={item.label} className={item.done ? 'seclab-check-row done' : 'seclab-check-row'}>
                <span>{item.done ? 'Tamamlandı' : 'Bekliyor'}</span>
                <Typography>{item.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Box>

      <Box className="seclab-module-grid">
        <ModuleCard
          title="İlerlemem"
          description="Öğrenme ivmenizi, tamamlanma puanınızı ve çalışma alanının güncel durumunu görüntüleyin."
          path="/user/progress"
          meta={`${workspace.progress_score}%`}
        />
        <ModuleCard
          title="Çalışma Planı"
          description="Son konu ve kayıt verilerinizi kullanarak bir sonraki çalışma adımınızı netleştirin."
          path="/user/study-plan"
          meta="Plan"
        />
        <ModuleCard
          title="Notlar"
          description="Son öğrenme ve kaynak notlarını tek yerde toplayın."
          path="/user/notes"
          meta="Notlar"
        />
        <ModuleCard
          title="Aktivite"
          description="Son konu, öğrenme kaydı, kaynak ve profil aktivitelerini inceleyin."
          path="/user/activity"
          meta="Canlı"
        />
      </Box>

      <Box className="seclab-two-col">
        <Paper className="seclab-panel">
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="h4">Son Çalışma Alanı Aktiviteleri</Typography>
            <TextField
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Aktivitelerde ara"
            />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.25}>
            {filteredActivity.map((item, index) => (
              <Box className="seclab-activity-row" key={`${item.title}-${index}`}>
                <Box />
                <Stack>
                  <Typography fontWeight={800}>{item.title}</Typography>
                  <Typography color="text.secondary">{item.detail}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper className="seclab-panel">
          <Typography variant="h4">Son Kayıtlar</Typography>
          <Divider sx={{ my: 2 }} />
          <DetailRow label="Son konu" value={workspace.latest_topic?.name} />
          <DetailRow label="Konu açıklaması" value={workspace.latest_topic?.description} />
          <DetailRow label="Son kayıt" value={workspace.latest_learning_log?.title} />
          <DetailRow label="Son kaynak" value={workspace.latest_resource?.title} />
          <Button sx={{ mt: 2 }} variant="contained" onClick={loadData}>
            Veriyi Yenile
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
