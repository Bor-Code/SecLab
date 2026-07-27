import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function AdminGuard() {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('seclab-admin-auth') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}