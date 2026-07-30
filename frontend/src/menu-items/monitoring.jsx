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
  title: '?zleme',
  type: 'group',
  children: [
    {
      id: 'system-health',
      title: 'Sistem Sa?l???',
      type: 'item',
      url: '/admin/system-health',
      icon: icons.HeartOutlined,
      breadcrumbs: false
    },
    {
      id: 'recent-activity',
      title: 'Son Aktiviteler',
      type: 'item',
      url: '/admin/recent-activity',
      icon: icons.HistoryOutlined,
      breadcrumbs: false
    },
    {
      id: 'data-browser',
      title: 'Veri Taray?c?',
      type: 'item',
      url: '/admin/data-browser',
      icon: icons.HistoryOutlined,
      breadcrumbs: false
    }
  ]
};

export default monitoring;
