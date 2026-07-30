import { lazy } from 'react';

import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import UserGuard from './UserGuard';

const UserDashboard = Loadable(lazy(() => import('pages/user/dashboard')));
const UserTopics = Loadable(lazy(() => import('pages/user/topics')));
const UserLearningLogs = Loadable(lazy(() => import('pages/user/learning-logs')));
const UserResources = Loadable(lazy(() => import('pages/user/resources')));
const UserProgress = Loadable(lazy(() => import('pages/user/progress')));
const UserStudyPlan = Loadable(lazy(() => import('pages/user/study-plan')));
const UserNotes = Loadable(lazy(() => import('pages/user/notes')));
const UserActivity = Loadable(lazy(() => import('pages/user/activity')));
const AccountSettings = Loadable(lazy(() => import('pages/account/account-settings')));
const SecuritySettings = Loadable(lazy(() => import('pages/account/security-settings')));
const SessionSettings = Loadable(lazy(() => import('pages/account/session-settings')));

const UserRoutes = {
  path: '/user',
  element: <UserGuard />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { index: true, element: <UserDashboard /> },
        { path: 'topics', element: <UserTopics /> },
        { path: 'learning-logs', element: <UserLearningLogs /> },
        { path: 'resources', element: <UserResources /> },
        { path: 'progress', element: <UserProgress /> },
        { path: 'study-plan', element: <UserStudyPlan /> },
        { path: 'notes', element: <UserNotes /> },
        { path: 'activity', element: <UserActivity /> },
        { path: 'settings/account', element: <AccountSettings /> },
        { path: 'settings/security', element: <SecuritySettings /> },
        { path: 'settings/session', element: <SessionSettings /> }
      ]
    }
  ]
};

export default UserRoutes;
