import { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

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
  const [search, setSearch] = useState('');

  const filteredTopics = topics.filter((topic) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [topic.name, topic.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <MainCard id="topics" title="Konularım" sx={{ scrollMarginTop: 96 }}>
      <Stack spacing={2}>
        <TextField
          label="Konu ara"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />

        {topics.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Henüz konu yok. İlk konunu yukarıdan oluşturarak öğrenme düzenini başlat.
          </Typography>
        ) : filteredTopics.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Aramanızla eşleşen konu bulunamadı.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {filteredTopics.map((topic) => (
              <Box key={topic.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {editingTopicId === topic.id ? (
                  <Stack component="form" spacing={2} onSubmit={(event) => handleUpdateTopic(event, topic.id)}>
                    <TextField
                      label="Konu Adı"
                      value={editTopicName}
                      onChange={(event) => setEditTopicName(event.target.value)}
                      fullWidth
                      disabled={isSaving}
                    />
                    <TextField
                      label="Açıklama"
                      value={editTopicDescription}
                      onChange={(event) => setEditTopicDescription(event.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      disabled={isSaving}
                    />
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small" onClick={handleCancelEditTopic} disabled={isSaving}>
                        İptal
                      </Button>
                      <Button type="submit" variant="contained" size="small" disabled={isSaving}>
                        Kaydet
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {topic.name}
                      </Typography>
                      {topic.description && (
                        <Typography variant="body2" color="text.secondary">
                          {topic.description}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small" sx={{ minWidth: 72 }} onClick={() => handleStartEditTopic(topic)} disabled={isSaving}>
                        Düzenle
                      </Button>
                      <Button variant="outlined" color="error" size="small" sx={{ minWidth: 72 }} onClick={() => handleDeleteTopic(topic.id)} disabled={isSaving}>
                        Sil
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
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