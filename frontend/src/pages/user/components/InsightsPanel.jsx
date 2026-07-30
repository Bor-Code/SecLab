import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

import { getUserStorageKey } from 'utils/authStorage';

const SESSIONS_KEY = getUserStorageKey('seclab-study-sessions');

function readSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function toDateKey(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createRecentDays(dayCount) {
  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (dayCount - index - 1));

    return {
      date,
      key: toDateKey(date),
      label: date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit'
      }),
      weekday: date.toLocaleDateString('tr-TR', {
        weekday: 'short'
      })
    };
  });
}

function getActivityColor(count) {
  if (count >= 4) return 'primary.dark';
  if (count === 3) return 'primary.main';
  if (count === 2) return 'primary.light';
  if (count === 1) return 'info.light';

  return 'grey.100';
}

export default function InsightsPanel({ topics, learningLogs, resources }) {
  const [sessions, setSessions] = useState(readSessions);

  useEffect(() => {
    function handleSessionsUpdated(event) {
      setSessions(Array.isArray(event.detail) ? event.detail : readSessions());
    }

    window.addEventListener('seclab-study-sessions-updated', handleSessionsUpdated);

    return () => {
      window.removeEventListener('seclab-study-sessions-updated', handleSessionsUpdated);
    };
  }, []);

  const activityByDate = useMemo(() => {
    const activityMap = {};

    function addActivity(value) {
      const key = toDateKey(value);

      if (key) {
        activityMap[key] = (activityMap[key] || 0) + 1;
      }
    }

    topics.forEach((topic) => addActivity(topic.created_at));
    learningLogs.forEach((log) => {
      addActivity(log.study_date || log.created_at);
    });
    resources.forEach((resource) => addActivity(resource.created_at));
    sessions.forEach((session) => addActivity(session.completedAt));

    return activityMap;
  }, [topics, learningLogs, resources, sessions]);

  const calendarDays = useMemo(() => {
    return createRecentDays(28).map((day) => ({
      ...day,
      count: activityByDate[day.key] || 0
    }));
  }, [activityByDate]);

  const weeklyChartData = useMemo(() => {
    return createRecentDays(7).map((day) => ({
      ...day,
      count: activityByDate[day.key] || 0
    }));
  }, [activityByDate]);

  const totalActivity = Object.values(activityByDate).reduce((sum, count) => sum + count, 0);

  const pieData = [
    {
      id: 0,
      value: topics.length,
      label: 'Konular'
    },
    {
      id: 1,
      value: learningLogs.length,
      label: 'Öğrenme kayıtları'
    },
    {
      id: 2,
      value: resources.length,
      label: 'Kaynaklar'
    },
    {
      id: 3,
      value: sessions.length,
      label: 'Çalışma oturumları'
    }
  ].filter((item) => item.value > 0);

  return (
    <Box
      className="seclab-insights-grid"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', xl: '1.15fr 1fr' },
        gap: 3
      }}
    >
      <Paper className="seclab-panel">
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h4">Aktivite Takvimi</Typography>
          <Typography color="text.secondary">Toplam {totalActivity} aktivite</Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(34px, 1fr))',
            gap: 1
          }}
        >
          {calendarDays.map((day) => (
            <Box
              key={day.key}
              title={`${day.label}: ${day.count} aktivite`}
              sx={{
                minHeight: 48,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: getActivityColor(day.count),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" fontWeight={700}>
                {day.label}
              </Typography>
              <Typography variant="caption">{day.count}</Typography>
            </Box>
          ))}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center', justifyContent: 'flex-end' }}>
          <Typography variant="caption">Az</Typography>
          {[0, 1, 2, 3, 4].map((count) => (
            <Box
              key={count}
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.5,
                bgcolor: getActivityColor(count),
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
          ))}
          <Typography variant="caption">Çok</Typography>
        </Stack>
      </Paper>

      <Stack spacing={3}>
        <Paper className="seclab-panel">
          <Typography variant="h4">Son 7 Gün</Typography>
          <Divider sx={{ my: 2 }} />

          <BarChart
            xAxis={[
              {
                scaleType: 'band',
                data: weeklyChartData.map((day) => day.weekday)
              }
            ]}
            series={[
              {
                data: weeklyChartData.map((day) => day.count),
                label: 'Aktivite'
              }
            ]}
            height={240}
            margin={{ left: 35, right: 15, top: 20, bottom: 30 }}
          />
        </Paper>

        <Paper className="seclab-panel">
          <Typography variant="h4">İlerleme Analizi Dağılımı</Typography>
          <Divider sx={{ my: 2 }} />

          {pieData.length > 0 ? (
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 35,
                  paddingAngle: 3,
                  cornerRadius: 4
                }
              ]}
              height={240}
            />
          ) : (
            <Typography color="text.secondary">Grafik oluşturmak için henüz yeterli veri yok.</Typography>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}

InsightsPanel.propTypes = {
  topics: PropTypes.array.isRequired,
  learningLogs: PropTypes.array.isRequired,
  resources: PropTypes.array.isRequired
};
