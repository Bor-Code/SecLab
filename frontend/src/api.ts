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

export function fetchUsers() {
  return request<User[]>('/users')
}

export function createUser(payload: UserCreate) {
  return request<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchTopics() {
  return request<Topic[]>('/topics')
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

export function fetchLearningLogs() {
  return request<LearningLog[]>('/learning-logs')
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

export function fetchResources() {
  return request<Resource[]>('/resources')
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