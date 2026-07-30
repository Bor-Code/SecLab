import { useMemo } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

// project imports
import AppBarStyled from './AppBarStyled';
import HeaderContent from './HeaderContent';
import IconButton from 'components/@extended/IconButton';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from 'config';

// assets
import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const menuState = useGetMenuMaster() || {};
  const menuMaster = menuState.menuMaster || {};
  const drawerOpen = menuMaster.isDashboardDrawerOpened ?? true;

  const headerContent = useMemo(() => <HeaderContent />, []);

  const handleDrawerToggle = () => {
    if (typeof handlerDrawerOpen === 'function') {
      handlerDrawerOpen(!drawerOpen);
    }
  };

  const mainHeader = (
    <Toolbar>
      <IconButton
        aria-label="menüyü aç veya kapat"
        onClick={handleDrawerToggle}
        edge="start"
        color="secondary"
        variant="light"
        sx={{
          color: 'text.primary',
          bgcolor: drawerOpen ? 'transparent' : 'grey.100',
          ml: { xs: 0, lg: -2 }
        }}
      >
        {!drawerOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </IconButton>

      {headerContent}
    </Toolbar>
  );

  const appBar = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      bgcolor: '#eef1f5',
      backgroundImage: 'none',
      borderBottom: '1px solid',
      borderBottomColor: '#d6dce5',
      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
      zIndex: 1200,
      width: {
        xs: '100%',
        lg: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${MINI_DRAWER_WIDTH}px)`
      }
    }
  };

  return !downLG ? (
    <AppBarStyled open={drawerOpen} {...appBar}>
      {mainHeader}
    </AppBarStyled>
  ) : (
    <AppBar {...appBar}>{mainHeader}</AppBar>
  );
}