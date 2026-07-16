import { useEffect, useState } from 'react'
import './App.css'

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

const API_BASE_URL = 'http://127.0.0.1:8000'

function App() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicUserId, setTopicUserId] = useState('1')
  const [topicName, setTopicName] = useState('')
  const [topicDescription, setTopicDescription] = useState('')
  const [isCreatingTopic, setIsCreatingTopic] = useState(false)
  const [topicFormMessage, setTopicFormMessage] = useState<string | null>(null)

  const [learningLogs, setLearningLogs] = useState<LearningLog[]>([])
  const [logUserId, setLogUserId] = useState('1')
  const [logTopicId, setLogTopicId] = useState('1')
  const [logTitle, setLogTitle] = useState('')
  const [logNotes, setLogNotes] = useState('')
  const [isCreatingLog, setIsCreatingLog] = useState(false)
  const [logFormMessage, setLogFormMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch(`${API_BASE_URL}/topics`)
        if (!response.ok) {
          throw new Error('Topics could not be loaded')
        }
        const data = (await response.json()) as Topic[]
        setTopics(data)
      } catch (error) {
        console.error('Topics could not be loaded:', error)
      }
    }

    async function loadLearningLogs() {
      try {
        const response = await fetch(`${API_BASE_URL}/learning-logs`)
        if (!response.ok) {
          throw new Error('Learning logs could not be loaded')
        }
        const data = (await response.json()) as LearningLog[]
        setLearningLogs(data)
      } catch (error) {
        console.error('Learning logs could not be loaded:', error)
      }
    }

    loadTopics()
    loadLearningLogs()
  }, [])

  async function handleCreateTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsCreatingTopic(true)
    setTopicFormMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/topics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: Number(topicUserId),
          name: topicName,
          description: topicDescription || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Topic could not be created')
      }

      const createdTopic = (await response.json()) as Topic
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

  async function handleCreateLearningLog(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setIsCreatingLog(true)
    setLogFormMessage(null)

    try {
      const response = await fetch(`${API_BASE_URL}/learning-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: Number(logUserId),
          topic_id: Number(logTopicId),
          title: logTitle,
          notes: logNotes || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Learning log could not be created')
      }

      const createdLog = (await response.json()) as LearningLog
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
          <strong>Ready</strong>
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
          <strong>Ready</strong>
          <p>Store useful links and references.</p>
        </article>
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
            User ID
            <input
              type="number"
              min="1"
              value={topicUserId}
              onChange={(event) => setTopicUserId(event.target.value)}
              required
            />
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
                <h3>{topic.name}</h3>
                <p>{topic.description ?? 'No description provided.'}</p>
                <span>User #{topic.user_id}</span>
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
            User ID
            <input
              type="number"
              min="1"
              value={logUserId}
              onChange={(event) => setLogUserId(event.target.value)}
              required
            />
          </label>

          <label>
            Topic ID
            <input
              type="number"
              min="1"
              value={logTopicId}
              onChange={(event) => setLogTopicId(event.target.value)}
              required
            />
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
                <h3>{log.title}</h3>
                <p>{log.notes ?? 'No notes provided.'}</p>
                <div className="card-meta">
                  <span>User #{log.user_id}</span>
                  <span>Topic #{log.topic_id}</span>
                  <span>{log.study_date}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App