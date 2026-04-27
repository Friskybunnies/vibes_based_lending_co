import { useState } from 'react'
import './App.css'
import partnerImg from './assets/official-lender.png'

function Shell({ children }) {
  return (
    <div className="app-layout">
      <div className="partner-gutter">
        <aside className="partner" aria-label="Partner">
          <img
            className="partner__img"
            src={partnerImg}
            alt="Official lending partner"
            width={192}
            height={192}
          />
          <p className="partner__caption">Your Official Lending Partner</p>
        </aside>
      </div>
      <div className="app-layout__main">{children}</div>
      <div className="layout-spacer" aria-hidden="true" />
    </div>
  )
}

const start = {
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

const api = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

export default function App() {
  const [form, setForm] = useState(start)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [outcome, setOutcome] = useState('')

  function onChange(e) {
    const { name, value } = e.target
    let v = value
    if (name === 'state') v = value.toUpperCase()
    if (name === 'dob') v = value.replace(/[^\d-]/g, '').slice(0, 10)
    setForm(f => ({ ...f, [name]: v }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!/^[A-Za-z]{2}$/.test(form.state)) {
      setError('State should be 2 letters (like NY)')
      return
    }
    if (form.country !== 'US') {
      setError('Country must be US')
      return
    }
    if (!/^\d{9}$/.test(form.ssn)) {
      setError('SSN needs to be 9 digits')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
      setError('Birth date: use YYYY-MM-DD')
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
        throw new Error(data?.details || data?.error || 'Request failed')
      }
      setOutcome(String(data.outcome ?? ''))
      setForm(start)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const o = outcome.trim()
  const ok = o === 'Approved'
  const review = o === 'Manual Review'
  const nope = o === 'Denied'

  if (done) {
    return (
      <Shell>
        <div className="wrap">
          <h1>Vibes-Based Lending Co.</h1>
          {ok && (
            <div className="box good">
              <p className="lead">Success! 🎉🎉🎉</p>
              <p>
                You’ve successfully created an account with our service.
              </p>
            </div>
          )}
          {review && (
            <div className="box maybe">
              <p>
                Thanks for submitting your application, we’ll be in touch shortly.
              </p>
            </div>
          )}
          {nope && (
            <div className="box bad">
              <p>Sorry, your application was not successful.</p>
            </div>
          )}
          {!ok && !review && !nope && (
            <div className="box">
              <p>Result: {o || 'Unknown'}</p>
            </div>
          )}
          <p>
            <button type="button" onClick={() => { setDone(false); setOutcome('') }}>
              Again
            </button>
          </p>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="wrap">
        <h1>Vibes-Based Lending Co.</h1>
        <form onSubmit={onSubmit}>
          <div className="row">
            <label>First name <input name="firstName" value={form.firstName} onChange={onChange} required /></label>
          </div>
          <div className="row">
            <label>Last name <input name="lastName" value={form.lastName} onChange={onChange} required /></label>
            <span className="hint">
              {`Sandbox personas: last name Review → outcome "Manual Review"; last name Deny → outcome "Denied".`}
            </span>
          </div>
          <div className="row">
            <label>Line 1 <input name="addressLine1" value={form.addressLine1} onChange={onChange} required /></label>
          </div>
          <div className="row">
            <label>Line 2 <input name="addressLine2" value={form.addressLine2} onChange={onChange} /></label>
          </div>
          <div className="row">
            <label>City <input name="city" value={form.city} onChange={onChange} required /></label>
          </div>
          <div className="row">
            <label>State <input name="state" value={form.state} onChange={onChange} minLength={2} maxLength={2} required /></label>
            <span className="hint">2 letters, e.g. NY. We uppercase for you.</span>
          </div>
          <div className="row">
            <label>ZIP <input name="zip" value={form.zip} onChange={onChange} required /></label>
          </div>
          <div className="row">
            <label>
              Country{' '}
              <input name="country" value={form.country} onChange={onChange} required />
            </label>
            <span className="hint">Must be US (fixed).</span>
          </div>
          <div className="row">
            <label>SSN <input name="ssn" value={form.ssn} onChange={onChange} inputMode="numeric" minLength={9} maxLength={9} required /></label>
            <span className="hint">9 digits, no dashes.</span>
          </div>
          <div className="row">
            <label>Email Address <input name="email" type="email" value={form.email} onChange={onChange} required /></label>
          </div>
          <div className="row">
            <label>
              Date of Birth{' '}
              <input
                name="dob"
                value={form.dob}
                onChange={onChange}
                inputMode="numeric"
                maxLength={10}
                placeholder=""
                required
              />
            </label>
            <span className="hint">YYYY-MM-DD</span>
          </div>
          <button type="submit" disabled={busy}>{busy ? '…' : 'Submit'}</button>
        </form>
        {error && <p className="err">{error}</p>}
      </div>
    </Shell>
  )
}
