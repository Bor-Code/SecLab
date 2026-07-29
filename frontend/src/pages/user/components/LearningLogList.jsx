import { useState } from 'react';
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
  handleİptalEditLearningLog,
  handleUpdateLearningLog,
  handleSilLearningLog
}) {
  const [search, setSearch] = useState('');

  const filteredLogs = learningLogs.filter((log) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [log.title, log.notes]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <MainCard id="learning-logs" title="LearningLogs" sx={{ scrollMarginTop: 96 }}>
      <Stack spacing={2}>
        <TextField
          label="Search learning logs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />

        {learningLogs.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No learning logs yet. Select a topic and add your first study note above.
          </Typography>
        ) : filteredLogs.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No learning logs match your search.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {filteredLogs.map((log) => (
              <Stack key={log.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {editingLogId === log.id ? (
                  <Stack component="form" spacing={1.5} onSubmit={(event) => handleUpdateLearningLog(event, log.id)}>
                    <TextField label="Title" value={editLogTitle} onChange={(event) => setEditLogTitle(event.target.value)} fullWidth />
                    <TextField label="Notes" value={editLogNotes} onChange={(event) => setEditLogNotes(event.target.value)} fullWidth multiline minRows={2} />
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="outlined" onClick={handleİptalEditLearningLog} disabled={isSaving}>
                        İptal
                      </Button>
                      <Button variant="contained" type="submit" disabled={isSaving}>
                        Save
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {log.title}
                      </Typography>
                      {log.notes && (
                        <Typography variant="body2" color="text.secondary">
                          {log.notes}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small" sx={{ minWidth: 72 }} onClick={() => handleStartEditLearningLog(log)} disabled={isSaving}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" sx={{ minWidth: 72 }} onClick={() => handleSilLearningLog(log.id)} disabled={isSaving}>
                        Sil
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
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
  handleİptalEditLearningLog: PropTypes.func.isRequired,
  handleUpdateLearningLog: PropTypes.func.isRequired,
  handleSilLearningLog: PropTypes.func.isRequired
};