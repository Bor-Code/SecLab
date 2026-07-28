import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function LearningLogList({
  learningLogs,
  isSaving,
  editingLogId,
  editLogTitle,
  editLogNotes,
  setEditLogTitle,
  setEditLogNotes,
  handleStartEditLearningLog,
  handleCancelEditLearningLog,
  handleUpdateLearningLog,
  handleDeleteLearningLog
}) {
  return (
    <MainCard id="learning-logs" title="Learning Logs" sx={{ scrollMarginTop: 96 }}>
      {learningLogs.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No learning logs yet. Select a topic and add your first study note above.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {learningLogs.map((log) => (
            <Stack key={log.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {editingLogId === log.id ? (
                <Stack component="form" spacing={1.5} onSubmit={(event) => handleUpdateLearningLog(event, log.id)}>
                  <TextField label="Title" value={editLogTitle} onChange={(event) => setEditLogTitle(event.target.value)} fullWidth />
                  <TextField label="Notes" value={editLogNotes} onChange={(event) => setEditLogNotes(event.target.value)} fullWidth multiline minRows={2} />
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Button variant="outlined" onClick={handleCancelEditLearningLog} disabled={isSaving}>Cancel</Button>
                    <Button variant="contained" type="submit" disabled={isSaving}>Save</Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{log.title}</Typography>
                    {log.notes && <Typography variant="body2" color="text.secondary">{log.notes}</Typography>}
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                    <Button variant="outlined" size="small" sx={{ minWidth: 72 }} onClick={() => handleStartEditLearningLog(log)} disabled={isSaving}>Edit</Button>
                    <Button variant="outlined" color="error" size="small" sx={{ minWidth: 72 }} onClick={() => handleDeleteLearningLog(log.id)} disabled={isSaving}>Delete</Button>
                  </Stack>
                </Stack>
              )}
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
  editingLogId: PropTypes.number,
  editLogTitle: PropTypes.string.isRequired,
  editLogNotes: PropTypes.string.isRequired,
  setEditLogTitle: PropTypes.func.isRequired,
  setEditLogNotes: PropTypes.func.isRequired,
  handleStartEditLearningLog: PropTypes.func.isRequired,
  handleCancelEditLearningLog: PropTypes.func.isRequired,
  handleUpdateLearningLog: PropTypes.func.isRequired,
  handleDeleteLearningLog: PropTypes.func.isRequired
};