import { DatabaseOutlined, HeartOutlined, HistoryOutlined } from '@ant-design/icons';

const monitoring = {
  id: 'group-monitoring',
  title: 'İzleme',
  type: 'group',
  children: [
    {
      id: 'system-health',
      title: 'Sistem Durumu',
      type: 'item',
      url: '/admin/system-health',
      icon: HeartOutlined,
      breadcrumbs: false
    },
    {
      id: 'recent-activity',
      title: 'Son Aktiviteler',
      type: 'item',
      url: '/admin/recent-activity',
      icon: HistoryOutlined,
      breadcrumbs: false
    },
    {
      id: 'data-browser',
      title: 'Veri Tarayıcısı',
      type: 'item',
      url: '/admin/data-browser',
      icon: DatabaseOutlined,
      breadcrumbs: false
    }
  ]
};

export default monitoring;
