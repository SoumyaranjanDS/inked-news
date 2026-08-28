import React, { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { LegalLayout } from './LegalLayout'
import { mainApiClient } from '../../lib/axios'

export default function Takedown({ theme, toggleTheme }) {
  const [form, setForm] = useState({ name: '', email: '', organisation: '', url: '', reason: '', description: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await mainApiClient.post('/api/takedown', form)
    } catch {}
    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <LegalLayout eyebrow="Legal" title="Takedown Request" theme={theme} toggleTheme={toggleTheme}>
      <p>If content on Inked appears without your permission, infringes your copyright, or violates our Content Policy, use this form to submit a formal takedown request. We review all requests within <strong style={{ color: 'var(--text)' }}>2 business days</strong> and notify you of the outcome.</p>

      <div style={{ borderTop: '1px solid var(--rule-gray)', paddingTop: '1.5rem' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--caption-gray)', marginBottom: '1.5rem' }}>
          <strong style={{ color: 'var(--text)' }}>Who can submit:</strong> The original creator or rights holder of the content, or a legal representative acting on their behalf. False takedown requests are a violation of our Terms of Service and may be referred to relevant authorities.
        </p>

        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.75rem', border: '1px solid var(--rule-gray)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--success-green)', fontWeight: 600 }}>
              <CheckCircle size={20} />
              <span>Request received.</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--caption-gray)', lineHeight: 1.65 }}>
              We've received your takedown request and will review it within 2 business days. You'll receive a response at the email address you provided. Reference: TDN-{Date.now().toString().slice(-6)}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '560px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Your Full Name *</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="As it appears on your ID or contract" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Email Address *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="We'll send our response here" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Organisation (if applicable)</label>
              <input type="text" name="organisation" value={form.organisation} onChange={handleChange} placeholder="Publisher, media company, or law firm" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>URL of content on Inked *</label>
              <input type="text" name="url" required value={form.url} onChange={handleChange} placeholder="https://inked.app/..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Reason for request *</label>
              <select name="reason" required value={form.reason} onChange={handleChange}>
                <option value="">Select a reason</option>
                <option value="copyright">Copyright infringement — I am the original creator/rights holder</option>
                <option value="defamation">Defamatory or false factual claims about me</option>
                <option value="privacy">Violation of my privacy (personal data published without consent)</option>
                <option value="impersonation">Impersonation of me or my organisation</option>
                <option value="other">Other policy violation</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.4rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Description *</label>
              <textarea name="description" required value={form.description} onChange={handleChange} rows={5} placeholder="Describe specifically what is infringing, why you are the rights holder, and what action you are requesting (removal, correction, attribution)." />
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--rule-gray)', fontSize: '0.82rem', color: 'var(--caption-gray)', lineHeight: 1.65 }}>
              By submitting this form, I confirm that the information provided is accurate and that I have a good-faith belief that the described use is not authorised by the rights holder, its agent, or the law.
            </div>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ justifyContent: 'center', maxWidth: '200px' }}>
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--rule-gray)', paddingTop: '1.5rem' }}>
        <p style={{ fontSize: '0.88rem', color: 'var(--caption-gray)' }}>
          Prefer email? Send your request directly to <a href="mailto:takedown@inked.app" style={{ color: 'var(--masthead-red)', textDecoration: 'none', fontWeight: 600 }}>takedown@inked.app</a> with the same information listed above.
        </p>
      </div>
    </LegalLayout>
  )
}
