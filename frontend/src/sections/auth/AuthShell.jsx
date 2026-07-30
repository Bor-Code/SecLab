import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import LogoIcon from 'components/logo/LogoIcon';

export default function AuthShell({
  children,
  eyebrow = 'SecLab Öğrenci Takip Sistemi',
  title = 'Öğrenci Gelişimini Tek Merkezden Yönetin',
  description = 'Çalışma kayıtlarını, hedefleri ve ilerleme verilerini düzenli bir yapıda takip edin.',
  highlights = ['Öğrenci Takibi', 'İlerleme Analizi', 'Kayıt Yönetimi'],
  formSide = 'left',
  formEyebrow = 'Güvenli Hesap Erişimi',
  formTitle = 'Hesabınıza Giriş Yapın',
  formDescription = 'Devam etmek için hesap bilgilerinizi girin.'
}) {
  const formOnRight = formSide === 'right';

  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            background: '#e7ecf3'
          },
          '@keyframes seclabDriftOne': {
            '0%, 100%': { transform: 'translate3d(-3%, -2%, 0) rotate(0deg)' },
            '50%': { transform: 'translate3d(4%, 3%, 0) rotate(8deg)' }
          },
          '@keyframes seclabDriftTwo': {
            '0%, 100%': { transform: 'translate3d(3%, 2%, 0) rotate(0deg)' },
            '50%': { transform: 'translate3d(-4%, -3%, 0) rotate(-8deg)' }
          },
          '@keyframes seclabFormFromLeft': {
            '0%': { opacity: 0, transform: 'translateX(-26px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' }
          },
          '@keyframes seclabFormFromRight': {
            '0%': { opacity: 0, transform: 'translateX(26px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' }
          },
          '@keyframes seclabHeroFromLeft': {
            '0%': { opacity: 0, transform: 'translateX(-32px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' }
          },
          '@keyframes seclabHeroFromRight': {
            '0%': { opacity: 0, transform: 'translateX(32px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' }
          },
          '@keyframes seclabFadeUp': {
            '0%': { opacity: 0, transform: 'translateY(18px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes seclabGlow': {
            '0%, 100%': { opacity: 0.42, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(1.08)' }
          },
          '@keyframes seclabBadgeFloat': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-4px)' }
          },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important'
            }
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
            maxWidth: 1120,
            minHeight: { xs: 'auto', md: 640 },
            display: 'grid',
            gridTemplateAreas: {
              xs: '"form"',
              md: formOnRight ? '"hero form"' : '"form hero"'
            },
            gridTemplateColumns: {
              xs: '1fr',
              md: formOnRight ? 'minmax(0, 1.08fr) minmax(0, 0.92fr)' : 'minmax(0, 0.92fr) minmax(0, 1.08fr)'
            },
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid rgba(148, 163, 184, 0.32)',
            boxShadow: '0 30px 90px rgba(15, 23, 42, 0.20)',
            bgcolor: '#f8fafc'
          }}
        >
          <Box
            sx={{
              gridArea: 'form',
              position: 'relative',
              px: { xs: 3, sm: 5, lg: 6 },
              py: { xs: 4, sm: 5 },
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              bgcolor: '#f8fafc',
              overflow: 'hidden',
              animation: `${formOnRight ? 'seclabFormFromRight' : 'seclabFormFromLeft'} 720ms cubic-bezier(0.22, 1, 0.36, 1) both`,
              '&::before': {
                content: '""',
                position: 'absolute',
                width: 220,
                height: 220,
                right: formOnRight ? -110 : 'auto',
                left: formOnRight ? 'auto' : -110,
                top: -110,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37,99,235,0.10), transparent 68%)',
                pointerEvents: 'none'
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1.5,
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&.Mui-focused': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.10)'
                }
              },
              '& .MuiButton-contained': {
                borderRadius: 1.5,
                py: 1.25,
                boxShadow: '0 10px 24px rgba(37,99,235,0.22)',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 14px 28px rgba(37,99,235,0.28)'
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', width: '100%', maxWidth: 420, mx: 'auto' }}>
              <Stack spacing={0.8} sx={{ mb: 3.5 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    letterSpacing: 1.1
                  }}
                >
                  {formEyebrow}
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    color: 'text.primary',
                    fontSize: { xs: 27, sm: 32 },
                    lineHeight: 1.18,
                    fontWeight: 750
                  }}
                >
                  {formTitle}
                </Typography>

                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
                  {formDescription}
                </Typography>
              </Stack>

              {children}
            </Box>
          </Box>

          <Box
            sx={{
              gridArea: 'hero',
              display: { xs: 'none', md: 'flex' },
              position: 'relative',
              alignItems: 'center',
              minWidth: 0,
              px: { md: 6, lg: 8 },
              color: 'common.white',
              background: 'linear-gradient(135deg, #129fdb 0%, #118aa5 48%, #0f766e 100%)',
              overflow: 'hidden',
              animation: `${formOnRight ? 'seclabHeroFromLeft' : 'seclabHeroFromRight'} 780ms cubic-bezier(0.22, 1, 0.36, 1) both`
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                width: 340,
                height: 340,
                top: -130,
                right: -90,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.24), transparent 68%)',
                animation: 'seclabGlow 8s ease-in-out infinite'
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                width: 290,
                height: 290,
                bottom: -130,
                left: -100,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.035)',
                animation: 'seclabDriftTwo 12s ease-in-out infinite'
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.24,
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '34px 34px',
                maskImage: 'linear-gradient(to bottom right, rgba(0,0,0,0.8), transparent 78%)'
              }}
            />

            <Stack
              spacing={3}
              sx={{
                position: 'relative',
                zIndex: 1,
                maxWidth: 470,
                minWidth: 0,
                '& > *': {
                  opacity: 0,
                  animation: 'seclabFadeUp 650ms ease-out forwards'
                },
                '& > :nth-of-type(1)': { animationDelay: '100ms' },
                '& > :nth-of-type(2)': { animationDelay: '190ms' },
                '& > :nth-of-type(3)': { animationDelay: '280ms' },
                '& > :nth-of-type(4)': { animationDelay: '370ms' },
                '& > :nth-of-type(5)': { animationDelay: '460ms' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    p: 0.7,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.14)',
                    border: '1px solid rgba(255,255,255,0.24)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <LogoIcon />
                </Box>

                <Box>
                  <Typography sx={{ color: 'common.white', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>SecLab</Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 11, letterSpacing: 0.8 }}>
                    Öğrenci Takip Sistemi
                  </Typography>
                </Box>
              </Box>

              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.82)', letterSpacing: 1.15, fontWeight: 700 }}>
                {eyebrow}
              </Typography>

              <Typography
                variant="h1"
                sx={{
                  color: 'common.white',
                  lineHeight: 1.08,
                  fontSize: { md: 42, lg: 50 },
                  fontWeight: 760,
                  letterSpacing: '-0.8px',
                  maxWidth: 470
                }}
              >
                {title}
              </Typography>

              <Typography sx={{ color: 'rgba(255,255,255,0.88)', fontSize: { md: 17, lg: 18 }, fontWeight: 400, lineHeight: 1.65 }}>
                {description}
              </Typography>

              <Stack spacing={1.15} sx={{ pt: 0.5 }}>
                {highlights.map((item, index) => (
                  <Box
                    key={item}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      width: 'fit-content',
                      maxWidth: '100%',
                      px: 1.5,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(255,255,255,0.11)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(9px)',
                      animation: `seclabBadgeFloat ${4.8 + index * 0.5}s ease-in-out ${index * 0.18}s infinite`,
                      transition: 'background-color 180ms ease, border-color 180ms ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.18)',
                        borderColor: 'rgba(255,255,255,0.34)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        flexShrink: 0,
                        borderRadius: '50%',
                        bgcolor: '#bae6fd',
                        boxShadow: '0 0 0 5px rgba(186,230,253,0.12)'
                      }}
                    />
                    <Typography sx={{ color: 'common.white', fontSize: 14, fontWeight: 650 }}>{item}</Typography>
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
  description: PropTypes.string,
  highlights: PropTypes.arrayOf(PropTypes.string),
  formSide: PropTypes.oneOf(['left', 'right']),
  formEyebrow: PropTypes.string,
  formTitle: PropTypes.string,
  formDescription: PropTypes.string
};
