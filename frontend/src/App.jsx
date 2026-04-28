import { useState } from 'react'
import './App.css'
import partnerImg from './static/official-lender.png'

function PageOutline({ children }) {
  return (
    <div className="app-layout">
      <div className="partner-gutter">
        <aside className="partner">
          <img
            className="partner__img"
            src={partnerImg}
            width={192}
            height={192}
          />
          <p className="partner__caption">Your Official Lending Partner</p>
        </aside>
      </div>
      <div className="app-layout__main">{children}</div>
      <div className="layout-spacer" />
    </div>
  )
}

const api = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '')

function formInputsTranslation(formInputs) {
  const trim = (input) => String(formInputs.get(input) ?? '').trim()
  return {
    firstName: trim('firstName'),
    lastName: trim('lastName'),
    addressLine1: trim('addressLine1'),
    addressLine2: trim('addressLine2'),
    city: trim('city'),
    state: trim('state').toUpperCase(),
    zip: trim('zip'),
    country: trim('country').toUpperCase(),
    ssn: String(formInputs.get('ssn') ?? '').replace(/\D/g, ''),
    email: trim('email'),
    dob: String(formInputs.get('dob') ?? '').replace(/[^\d-]/g, '').slice(0, 10),
  }
}

export default function App() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [outcome, setOutcome] = useState('')
  const [formKey, setFormKey] = useState(0)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const formData = formInputsTranslation(new FormData(e.currentTarget))

    if (!/^[A-Za-z]{2}$/.test(formData.state)) {
      setError('State should be two letters')
      return
    }
    if (formData.country !== 'US') {
      setError('Country must be "US"')
      return
    }
    if (!/^\d{9}$/.test(formData.ssn)) {
      setError('SSN should be nine digits')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
      setError('Please use "YYYY-MM-DD" format')
      return
    }

    setBusy(true)
    try {
      const res = await fetch(`${api}/api/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const responseData = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(responseData?.details || responseData?.error || 'Request failed')
      }
      setOutcome(String(responseData.outcome ?? ''))
      setDone(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const status = outcome.trim()
  const approved = status === 'Approved'
  const manual_review = status === 'Manual Review'
  const denied = status === 'Denied'

  if (done) {
    return (
      <PageOutline>
        <div className="application-card">
          <h1>Vibes-Based Lending Co.</h1>
          {approved && (
            <div className="box good">
              <p className="outcome-heading">Success! 🎉🎉🎉</p>
              <p>
                You’ve successfully created an account with our service.
              </p>
            </div>
          )}
          {manual_review && (
            <div className="box maybe">
              <p>
                Thanks for submitting your application, we’ll be in touch shortly.
              </p>
            </div>
          )}
          {denied && (
            <div className="box bad">
              <p>Sorry, your application was not successful.</p>
            </div>
          )}
          {!approved && !manual_review && !denied && (
            <div className="box">
              <p>Result: {status || 'Unknown'}</p>
            </div>
          )}
          <p>
            <button
              type="button"
              onClick={() => {
                setDone(false)
                setOutcome('')
                setFormKey((k) => k + 1)
              }}
            >
              Submit again
            </button>
          </p>
        </div>
      </PageOutline>
    )
  }

  return (
    <PageOutline>
      <div className="application-card">
        <h1>Vibes-Based Lending Co.</h1>
        <form key={formKey} onSubmit={onSubmit}>
          <div className="row">
            <label>First name <input name="firstName" required /></label>
          </div>
          <div className="row">
            <label>Last name <input name="lastName" required /></label>
          </div>
          <div className="row">
            <label>Line 1 <input name="addressLine1" required /></label>
          </div>
          <div className="row">
            <label>Line 2 <input name="addressLine2" /></label>
          </div>
          <div className="row">
            <label>City <input name="city" required /></label>
          </div>
          <div className="row">
            <label>State <input name="state" minLength={2} maxLength={2} required /></label>
            <span className="hint">State should be two letters.</span>
          </div>
          <div className="row">
            <label>ZIP <input name="zip" required /></label>
          </div>
          <div className="row">
            <label>Country <input name="country" minLength={2} maxLength={2} required /></label>
            <span className="hint">Country must be "US".</span>
          </div>
          <div className="row">
            <label>SSN <input name="ssn" inputMode="numeric" minLength={9} maxLength={9} required /></label>
            <span className="hint">SSN should be nine digits.</span>
          </div>
          <div className="row">
            <label>Email Address <input name="email" type="email" required /></label>
          </div>
          <div className="row">
            <label>Date of Birth <input name="dob" inputMode="numeric" maxLength={10} required /></label>
            <span className="hint">YYYY-MM-DD</span>
          </div>
          <button type="submit" disabled={busy}>{busy ? 'Submitting...' : 'Submit'}</button>
        </form>
        {error && <p className="err">{error}</p>}
      </div>
    </PageOutline>
  )
}
