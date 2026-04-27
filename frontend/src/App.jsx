import { useState, useEffect } from 'react'
import './App.css'

const blankForm = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  ssn: '',
  email: '',
  dob: '',
}

function App() {
  const [messages, setMessages] = useState([])
  const [formData, setFormData] = useState(blankForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    fetch('http://localhost:3001/api/evaluations')
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setError('Vibes are BAD, because my API call didn\'t return as expected 💅\n NO LOANS FOR YOU!'))
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    let normalizedValue = value

    if (name === 'state' || name === 'country') {
      normalizedValue = value.toUpperCase()
    }

    if (name === 'dob') {
      normalizedValue = value.replace(/[^\d-]/g, '').slice(0, 10)
    }

    setFormData(prev => ({ ...prev, [name]: normalizedValue }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSubmitMessage('')
    if (!/^[A-Za-z]{2}$/.test(formData.state)) {
      setError('State must be a 2-letter code (e.g. \'CA\')')
      return
    }
    if (!/^[A-Za-z]{2}$/.test(formData.country)) {
      setError('Country must be a 2-letter code (e.g. \'US\')')
      return
    }
    if (!/^\d{9}$/.test(formData.ssn)) {
      setError('SSN must be exactly 9 digits')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
      setError('Date of birth must be in ISO 8601 format (YYYY-MM-DD)')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const payload = await res.json()
      if (!res.ok) {
        throw new Error(payload?.error || 'Failed to submit form data')
      }

      setSubmitMessage(`Form data submitted. Outcome: ${payload.outcome || 'Unknown'}`)
      setFormData(blankForm)

      const latest = await fetch('http://localhost:3001/api/evaluations')
      const list = await latest.json()
      setMessages(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.message || 'Vibes are BAD, because my API call didn\'t return as expected 💅\n NO LOANS FOR YOU!')
    } finally {
      setLoading(false)
    }
  }

  const latestMessage = messages[messages.length - 1]

  return (
    <div>
      <h1>Vibes-Based Lending Co.</h1>
      <form onSubmit={handleSubmit}>
        <p>
          <input name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required />
        </p>
        <p>
          <input name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required />
        </p>
        <p>
          <input name="addressLine1" placeholder="Address line 1" value={formData.addressLine1} onChange={handleChange} required />
        </p>
        <p>
          <input name="addressLine2" placeholder="Address line 2 (optional)" value={formData.addressLine2} onChange={handleChange} />
        </p>
        <p>
          <input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        </p>
        <p>
          <input name="state" placeholder="State (2 letters)" value={formData.state} onChange={handleChange} minLength={2} maxLength={2} pattern="[A-Za-z]{2}" required />
        </p>
        <p>
          <input name="zip" placeholder="ZIP code" value={formData.zip} onChange={handleChange} required />
        </p>
        <p>
          <input name="country" placeholder="Country code (e.g. US)" value={formData.country} onChange={handleChange} minLength={2} maxLength={2} pattern="[A-Za-z]{2}" required />
        </p>
        <p>
          <input name="ssn" placeholder="SSN (9 digits)" value={formData.ssn} onChange={handleChange} inputMode="numeric" minLength={9} maxLength={9} pattern="\d{9}" required />
        </p>
        <p>
          <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        </p>
        <p>
          <input name="dob" type="text" placeholder="Date of birth (YYYY-MM-DD)" value={formData.dob} onChange={handleChange} inputMode="numeric" maxLength={10} pattern="\d{4}-\d{2}-\d{2}" required />
        </p>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting' : 'Submit form data'}
        </button>
      </form>

      {submitMessage ? <p>{submitMessage}</p> : null}

      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <p>Total calls: {messages.length}</p>
          <p>
            Latest outcome: {latestMessage ? latestMessage.outcome : 'No records yet'}
          </p>
          {latestMessage?.createdAt ? (
            <p>Latest submitted at: {new Date(latestMessage.createdAt).toLocaleString()}</p>
          ) : null}
        </>
      )}
    </div>
  )
}

export default App
