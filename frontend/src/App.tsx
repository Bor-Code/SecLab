import { useEffect, useState, type FormEvent } from 'react'
import './App.css'

type User = {
  id: number
  username: string
  email: string
  created_at: string
}

type Topic = {
  id: number
  user_id: number
  name: string
  description: string | null
  created_at: string
}

type LearningLog = {
  id: number
  user_id: number
  topic_id: number
  title: string
  notes: string | null
  study_date: string
  created_at: string
}

type Resource = {
  id: number
  user_id: number
  topic_id: number
  title: string
  url: string
  resource_type: string
  notes: string | null
  created_at: string
}

const API_BASE_URL = 'http://127.0.0.1:8000'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [userFormMessage, setUserFormMessage] = useState<string | null>(null)

  const [topics, setTopics] = useState<Topic[]>([])
  const [topicUserId, setTopicUserId] = useState('1')
  const [topicName, setTopicName] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [topicFormMessage, setTopicFormMessage] = useState<string | null>(null)

  const [editingTopicId, setEditingTopicId] = useState<number | null>(null)
  const [editingTopicName, setEditingTopicName] = useState('')
  const [editingTopicDescription, setEditingTopicDescription] = useState('')

  const [learningLogs, setLearningLogs] = useState<LearningLog[]>([])
  const [logUserId, setLogUserId] = useState('1')
  const [logTopicId, setLogTopicId] = useState('1')
  const [logTitle, setLogTitle] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [isCreatingLog, setIsCreatingLog] = useState(false)
  const [logFormMessage, setLogFormMessage] = useState<string | null>(null)

  const [editingLogId, setEditingLogId] = useState<number | null>(null)
  const [editingLogTitle, setEditingLogTitle] = useState('')
  const [editingLogNotes, setEditingLogNotes] = useState('')

  const [resources, setResources] = useState<Resource[]>([])
  const [resourceUserId, setResourceUserId] = useState('1')
  const [resourceTopicId, setResourceTopicId] = useState('1')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceType, setResourceType] = useState('documentation')
  const [resourceNotes, setResourceNotes] = useState('')
  const [isCreatingResource, setIsCreatingResource] = useState(false)
  const [resourceFormMessage, setResourceFormMessage] = useState<string | null>(null)

  const [editingResourceId, setEditingResourceId] = useState<number | null>(null)
  const [editingResourceTitle, setEditingResourceTitle] = useState('')
  const [editingResourceUrl, setEditingResourceUrl] = useState('')
  const [editingResourceType, setEditingResourceType] = useState('')
  const [editingResourceNotes, setEditingResourceNotes] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch(`${API_BASE_URL}/users`)
        if (!response.ok) throw new Error('Users could not be loaded')
        const data = (await response.json()) as User[]
        setUsers(data)
      } catch (error) {
        console.error('Users could not be loaded:', error)
      }
    }

    async function loadTopics() {
      try {
        const response = await fetch(`${API_BASE_URL}/topics`)
        if (!response.ok) throw new Error('Topics could not be loaded')
        const data = (await response.json()) as Topic[]
        setTopics(data)
      } catch (error) {
        console.error('Topics could not be loaded:', error)
      }
    }

    async function loadLearningLogs() {
      try {
        const response = await fetch(`${API_BASE_URL}/learning-logs`)
        if (!response.ok) throw new Error('Learning logs could not be loaded')
        const data = (await response.json()) as LearningLog[]
        setLearningLogs(data)
      } catch (error) {
        console.error('Learning logs could not be loaded:', error)
      }
    }

    async function loadResources() {
      try {
        const response = await fetch(`${API_BASE_URL}/resources`)
        if (!response.ok) throw new Error('Resources could not be loaded')
        const data = (await response.json()) as Resource[]
        setResources(data)
      } catch (error) {
        console.error('Resources could not be loaded:', error)
      }
    }

    loadUsers()
    loadTopics()
    loadLearningLogs()
    loadResources()
  }, [])

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingUser(true)
    setUserFormMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      })

      if (!response.ok) throw new Error('User could not be created')

      const createdUser = (await response.json()) as User
      setUsers((currentUsers) => [...currentUsers, createdUser])
      setUsername('')
      setEmail('')
      setUserFormMessage('User created successfully.')
    } catch (error) {
      setUserFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    } finally {
      setIsCreatingUser(false)
    }
  }

  async function handleCreateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingTopic(true)
    setTopicFormMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(topicUserId),
          name: topicName,
          description: topicDescription || null,
        }),
      })

      if (!response.ok) throw new Error('Topic could not be created')

      const createdTopic = (await response.json()) as Topic
      setTopics((currentTopics) => [...currentTopics, createdTopic])
      setTopicName('')
      setTopicDescription('')
      setTopicFormMessage('Topic created successfully.')
    } catch (error) {
      setTopicFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    } finally {
      setIsCreatingTopic(false)
    }
  }

  function startEditingTopic(topic: Topic) {
    setEditingTopicId(topic.id)
    setEditingTopicName(topic.name)
    setEditingTopicDescription(topic.description ?? '')
    setTopicFormMessage(null)
  }

  function cancelEditingTopic() {
    setEditingTopicId(null)
    setEditingTopicName('')
    setEditingTopicDescription('')
  }

  async function handleUpdateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingTopicId === null) return

    try {
      const response = await fetch(`${API_BASE_URL}/topics/${editingTopicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTopicName,
          description: editingTopicDescription || null,
        }),
      })

      if (!response.ok) throw new Error('Topic could not be updated')

      const updatedTopic = (await response.json()) as Topic
      setTopics((currentTopics) =>
        currentTopics.map((topic) =>
          topic.id === updatedTopic.id ? updatedTopic : topic,
        ),
      )
      cancelEditingTopic()
      setTopicFormMessage('Topic updated successfully.')
    } catch (error) {
      setTopicFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  async function handleDeleteTopic(topicId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Topic could not be deleted')

      setTopics((currentTopics) =>
        currentTopics.filter((topic) => topic.id !== topicId),
      )
      setTopicFormMessage('Topic deleted successfully.')
    } catch (error) {
      setTopicFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  async function handleCreateLearningLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingLog(true)
    setLogFormMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/learning-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(logUserId),
          topic_id: Number(logTopicId),
          title: logTitle,
          notes: logNotes || null,
        }),
      })

      if (!response.ok) throw new Error('Learning log could not be created')

      const createdLog = (await response.json()) as LearningLog
      setLearningLogs((currentLogs) => [...currentLogs, createdLog])
      setLogTitle('')
      setLogNotes('')
      setLogFormMessage('Learning log created successfully.')
    } catch (error) {
      setLogFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    } finally {
      setIsCreatingLog(false)
    }
  }

  function startEditingLog(log: LearningLog) {
    setEditingLogId(log.id)
    setEditingLogTitle(log.title)
    setEditingLogNotes(log.notes ?? '')
    setLogFormMessage(null)
  }

  function cancelEditingLog() {
    setEditingLogId(null)
    setEditingLogTitle('')
    setEditingLogNotes('')
  }

  async function handleUpdateLearningLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingLogId === null) return

    try {
      const response = await fetch(`${API_BASE_URL}/learning-logs/${editingLogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingLogTitle,
          notes: editingLogNotes || null,
        }),
      })

      if (!response.ok) throw new Error('Learning log could not be updated')

      const updatedLog = (await response.json()) as LearningLog
      setLearningLogs((currentLogs) =>
        currentLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log)),
      )
      cancelEditingLog()
      setLogFormMessage('Learning log updated successfully.')
    } catch (error) {
      setLogFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  async function handleDeleteLearningLog(logId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/learning-logs/${logId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Learning log could not be deleted')

      setLearningLogs((currentLogs) => currentLogs.filter((log) => log.id !== logId))
      setLogFormMessage('Learning log deleted successfully.')
    } catch (error) {
      setLogFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  async function handleCreateResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingResource(true)
    setResourceFormMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(resourceUserId),
          topic_id: Number(resourceTopicId),
          title: resourceTitle,
          url: resourceUrl,
          resource_type: resourceType,
          notes: resourceNotes || null,
        }),
      })

      if (!response.ok) throw new Error('Resource could not be created')

      const createdResource = (await response.json()) as Resource
      setResources((currentResources) => [...currentResources, createdResource])
      setResourceTitle('')
      setResourceUrl('')
      setResourceNotes('')
      setResourceFormMessage('Resource created successfully.')
    } catch (error) {
      setResourceFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    } finally {
      setIsCreatingResource(false)
    }
  }

  function startEditingResource(resource: Resource) {
    setEditingResourceId(resource.id)
    setEditingResourceTitle(resource.title)
    setEditingResourceUrl(resource.url)
    setEditingResourceType(resource.resource_type)
    setEditingResourceNotes(resource.notes ?? '')
    setResourceFormMessage(null)
  }

  function cancelEditingResource() {
    setEditingResourceId(null)
    setEditingResourceTitle('')
    setEditingResourceUrl('')
    setEditingResourceType('')
    setEditingResourceNotes('')
  }

  async function handleUpdateResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingResourceId === null) return

    try {
      const response = await fetch(`${API_BASE_URL}/resources/${editingResourceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingResourceTitle,
          url: editingResourceUrl,
          resource_type: editingResourceType,
          notes: editingResourceNotes || null,
        }),
      })

      if (!response.ok) throw new Error('Resource could not be updated')

      const updatedResource = (await response.json()) as Resource
      setResources((currentResources) =>
        currentResources.map((resource) =>
          resource.id === updatedResource.id ? updatedResource : resource,
        ),
      )
      cancelEditingResource()
      setResourceFormMessage('Resource updated successfully.')
    } catch (error) {
      setResourceFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  async function handleDeleteResource(resourceId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Resource could not be deleted')

      setResources((currentResources) =>
        currentResources.filter((resource) => resource.id !== resourceId),
      )
      setResourceFormMessage('Resource deleted successfully.')
    } catch (error) {
      setResourceFormMessage(error instanceof Error ? error.message : 'Unexpected error')
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-section">
        <p className="eyebrow">SecLab</p>
        <h1>Learning record system</h1>
        <p className="hero-text">
          Track users, topics, learning logs, and resources from one simple
          engineering dashboard.
        </p>
      </section>

      <section className="summary-grid">
        <article className="summary-card">
          <span>Users</span>
          <strong>{users.length}</strong>
          <p>Create and list application users.</p>
        </article>

        <article className="summary-card">
          <span>Topics</span>
          <strong>{topics.length}</strong>
          <p>Topics loaded from the FastAPI backend.</p>
        </article>

        <article className="summary-card">
          <span>Learning Logs</span>
          <strong>{learningLogs.length}</strong>
          <p>Record study notes for each topic.</p>
        </article>

        <article className="summary-card">
          <span>Resources</span>
          <strong>{resources.length}</strong>
          <p>Store useful links and references.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Users</p>
            <h2>Application users</h2>
          </div>
        </div>

        <form className="data-form user-form" onSubmit={handleCreateUser}>
          <label>
            Username
            <input
              type="text"
              maxLength={50}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              maxLength={255}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={isCreatingUser}>
            {isCreatingUser ? 'Creating...' : 'Create user'}
          </button>
        </form>

        {userFormMessage && <p className="status-text">{userFormMessage}</p>}

        {users.length === 0 ? (
          <p className="status-text">No users found.</p>
        ) : (
          <div className="data-list">
            {users.map((user) => (
              <article className="data-card" key={user.id}>
                <h3>{user.username}</h3>
                <p>{user.email}</p>
                <span>User #{user.id}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Topics</p>
            <h2>Backend topics</h2>
          </div>
        </div>

        <form className="data-form topic-form" onSubmit={handleCreateTopic}>
          <label>
            User
            <select
              value={topicUserId}
              onChange={(event) => setTopicUserId(event.target.value)}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </label>

          <label>
            Topic name
            <input
              type="text"
              maxLength={100}
              value={topicName}
              onChange={(event) => setTopicName(event.target.value)}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={topicDescription}
              onChange={(event) => setTopicDescription(event.target.value)}
              rows={3}
            />
          </label>

          <button type="submit" disabled={isCreatingTopic}>
            {isCreatingTopic ? 'Creating...' : 'Create topic'}
          </button>
        </form>

        {topicFormMessage && <p className="status-text">{topicFormMessage}</p>}

        {topics.length === 0 ? (
          <p className="status-text">No topics found.</p>
        ) : (
          <div className="data-list">
            {topics.map((topic) => (
              <article className="data-card" key={topic.id}>
                {editingTopicId === topic.id ? (
                  <form className="edit-form" onSubmit={handleUpdateTopic}>
                    <label>
                      Topic name
                      <input
                        type="text"
                        maxLength={100}
                        value={editingTopicName}
                        onChange={(event) => setEditingTopicName(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Description
                      <textarea
                        value={editingTopicDescription}
                        onChange={(event) =>
                          setEditingTopicDescription(event.target.value)
                        }
                        rows={3}
                      />
                    </label>

                    <div className="card-actions">
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEditingTopic}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{topic.name}</h3>
                    <p>{topic.description ?? 'No description provided.'}</p>
                    <span>User #{topic.user_id}</span>

                    <div className="card-actions">
                      <button type="button" onClick={() => startEditingTopic(topic)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteTopic(topic.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Learning Logs</p>
            <h2>Study records</h2>
          </div>
        </div>

        <form className="data-form log-form" onSubmit={handleCreateLearningLog}>
          <label>
            User
            <select
              value={logUserId}
              onChange={(event) => setLogUserId(event.target.value)}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </label>

          <label>
            Topic
            <select
              value={logTopicId}
              onChange={(event) => setLogTopicId(event.target.value)}
              required
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Title
            <input
              type="text"
              maxLength={150}
              value={logTitle}
              onChange={(event) => setLogTitle(event.target.value)}
              required
            />
          </label>

          <label>
            Notes
            <textarea
              value={logNotes}
              onChange={(event) => setLogNotes(event.target.value)}
              rows={3}
            />
          </label>

          <button type="submit" disabled={isCreatingLog}>
            {isCreatingLog ? 'Creating...' : 'Create log'}
          </button>
        </form>

        {logFormMessage && <p className="status-text">{logFormMessage}</p>}

        {learningLogs.length === 0 ? (
          <p className="status-text">No learning logs found.</p>
        ) : (
          <div className="data-list">
            {learningLogs.map((log) => (
              <article className="data-card" key={log.id}>
                {editingLogId === log.id ? (
                  <form className="edit-form" onSubmit={handleUpdateLearningLog}>
                    <label>
                      Title
                      <input
                        type="text"
                        maxLength={150}
                        value={editingLogTitle}
                        onChange={(event) => setEditingLogTitle(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Notes
                      <textarea
                        value={editingLogNotes}
                        onChange={(event) => setEditingLogNotes(event.target.value)}
                        rows={3}
                      />
                    </label>

                    <div className="card-actions">
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEditingLog}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{log.title}</h3>
                    <p>{log.notes ?? 'No notes provided.'}</p>
                    <div className="card-meta">
                      <span>User #{log.user_id}</span>
                      <span>Topic #{log.topic_id}</span>
                      <span>{log.study_date}</span>
                    </div>

                    <div className="card-actions">
                      <button type="button" onClick={() => startEditingLog(log)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteLearningLog(log.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Resources</p>
            <h2>Helpful links</h2>
          </div>
        </div>

        <form className="data-form resource-form" onSubmit={handleCreateResource}>
          <label>
            User
            <select
              value={resourceUserId}
              onChange={(event) => setResourceUserId(event.target.value)}
              required
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </label>

          <label>
            Topic
            <select
              value={resourceTopicId}
              onChange={(event) => setResourceTopicId(event.target.value)}
              required
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Title
            <input
              type="text"
              maxLength={150}
              value={resourceTitle}
              onChange={(event) => setResourceTitle(event.target.value)}
              required
            />
          </label>

          <label>
            URL
            <input
              type="url"
              value={resourceUrl}
              onChange={(event) => setResourceUrl(event.target.value)}
              required
            />
          </label>

          <label>
            Type
            <input
              type="text"
              maxLength={50}
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value)}
              required
            />
          </label>

          <label>
            Notes
            <textarea
              value={resourceNotes}
              onChange={(event) => setResourceNotes(event.target.value)}
              rows={3}
            />
          </label>

          <button type="submit" disabled={isCreatingResource}>
            {isCreatingResource ? 'Creating...' : 'Create resource'}
          </button>
        </form>

        {resourceFormMessage && <p className="status-text">{resourceFormMessage}</p>}

        {resources.length === 0 ? (
          <p className="status-text">No resources found.</p>
        ) : (
          <div className="data-list">
            {resources.map((resource) => (
              <article className="data-card" key={resource.id}>
                {editingResourceId === resource.id ? (
                  <form className="edit-form" onSubmit={handleUpdateResource}>
                    <label>
                      Title
                      <input
                        type="text"
                        maxLength={150}
                        value={editingResourceTitle}
                        onChange={(event) =>
                          setEditingResourceTitle(event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      URL
                      <input
                        type="url"
                        value={editingResourceUrl}
                        onChange={(event) => setEditingResourceUrl(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Type
                      <input
                        type="text"
                        maxLength={50}
                        value={editingResourceType}
                        onChange={(event) => setEditingResourceType(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Notes
                      <textarea
                        value={editingResourceNotes}
                        onChange={(event) =>
                          setEditingResourceNotes(event.target.value)
                        }
                        rows={3}
                      />
                    </label>

                    <div className="card-actions">
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEditingResource}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{resource.title}</h3>
                    <p>
                      <a href={resource.url} target="_blank" rel="noreferrer">
                        {resource.url}
                      </a>
                    </p>
                    <p>{resource.notes ?? 'No notes provided.'}</p>
                    <div className="card-meta">
                      <span>Type: {resource.resource_type}</span>
                      <span>User #{resource.user_id}</span>
                      <span>Topic #{resource.topic_id}</span>
                    </div>

                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => startEditingResource(resource)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(resource.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App