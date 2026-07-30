import { lazy } from 'react';

import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';

const UserDashboard = Loadable(lazy(() => import('pages/user/dashboard')));
const UserKonular = Loadable(lazy(() => import('pages/user/topics')));
const UserLearningLogs = Loadable(lazy(() => import('pages/user/learning-logs')));
const UserResources = Loadable(lazy(() => import('pages/user/resources')));
const UserProfile = Loadable(lazy(() => import('pages/user/profile')));
const UserProgress = Loadable(lazy(() => import('pages/user/progress')));
const UserStudyPlan = Loadable(lazy(() => import('pages/user/study-plan')));
const UserNotes = Loadable(lazy(() => import('pages/user/notes')));
const UserActivity = Loadable(lazy(() => import('pages/user/activity')));

const UserRoutes = {
  path: '/user',
  element: <DashboardLayout />,
  children: [
    { index: true, element: <UserDashboard /> },
    { path: 'topics', element: <UserKonular /> },
    { path: 'learning-logs', element: <UserLearningLogs /> },
    { path: 'resources', element: <UserResources /> },
    { path: 'profile', element: <UserProfile /> },
    { path: 'progress', element: <UserProgress /> },
    { path: 'study-plan', element: <UserStudyPlan /> },
    { path: 'notes', element: <UserNotes /> },
    { path: 'activity', element: <UserActivity /> }
  ]
};

export default UserRoutes;
