const API_BASE_URL = 'http://127.0.0.1:8000'

export type User = {
  id: number
  username: string
  email: string
  created_at: string
}

export type Topic = {
  id: number
  user_id: number
  name: string
  description: string | null
  created_at: string
}

export type LearningLog = {
  id: number
  user_id: number
  topic_id: number
  title: string
  notes: string | null
  study_date: string
  created_at: string
}

export type Resource = {
  id: number
  user_id: number
  topic_id: number
  title: string
  url: string
  resource_type: string
  notes: string | null
  created_at: string
}

export type UserCreate = {
  username: string
  email: string
}

export type UserUpdate = {
  username: string
  email: string
}

export type TopicCreate = {
  user_id: number
  name: string
  description: string | null
}

export type TopicUpdate = {
  name: string
  description: string | null
}

export type LearningLogCreate = {
  user_id: number
  topic_id: number
  title: string
  notes: string | null
}

export type LearningLogUpdate = {
  title: string
  notes: string | null
}

export type ResourceCreate = {
  user_id: number
  topic_id: number
  title: string
  url: string
  resource_type: string
  notes: string | null
}

export type ResourceUpdate = {
  title: string
  url: string
  resource_type: string
  notes: string | null
}

export type TopicFilters = {
  user_id?: number
  search?: string
}

export type LearningLogFilters = {
  user_id?: number
  topic_id?: number
  search?: string
}

export type ResourceFilters = {
  user_id?: number
  topic_id?: number
  resource_type?: string
  search?: string
}

export type DashboardSummary = {
  users_count: number
  topics_count: number
  learning_logs_count: number
  resources_count: number
}

type QueryValue = string | number | null | undefined
type QueryParams = Record<string, QueryValue>

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`)
  }

  return (await response.json()) as T
}

function buildQueryString(params?: QueryParams) {
  if (!params) {
    return ''
  }

  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  }

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export function fetchUsers() {
  return request<User[]>('/users')
}

export function createUser(payload: UserCreate) {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUser(userId: number, payload: UserUpdate) {
  return request<User>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(userId: number) {
  await request<unknown>(`/users/${userId}`, {
    method: 'DELETE',
  })
}

export function fetchTopics(params?: TopicFilters) {
  const queryString = buildQueryString(params)
  return request<Topic[]>(`/topics${queryString}`)
}

export function createTopic(payload: TopicCreate) {
  return request<Topic>('/topics', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateTopic(topicId: number, payload: TopicUpdate) {
  return request<Topic>(`/topics/${topicId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteTopic(topicId: number) {
  await request<unknown>(`/topics/${topicId}`, {
    method: 'DELETE',
  })
}

export function fetchLearningLogs(params?: LearningLogFilters) {
  const queryString = buildQueryString(params)
  return request<LearningLog[]>(`/learning-logs${queryString}`)
}

export function createLearningLog(payload: LearningLogCreate) {
  return request<LearningLog>('/learning-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateLearningLog(logId: number, payload: LearningLogUpdate) {
  return request<LearningLog>(`/learning-logs/${logId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteLearningLog(logId: number) {
  await request<unknown>(`/learning-logs/${logId}`, {
    method: 'DELETE',
  })
}

export function fetchResources(params?: ResourceFilters) {
  const queryString = buildQueryString(params)
  return request<Resource[]>(`/resources${queryString}`)
}

export function createResource(payload: ResourceCreate) {
  return request<Resource>('/resources', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateResource(resourceId: number, payload: ResourceUpdate) {
  return request<Resource>(`/resources/${resourceId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteResource(resourceId: number) {
  await request<unknown>(`/resources/${resourceId}`, {
    method: 'DELETE',
  })
}

export function fetchDashboardSummary() {
  return request<DashboardSummary>('/dashboard/summary')
}