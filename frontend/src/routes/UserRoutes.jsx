import { lazy } from 'react';

import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import UserGuard from './UserGuard';

const UserDashboardPage = Loadable(lazy(() => import('pages/user/dashboard')));

const UserRoutes = {
  path: '/user',
  element: <UserGuard />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: <UserDashboardPage />
        },
        {
          path: 'topics',
          element: <UserDashboardPage />
        },
        {
          path: 'learning-logs',
          element: <UserDashboardPage />
        },
        {
          path: 'resources',
          element: <UserDashboardPage />
        }
      ]
    }
  ]
};

export default UserRoutes;