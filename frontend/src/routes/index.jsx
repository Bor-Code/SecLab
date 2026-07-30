import { createBrowserRouter } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import UserRoutes from './UserRoutes';
import LoginRoutes from './LoginRoutes';

// ==============================|| ROUTER RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, UserRoutes, LoginRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
