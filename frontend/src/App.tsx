import { useEffect, useState } from 'react'
import './App.css'

type Topic = {
  id: number
  user_id: number
  name: string
  description: string | null
  created_at: string
}

const API_BASE_URL = 'http://127.0.0.1:8000'

function App() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
        setErrorMessage(
          error instanceof Error ? error.message : 'Unexpected error',
        )
      } finally {
        console.log('topics request finished')
        setIsLoading(false)
      }
    }

    loadTopics()
  }, [])

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
          <strong>Ready</strong>
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

        {isLoading && <p className="status-text">Loading topics...</p>}

        {errorMessage && <p className="error-text">{errorMessage}</p>}

        {!isLoading && !errorMessage && topics.length === 0 && (
          <p className="status-text">No topics found.</p>
        )}

        {!isLoading && !errorMessage && topics.length > 0 && (
          <div className="topic-list">
            {topics.map((topic) => (
              <article className="topic-card" key={topic.id}>
                <h3>{topic.name}</h3>
                <p>{topic.description ?? 'No description provided.'}</p>
                <span>User #{topic.user_id}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default App