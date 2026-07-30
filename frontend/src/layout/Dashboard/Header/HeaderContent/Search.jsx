import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

const items = [
  { label: 'Çalışma Alanım', path: '/user' },
  { label: 'Konular', path: '/user/topics' },
  { label: 'Öğrenme Kayıtları', path: '/user/learning-logs' },
  { label: 'Kaynaklar', path: '/user/resources' },
  { label: 'İlerlemem', path: '/user/progress' },
  { label: 'Çalışma Planı', path: '/user/study-plan' },
  { label: 'Notlar', path: '/user/notes' },
  { label: 'Aktivite', path: '/user/activity' },
  { label: 'Profilim', path: '/user/profile' }
];

export default function Ara() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [open, setAç] = useState(false);

  const results = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return items.slice(0, 5);
    }

    return items.filter((item) => item.label.toLowerCase().includes(query)).slice(0, 6);
  }, [value]);

  const goTo = (path) => {
    setValue('');
    setAç(false);
    navigate(path);
  };

  return (
    <Box sx={{ position: 'relative', width: { xs: 220, sm: 320 } }}>
      <TextField
        size="small"
        fullWidth
        value={value}
        onFocus={() => setAç(true)}
        onChange={(event) => {
          setValue(event.target.value);
          setAç(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && results[0]) {
            goTo(results[0].path);
          }

          if (event.key === 'Escape') {
            setAç(false);
          }
        }}
        placeholder="Çalışma alanında ara"
      />

      {open && (
        <Paper
          sx={{
            position: 'absolute',
            zIndex: 20,
            top: 46,
            left: 0,
            right: 0,
            borderRadius: 0,
            overflow: 'hidden',
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.18)'
          }}
        >
          <List dense disablePadding>
            {results.map((item) => (
              <ListItemButton key={item.path} onMouseDown={() => goTo(item.path)}>
                <Typography>{item.label}</Typography>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
