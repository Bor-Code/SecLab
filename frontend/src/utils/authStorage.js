const AUTH_STORAGE_KEYS = [
  'seclab-access-token',
  'seclab-token-expires-at',
  'seclab-user-id',
  'seclab-user-role',
  'seclab-user-username',
  'seclab-user-email',
  'seclab-admin-auth',
  'seclab-admin-role'
];

export const AUTH_CHANGED_EVENT = 'seclab-auth-changed';

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuthStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  notifyAuthChanged();
}

export function saveAuthSession(user) {
  const expiresMs = Date.parse(user.expires_at);

  localStorage.setItem('seclab-access-token', user.access_token);
  localStorage.setItem('seclab-token-expires-at', String(Number.isNaN(expiresMs) ? Date.now() + 3600000 : expiresMs));
  localStorage.setItem('seclab-user-id', String(user.id));
  localStorage.setItem('seclab-user-role', user.role);
  localStorage.setItem('seclab-user-username', user.username || '');
  localStorage.setItem('seclab-user-email', user.email || '');

  if (user.role === 'admin') {
    localStorage.setItem('seclab-admin-auth', 'true');
    localStorage.setItem('seclab-admin-role', 'admin');
  } else {
    localStorage.removeItem('seclab-admin-auth');
    localStorage.removeItem('seclab-admin-role');
  }

  notifyAuthChanged();
}

export function getUserStorageKey(baseKey) {
  const userId = localStorage.getItem('seclab-user-id') || 'guest';
  return `${baseKey}:${userId}`;
}
