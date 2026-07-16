import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#f8f8f8', marginTop: '4rem', paddingTop: '4rem', borderTop: '1px solid var(--rule-gray)' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', paddingBottom: '3rem' }}>
        {/* Column 1: Logo & Desc */}
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              INKED
            </span>
            <span style={{ color: 'var(--masthead-red)', transform: 'rotate(90deg)' }}>&#9650;</span>
          </Link>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Aliquam ac ultricies efficitur class lacinia magnis platea bibendum phasellus commodo enim.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', color: 'var(--text)' }}>
            <a href="#" style={{ color: 'inherit' }}><i className="lucide-facebook">FB</i></a>
            <a href="#" style={{ color: 'inherit' }}><i className="lucide-twitter">TW</i></a>
            <a href="#" style={{ color: 'inherit' }}><i className="lucide-instagram">IG</i></a>
            <a href="#" style={{ color: 'inherit' }}><i className="lucide-youtube">YT</i></a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Quick Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['About Us', 'Contact', 'Advertise', 'Career', 'Site Map'].map(link => (
              <Link key={link} to="#" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px dashed var(--rule-gray)', paddingBottom: '0.5rem' }}>
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3: Category */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Category</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Lifestyle', 'Business', 'Entertainment', 'Technology', 'Healthcare'].map(link => (
              <Link key={link} to="#" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px dashed var(--rule-gray)', paddingBottom: '0.5rem' }}>
                {link}
              </Link>
            ))}
          </div>
        </div>

        {/* Column 4: Newsletter */}
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Newsletter</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Sign up our newsletter to get update information, news and free insight.
          </p>
          <form style={{ display: 'flex' }} onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="Your email" style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid var(--rule-gray)', borderRadius: 0, outline: 'none' }} />
            <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}>SIGN UP</button>
          </form>
        </div>
      </div>

      {/* Bottom Strip */}
      <div style={{ background: '#222226', color: '#a0a0a0', padding: '1.5rem 0', fontSize: '0.8rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p>Copyright © {new Date().getFullYear()} Inked, All rights reserved. Powered by InkedDev</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/legal/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Use</Link>
            <Link to="/legal/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/legal/cookie" style={{ color: 'inherit', textDecoration: 'none' }}>Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
