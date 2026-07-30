import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AuthShell({ children, eyebrow = 'SecLab Çalışma Alanı', title = 'Güvenle çalışın. Net biçimde öğrenin.', description }) {
  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            background: '#e7ecf3'
          },
          '@keyframes seclabDriftOne': {
            '0%': { transform: 'translate3d(-3%, -2%, 0) rotate(0deg)' },
            '50%': { transform: 'translate3d(4%, 3%, 0) rotate(8deg)' },
            '100%': { transform: 'translate3d(-3%, -2%, 0) rotate(0deg)' }
          },
          '@keyframes seclabDriftTwo': {
            '0%': { transform: 'translate3d(3%, 2%, 0) rotate(0deg)' },
            '50%': { transform: 'translate3d(-4%, -3%, 0) rotate(-8deg)' },
            '100%': { transform: 'translate3d(3%, 2%, 0) rotate(0deg)' }
          }
        }}
      />

      <Box
        sx={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#e7ecf3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 6 }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 520,
            height: 520,
            left: { xs: -260, md: -120 },
            top: { xs: -220, md: -140 },
            borderRadius: '38%',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.24), rgba(20,184,166,0.10))',
            filter: 'blur(18px)',
            animation: 'seclabDriftOne 12s ease-in-out infinite'
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 560,
            height: 560,
            right: { xs: -300, md: -140 },
            bottom: { xs: -260, md: -180 },
            borderRadius: '42%',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(15,118,110,0.24))',
            filter: 'blur(20px)',
            animation: 'seclabDriftTwo 14s ease-in-out infinite'
          }}
        />

        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: 1040,
            minHeight: { xs: 'auto', md: 600 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' },
            overflow: 'hidden',
            borderRadius: 2,
            border: '1px solid rgba(148, 163, 184, 0.35)',
            boxShadow: '0 28px 80px rgba(15, 23, 42, 0.18)',
            bgcolor: '#f8fafc'
          }}
        >
          <Box
            sx={{
              px: { xs: 3, sm: 5 },
              py: { xs: 4, sm: 5 },
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              bgcolor: '#f8fafc'
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 390, mx: 'auto' }}>{children}</Box>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              position: 'relative',
              alignItems: 'center',
              minWidth: 0,
              px: { md: 5, lg: 7 },
              color: 'common.white',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0f766e 100%)',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.45,
                background:
                  'radial-gradient(circle at 20% 18%, rgba(255,255,255,0.34), transparent 28%), radial-gradient(circle at 78% 78%, rgba(255,255,255,0.22), transparent 34%)'
              }}
            />

            <Stack spacing={3} sx={{ position: 'relative', maxWidth: 440, minWidth: 0 }}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.82)', letterSpacing: 1 }}>
                {eyebrow}
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  color: 'common.white',
                  lineHeight: 1.14,
                  fontSize: { md: 34, lg: 42 },
                  maxWidth: 420
                }}
              >
                {title}
              </Typography>

              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.88)', fontWeight: 400, lineHeight: 1.55 }}>
                {description || 'Kimlik doğrulama, kullanıcı, konu, öğrenme kaydı ve kaynak işlemlerini tek bir SecLab çalışma alanından yönetin.'}
              </Typography>

              <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap', pt: 1 }}>
                {['Kimlik Doğrulama', 'Çalışma Alanı', 'Kayıtlar'].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      mb: 1,
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