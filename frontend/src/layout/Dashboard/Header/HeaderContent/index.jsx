import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import Search from './Search';
import Profile from './Profile';
import MobileSection from './MobileSection';

import { GithubOutlined } from '@ant-design/icons';

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {!downLG && <Search />}
      {downLG && <Box sx={{ width: '100%', ml: 1 }} />}

      <Stack className="seclab-header-actions" direction="row" spacing={1} sx={{ ml: 'auto', flexShrink: 0, alignItems: 'center' }}>
        <IconButton
          component={Link}
          href="https://github.com/Bor-Code"
          target="_blank"
          rel="noopener noreferrer"
          disableRipple
          color="secondary"
          title="GitHub profilini aç"
          aria-label="GitHub profilini aç"
          sx={{
            color: 'text.primary',
            bgcolor: 'grey.100',
            flexShrink: 0
          }}
        >
          <GithubOutlined />
        </IconButton>

        {!downLG && <Profile />}
        {downLG && <MobileSection />}
      </Stack>
    </>
  );
}
