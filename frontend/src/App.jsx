import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch("http://localhost:3001/api/message")
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error("Error:", error));
  }, []);

  return (
    <div>
      <h1>Hello World App</h1>
      <p>{message}</p>
    </div>
  );
}

export default App
