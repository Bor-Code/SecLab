// assets
import { HeartOutlined, HistoryOutlined } from '@ant-design/icons';

// icons
const icons = {
  HeartOutlined,
  HistoryOutlined
};

// ==============================|| MENU ITEMS - MONITORING ||============================== //

const monitoring = {
  id: 'group-monitoring',
  title: 'Monitoring',
  type: 'group',
  children: [
    {
      id: 'system-health',
      title: 'System Health',
      type: 'item',
      url: '/system-health',
      icon: icons.HeartOutlined,
      breadcrumbs: false
    },
    {
      id: 'recent-activity',
      title: 'Recent Activity',
      type: 'item',
      url: '/recent-activity',
      icon: icons.HistoryOutlined,
      breadcrumbs: false
    }
  ]
};

export default monitoring;