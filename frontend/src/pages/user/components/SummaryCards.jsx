import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function SummaryCards({ topicsCount, learningLogsCount, resourcesCount }) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title="Konular">
          <Typography variant="h3">{topicsCount}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title="Öğrenme Kayıtları">
          <Typography variant="h3">{learningLogsCount}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <MainCard title="Kaynaklar">
          <Typography variant="h3">{resourcesCount}</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}

SummaryCards.propTypes = {
  topicsCount: PropTypes.number.isRequired,
  learningLogsCount: PropTypes.number.isRequired,
  resourcesCount: PropTypes.number.isRequired
};
