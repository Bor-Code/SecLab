import { useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

const resourceTypes = ['documentation', 'tool', 'article', 'video', 'other'];

export default function ResourceList({
  resources,
  isSaving,
  editingResourceId,
  editResourceTitle,
  editResourceUrl,
  editResourceType,
  editResourceNotes,
  setEditResourceTitle,
  setEditResourceUrl,
  setEditResourceType,
  setEditResourceNotes,
  handleStartEditResource,
  handleİptalEditResource,
  handleUpdateResource,
  handleSilResource
}) {
  const [search, setSearch] = useState('');

  const filteredResources = resources.filter((resource) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [resource.title, resource.url, resource.resource_type, resource.notes]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <MainCard id="resources" title="Saved Resources" sx={{ scrollMarginTop: 96 }}>
      <Stack spacing={2}>
        <TextField
          label="Kaynak ara"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          fullWidth
        />

        {resources.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No resources yet. Add useful links and documentation references above.
          </Typography>
        ) : filteredResources.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No resources match your search.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {filteredResources.map((resource) => (
              <Stack key={resource.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {editingResourceId === resource.id ? (
                  <Stack component="form" spacing={1.5} onSubmit={(event) => handleUpdateResource(event, resource.id)}>
                    <TextField label="Title" value={editResourceTitle} onChange={(event) => setEditResourceTitle(event.target.value)} fullWidth />
                    <TextField label="URL" value={editResourceUrl} onChange={(event) => setEditResourceUrl(event.target.value)} fullWidth />
                    <TextField select label="Type" value={editResourceType} onChange={(event) => setEditResourceType(event.target.value)} fullWidth>
                      {resourceTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField label="Notes" value={editResourceNotes} onChange={(event) => setEditResourceNotes(event.target.value)} fullWidth multiline minRows={2} />
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="outlined" onClick={handleİptalEditResource} disabled={isSaving}>
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
                        {resource.title}
                      </Typography>
                      <Typography variant="body2" color="primary" component="a" href={resource.url} target="_blank" rel="noopener noreferrer">
                        {resource.url}
                      </Typography>
                      {resource.notes && (
                        <Typography variant="body2" color="text.secondary">
                          {resource.notes}
                        </Typography>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button variant="outlined" size="small" sx={{ minWidth: 72 }} onClick={() => handleStartEditResource(resource)} disabled={isSaving}>
                        Edit
                      </Button>
                      <Button variant="outlined" color="error" size="small" sx={{ minWidth: 72 }} onClick={() => handleSilResource(resource.id)} disabled={isSaving}>
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

ResourceList.propTypes = {
  resources: PropTypes.array.isRequired,
  isSaving: PropTypes.bool.isRequired,
  editingResourceId: PropTypes.number,
  editResourceTitle: PropTypes.string.isRequired,
  editResourceUrl: PropTypes.string.isRequired,
  editResourceType: PropTypes.string.isRequired,
  editResourceNotes: PropTypes.string.isRequired,
  setEditResourceTitle: PropTypes.func.isRequired,
  setEditResourceUrl: PropTypes.func.isRequired,
  setEditResourceType: PropTypes.func.isRequired,
  setEditResourceNotes: PropTypes.func.isRequired,
  handleStartEditResource: PropTypes.func.isRequired,
  handleİptalEditResource: PropTypes.func.isRequired,
  handleUpdateResource: PropTypes.func.isRequired,
  handleSilResource: PropTypes.func.isRequired
};