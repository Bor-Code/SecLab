import { clearAuthStorage } from 'utils/authStorage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

async function request(path, options) {
  const token = localStorage.getItem('seclab-access-token');
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 10000);
  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options?.signal || controller.signal
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Sunucu zaman aşımına uğradı. Backend ve veritabanı bağlantısını kontrol edin.');
    }

    throw new Error('Backend sunucusuna ulaşılamadı.');
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const detail = typeof errorData?.detail === 'string' ? errorData.detail : `İstek başarısız oldu: ${path}`;

    if (response.status === 401 && token) {
      clearAuthStorage();

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }

    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

function buildQueryString(params) {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function requestPasswordReset(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export function resetPassword(token, password) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  });
}

export function fetchCurrentUser() {
  return request('/auth/me');
}

export function updateCurrentUser(payload) {
  return request('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({
      username: payload.username,
      email: payload.email
    })
  });
}

export function changeCurrentUserPassword(payload) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      current_password: payload.currentPassword,
      new_password: payload.newPassword
    })
  });
}

export function fetchUsers() {
  return request('/users');
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateUser(userId, payload) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteUser(userId) {
  await request(`/users/${userId}`, {
    method: 'DELETE'
  });
}

export function fetchTopics(params) {
  const queryString = buildQueryString(params);
  return request(`/topics${queryString}`);
}

export function createTopic(payload) {
  return request('/topics', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateTopic(topicId, payload) {
  return request(`/topics/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteTopic(topicId) {
  await request(`/topics/${topicId}`, {
    method: 'DELETE'
  });
}

export function fetchLearningLogs(params) {
  const queryString = buildQueryString(params);
  return request(`/learning-logs${queryString}`);
}

export function createLearningLog(payload) {
  return request('/learning-logs', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateLearningLog(logId, payload) {
  return request(`/learning-logs/${logId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteLearningLog(logId) {
  await request(`/learning-logs/${logId}`, {
    method: 'DELETE'
  });
}

export function fetchResources(params) {
  const queryString = buildQueryString(params);
  return request(`/resources${queryString}`);
}

export function createResource(payload) {
  return request('/resources', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateResource(resourceId, payload) {
  return request(`/resources/${resourceId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteResource(resourceId) {
  await request(`/resources/${resourceId}`, {
    method: 'DELETE'
  });
}

export function fetchDashboardSummary() {
  return request('/dashboard/summary');
}

export function fetchDashboardRecentActivity() {
  return request('/dashboard/recent-activity');
}

export function fetchUserWorkspace() {
  return request('/dashboard/user-workspace');
}

export function fetchHealthStatus() {
  return request('/health');
}

export function resetUserPassword(userId) {
  return request(`/users/${userId}/reset-password`, {
    method: 'POST'
  });
}
