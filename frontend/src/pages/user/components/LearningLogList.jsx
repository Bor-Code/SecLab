import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function LearningLogList({ learningLogs, isSaving, handleDeleteLearningLog }) {
  return (
    <MainCard id="learning-logs" title="Learning Logs" sx={{ scrollMarginTop: 96 }}>
      {learningLogs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No learning logs yet. Select a topic and add your first study note above.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {learningLogs.map((log) => (
            <Stack
              key={log.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
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
              <Button variant="outlined" color="error" size="small" sx={{ minWidth: 72 }}
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
