import { lazy } from 'react';

import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AdminGuard from './AdminGuard';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

const UsersPage = Loadable(lazy(() => import('pages/seclab/users')));
const KonularPage = Loadable(lazy(() => import('pages/seclab/topics')));
const OgrenmeKayitlariPage = Loadable(lazy(() => import('pages/seclab/learning-logs')));
const KaynaklarPage = Loadable(lazy(() => import('pages/seclab/resources')));
const SystemHealthPage = Loadable(lazy(() => import('pages/seclab/system-health')));
const RecentAktivitePage = Loadable(lazy(() => import('pages/seclab/recent-activity')));
const DataBrowserPage = Loadable(lazy(() => import('pages/seclab/data-browser')));

const MainRoutes = {
  path: '/admin',
  element: <AdminGuard />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: <DashboardDefault />
        },
        {
          path: 'dashboard',
          children: [
            {
              path: 'default',
              element: <DashboardDefault />
            }
          ]
        },
        {
          path: 'users',
          element: <UsersPage />
        },
        {
          path: 'topics',
          element: <KonularPage />
        },
        {
          path: 'learning-logs',
          element: <OgrenmeKayitlariPage />
        },
        {
          path: 'resources',
          element: <KaynaklarPage />
        },
        {
          path: 'system-health',
          element: <SystemHealthPage />
        },
        {
          path: 'recent-activity',
          element: <RecentAktivitePage />
        },
        {
          path: 'data-browser',
          element: <DataBrowserPage />
        }
      ]
    }
  ]
};

export default MainRoutes;
