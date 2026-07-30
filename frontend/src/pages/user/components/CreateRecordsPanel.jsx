import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MainCard from 'components/MainCard';

export default function CreateRecordsPanel({
  activeSection,
  topics,
  isSaving,
  newTopicName,
  setNewTopicName,
  newTopicDescription,
  setNewTopicDescription,
  logTopicId,
  setLogTopicId,
  logTitle,
  setLogTitle,
  logNotes,
  setLogNotes,
  resourceTopicId,
  setResourceTopicId,
  resourceTitle,
  setResourceTitle,
  resourceUrl,
  setResourceUrl,
  resourceType,
  setResourceType,
  resourceNotes,
  setResourceNotes,
  handleCreateTopic,
  handleCreateLearningLog,
  handleCreateResource
}) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }} sx={{ display: activeSection === 'topics' ? 'block' : 'none' }}>
        <MainCard title="Yeni Konu">
          <Stack component="form" spacing={2} onSubmit={handleCreateTopic}>
            <TextField
              label="Konu Adı"
              value={newTopicName}
              onChange={(event) => setNewTopicName(event.target.value)}
              fullWidth
              disabled={isSaving}
            />
            <TextField
              label="Açıklama"
              value={newTopicDescription}
              onChange={(event) => setNewTopicDescription(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              disabled={isSaving}
            />
            <Button type="submit" variant="contained" size="large" sx={{ py: 1.2, fontWeight: 700, borderRadius: 1.5 }} disabled={isSaving}>
              {isSaving ? 'Kaydediliyor...' : 'Konu Oluştur'}
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: activeSection === 'learning-logs' ? 'block' : 'none' }}>
        <MainCard title="Yeni Öğrenme Kaydı">
          <Stack component="form" spacing={2} onSubmit={handleCreateLearningLog}>
            <FormControl fullWidth>
              <InputLabel id="log-topic-label">Konu Seçin</InputLabel>
              <Select
                labelId="log-topic-label"
                value={logTopicId}
                label="Konu"
                onChange={(e) => setLogTopicId(e.target.value)}
                disabled={isSaving}
              >
                {topics.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Kayıt Başlığı"
              value={logTitle}
              onChange={(event) => setLogTitle(event.target.value)}
              fullWidth
              disabled={isSaving}
            />
            <TextField
              label="Notlar"
              value={logNotes}
              onChange={(event) => setLogNotes(event.target.value)}
              fullWidth
              multiline
              minRows={2}
              disabled={isSaving}
            />
            <Button type="submit" variant="contained" size="large" sx={{ py: 1.2, fontWeight: 700, borderRadius: 1.5 }} disabled={isSaving || topics.length === 0}>
              {isSaving ? 'Kaydediliyor...' : 'Kayıt Oluştur'}
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12 }} sx={{ display: activeSection === 'resources' ? 'block' : 'none' }}>
        <MainCard title="Yeni Kaynak">
          <Stack component="form" spacing={2} onSubmit={handleCreateResource}>
            <FormControl fullWidth>
              <InputLabel id="resource-topic-label">Konu Seçin</InputLabel>
              <Select
                labelId="resource-topic-label"
                value={resourceTopicId}
                label="Konu"
                onChange={(e) => setResourceTopicId(e.target.value)}
                disabled={isSaving}
              >
                {topics.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Kaynak Başlığı"
              value={resourceTitle}
              onChange={(event) => setResourceTitle(event.target.value)}
              fullWidth
              disabled={isSaving}
            />
            <TextField
              label="URL"
              value={resourceUrl}
              onChange={(event) => setResourceUrl(event.target.value)}
              fullWidth
              disabled={isSaving}
            />
            <TextField
              label="Tür"
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value)}
              fullWidth
              disabled={isSaving}
            />
            <Button type="submit" variant="contained" size="large" sx={{ py: 1.2, fontWeight: 700, borderRadius: 1.5 }} disabled={isSaving || topics.length === 0}>
              {isSaving ? 'Kaydediliyor...' : 'Kaynak Oluştur'}
            </Button>
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}

CreateRecordsPanel.propTypes = {
  topics: PropTypes.array.isRequired,
  isSaving: PropTypes.bool.isRequired,
  newTopicName: PropTypes.string.isRequired,
  setNewTopicName: PropTypes.func.isRequired,
  newTopicDescription: PropTypes.string.isRequired,
  setNewTopicDescription: PropTypes.func.isRequired,
  logTopicId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setLogTopicId: PropTypes.func.isRequired,
  logTitle: PropTypes.string.isRequired,
  setLogTitle: PropTypes.func.isRequired,
  logNotes: PropTypes.string.isRequired,
  setLogNotes: PropTypes.func.isRequired,
  resourceTopicId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setResourceTopicId: PropTypes.func.isRequired,
  resourceTitle: PropTypes.string.isRequired,
  setResourceTitle: PropTypes.func.isRequired,
  resourceUrl: PropTypes.string.isRequired,
  setResourceUrl: PropTypes.func.isRequired,
  resourceType: PropTypes.string.isRequired,
  setResourceType: PropTypes.func.isRequired,
  resourceNotes: PropTypes.string.isRequired,
  setResourceNotes: PropTypes.func.isRequired,
  handleCreateTopic: PropTypes.func.isRequired,
  handleCreateLearningLog: PropTypes.func.isRequired,
  handleCreateResource: PropTypes.func.isRequired
};
