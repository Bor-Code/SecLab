import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function AdminGuard() {
  const location = useLocation();
  const token = localStorage.getItem('seclab-access-token');
  const expiresAt = localStorage.getItem('seclab-token-expires-at');
  const userId = localStorage.getItem('seclab-user-id');
  const userRol = localStorage.getItem('seclab-user-role');
  const adminAuth = localStorage.getItem('seclab-admin-auth') === 'true';
  const adminRol = localStorage.getItem('seclab-admin-role');

  if (expiresAt && new Date().getTime() > Number(expiresAt)) {
    localStorage.clear();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!token || !userId || userRol !== 'admin' || !adminAuth || adminRol !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
