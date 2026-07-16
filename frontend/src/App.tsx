import './App.css'

function App() {
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
          <strong>Ready</strong>
          <p>Track learning topics with CRUD endpoints.</p>
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
    </main>
  )
}

export default App