import { Navigate, Outlet } from 'react-router-dom';

export default function AdminGuard() {
  const isAuthenticated = localStorage.getItem('seclab-admin-auth') === 'true';
  const role = localStorage.getItem('seclab-admin-role');

  if (!isAuthenticated || role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}