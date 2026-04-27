import { useState } from 'react'
import './App.css'

const empty = {
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

// Dev: Vite on 5173, API on 3001. Production (e.g. Railway): same host, use relative /api
const api = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

function App() {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [outcome, setOutcome] = useState('')

  function onChange(e) {
    const { name, value } = e.target
    let v = value
    if (name === 'state' || name === 'country') v = value.toUpperCase()
    if (name === 'dob') v = value.replace(/[^\d-]/g, '').slice(0, 10)
    setForm(f => ({ ...f, [name]: v }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!/^[A-Za-z]{2}$/.test(form.state)) {
      setError('State: 2 letters (e.g. NY)')
      return
    }
    if (!/^[A-Za-z]{2}$/.test(form.country)) {
      setError('Country: 2 letters (e.g. US)')
      return
    }
    if (!/^\d{9}$/.test(form.ssn)) {
      setError('SSN: 9 digits')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
      setError('DOB: YYYY-MM-DD')
      return
    }

    setBusy(true)
    try {
      const res = await fetch(`${api}/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(
          data?.details || data?.error?.message || data?.error || `HTTP ${res.status}`
        )
      }
      setOutcome(String(data.outcome ?? ''))
      setForm(empty)
      setShowResult(true)
    } catch (err) {
      setError(err.message || 'Submit failed')
    } finally {
      setBusy(false)
    }
  }

  const o = outcome.trim()
  const approved = /^approved$/i.test(o)
  const manual = /manual\s*review/i.test(o)
  const denied = /^denied$/i.test(o)

  if (showResult) {
    return (
      <div className="wrap">
        <h1>Vibes-Based Lending Co.</h1>
        {approved && (
          <div className="result ok">
            <p className="big">Success! 🎉🎉🎉</p>
            <p>Your account is set up.</p>
          </div>
        )}
        {manual && (
          <div className="result wait">
            <p>Thanks for submitting your application, we’ll be in touch shortly.</p>
          </div>
        )}
        {denied && (
          <div className="result bad">
            <p>Sorry, your application was not successful.</p>
          </div>
        )}
        {!approved && !manual && !denied && (
          <div className="result">
            <p>Outcome: {o || 'Unknown'}</p>
          </div>
        )}
        <p>
          <button type="button" onClick={() => { setShowResult(false); setOutcome('') }}>
            New application
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="wrap">
      <h1>Vibes-Based Lending Co.</h1>
      <form onSubmit={onSubmit}>
        <p><input name="firstName" value={form.firstName} onChange={onChange} placeholder="First name" required /></p>
        <p>
          <input
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            placeholder="Last name (sandbox: Review or Deny)"
            required
          />
        </p>
        <p><input name="addressLine1" value={form.addressLine1} onChange={onChange} placeholder="Address line 1" required /></p>
        <p><input name="addressLine2" value={form.addressLine2} onChange={onChange} placeholder="Address line 2" /></p>
        <p><input name="city" value={form.city} onChange={onChange} placeholder="City" required /></p>
        <p>
          <input
            name="state"
            value={form.state}
            onChange={onChange}
            placeholder="State"
            minLength={2}
            maxLength={2}
            pattern="[A-Za-z]{2}"
            required
          />
        </p>
        <p><input name="zip" value={form.zip} onChange={onChange} placeholder="ZIP" required /></p>
        <p>
          <input
            name="country"
            value={form.country}
            onChange={onChange}
            placeholder="Country"
            minLength={2}
            maxLength={2}
            pattern="[A-Za-z]{2}"
            required
          />
        </p>
        <p>
          <input
            name="ssn"
            value={form.ssn}
            onChange={onChange}
            placeholder="SSN"
            inputMode="numeric"
            minLength={9}
            maxLength={9}
            pattern="\d{9}"
            required
          />
        </p>
        <p><input name="email" type="email" value={form.email} onChange={onChange} placeholder="Email" required /></p>
        <p>
          <input
            name="dob"
            value={form.dob}
            onChange={onChange}
            placeholder="DOB (YYYY-MM-DD)"
            inputMode="numeric"
            maxLength={10}
            pattern="\d{4}-\d{2}-\d{2}"
            required
          />
        </p>
        <button type="submit" disabled={busy}>{busy ? '…' : 'Submit'}</button>
      </form>
      {error ? <p className="err">{error}</p> : null}
    </div>
  )
}

export default App
