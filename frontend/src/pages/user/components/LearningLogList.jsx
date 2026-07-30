import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function LearningLogList({ learningLogs, isSaving, handleDeleteLearningLog }) {
  return (
    <MainCard title="Öğrenme Kayıtları">
      {learningLogs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Henüz öğrenme kaydı yok. Bir konu seçerek ilk çalışma notunuzu ekleyin.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {learningLogs.map((log) => (
            <Stack
              key={log.id}
              className="seclab-record-item"
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {log.title}
                </Typography>
                {log.notes && (
                  <Typography variant="caption" color="text.secondary">
                    {log.notes}
                  </Typography>
                )}
              </Stack>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDeleteLearningLog(log.id)}
                disabled={isSaving}
              >
                Delete
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </MainCard>
  );
}

LearningLogList.propTypes = {
  learningLogs: PropTypes.array.isRequired,
  isSaving: PropTypes.bool.isRequired,
  handleDeleteLearningLog: PropTypes.func.isRequired
};
