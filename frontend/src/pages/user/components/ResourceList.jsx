import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';

export default function ResourceList({ resources, isSaving, handleDeleteResource }) {
  return (
    <MainCard title="Kaydedilen Kaynaklar">
      {resources.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Henüz kaynak yok. Faydalı bağlantıları ve dokümanları ekleyin.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {resources.map((resource) => (
            <Stack
              key={resource.id}
              className="seclab-record-item"
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {resource.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="a"
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resource.url}
                </Typography>
              </Stack>
              <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteResource(resource.id)} disabled={isSaving}>
                Sil
              </Button>
            </Stack>
          ))}
        </Stack>
      )}
    </MainCard>
  );
}

ResourceList.propTypes = {
  resources: PropTypes.array.isRequired,
  isSaving: PropTypes.bool.isRequired,
  handleDeleteResource: PropTypes.func.isRequired
};
