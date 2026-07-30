import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';

import ButtonBase from '@mui/material/ButtonBase';

import Logo from './LogoMain';
import LogoIcon from './LogoIcon';

export default function LogoSection({ reverse, isIcon, sx, to }) {
  const location = useLocation();
  const role = typeof window !== 'undefined' ? localStorage.getItem('seclab-user-role') : null;
  const isAdminRoute = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const homePath = isAdminRoute || role === 'admin' ? '/admin' : '/user';

  return (
    <ButtonBase disableRipple component={Link} to={to || homePath} sx={sx} aria-label="Ana sayfaya git">
      {isIcon ? <LogoIcon /> : <Logo reverse={reverse} />}
    </ButtonBase>
  );
}

LogoSection.propTypes = {
  reverse: PropTypes.bool,
  isIcon: PropTypes.bool,
  sx: PropTypes.any,
  to: PropTypes.any
};
