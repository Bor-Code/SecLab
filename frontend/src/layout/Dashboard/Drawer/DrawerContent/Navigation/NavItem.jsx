import PropTypes from 'prop-types';
import { Link, matchPath, useLocation } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import IconButton from 'components/@extended/IconButton';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

export default function NavItem({ item, level, isParents = false, setSelectedID }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const itemTarget = item.target ? '_blank' : '_self';

  const itemHandler = () => {
    if (downLG) handlerDrawerOpen(false);
    if (isParents && setSelectedID) setSelectedID(item.id);
  };

  const Icon = item.icon;
  const itemIcon = Icon ? (
    <Icon
      style={{
        fontSize: drawerOpen ? '1rem' : '1.25rem',
        ...(isParents && { fontSize: 20, stroke: '1.5' })
      }}
    />
  ) : null;

  const { pathname } = useLocation();
  const isSelected = Boolean(matchPath({ path: item?.link || item.url, end: false }, pathname));

  const button = (
    <ListItemButton
      component={Link}
      to={item.url}
      target={itemTarget}
      disabled={item.disabled}
      selected={isSelected}
      aria-label={item.title}
      onClick={itemHandler}
      sx={{
        zIndex: 1201,
        minHeight: 44,
        width: drawerOpen ? 'auto' : 44,
        mx: drawerOpen ? 1.25 : 'auto',
        my: 0.4,
        px: drawerOpen ? 1.5 : 0,
        pl: drawerOpen ? `${level * 28}px` : 0,
        py: drawerOpen ? 1 : 0,
        justifyContent: drawerOpen ? 'initial' : 'center',
        borderRadius: 2,
        overflow: 'hidden',
        '&:hover': { bgcolor: drawerOpen ? 'primary.lighter' : 'action.hover' },
        '&.Mui-selected': {
          bgcolor: drawerOpen ? 'primary.lighter' : 'primary.main',
          color: drawerOpen ? 'primary.main' : 'primary.contrastText',
          borderRight: drawerOpen ? '2px solid' : 0,
          borderColor: drawerOpen ? 'primary.main' : 'transparent',
          '&:hover': {
            bgcolor: drawerOpen ? 'primary.lighter' : 'primary.dark',
            color: drawerOpen ? 'primary.main' : 'primary.contrastText'
          }
        }
      }}
    >
      {itemIcon && (
        <ListItemIcon
          sx={{
            minWidth: drawerOpen ? 28 : 44,
            width: drawerOpen ? 28 : 44,
            height: drawerOpen ? 'auto' : 44,
            color: isSelected ? (drawerOpen ? 'primary.main' : 'inherit') : 'inherit',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'transparent',
            borderRadius: 0
          }}
        >
          {itemIcon}
        </ListItemIcon>
      )}
      {drawerOpen && (
        <ListItemText
          primary={
            <Typography variant="h6" sx={{ color: 'inherit' }}>
              {item.title}
            </Typography>
          }
        />
      )}
      {drawerOpen && item.chip && (
        <Chip
          color={item.chip.color}
          variant={item.chip.variant}
          size={item.chip.size}
          label={item.chip.label}
          avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
        />
      )}
    </ListItemButton>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {drawerOpen ? (
        button
      ) : (
        <Tooltip title={item.title} placement="right" arrow>
          {button}
        </Tooltip>
      )}
      {drawerOpen &&
        item?.actions?.map((action, index) => {
          const ActionIcon = action.icon;
          const callAction = action?.function;
          return (
            <IconButton
              key={index}
              {...(action.type === 'function' && {
                onClick: (event) => {
                  event.stopPropagation();
                  callAction();
                }
              })}
              {...(action.type === 'link' && {
                component: Link,
                to: action.url,
                target: action.target ? '_blank' : '_self'
              })}
              color="secondary"
              variant="outlined"
              sx={{
                position: 'absolute',
                top: 12,
                right: 20,
                zIndex: 1202,
                width: 20,
                height: 20,
                mr: -1,
                ml: 1,
                color: 'secondary.dark',
                borderColor: isSelected ? 'primary.light' : 'secondary.light',
                '&:hover': { borderColor: isSelected ? 'primary.main' : 'secondary.main' }
              }}
            >
              <ActionIcon style={{ fontSize: '0.625rem' }} />
            </IconButton>
          );
        })}
    </Box>
  );
}

NavItem.propTypes = {
  item: PropTypes.any,
  level: PropTypes.number,
  isParents: PropTypes.bool,
  setSelectedID: PropTypes.oneOfType([PropTypes.any, PropTypes.func])
};
