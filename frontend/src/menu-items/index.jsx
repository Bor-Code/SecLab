import dashboard from './dashboard';
import records from './records';
import monitoring from './monitoring';
import { BarChartOutlined, BookOutlined, CalendarOutlined, DashboardOutlined, FileTextOutlined, HistoryOutlined, LinkOutlined, ReadOutlined, UserOutlined } from '@ant-design/icons';

const userWorkspace = {
  id: 'group-user-workspace',
  title: 'Çalışma Alanı',
  type: 'group',
  children: [
    {
      id: 'user-workspace',
      title: 'MyWorkspace',
      type: 'item',
      url: '/user',
      icon: DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-topics',
      title: 'Konular',
      type: 'item',
      url: '/user/topics',
      icon: BookOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-learning-logs',
      title: 'Öğrenme Kayıtları',
      type: 'item',
      url: '/user/learning-logs',
      icon: ReadOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-resources',
      title: 'Kaynaklar',
      type: 'item',
      url: '/user/resources',
      icon: LinkOutlined,
      breadcrumbs: false
    },
    
        {
          id: 'user-progress',
          title: 'İlerlemem',
          type: 'item',
          url: '/user/progress',
          icon: BarChartOutlined
        },

        {
          id: 'user-study-plan',
          title: 'Çalışma Planı',
          type: 'item',
          url: '/user/study-plan',
          icon: CalendarOutlined
        },

        {
          id: 'user-notes',
          title: 'Notlar',
          type: 'item',
          url: '/user/notes',
          icon: FileTextOutlined
        },

        {
          id: 'user-activity',
          title: 'Aktivite',
          type: 'item',
          url: '/user/activity',
          icon: HistoryOutlined
        },
{
      id: 'user-profile',
      title: 'Profil',
      type: 'item',
      url: '/user/profile',
      icon: UserOutlined,
      breadcrumbs: false
    }
  ]
};

const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
const role = typeof window !== 'undefined' ? localStorage.getItem('seclab-user-role') : null;
const isUserWorkspace = role === 'user' || pathname.includes('/user');

const menuItems = {
  items: isUserWorkspace ? [userWorkspace] : [dashboard, records, monitoring]
};

export default menuItems;