import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import LogoIcon from 'components/logo/LogoIcon';

const features = [
  ['01', 'Çalışmalarınızı Düzenleyin', 'Konularınızı, çalışma kayıtlarınızı, notlarınızı ve kaynaklarınızı tek bir alanda yönetin.'],
  ['02', 'İlerlemenizi Görün', 'Tamamlanan çalışmalarınızı ve öğrenme sürecinizdeki gelişimi anlaşılır biçimde takip edin.'],
  ['03', 'Hedeflerinize Odaklanın', 'Çalışma planınızı oluşturun, önceliklerinizi belirleyin ve düzenli çalışma alışkanlığı kazanın.']
];

const steps = [
  ['1', 'Hesabınızı Oluşturun', 'Kısa kayıt formuyla kişisel SecLab çalışma alanınızı açın.'],
  ['2', 'Çalışma Alanınızı Düzenleyin', 'Konularınızı, kaynaklarınızı, notlarınızı ve kayıtlarınızı ekleyin.'],
  ['3', 'Gelişiminizi Takip Edin', 'İlerleme ekranından çalışmalarınızı gözden geçirip yeni hedefinizi belirleyin.']
];

export default function Landing() {
  return (
    <>
      <GlobalStyles
        styles={{
          html: { scrollBehavior: 'smooth' },
          body: { margin: 0, background: '#f4f7fb' },
          '@keyframes seclabFadeUp': {
            '0%': { opacity: 0, transform: 'translateY(22px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes seclabFloat': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-12px)' }
          },
          '@keyframes seclabPulse': {
            '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
            '50%': { opacity: 0.65, transform: 'scale(1.08)' }
          },
          '@keyframes seclabBarOne': { '0%': { width: 0 }, '100%': { width: '78%' } },
          '@keyframes seclabBarTwo': { '0%': { width: 0 }, '100%': { width: '62%' } },
          '@keyframes seclabBarThree': { '0%': { width: 0 }, '100%': { width: '91%' } },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important'
            }
          }
        }}
      />

      <Box sx={{ minHeight: '100vh', overflow: 'hidden', bgcolor: '#f4f7fb', color: '#0f172a' }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            bgcolor: 'rgba(248,250,252,0.88)',
            borderBottom: '1px solid rgba(148,163,184,0.18)',
            backdropFilter: 'blur(18px)'
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ minHeight: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.2, textDecoration: 'none' }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    p: 0.7,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 2,
                    bgcolor: '#fff',
                    border: '1px solid rgba(14,116,144,0.14)',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.08)'
                  }}
                >
                  <LogoIcon />
                </Box>
                <Box>
                  <Typography sx={{ color: '#0f172a', fontWeight: 800, fontSize: 19, lineHeight: 1.05 }}>SecLab</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: 10.5, letterSpacing: 0.7 }}>ÖĞRENCİ TAKİP SİSTEMİ</Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button component="a" href="#features" sx={{ display: { xs: 'none', md: 'inline-flex' }, color: '#475569', fontWeight: 650 }}>
                  SecLab Nedir?
                </Button>
                <Button component={RouterLink} to="/login" sx={{ color: '#0f172a', fontWeight: 700 }}>
                  Giriş Yap
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  sx={{ px: { xs: 1.8, sm: 2.7 }, borderRadius: 2, textTransform: 'none', fontWeight: 750 }}
                >
                  Kayıt Ol
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>

        <Box
          component="main"
          sx={{
            position: 'relative',
            background:
              'radial-gradient(circle at 8% 16%, rgba(14,165,233,0.13), transparent 25%), radial-gradient(circle at 92% 18%, rgba(13,148,136,0.14), transparent 28%)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 430,
              height: 430,
              right: -190,
              top: 65,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(13,148,136,0.08))',
              filter: 'blur(12px)',
              animation: 'seclabPulse 9s ease-in-out infinite'
            }}
          />

          <Container maxWidth="lg">
            <Box
              sx={{
                minHeight: { xs: 'auto', md: 'calc(100vh - 76px)' },
                py: { xs: 8, md: 9 },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1.05fr) minmax(380px,.95fr)' },
                alignItems: 'center',
                gap: { xs: 6, md: 8 }
              }}
            >
              <Stack
                spacing={3}
                sx={{
                  maxWidth: 650,
                  '& > *': { opacity: 0, animation: 'seclabFadeUp 700ms cubic-bezier(.22,1,.36,1) forwards' },
                  '& > :nth-of-type(1)': { animationDelay: '60ms' },
                  '& > :nth-of-type(2)': { animationDelay: '150ms' },
                  '& > :nth-of-type(3)': { animationDelay: '240ms' },
                  '& > :nth-of-type(4)': { animationDelay: '330ms' },
                  '& > :nth-of-type(5)': { animationDelay: '420ms' }
                }}
              >
                <Box sx={{ width: 'fit-content', px: 1.5, py: 0.8, borderRadius: 10, color: '#0369a1', bgcolor: 'rgba(14,165,233,.10)', border: '1px solid rgba(14,165,233,.18)' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 750, letterSpacing: 0.25 }}>KİŞİSEL ÖĞRENCİ ÇALIŞMA ALANI</Typography>
                </Box>

                <Typography
                  component="h1"
                  sx={{
                    m: 0,
                    fontSize: { xs: 42, sm: 56, lg: 68 },
                    lineHeight: { xs: 1.08, md: 1.03 },
                    letterSpacing: { xs: '-1.2px', md: '-2.2px' },
                    fontWeight: 820
                  }}
                >
                  SecLab'a Hoş Geldiniz.{' '}
                  <Box
                    component="span"
                    sx={{
                      color: 'transparent',
                      backgroundImage: 'linear-gradient(100deg,#0284c7,#0f766e)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text'
                    }}
                  >
                    Öğrenme Sürecinizi Görünür Hale Getirin
                  </Box>
                </Typography>

                <Typography sx={{ maxWidth: 610, color: '#475569', fontSize: { xs: 17, sm: 19 }, lineHeight: 1.75 }}>
                  SecLab; konularınızı, çalışma kayıtlarınızı, kaynaklarınızı, notlarınızı ve ilerleme verilerinizi güvenli,
                  düzenli ve ölçülebilir bir çalışma alanında bir araya getirir.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    sx={{
                      minHeight: 52,
                      px: 3.4,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: 16,
                      fontWeight: 780,
                      boxShadow: '0 14px 30px rgba(37,99,235,.24)',
                      transition: 'transform 180ms ease, box-shadow 180ms ease',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 34px rgba(37,99,235,.30)' }
                    }}
                  >
                    Hemen Kayıt Ol
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{
                      minHeight: 52,
                      px: 3.2,
                      borderRadius: 2,
                      textTransform: 'none',
                      color: '#0f172a',
                      borderColor: 'rgba(15,23,42,.22)',
                      fontSize: 16,
                      fontWeight: 740
                    }}
                  >
                    Hesabım Var, Giriş Yap
                  </Button>
                </Stack>

                <Typography sx={{ color: '#64748b', fontSize: 13.5 }}>
                  Kredi kartı gerekmez. Hesabınızı birkaç dakika içinde oluşturabilirsiniz.
                </Typography>
              </Stack>

              <Box sx={{ position: 'relative', display: { xs: 'none', sm: 'block' }, animation: 'seclabFloat 7s ease-in-out infinite' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    inset: -26,
                    borderRadius: 7,
                    background: 'linear-gradient(135deg,rgba(14,165,233,.24),rgba(15,118,110,.18))',
                    filter: 'blur(26px)',
                    opacity: 0.72
                  }}
                />
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    p: { xs: 2.2, md: 2.8 },
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,.90)',
                    border: '1px solid rgba(148,163,184,.24)',
                    boxShadow: '0 32px 80px rgba(15,23,42,.18)',
                    backdropFilter: 'blur(18px)'
                  }}
                >
                  <Box sx={{ p: 2.2, borderRadius: 3, color: '#fff', background: 'linear-gradient(135deg,#0284c7,#0f766e)' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.8 }}>
                      SECLAB ÇALIŞMA ÖZETİ
                    </Typography>
                    <Typography sx={{ mt: 0.8, fontSize: 24, fontWeight: 800 }}>Gelişiminiz Tek Ekranda</Typography>
                    <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,.82)', fontSize: 14.5 }}>
                      Haftalık hedeflerinizi ve çalışma durumunuzu kolayca izleyin.
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 1.2 }}>
                    {[['12', 'Konu'], ['28', 'Kayıt'], ['9', 'Kaynak']].map(([value, label]) => (
                      <Box key={label} sx={{ p: 1.5, textAlign: 'center', borderRadius: 2.2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 23 }}>{value}</Typography>
                        <Typography sx={{ color: '#64748b', fontSize: 12.5 }}>{label}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Stack spacing={2} sx={{ mt: 2.3 }}>
                    {[
                      ['Haftalık Çalışma Hedefi', '78%', 'seclabBarOne'],
                      ['Kaynak İnceleme Durumu', '62%', 'seclabBarTwo'],
                      ['Planlanan Çalışmalar', '91%', 'seclabBarThree']
                    ].map(([label, value, animation]) => (
                      <Box key={label}>
                        <Box sx={{ mb: 0.7, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                          <Typography sx={{ color: '#334155', fontSize: 13.5, fontWeight: 650 }}>{label}</Typography>
                          <Typography sx={{ color: '#0f766e', fontSize: 13.5, fontWeight: 800 }}>{value}</Typography>
                        </Box>
                        <Box sx={{ height: 8, borderRadius: 5, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                          <Box
                            sx={{
                              height: '100%',
                              borderRadius: 5,
                              background: 'linear-gradient(90deg,#0ea5e9,#0f766e)',
                              animation: `${animation} 1.2s ease-out 600ms both`
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Box>
          </Container>
        </Box>

        <Box id="features" component="section" sx={{ py: { xs: 9, md: 12 }, bgcolor: '#fff' }}>
          <Container maxWidth="lg">
            <Box sx={{ maxWidth: 720, mx: 'auto', textAlign: 'center' }}>
              <Typography sx={{ color: '#0284c7', fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>SECLAB NEDİR?</Typography>
              <Typography component="h2" sx={{ mt: 1.4, fontSize: { xs: 32, md: 44 }, lineHeight: 1.12, letterSpacing: '-1px', fontWeight: 800 }}>
                Daha Düzenli Bir Öğrenme Süreci İçin Tek Merkez
              </Typography>
              <Typography sx={{ mt: 2, color: '#64748b', fontSize: 17, lineHeight: 1.75 }}>
                SecLab, öğrencilerin çalışma sürecini planlamasına, kayıt altına almasına ve gelişimini takip etmesine yardımcı
                olan kişisel bir takip sistemidir.
              </Typography>
            </Box>

            <Box sx={{ mt: 6, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3,minmax(0,1fr))' }, gap: 2.4 }}>
              {features.map(([number, title, description]) => (
                <Paper
                  key={number}
                  elevation={0}
                  sx={{
                    p: 3.2,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                    '&:hover': { transform: 'translateY(-6px)', borderColor: 'rgba(14,165,233,.34)', boxShadow: '0 20px 44px rgba(15,23,42,.10)' }
                  }}
                >
                  <Typography sx={{ color: '#0ea5e9', fontSize: 13, fontWeight: 850 }}>{number}</Typography>
                  <Typography sx={{ mt: 2.2, fontSize: 21, fontWeight: 780 }}>{title}</Typography>
                  <Typography sx={{ mt: 1.2, color: '#64748b', lineHeight: 1.7 }}>{description}</Typography>
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        <Box component="section" sx={{ py: { xs: 9, md: 12 }, bgcolor: '#f4f7fb' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,.8fr) minmax(0,1.2fr)' }, gap: { xs: 5, md: 9 }, alignItems: 'center' }}>
              <Box>
                <Typography sx={{ color: '#0f766e', fontSize: 13, fontWeight: 800, letterSpacing: 1 }}>NASIL ÇALIŞIR?</Typography>
                <Typography component="h2" sx={{ mt: 1.4, fontSize: { xs: 32, md: 44 }, lineHeight: 1.12, letterSpacing: '-1px', fontWeight: 800 }}>
                  Üç Adımda Kendi Çalışma Alanınızı Kurun
                </Typography>
                <Typography sx={{ mt: 2, color: '#64748b', fontSize: 17, lineHeight: 1.75 }}>
                  Karmaşık kurulumlar olmadan hesabınızı oluşturun ve çalışmalarınızı hemen takip etmeye başlayın.
                </Typography>
              </Box>

              <Stack spacing={2}>
                {steps.map(([number, title, description]) => (
                  <Paper key={number} elevation={0} sx={{ p: 2.4, display: 'flex', gap: 2, alignItems: 'flex-start', borderRadius: 3, bgcolor: '#fff', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ width: 42, height: 42, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, color: '#fff', background: 'linear-gradient(135deg,#0284c7,#0f766e)', fontWeight: 850 }}>
                      {number}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 18, fontWeight: 760 }}>{title}</Typography>
                      <Typography sx={{ mt: 0.7, color: '#64748b', lineHeight: 1.65 }}>{description}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Container>
        </Box>

        <Box component="section" sx={{ px: 2, pb: { xs: 7, md: 10 }, bgcolor: '#f4f7fb' }}>
          <Container
            maxWidth="lg"
            sx={{
              py: { xs: 6, md: 8 },
              px: { xs: 3, md: 7 },
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 4,
              color: '#fff',
              background: 'linear-gradient(135deg,#0284c7,#0f766e)',
              boxShadow: '0 26px 70px rgba(15,118,110,.24)'
            }}
          >
            <Typography sx={{ fontSize: { xs: 30, md: 43 }, lineHeight: 1.15, fontWeight: 820 }}>
              Öğrenme Sürecinizi Bugün Düzenlemeye Başlayın
            </Typography>
            <Typography sx={{ mt: 1.8, maxWidth: 650, color: 'rgba(255,255,255,.82)', fontSize: 17, lineHeight: 1.7 }}>
              Hesabınızı oluşturun, çalışma alanınızı düzenleyin ve gelişiminizi tek merkezden takip edin.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
              <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ bgcolor: '#fff', color: '#0f766e', borderRadius: 2, px: 3.2, textTransform: 'none', fontWeight: 800, '&:hover': { bgcolor: '#f8fafc' } }}>
                Ücretsiz Kayıt Ol
              </Button>
              <Button component={RouterLink} to="/login" variant="outlined" size="large" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.46)', borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 750 }}>
                Zaten Hesabım Var
              </Button>
            </Stack>
          </Container>
        </Box>

        <Box component="footer" sx={{ py: 4, bgcolor: '#0f172a' }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
              <Typography sx={{ color: '#fff', fontWeight: 800 }}>SecLab Öğrenci Takip Sistemi</Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: 13.5 }}>Düzenli çalışma, ölçülebilir gelişim.</Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}
