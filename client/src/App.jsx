import { useEffect, useState } from "react"
import axios from "./api/axios"

const App = () => {
  const [message, setMessage] = useState("Connecting to backend...")

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await axios.get("/api/health")
        setMessage(response.data.message)
      } catch (error) {
        setMessage("Unable to connect to backend.")
      }
    }

    fetchHealth()
  }, [])

  return (
    <main className="app-shell">
      <section className="status-card">
        <p className="status-label">Helios</p>
        <h1>{message}</h1>
      </section>
    </main>
  )
}

export default App