import { useEffect } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';

// project imports
import Search from './Search';
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';
import { prefetchUserWorkspaceData } from 'api/userWorkspaceCache';

// project import
import { GithubOutlined } from '@ant-design/icons';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  useEffect(() => {
    const token = localStorage.getItem('seclab-access-token');
    const role = localStorage.getItem('seclab-user-role');

    if (token && role === 'user') {
      prefetchUserWorkspaceData(API_BASE_URL, token);
    }
  }, []);

  return (
    <>
      {!downLG && <Search />}
      <Box sx={{ flexGrow: 1, ml: 1 }} />
      <IconButton
        component={Link}
        href="https://github.com/Bor-Code"
        target="_blank"
        disableRipple
        color="secondary"
        title="GitHub profilini aç"
        sx={{ color: 'text.primary', bgcolor: 'grey.100' }}
      >
        <GithubOutlined />
      </IconButton>

      <Notification />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
