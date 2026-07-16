import React from 'react'
import Masthead from '../../components/Masthead'
import Footer from '../../components/Footer'

function LegalLayout({ title, eyebrow, children, theme, toggleTheme }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Masthead theme={theme} toggleTheme={toggleTheme} />
      <div style={{ borderBottom: '1px solid var(--rule-gray)' }}>
        <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>{eyebrow}</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: 'var(--text)' }}>{title}</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--caption-gray)', marginTop: '0.5rem' }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '760px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', color: 'var(--caption-gray)', fontSize: '0.95rem', lineHeight: 1.8 }}>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function Clause({ title, children }) {
  return (
    <div style={{ borderTop: '1px solid var(--rule-gray)', paddingTop: '1.5rem' }}>
      <h2 className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem' }}>{title}</h2>
      {children}
    </div>
  )
}

export { LegalLayout, Clause }
