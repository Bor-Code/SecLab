import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AuthShell({ children, eyebrow = 'SecLab Workspace', title = 'Secure learning operations', description }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#eef4fb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 5
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 980,
          minHeight: 560,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 22px 60px rgba(15, 23, 42, 0.14)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.92fr 1.08fr' },
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ px: { xs: 3, sm: 5 }, py: { xs: 4, sm: 5 }, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '100%' }}>{children}</Box>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            position: 'relative',
            overflow: 'hidden',
            alignItems: 'center',
            px: 6,
            color: 'common.white',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0f766e 100%)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.24), transparent 28%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.16), transparent 30%)'
            }}
          />

          <Stack spacing={3} sx={{ position: 'relative', maxWidth: 420 }}>
            <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.82)', letterSpacing: 1 }}>
              {eyebrow}
            </Typography>

            <Typography variant="h2" sx={{ color: 'common.white', lineHeight: 1.18 }}>
              {title}
            </Typography>

            <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.86)', fontWeight: 400, lineHeight: 1.55 }}>
              {description || 'Manage users, topics, learning logs, resources, and account access from one focused workspace.'}
            </Typography>

            <Stack direction="row" spacing={1.25} sx={{ pt: 1 }}>
              {['Auth', 'Workspace', 'Records'].map((item) => (
                <Box
                  key={item}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.20)',
                    fontSize: 13,
                    fontWeight: 600
                  }}
                >
                  {item}
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

AuthShell.propTypes = {
  children: PropTypes.node.isRequired,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string
};
