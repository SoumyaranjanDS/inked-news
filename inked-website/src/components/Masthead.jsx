import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Search } from 'lucide-react'

const NAV_LINKS = [
  { label: 'HOME', to: '/' },
  { label: 'WORLD', to: '/category/world' },
  { label: 'TECHNOLOGY', to: '/category/technology' },
  { label: 'BUSINESS', to: '/category/business' },
  { label: 'SPACE', to: '/category/space' },
  { label: 'SPORTS', to: '/category/sports' },
]

export default function Masthead() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff' }}>
      {/* Top Strip */}
      <div style={{ background: '#1c1c20', color: '#fff' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1.5rem', height: '40px' }}>
          <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', marginRight: '1.5rem', color: '#a0a0a0' }} className="hidden md:flex">
              <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link>
              <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link>
              <Link to="/advertise" style={{ color: 'inherit', textDecoration: 'none' }}>Advertise</Link>
            </div>
            <button className="btn-primary" style={{ height: '100%', padding: '0 1.5rem', fontSize: '0.75rem' }}>
              SUBSCRIPTION
            </button>
          </div>
        </div>
      </div>

      {/* Main Masthead */}
      <div style={{ borderBottom: scrolled ? '1px solid var(--rule-gray)' : '1px solid var(--rule-gray)', boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.04)' : 'none', transition: 'box-shadow 0.2s ease' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '2rem' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span className="font-serif" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              INKED
            </span>
            <span style={{ color: 'var(--masthead-red)', transform: 'rotate(90deg)' }}>&#9650;</span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex" style={{ flex: 1, justifyContent: 'center', gap: '2rem' }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: pathname === link.to ? 'var(--masthead-red)' : 'var(--text)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--masthead-red)'}
                onMouseLeave={e => e.target.style.color = pathname === link.to ? 'var(--masthead-red)' : 'var(--text)'}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: '1rem', color: 'var(--text)' }}>
            <Search size={18} style={{ cursor: 'pointer' }} />
          </div>

          {/* Hamburger (Mobile) */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle navigation"
            className="md:hidden flex ml-auto"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '0.3rem' }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {menuOpen && (
        <nav style={{ background: '#fff', borderBottom: '1px solid var(--rule-gray)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="md:hidden">
          {NAV_LINKS.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: pathname === link.to ? 'var(--masthead-red)' : 'var(--text)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
