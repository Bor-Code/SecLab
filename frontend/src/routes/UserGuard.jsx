import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearAuthStorage } from 'utils/authStorage';

export default function UserGuard() {
  const location = useLocation();
  const token = localStorage.getItem('seclab-access-token');
  const expiresAt = localStorage.getItem('seclab-token-expires-at');
  const userId = localStorage.getItem('seclab-user-id');
  const role = localStorage.getItem('seclab-user-role');
  const allowedRoles = ['user', 'admin'];

  if (expiresAt && new Date().getTime() > Number(expiresAt)) {
    clearAuthStorage();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!token || !userId || !allowedRoles.includes(role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
