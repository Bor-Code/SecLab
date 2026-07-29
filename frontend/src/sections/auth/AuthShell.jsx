import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AuthShell({ children, eyebrow = 'SecLab Workspace', title = 'Secure learning operations', description }) {
  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes seclabFloatA': {
            '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
            '50%': { transform: 'translate3d(24px, -18px, 0) scale(1.05)' },
            '100%': { transform: 'translate3d(0, 0, 0) scale(1)' }
          },
          '@keyframes seclabFloatB': {
            '0%': { transform: 'translate3d(0, 0, 0) scale(1)' },
            '50%': { transform: 'translate3d(-22px, 20px, 0) scale(1.04)' },
            '100%': { transform: 'translate3d(0, 0, 0) scale(1)' }
          }
        }}
      />

      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#e8edf3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 6 },
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            top: -120,
            right: -80,
            background: 'rgba(37, 99, 235, 0.14)',
            filter: 'blur(4px)',
            animation: 'seclabFloatA 9s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 360,
            height: 360,
            borderRadius: '50%',
            bottom: -120,
            left: -80,
            background: 'rgba(20, 184, 166, 0.18)',
            filter: 'blur(4px)',
            animation: 'seclabFloatB 10s ease-in-out infinite'
          }
        }}
      >
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 980,
            minHeight: { xs: 'auto', md: 560 },
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            boxShadow: '0 24px 70px rgba(15, 23, 42, 0.18)',
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '0.92fr 1.08fr'
            },
            bgcolor: '#f8fafc'
          }}
        >
          <Box
            sx={{
              px: { xs: 3, sm: 5 },
              py: { xs: 4, sm: 5 },
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f8fafc',
              minWidth: 0
            }}
          >
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', lg: 390 }, mx: { xs: 0, lg: 'auto' } }}>{children}</Box>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              position: 'relative',
              overflow: 'hidden',
              alignItems: 'center',
              px: 6,
              color: 'common.white',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.96) 0%, rgba(13,148,136,0.98) 100%)'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 18% 18%, rgba(255,255,255,0.26), transparent 28%), radial-gradient(circle at 82% 72%, rgba(255,255,255,0.18), transparent 32%)'
              }}
            />

            <Stack spacing={3} sx={{ position: 'relative', maxWidth: 430 }}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.82)', letterSpacing: 1 }}>
                {eyebrow}
              </Typography>

              <Typography variant="h2" sx={{ color: 'common.white', lineHeight: 1.16 }}>
                {title}
              </Typography>

              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.88)', fontWeight: 400, lineHeight: 1.55 }}>
                {description || 'Manage users, topics, learning logs, resources, and account access from one focused workspace.'}
              </Typography>

              <Stack direction="row" spacing={1.25} sx={{ pt: 1, flexWrap: 'wrap' }}>
                {['Auth', 'Workspace', 'Records'].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 1,
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.22)',
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
    </>
  );
}

AuthShell.propTypes = {
  children: PropTypes.node.isRequired,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string
};