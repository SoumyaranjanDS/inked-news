import React from 'react'
import { BookOpen, PenLine } from 'lucide-react'
import Masthead from '../components/Masthead'
import Footer from '../components/Footer'

export default function Blog({ theme, toggleTheme }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      <div style={{ borderBottom: '1px solid var(--rule-gray)' }}>
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Blog · Press</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15 }}>
            From the Inked team.
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '5rem 1.5rem', maxWidth: '640px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', background: 'var(--rule-gray)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <BookOpen size={24} style={{ color: 'var(--caption-gray)' }} />
        </div>
        <h2 className="font-serif" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
          Coming soon.
        </h2>
        <p style={{ color: 'var(--caption-gray)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
          We're finishing the app before we start writing about building it. This space will carry product updates, creator spotlights, and the occasional essay on independent journalism once we're live.
        </p>
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--rule-gray)', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--caption-gray)' }}>
          <PenLine size={15} style={{ color: 'var(--masthead-red)' }} />
          Want to write for Inked? <a href="/writers" style={{ color: 'var(--masthead-red)', textDecoration: 'none', fontWeight: 600 }}>Apply here →</a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
