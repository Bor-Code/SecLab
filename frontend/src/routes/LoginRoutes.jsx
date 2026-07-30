import { lazy } from 'react';
import { Outlet } from 'react-router-dom';

import Loadable from 'components/Loadable';

const Landing = Loadable(lazy(() => import('../pages/public/Landing')));
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ForgotPassword = Loadable(lazy(() => import('../pages/authentication/ForgotPassword')));

const LoginRoutes = {
  path: '/',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <Landing />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />
    }
  ]
};

export default LoginRoutes;
