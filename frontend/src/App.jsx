import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch("http://localhost:3001/api/evaluations")
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Error:", err)
        setError('Unable to load results')
      })
  }, [])

  const latestMessage = messages[messages.length - 1]

  return (
    <div>
      <h1>Vibes-Based Lending Co.</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <p>Total messages: {messages.length}</p>
          <p>
            Latest outcome: {latestMessage ? latestMessage.outcome : 'No messages yet'}
          </p>
        </>
      )}
    </div>
  )
}

export default App
