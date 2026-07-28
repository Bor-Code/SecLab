import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function UserGuard() {
  const location = useLocation();
  const userId = localStorage.getItem('seclab-user-id');
  const role = localStorage.getItem('seclab-user-role');
  const allowedRoles = ['user', 'admin'];

  if (!userId || !allowedRoles.includes(role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
