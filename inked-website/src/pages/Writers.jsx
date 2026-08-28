import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { mainApiClient } from '../lib/axios'
import { CheckCircle, ArrowRight, AlertCircle } from 'lucide-react'
import Masthead from '../components/Masthead'
import Footer from '../components/Footer'
import useReveal from '../hooks/useReveal'

function RevealSection({ children }) {
  const ref = useReveal()
  return <div ref={ref} className="reveal">{children}</div>
}

export default function Writers({ theme, toggleTheme }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await mainApiClient.post('/api/waitlist', { email, role: 'writer' })
    } catch {}
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--rule-gray)' }}>
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>For Writers</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text)', marginBottom: '1rem', lineHeight: 1.15 }}>
            Write independently.<br />Earn from real engagement.
          </h1>
          <p style={{ maxWidth: '560px', color: 'var(--caption-gray)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Inked gives independent writers a platform where your earnings are determined by how much readers actually engage with your work — not how many followers you start with.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem' }}>

        {/* Eligibility */}
        <RevealSection>
          <section style={{ marginBottom: '4rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Who can apply</p>
            <hr className="rule" style={{ marginBottom: '2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
              {[
                { ok: true, text: 'Journalists, bloggers, and independent reporters' },
                { ok: true, text: 'Subject-matter experts with original analysis to share' },
                { ok: true, text: 'Writers who publish in English (more languages coming)' },
                { ok: true, text: 'Individuals willing to verify their identity once' },
                { ok: false, text: 'Anonymous accounts — pseudonyms are fine, but ID is required' },
                { ok: false, text: 'PR agencies or brand-funded content masquerading as editorial' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {item.ok
                    ? <CheckCircle size={17} style={{ color: 'var(--success-green)', flexShrink: 0, marginTop: '2px' }} />
                    : <AlertCircle size={17} style={{ color: 'var(--masthead-red)', flexShrink: 0, marginTop: '2px' }} />
                  }
                  <p style={{ fontSize: '0.92rem', color: item.ok ? 'var(--text)' : 'var(--caption-gray)', lineHeight: 1.55 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </section>
        </RevealSection>

        {/* ID Verification — upfront, not buried */}
        <RevealSection>
          <section style={{ marginBottom: '4rem', borderLeft: '3px solid var(--masthead-red)', paddingLeft: '1.5rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Identity Verification — explained upfront</p>
            <p style={{ fontSize: '1rem', color: 'var(--text)', lineHeight: 1.7, maxWidth: '620px' }}>
              To publish on Inked, you need to verify your identity once — a government-issued ID submitted through our secure verification flow. Your full name and ID number are <strong>never displayed publicly</strong>. This exists to ensure accountability, protect your byline from impersonation, and maintain the platform's credibility standard. It takes under five minutes.
            </p>
          </section>
        </RevealSection>

        {/* Earnings model — the actual mechanism */}
        <RevealSection>
          <section style={{ marginBottom: '4rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>The earnings model</p>
            <hr className="rule" style={{ marginBottom: '2rem' }} />
            <h2 className="font-serif" style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
              Engagement-weighted pool distribution.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--caption-gray)', lineHeight: 1.7, maxWidth: '620px', marginBottom: '2rem' }}>
              Each month, Inked sets aside a writer pool from platform revenue. Your share of that pool is proportional to your engagement score — calculated from real reader behavior, not algorithmic boosts or pay-to-promote mechanics.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1px', background: 'var(--rule-gray)', border: '1px solid var(--rule-gray)', marginBottom: '2rem' }}>
              {[
                { signal: 'Read Time', weight: 'High', note: 'Minutes spent — the clearest signal of genuine value' },
                { signal: 'Saves / Bookmarks', weight: 'High', note: 'Reader explicitly marks your piece as worth keeping' },
                { signal: 'In-app Shares', weight: 'Medium', note: 'Organic sharing within the Inked platform' },
                { signal: 'Return Visits', weight: 'Medium', note: 'Reader comes back to your profile for more' },
                { signal: 'Comments', weight: 'Low', note: 'Engagement signal, lower weight to prevent gaming' },
                { signal: 'External Clicks', weight: 'Excluded', note: 'We only count what happens inside the app' },
              ].map((row, i) => (
                <div key={i} style={{ background: 'var(--bg)', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '0.02em' }}>{row.signal}</p>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: row.weight === 'Excluded' ? 'var(--caption-gray)' : 'var(--masthead-red)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.weight}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--caption-gray)', lineHeight: 1.5 }}>{row.note}</p>
                </div>
              ))}
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg)', border: '1px solid var(--rule-gray)' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--caption-gray)', lineHeight: 1.7 }}>
                <strong style={{ color: 'var(--text)' }}>Important:</strong> Earnings are not guaranteed. The pool size depends on platform revenue and will be disclosed monthly to all active writers. We will publish the full pool amount and per-writer distribution formula in the app before you publish your first article — no surprises.
              </p>
            </div>
          </section>
        </RevealSection>

        {/* Content policy summary */}
        <RevealSection>
          <section style={{ marginBottom: '4rem' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Content policy — the short version</p>
            <hr className="rule" style={{ marginBottom: '2rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              {[
                { rule: 'Sourced claims only', detail: 'Every factual claim must be sourced. Speculation is allowed when clearly labeled as opinion or analysis.' },
                { rule: 'No misinformation', detail: 'Articles found to contain false factual claims are unpublished and the writer is notified with a specific reason.' },
                { rule: 'No plagiarism', detail: 'Original writing only. Quotes from other sources must be attributed. Republishing others\' work verbatim is not allowed.' },
                { rule: 'Civil discourse', detail: 'Criticism and strong opinion are allowed. Personal attacks, hate speech, and harassment are not.' },
              ].map((item, i) => (
                <div key={i} style={{ borderTop: '2px solid var(--masthead-red)', paddingTop: '1rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.4rem' }}>{item.rule}</p>
                  <p style={{ fontSize: '0.87rem', color: 'var(--caption-gray)', lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/legal/content-policy" style={{ fontSize: '0.9rem', color: 'var(--masthead-red)', textDecoration: 'none', fontWeight: 600 }}>
                Read the full Content Policy →
              </Link>
            </div>
          </section>
        </RevealSection>

        {/* Writer signup */}
        <RevealSection>
          <section style={{ maxWidth: '480px' }}>
            <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Apply to write on Inked</p>
            <hr className="rule" style={{ marginBottom: '1.5rem' }} />
            {submitted ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--success-green)', fontWeight: 600 }}>
                <CheckCircle size={20} />
                <p>You're on the writer waitlist. We'll reach out with next steps.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                  Join the writer waitlist <ArrowRight size={15} />
                </button>
                <p style={{ fontSize: '0.8rem', color: 'var(--caption-gray)' }}>
                  We'll contact you with the verification link and onboarding steps. No spam.
                </p>
              </form>
            )}
          </section>
        </RevealSection>
      </div>

      <Footer />
    </div>
  )
}
