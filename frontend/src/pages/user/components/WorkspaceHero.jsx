import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

function getRoleLabel(role) {
  return role === 'admin' ? 'Yönetici' : 'Kullanıcı';
}

export default function WorkspaceHero({ displayName, email, role }) {
  return (
    <MainCard className="seclab-workspace-hero" contentSX={{ p: '0 !important' }}>
      <Box className="seclab-workspace-hero__layout">
        <Stack className="seclab-workspace-hero__intro" spacing={2}>
          <Typography className="seclab-workspace-hero__eyebrow">SECLAB ÇALIŞMA MERKEZİ</Typography>

          <Box>
            <Typography component="h1" className="seclab-workspace-hero__title">
              Çalışma alanına hoş geldin, {displayName}
            </Typography>
            <Typography className="seclab-workspace-hero__description">
              Konularını, öğrenme kayıtlarını, kaynaklarını ve haftalık hedeflerini tek merkezden yönet.
            </Typography>
          </Box>

          <Stack className="seclab-workspace-hero__actions" direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button component="a" href="#workspace-records" variant="contained" className="seclab-workspace-hero__primary-action">
              Yeni kayıt oluştur
            </Button>
            <Button component="a" href="#workspace-insights" variant="outlined" className="seclab-workspace-hero__secondary-action">
              Analizleri incele
            </Button>
          </Stack>
        </Stack>

        <Box className="seclab-workspace-hero__meta">
          <Box className="seclab-workspace-hero__meta-item">
            <Typography component="span">Hesap</Typography>
            <Typography component="strong">{email || displayName}</Typography>
          </Box>
          <Box className="seclab-workspace-hero__meta-item">
            <Typography component="span">Yetki</Typography>
            <Typography component="strong">{getRoleLabel(role)}</Typography>
          </Box>
          <Box className="seclab-workspace-hero__meta-item">
            <Typography component="span">Çalışma alanı</Typography>
            <Typography component="strong" className="seclab-workspace-hero__status">
              Aktif
            </Typography>
          </Box>
        </Box>
      </Box>
    </MainCard>
  );
}

WorkspaceHero.propTypes = {
  displayName: PropTypes.string.isRequired,
  email: PropTypes.string,
  role: PropTypes.string.isRequired
};
