import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MainCard from 'components/MainCard';

export default function TopicManager({
  topics,
  editingTopicId,
  editTopicName,
  editTopicDescription,
  setEditTopicName,
  setEditTopicDescription,
  isSaving,
  handleStartEditTopic,
  handleCancelEditTopic,
  handleUpdateTopic,
  handleDeleteTopic
}) {
  return (
    <MainCard title="My Topics">
      {topics.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No topics yet. Create your first topic above to start organizing your learning journey.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {topics.map((topic) => (
            <Box key={topic.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {editingTopicId === topic.id ? (
                <Stack component="form" spacing={2} onSubmit={(e) => handleUpdateTopic(e, topic.id)}>
                  <TextField
                    label="Topic name"
                    value={editTopicName}
                    onChange={(e) => setEditTopicName(e.target.value)}
                    fullWidth
                    disabled={isSaving}
                  />
                  <TextField
                    label="Description"
                    value={editTopicDescription}
                    onChange={(e) => setEditTopicDescription(e.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                    disabled={isSaving}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained" size="small" disabled={isSaving}>
                      Save
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleCancelEditTopic} disabled={isSaving}>
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1">{topic.name}</Typography>
                    {topic.description && (
                      <Typography variant="body2" color="text.secondary">
                        {topic.description}
                      </Typography>
                    )}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" size="small" onClick={() => handleStartEditTopic(topic)} disabled={isSaving}>
                      Edit
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteTopic(topic.id)} disabled={isSaving}>
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </MainCard>
  );
}

TopicManager.propTypes = {
  topics: PropTypes.array.isRequired,
  editingTopicId: PropTypes.number,
  editTopicName: PropTypes.string.isRequired,
  editTopicDescription: PropTypes.string.isRequired,
  setEditTopicName: PropTypes.func.isRequired,
  setEditTopicDescription: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  handleStartEditTopic: PropTypes.func.isRequired,
  handleCancelEditTopic: PropTypes.func.isRequired,
  handleUpdateTopic: PropTypes.func.isRequired,
  handleDeleteTopic: PropTypes.func.isRequired
};
