function clearSecLabSession() {
  localStorage.removeItem('seclab-access-token');
  localStorage.removeItem('seclab-token-expires-at');
  localStorage.removeItem('seclab-user-id');
  localStorage.removeItem('seclab-user-role');
  localStorage.removeItem('seclab-user-username');
  localStorage.removeItem('seclab-user-email');
  localStorage.removeItem('seclab-admin-auth');
  localStorage.removeItem('seclab-admin-role');
}

function redirectToLogin() {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  window.location.assign(`${baseUrl}/login`);
}
const API_BASE_URL = 'http://127.0.0.1:8000';

export type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
};

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  access_token: string;
  token_type: string;
  expires_at: string;
};

export type Topic = {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export type LearningLog = {
  id: number;
  user_id: number;
  topic_id: number;
  title: string;
  notes: string | null;
  study_date: string;
  created_at: string;
};

export type Resource = {
  id: number;
  user_id: number;
  topic_id: number;
  title: string;
  url: string;
  resource_type: string;
  notes: string | null;
  created_at: string;
};

export type UserCreate = {
  username: string;
  email: string;
  role: string;
};

export type UserUpdate = {
  username?: string;
  email?: string;
  role?: string;
};

export type TopicCreate = {
  user_id: number;
  name: string;
  description: string | null;
};

export type TopicUpdate = {
  name: string;
  description: string | null;
};

export type LearningLogCreate = {
  user_id: number;
  topic_id: number;
  title: string;
  notes: string | null;
};

export type LearningLogUpdate = {
  title: string;
  notes: string | null;
};

export type ResourceCreate = {
  user_id: number;
  topic_id: number;
  title: string;
  url: string;
  resource_type: string;
  notes: string | null;
};

export type ResourceUpdate = {
  title: string;
  url: string;
  resource_type: string;
  notes: string | null;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ChangeŞifrePayload = {
  current_password: string;
  new_password: string;
};

export type ProfilimUpdatePayload = {
  username?: string;
  email?: string;
};

export type TopicFilters = {
  user_id?: number;
  search?: string;
};

export type LearningLogFilters = {
  user_id?: number;
  topic_id?: number;
  search?: string;
};

export type ResourceFilters = {
  user_id?: number;
  topic_id?: number;
  resource_type?: string;
  search?: string;
};

export type DashboardSummary = {
  users_count: number;
  topics_count: number;
  learning_logs_count: number;
  resources_count: number;
};

export type DashboardActivityItem = {
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type HealthStatus = {
  status: string;
  database: string;
  checked_at_utc: string;
};

type QueryValue = string | number | null | undefined;
type QueryParams = Record<string, QueryValue>;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('seclab-access-token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearSecLabSession();
    redirectToLogin();
    throw new Error('Session expired. Please log in again.');
  }

  if (!response.ok) {
    let message = `Request failed: ${path}`;

    try {
      const errorBody = await response.json();
      if (typeof errorBody?.detail === 'string') {
        message = errorBody.detail;
      }
    } catch {
      message = `Request failed: ${path}`;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function buildQueryString(params?: QueryParams) {
  if (!params) {
    return '';
  }

  const searchParams = new URLAraParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function registerUser(payload: RegisterPayload) {
  return request<AuthUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return request<AuthUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function changeŞifre(payload: ChangeŞifrePayload) {
  return request<{ message: string }>('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function fetchMyProfilim() {
  return request<User>('/auth/me');
}

export function updateMyProfilim(payload: ProfilimUpdatePayload) {
  return request<User>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function fetchUsers() {
  return request<User[]>('/users');
}

export function createUser(payload: UserCreate) {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(userId: number, payload: UserUpdate) {
  return request<User>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(userId: number) {
  await request<unknown>(`/users/${userId}`, {
    method: 'DELETE',
  });
}

export function fetchTopics(params?: TopicFilters) {
  const queryString = buildQueryString(params);
  return request<Topic[]>(`/topics${queryString}`);
}

export function createTopic(payload: TopicCreate) {
  return request<Topic>('/topics', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTopic(topicId: number, payload: TopicUpdate) {
  return request<Topic>(`/topics/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteTopic(topicId: number) {
  await request<unknown>(`/topics/${topicId}`, {
    method: 'DELETE',
  });
}

export function fetchLearningLogs(params?: LearningLogFilters) {
  const queryString = buildQueryString(params);
  return request<LearningLog[]>(`/learning-logs${queryString}`);
}

export function createLearningLog(payload: LearningLogCreate) {
  return request<LearningLog>('/learning-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateLearningLog(logId: number, payload: LearningLogUpdate) {
  return request<LearningLog>(`/learning-logs/${logId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteLearningLog(logId: number) {
  await request<unknown>(`/learning-logs/${logId}`, {
    method: 'DELETE',
  });
}

export function fetchResources(params?: ResourceFilters) {
  const queryString = buildQueryString(params);
  return request<Resource[]>(`/resources${queryString}`);
}

export function createResource(payload: ResourceCreate) {
  return request<Resource>('/resources', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateResource(resourceId: number, payload: ResourceUpdate) {
  return request<Resource>(`/resources/${resourceId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteResource(resourceId: number) {
  await request<unknown>(`/resources/${resourceId}`, {
    method: 'DELETE',
  });
}

export function fetchDashboardSummary() {
  return request<DashboardSummary>('/dashboard/summary');
}

export function fetchDashboardRecentActivity() {
  return request<DashboardActivityItem[]>('/dashboard/recent-activity');
}

export function fetchHealthStatus() {
  return request<HealthStatus>('/health');
}

export function verifyEmail(token: string) {
  return request('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
}

export function forgotPassword(email: string) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}

export function resetPassword(payload: { token: string; new_password: string }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}


export function resetUserPassword(userId: number) {
  return request(`/users/${userId}/reset-password`, {
    method: 'POST'
  });
}

export function fetchCurrentUser() {
  return request('/auth/me');
}
