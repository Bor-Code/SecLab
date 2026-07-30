import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import LogoIcon from './LogoIcon';

export default function LogoMain() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box sx={{ width: 38, height: 38, flexShrink: 0 }}>
        <LogoIcon />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          component="div"
          sx={{
            color: 'inherit',
            fontSize: 23,
            fontWeight: 800,
            letterSpacing: '-0.45px',
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}
        >
          SecLab
        </Typography>
        <Typography
          component="div"
          sx={{
            color: 'inherit',
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: '0.95px',
            lineHeight: 1.4,
            mt: 0.45,
            opacity: 0.72,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap'
          }}
        >
          Öğrenci Takip Sistemi
        </Typography>
      </Box>
    </Box>
  );
}
