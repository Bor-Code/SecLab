// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ==============================|| LOGO MAIN ||============================== //

export default function LogoMain() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '0.5px' }}>
        SecLab
      </Typography>
    </Box>
  );
}