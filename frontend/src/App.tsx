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
  
  const [topicUserId, setTopicUserId] = useState('1')
  const [topicName, setTopicName] = useState('')
  const [topicDescription, setTopicDescription] = useState('')

  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await fetch(`${API_BASE_URL}/topics`)
        const data = await response.json()
        setTopics(data)
      } catch (error) {
        console.error("Backend'den veriler çekilemedi:", error)
      }
    }

    loadTopics()
  }, [])

  async function handleCreateTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

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

      if (response.ok) {
        const createdTopic = await response.json()
        
        setTopics([...topics, createdTopic])
        
        setTopicName('')
        setTopicDescription('')
        alert("Konu başarıyla oluşturuldu!")
      } else {
        alert("Konu oluşturulurken backend bir hata döndürdü.")
      }

    } catch (error) {
      console.error("İstek atılırken hata oluştu:", error)
      alert("Beklenmeyen bir hata oluştu.")
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

        <form className="topic-form" onSubmit={handleCreateTopic}>
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

          <button type="submit">Create topic</button>
        </form>

        <div className="topic-list">
          {topics.map((topic) => (
            <article className="topic-card" key={topic.id}>
              <h3>{topic.name}</h3>
              <p>{topic.description ?? 'No description provided.'}</p>
              <span>User #{topic.user_id}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App