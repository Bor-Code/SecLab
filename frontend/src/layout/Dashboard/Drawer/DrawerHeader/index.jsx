import PropTypes from 'prop-types';

import DrawerHeaderStyled from './DrawerHeaderStyled';
import Logo from 'components/logo';

export default function DrawerHeader({ open }) {
  return (
    <DrawerHeaderStyled
      open={open}
      sx={{
        minHeight: open ? 72 : 68,
        width: '100%',
        px: open ? 2.25 : 0,
        py: 1,
        overflow: 'hidden'
      }}
    >
      <Logo
        isIcon={!open}
        sx={{
          width: open ? '100%' : 40,
          height: open ? 'auto' : 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          color: 'inherit'
        }}
      />
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
