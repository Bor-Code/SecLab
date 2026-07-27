import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function UserGuard() {
  const location = useLocation();
  const userId = localStorage.getItem('seclab-user-id');

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
