import dashboard from './dashboard';
import records from './records';
import monitoring from './monitoring';

import {
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  LinkOutlined,
  ReadOutlined,
  SettingOutlined
} from '@ant-design/icons';

const userWorkspace = {
  id: 'group-user-workspace',
  title: 'İlerleme Analizi',
  type: 'group',
  children: [
    {
      id: 'user-workspace',
      title: 'İlerleme Analizim',
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
      title: 'Öğrenme Kayıt Yönetimiı',
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
      icon: BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-study-plan',
      title: 'Çalışma Planı',
      type: 'item',
      url: '/user/study-plan',
      icon: CalendarOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-notes',
      title: 'Notlar',
      type: 'item',
      url: '/user/notes',
      icon: FileTextOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-activity',
      title: 'Aktivite',
      type: 'item',
      url: '/user/activity',
      icon: HistoryOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-settings',
      title: 'Hesap Ayarları',
      type: 'item',
      url: '/user/settings/account',
      icon: SettingOutlined,
      breadcrumbs: false
    }
  ]
};

function normalizePathname(pathname = '') {
  const withoutBase = pathname.replace(/^\/free(?=\/|$)/, '');
  return withoutBase || '/';
}

export function getMenuItems(pathname = '') {
  const normalizedPath = normalizePathname(pathname);
  const role = typeof window !== 'undefined' ? localStorage.getItem('seclab-user-role') : null;
  const isAdminPath = normalizedPath === '/admin' || normalizedPath.startsWith('/admin/');
  const isUserPath = normalizedPath === '/user' || normalizedPath.startsWith('/user/');

  if (isAdminPath || (role === 'admin' && !isUserPath)) {
    return { items: [dashboard, records, monitoring] };
  }

  return { items: [userWorkspace] };
}

export default getMenuItems(typeof window !== 'undefined' ? window.location.pathname : '');
