import dashboard from './dashboard';
import records from './records';
import monitoring from './monitoring';
import { DashboardOutlined, BookOutlined, ReadOutlined, LinkOutlined } from '@ant-design/icons';

const userWorkspace = {
  id: 'group-user-workspace',
  title: 'Workspace',
  type: 'group',
  children: [
    {
      id: 'user-workspace',
      title: 'My Workspace',
      type: 'item',
      url: '/user',
      icon: DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-topics',
      title: 'Topics',
      type: 'item',
      url: '/user/topics',
      icon: BookOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-learning-logs',
      title: 'Learning Logs',
      type: 'item',
      url: '/user/learning-logs',
      icon: ReadOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-resources',
      title: 'Resources',
      type: 'item',
      url: '/user/resources',
      icon: LinkOutlined,
      breadcrumbs: false
    }
  ]
};

const role = typeof window !== 'undefined' ? localStorage.getItem('seclab-user-role') : null;

const menuItems = {
  items: role === 'user' ? [userWorkspace] : [dashboard, records, monitoring]
};

export default menuItems;