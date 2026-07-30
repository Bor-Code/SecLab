import { lazy } from 'react';

import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const UserDashboard = Loadable(lazy(() => import('pages/user/dashboard')));
const UserTopics = Loadable(lazy(() => import('pages/user/topics')));
const UserLearningLogs = Loadable(lazy(() => import('pages/user/learning-logs')));
const UserResources = Loadable(lazy(() => import('pages/user/resources')));
const UserProfilim = Loadable(lazy(() => import('pages/user/profile')));
const UserProgress = Loadable(lazy(() => import('pages/user/progress')));
const UserCalismaPlani = Loadable(lazy(() => import('pages/user/study-plan')));
const UserNotlar = Loadable(lazy(() => import('pages/user/notes')));
const UserAktivite = Loadable(lazy(() => import('pages/user/activity')));

const UserRoutes = {
  path: '/user',
  element: <DashboardLayout />,
  children: [
    { index: true, element: <UserDashboard /> },
    { path: 'topics', element: <UserTopics /> },
    { path: 'learning-logs', element: <UserLearningLogs /> },
    { path: 'resources', element: <UserResources /> },
    { path: 'profile', element: <UserProfilim /> },
    { path: 'progress', element: <UserProgress /> },
    { path: 'study-plan', element: <UserCalismaPlani /> },
    { path: 'notes', element: <UserNotlar /> },
    { path: 'activity', element: <UserAktivite /> }
  ]
};

export default UserRoutes;
