import { lazy } from 'react';

import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

const UsersPage = Loadable(lazy(() => import('pages/seclab/users')));
const TopicsPage = Loadable(lazy(() => import('pages/seclab/topics')));
const LearningLogsPage = Loadable(lazy(() => import('pages/seclab/learning-logs')));
const ResourcesPage = Loadable(lazy(() => import('pages/seclab/resources')));
const SystemHealthPage = Loadable(lazy(() => import('pages/seclab/system-health')));
const RecentActivityPage = Loadable(lazy(() => import('pages/seclab/recent-activity')));

const MainRoutes = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      path: '/',
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
      element: <TopicsPage />
    },
    {
      path: 'learning-logs',
      element: <LearningLogsPage />
    },
    {
      path: 'resources',
      element: <ResourcesPage />
    },
    {
      path: 'system-health',
      element: <SystemHealthPage />
    },
    {
      path: 'recent-activity',
      element: <RecentActivityPage />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;