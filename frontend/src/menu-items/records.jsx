// assets
import {
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  LinkOutlined
} from '@ant-design/icons';

// icons
const icons = {
  UserOutlined,
  BookOutlined,
  ReadOutlined,
  LinkOutlined
};

// ==============================|| MENU ITEMS - RECORDS ||============================== //

const records = {
  id: 'group-records',
  title: 'Records',
  type: 'group',
  children: [
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/admin/users',
      icon: icons.UserOutlined,
      breadcrumbs: false
    },
    {
      id: 'topics',
      title: 'Konular',
      type: 'item',
      url: '/admin/topics',
      icon: icons.BookOutlined,
      breadcrumbs: false
    },
    {
      id: 'learning-logs',
      title: 'LearningLogs',
      type: 'item',
      url: '/admin/learning-logs',
      icon: icons.ReadOutlined,
      breadcrumbs: false
    },
    {
      id: 'resources',
      title: 'Resources',
      type: 'item',
      url: '/admin/resources',
      icon: icons.LinkOutlined,
      breadcrumbs: false
    }
  ]
};

export default records;