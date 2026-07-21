import { useEffect, useState, type FormEvent } from 'react'
import {
  createLearningLog,
  createResource,
  createTopic,
  createUser,
  deleteLearningLog,
  deleteResource,
  deleteTopic,
  deleteUser,
  fetchLearningLogs,
  fetchResources,
  fetchTopics,
  fetchUsers,
  updateLearningLog,
  updateResource,
  updateTopic,
  updateUser,
  type LearningLog,
  type Resource,
  type Topic,
  type User,
} from './api'
import './App.css'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [userFormMessage, setUserFormMessage] = useState<string | null>(null)

  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editingUsername, setEditingUsername] = useState('')
  const [editingEmail, setEditingEmail] = useState('')
  const [userSearch, setUserSearch] = useState('')

  const [topics, setTopics] = useState<Topic[]>([])
  const [topicUserId, setTopicUserId] = useState('')
  const [topicName, setTopicName] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [topicFormMessage, setTopicFormMessage] = useState<string | null>(null)

  const [editingTopicId, setEditingTopicId] = useState<number | null>(null)
  const [editingTopicName, setEditingTopicName] = useState('')
  const [editingTopicDescription, setEditingTopicDescription] = useState('')

  const [learningLogs, setLearningLogs] = useState<LearningLog[]>([])
  const [logUserId, setLogUserId] = useState('')
  const [logTopicId, setLogTopicId] = useState('')
  const [logTitle, setLogTitle] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [isCreatingLog, setIsCreatingLog] = useState(false)
  const [logFormMessage, setLogFormMessage] = useState<string | null>(null)

  const [editingLogId, setEditingLogId] = useState<number | null>(null)
  const [editingLogTitle, setEditingLogTitle] = useState('')
  const [editingLogNotes, setEditingLogNotes] = useState('')

  const [resources, setResources] = useState<Resource[]>([])
  const [resourceUserId, setResourceUserId] = useState('')
  const [resourceTopicId, setResourceTopicId] = useState('')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceUrl, setResourceUrl] = useState('')
  const [resourceType, setResourceType] = useState('documentation')
  const [resourceNotes, setResourceNotes] = useState('')
  const [isCreatingResource, setIsCreatingResource] = useState(false)
  const [resourceFormMessage, setResourceFormMessage] = useState<string | null>(
    null,
  )

  const [editingResourceId, setEditingResourceId] = useState<number | null>(
    null,
  )
  const [editingResourceTitle, setEditingResourceTitle] = useState('')
  const [editingResourceUrl, setEditingResourceUrl] = useState('')
  const [editingResourceType, setEditingResourceType] = useState('')
  const [editingResourceNotes, setEditingResourceNotes] = useState('')

  const [topicSearch, setTopicSearch] = useState('')
  const [selectedLogTopicFilter, setSelectedLogTopicFilter] = useState('all')
  const [selectedResourceTopicFilter, setSelectedResourceTopicFilter] =
    useState('all')
  const [selectedResourceTypeFilter, setSelectedResourceTypeFilter] =
    useState('all')

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchUsers()
        setUsers(data)
      } catch (error) {
        console.error('Users could not be loaded:', error)
      }
    }

    async function loadTopics() {
      try {
        const data = await fetchTopics()
        setTopics(data)
      } catch (error) {
        console.error('Topics could not be loaded:', error)
      }
    }

    async function loadLearningLogs() {
      try {
        const data = await fetchLearningLogs()
        setLearningLogs(data)
      } catch (error) {
        console.error('Learning logs could not be loaded:', error)
      }
    }

    async function loadResources() {
      try {
        const data = await fetchResources()
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

  const userNameById = new Map(users.map((user) => [user.id, user.username]))
  const topicNameById = new Map(topics.map((topic) => [topic.id, topic.name]))

  const hasUsers = users.length > 0
  const hasTopics = topics.length > 0

  const selectedTopicUserId = users.some(
    (user) => user.id.toString() === topicUserId,
  )
    ? topicUserId
    : (users[0]?.id.toString() ?? '')

  const selectedLogUserId = users.some(
    (user) => user.id.toString() === logUserId,
  )
    ? logUserId
    : (users[0]?.id.toString() ?? '')

  const selectedLogTopicId = topics.some(
    (topic) => topic.id.toString() === logTopicId,
  )
    ? logTopicId
    : (topics[0]?.id.toString() ?? '')

  const selectedResourceUserId = users.some(
    (user) => user.id.toString() === resourceUserId,
  )
    ? resourceUserId
    : (users[0]?.id.toString() ?? '')

  const selectedResourceTopicId = topics.some(
    (topic) => topic.id.toString() === resourceTopicId,
  )
    ? resourceTopicId
    : (topics[0]?.id.toString() ?? '')

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()),
  )

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase()),
  )

  const filteredLearningLogs = learningLogs.filter((log) => {
    if (selectedLogTopicFilter === 'all') {
      return true
    }

    return log.topic_id === Number(selectedLogTopicFilter)
  })

  const resourceTypes = Array.from(
    new Set(resources.map((resource) => resource.resource_type)),
  ).sort()

  const filteredResources = resources.filter((resource) => {
    const matchesTopic =
      selectedResourceTopicFilter === 'all' ||
      resource.topic_id === Number(selectedResourceTopicFilter)

    const matchesType =
      selectedResourceTypeFilter === 'all' ||
      resource.resource_type === selectedResourceTypeFilter

    return matchesTopic && matchesType
  })

  function getUserLabel(userId: number) {
    return userNameById.get(userId) ?? `User #${userId}`
  }

  function getTopicLabel(topicId: number) {
    return topicNameById.get(topicId) ?? `Topic #${topicId}`
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingUser(true)
    setUserFormMessage(null)

    try {
      const createdUser = await createUser({
        username,
        email,
      })

      setUsers((currentUsers) => [...currentUsers, createdUser])
      setUsername('')
      setEmail('')
      setUserFormMessage('User created successfully.')
    } catch (error) {
      setUserFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    } finally {
      setIsCreatingUser(false)
    }
  }

  function startEditingUser(user: User) {
    setEditingUserId(user.id)
    setEditingUsername(user.username)
    setEditingEmail(user.email)
    setUserFormMessage(null)
  }

  function cancelEditingUser() {
    setEditingUserId(null)
    setEditingUsername('')
    setEditingEmail('')
  }

  async function handleUpdateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (editingUserId === null) {
      return
    }

    try {
      const updatedUser = await updateUser(editingUserId, {
        username: editingUsername,
        email: editingEmail,
      })

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      )
      cancelEditingUser()
      setUserFormMessage('User updated successfully.')
    } catch (error) {
      setUserFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!window.confirm('Delete this user?')) {
      return
    }

    try {
      await deleteUser(userId)

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      )
      
      cancelEditingUser()
      cancelEditingTopic()
      cancelEditingLog()
      cancelEditingResource()

      setUserFormMessage('User deleted successfully.')
    } catch (error) {
      setUserFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  async function handleCreateTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingTopic(true)
    setTopicFormMessage(null)

    try {
      const createdTopic = await createTopic({
        user_id: Number(selectedTopicUserId),
        name: topicName,
        description: topicDescription || null,
      })

      setTopics((currentTopics) => [...currentTopics, createdTopic])
      setTopicName('')
      setTopicDescription('')
      setTopicFormMessage('Topic created successfully.')
    } catch (error) {
      setTopicFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
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

    if (editingTopicId === null) {
      return
    }

    try {
      const updatedTopic = await updateTopic(editingTopicId, {
        name: editingTopicName,
        description: editingTopicDescription || null,
      })

      setTopics((currentTopics) =>
        currentTopics.map((topic) =>
          topic.id === updatedTopic.id ? updatedTopic : topic,
        ),
      )
      cancelEditingTopic()
      setTopicFormMessage('Topic updated successfully.')
    } catch (error) {
      setTopicFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  async function handleDeleteTopic(topicId: number) {
    if (!window.confirm('Delete this topic?')) {
      return
    }

    try {
      await deleteTopic(topicId)

      setTopics((currentTopics) =>
        currentTopics.filter((topic) => topic.id !== topicId),
      )
      
      setLearningLogs((currentLogs) =>
        currentLogs.filter((log) => log.topic_id !== topicId),
      )
      
      setResources((currentResources) =>
        currentResources.filter((resource) => resource.topic_id !== topicId),
      )

      setSelectedLogTopicFilter((currentFilter) =>
        currentFilter === topicId.toString() ? 'all' : currentFilter,
      )
      setSelectedResourceTopicFilter((currentFilter) =>
        currentFilter === topicId.toString() ? 'all' : currentFilter,
      )
      setLogTopicId((currentTopicId) =>
        currentTopicId === topicId.toString() ? '' : currentTopicId,
      )
      setResourceTopicId((currentTopicId) =>
        currentTopicId === topicId.toString() ? '' : currentTopicId,
      )
      
      cancelEditingTopic()
      cancelEditingLog()
      cancelEditingResource()

      setTopicFormMessage('Topic deleted successfully.')
    } catch (error) {
      setTopicFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  async function handleCreateLearningLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingLog(true)
    setLogFormMessage(null)

    try {
      const createdLog = await createLearningLog({
        user_id: Number(selectedLogUserId),
        topic_id: Number(selectedLogTopicId),
        title: logTitle,
        notes: logNotes || null,
      })

      setLearningLogs((currentLogs) => [...currentLogs, createdLog])
      setLogTitle('')
      setLogNotes('')
      setLogFormMessage('Learning log created successfully.')
    } catch (error) {
      setLogFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
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

    if (editingLogId === null) {
      return
    }

    try {
      const updatedLog = await updateLearningLog(editingLogId, {
        title: editingLogTitle,
        notes: editingLogNotes || null,
      })

      setLearningLogs((currentLogs) =>
        currentLogs.map((log) => (log.id === updatedLog.id ? updatedLog : log)),
      )
      cancelEditingLog()
      setLogFormMessage('Learning log updated successfully.')
    } catch (error) {
      setLogFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  async function handleDeleteLearningLog(logId: number) {
    if (!window.confirm('Delete this learning log?')) {
      return
    }

    try {
      await deleteLearningLog(logId)

      setLearningLogs((currentLogs) =>
        currentLogs.filter((log) => log.id !== logId),
      )
      setLogFormMessage('Learning log deleted successfully.')
    } catch (error) {
      setLogFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  async function handleCreateResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingResource(true)
    setResourceFormMessage(null)

    try {
      const createdResource = await createResource({
        user_id: Number(selectedResourceUserId),
        topic_id: Number(selectedResourceTopicId),
        title: resourceTitle,
        url: resourceUrl,
        resource_type: resourceType,
        notes: resourceNotes || null,
      })

      setResources((currentResources) => [...currentResources, createdResource])
      setResourceTitle('')
      setResourceUrl('')
      setResourceNotes('')
      setResourceFormMessage('Resource created successfully.')
    } catch (error) {
      setResourceFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
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

    if (editingResourceId === null) {
      return
    }

    try {
      const updatedResource = await updateResource(editingResourceId, {
        title: editingResourceTitle,
        url: editingResourceUrl,
        resource_type: editingResourceType,
        notes: editingResourceNotes || null,
      })

      setResources((currentResources) =>
        currentResources.map((resource) =>
          resource.id === updatedResource.id ? updatedResource : resource,
        ),
      )
      cancelEditingResource()
      setResourceFormMessage('Resource updated successfully.')
    } catch (error) {
      setResourceFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
    }
  }

  async function handleDeleteResource(resourceId: number) {
    if (!window.confirm('Delete this resource?')) {
      return
    }

    try {
      await deleteResource(resourceId)

      setResources((currentResources) =>
        currentResources.filter((resource) => resource.id !== resourceId),
      )
      setResourceFormMessage('Resource deleted successfully.')
    } catch (error) {
      setResourceFormMessage(
        error instanceof Error ? error.message : 'Unexpected error',
      )
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
          <p>Create, search, edit, and delete application users.</p>
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

        <label className="search-field">
          Search users
          <input
            type="search"
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            placeholder="Search by username or email"
          />
        </label>

        {filteredUsers.length === 0 ? (
          <p className="status-text">No users found.</p>
        ) : (
          <div className="data-list">
            {filteredUsers.map((user) => (
              <article className="data-card" key={user.id}>
                {editingUserId === user.id ? (
                  <form className="edit-form" onSubmit={handleUpdateUser}>
                    <label>
                      Username
                      <input
                        type="text"
                        maxLength={50}
                        value={editingUsername}
                        onChange={(event) => setEditingUsername(event.target.value)}
                        required
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        maxLength={255}
                        value={editingEmail}
                        onChange={(event) => setEditingEmail(event.target.value)}
                        required
                      />
                    </label>

                    <div className="card-actions">
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEditingUser}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{user.username}</h3>
                    <p>{user.email}</p>
                    <span>User #{user.id}</span>

                    <div className="card-actions">
                      <button type="button" onClick={() => startEditingUser(user)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDeleteUser(user.id)}>
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
            <p className="eyebrow">Topics</p>
            <h2>Backend topics</h2>
          </div>
        </div>

        <form className="data-form topic-form" onSubmit={handleCreateTopic}>
          <label>
            User
            <select
              value={selectedTopicUserId}
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

          <button type="submit" disabled={isCreatingTopic || !hasUsers}>
            {isCreatingTopic ? 'Creating...' : 'Create topic'}
          </button>
        </form>

        {!hasUsers && (
          <p className="status-text">Create a user before adding topics.</p>
        )}

        <label className="filter-control">
          Search topics
          <input
            type="search"
            value={topicSearch}
            onChange={(event) => setTopicSearch(event.target.value)}
            placeholder="Search by topic name"
          />
        </label>

        {topicFormMessage && <p className="status-text">{topicFormMessage}</p>}

        {filteredTopics.length === 0 ? (
          <p className="status-text">No topics found.</p>
        ) : (
          <div className="data-list">
            {filteredTopics.map((topic) => (
              <article className="data-card" key={topic.id}>
                {editingTopicId === topic.id ? (
                  <form className="edit-form" onSubmit={handleUpdateTopic}>
                    <label>
                      Topic name
                      <input
                        type="text"
                        maxLength={100}
                        value={editingTopicName}
                        onChange={(event) =>
                          setEditingTopicName(event.target.value)
                        }
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
                    <span>User: {getUserLabel(topic.user_id)}</span>

                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => startEditingTopic(topic)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTopic(topic.id)}
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
              value={selectedLogUserId}
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
              value={selectedLogTopicId}
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

          <button
            type="submit"
            disabled={isCreatingLog || !hasUsers || !hasTopics}
          >
            {isCreatingLog ? 'Creating...' : 'Create log'}
          </button>
        </form>

        {(!hasUsers || !hasTopics) && (
          <p className="status-text">
            Create a user and topic before adding learning logs.
          </p>
        )}

        <label className="filter-control">
          Filter logs by topic
          <select
            value={selectedLogTopicFilter}
            onChange={(event) => setSelectedLogTopicFilter(event.target.value)}
          >
            <option value="all">All topics</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>

        {logFormMessage && <p className="status-text">{logFormMessage}</p>}

        {filteredLearningLogs.length === 0 ? (
          <p className="status-text">No learning logs found.</p>
        ) : (
          <div className="data-list">
            {filteredLearningLogs.map((log) => (
              <article className="data-card" key={log.id}>
                {editingLogId === log.id ? (
                  <form className="edit-form" onSubmit={handleUpdateLearningLog}>
                    <label>
                      Title
                      <input
                        type="text"
                        maxLength={150}
                        value={editingLogTitle}
                        onChange={(event) =>
                          setEditingLogTitle(event.target.value)
                        }
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
                      <span>User: {getUserLabel(log.user_id)}</span>
                      <span>Topic: {getTopicLabel(log.topic_id)}</span>
                      <span>{log.study_date}</span>
                    </div>

                    <div className="card-actions">
                      <button type="button" onClick={() => startEditingLog(log)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLearningLog(log.id)}
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
              value={selectedResourceUserId}
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
              value={selectedResourceTopicId}
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

          <button
            type="submit"
            disabled={isCreatingResource || !hasUsers || !hasTopics}
          >
            {isCreatingResource ? 'Creating...' : 'Create resource'}
          </button>
        </form>

        {(!hasUsers || !hasTopics) && (
          <p className="status-text">
            Create a user and topic before adding resources.
          </p>
        )}

        <div className="filter-row">
          <label className="filter-control">
            Filter resources by topic
            <select
              value={selectedResourceTopicFilter}
              onChange={(event) =>
                setSelectedResourceTopicFilter(event.target.value)
              }
            >
              <option value="all">All topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            Filter resources by type
            <select
              value={selectedResourceTypeFilter}
              onChange={(event) =>
                setSelectedResourceTypeFilter(event.target.value)
              }
            >
              <option value="all">All types</option>
              {resourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        {resourceFormMessage && (
          <p className="status-text">{resourceFormMessage}</p>
        )}

        {filteredResources.length === 0 ? (
          <p className="status-text">No resources found.</p>
        ) : (
          <div className="data-list">
            {filteredResources.map((resource) => (
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
                        onChange={(event) =>
                          setEditingResourceUrl(event.target.value)
                        }
                        required
                      />
                    </label>

                    <label>
                      Type
                      <input
                        type="text"
                        maxLength={50}
                        value={editingResourceType}
                        onChange={(event) =>
                          setEditingResourceType(event.target.value)
                        }
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
                      <span>User: {getUserLabel(resource.user_id)}</span>
                      <span>Topic: {getTopicLabel(resource.topic_id)}</span>
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