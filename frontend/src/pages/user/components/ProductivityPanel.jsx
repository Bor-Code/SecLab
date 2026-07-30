import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const TIMER_KEY = 'seclab-study-timer';
const SESSIONS_KEY = 'seclab-study-sessions';
const GOALS_KEY = 'seclab-weekly-goals';

const defaultTimer = {
  elapsedSeconds: 0,
  isRunning: false,
  startedAt: null
};

const defaultGoals = {
  sessions: 5,
  minutes: 180
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function getWeekStart() {
  const date = new Date();
  const dayOffset = (date.getDay() + 6) % 7;

  date.setDate(date.getDate() - dayOffset);
  date.setHours(0, 0, 0, 0);

  return date;
}

function getElapsedSeconds(timer, currentTime) {
  if (!timer.isRunning || !timer.startedAt) {
    return timer.elapsedSeconds;
  }

  return timer.elapsedSeconds + Math.floor((currentTime - timer.startedAt) / 1000);
}

export default function ProductivityPanel() {
  const [timer, setTimer] = useState(() => readStorage(TIMER_KEY, defaultTimer));
  const [sessions, setSessions] = useState(() => readStorage(SESSIONS_KEY, []));
  const [goals, setGoals] = useState(() => readStorage(GOALS_KEY, defaultGoals));
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (!timer.isRunning) return undefined;

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timer.isRunning]);

  useEffect(() => {
    writeStorage(GOALS_KEY, goals);
  }, [goals]);

  const elapsedSeconds = getElapsedSeconds(timer, currentTime);

  const weeklyStats = useMemo(() => {
    const weekStart = getWeekStart();

    const weeklySessions = sessions.filter((session) => {
      return new Date(session.completedAt) >= weekStart;
    });

    const totalSeconds = weeklySessions.reduce(
      (sum, session) => sum + Number(session.durationSeconds || 0),
      0
    );

    return {
      sessionCount: weeklySessions.length,
      minutes: Math.round(totalSeconds / 60)
    };
  }, [sessions]);

  const sessionProgress = Math.min(
    (weeklyStats.sessionCount / Math.max(goals.sessions, 1)) * 100,
    100
  );

  const minuteProgress = Math.min(
    (weeklyStats.minutes / Math.max(goals.minutes, 1)) * 100,
    100
  );

  function saveTimer(nextTimer) {
    setTimer(nextTimer);
    writeStorage(TIMER_KEY, nextTimer);
    setCurrentTime(Date.now());
  }

  function handleStart() {
    if (timer.isRunning) return;

    saveTimer({
      ...timer,
      isRunning: true,
      startedAt: Date.now()
    });
  }

  function handlePause() {
    if (!timer.isRunning) return;

    saveTimer({
      elapsedSeconds,
      isRunning: false,
      startedAt: null
    });
  }

  function handleReset() {
    saveTimer(defaultTimer);
  }

  function handleSaveSession() {
    if (elapsedSeconds < 1) return;

    const nextSessions = [
      ...sessions,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        durationSeconds: elapsedSeconds,
        completedAt: new Date().toISOString()
      }
    ];

    setSessions(nextSessions);
    writeStorage(SESSIONS_KEY, nextSessions);
    window.dispatchEvent(
      new CustomEvent('seclab-study-sessions-updated', {
        detail: nextSessions
      })
    );
    saveTimer(defaultTimer);
  }

  function updateGoal(name, value) {
    const parsedValue = Math.max(1, Number(value) || 1);

    setGoals((currentGoals) => ({
      ...currentGoals,
      [name]: parsedValue
    }));
  }

  return (
    <Box
      className="seclab-productivity-grid"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 3,
        mb: 3
      }}
    >
      <Paper className="seclab-panel">
        <Typography variant="h4">Çalışma Zamanlayıcısı</Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'monospace',
              letterSpacing: 2,
              textAlign: 'center'
            }}
          >
            {formatDuration(elapsedSeconds)}
          </Typography>

          <Typography color="text.secondary" textAlign="center">
            {timer.isRunning ? 'Çalışma oturumu devam ediyor' : 'Zamanlayıcı hazır'}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: '100%' }}>
            <Button
              variant="contained"
              onClick={handleStart}
              disabled={timer.isRunning}
              sx={{ flex: '1 1 0', minWidth: 0, width: { xs: '100%', sm: 'auto' } }}
            >
              Başlat
            </Button>

            <Button
              variant="outlined"
              onClick={handlePause}
              disabled={!timer.isRunning}
              sx={{ flex: '1 1 0', minWidth: 0, width: { xs: '100%', sm: 'auto' } }}
            >
              Duraklat
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={handleReset}
              disabled={elapsedSeconds === 0}
              sx={{ flex: '1 1 0', minWidth: 0, width: { xs: '100%', sm: 'auto' } }}
            >
              Sıfırla
            </Button>
          </Stack>

          <Button
            variant="contained"
            color="success"
            onClick={handleSaveSession}
            disabled={elapsedSeconds === 0}
          >
            Oturumu Kaydet
          </Button>
        </Stack>
      </Paper>

      <Paper className="seclab-panel">
        <Typography variant="h4">Haftalık Hedefler</Typography>
        <Divider sx={{ my: 2 }} />

        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              type="number"
              label="Oturum hedefi"
              value={goals.sessions}
              onChange={(event) => updateGoal('sessions', event.target.value)}
              inputProps={{ min: 1, max: 100 }}
              fullWidth
            />

            <TextField
              type="number"
              label="Dakika hedefi"
              value={goals.minutes}
              onChange={(event) => updateGoal('minutes', event.target.value)}
              inputProps={{ min: 1, max: 10000 }}
              fullWidth
            />
          </Stack>

          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={700}>Çalışma oturumları</Typography>
              <Typography>
                {weeklyStats.sessionCount} / {goals.sessions}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={sessionProgress}
              sx={{ mt: 1, height: 8, borderRadius: 1 }}
            />
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={700}>Çalışma süresi</Typography>
              <Typography>
                {weeklyStats.minutes} / {goals.minutes} dakika
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={minuteProgress}
              sx={{ mt: 1, height: 8, borderRadius: 1 }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            Kaydedilen oturumlar haftalık analizlere ve aktivite takvimine
            otomatik olarak aktarılır.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}