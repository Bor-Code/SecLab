import { DashboardOutlined } from '@ant-design/icons';

const dashboard = {
  id: 'group-dashboard',
  title: 'Genel Bakış',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Gösterge Paneli',
      type: 'item',
      url: '/admin',
      icon: DashboardOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
