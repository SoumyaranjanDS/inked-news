import React, { useMemo } from 'react'
import { useLocation, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react'
import Masthead from '../components/Masthead'
import Footer from '../components/Footer'

// ─── Time helper ─────────────────────────────────────────────────────────────
function formatLocalTime(dateStr, timeStr) {
  try {
    const combined = dateStr && timeStr ? new Date(`${dateStr} ${timeStr}`) : null
    if (combined && !isNaN(combined)) {
      const date = combined.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      const time = combined.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      return { date, time }
    }
    return {
      date: dateStr
        ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: timeStr || ''
    }
  } catch {
    return { date: 'Today', time: '' }
  }
}

// ─── Noise Filter ─────────────────────────────────────────────────────────────
const NOISE_PATTERNS = [
  /you are logged in/i, /loading\.\.\./i, /you don't have any active subscription/i,
  /subscribed with another email/i, /logout and login/i, /your active subscription/i,
  /account subscription benefits/i, /premium stories/i, /unlock these with/i,
  /subscription products/i, /additional subscription benefits/i, /account settings/i,
  /need help with your subscription/i, /e-paper/i, /the view from india/i,
  /first day first show/i, /today's cache/i, /science for all/i, /data point/i,
  /decoding the headlines/i, /thedge/i, /health matters/i, /gender agenda/i,
  /copyright©/i, /all rights reserved/i, /back to top/i, /terms & conditions/i,
  /institutional subscriber/i, /comments have to be in english/i,
  /please abide by our community guidelines/i, /vuukle/i, /thg publishing/i
]
const MIN_WORD_COUNT = 8

function cleanArticleText(rawText) {
  if (!rawText || rawText.trim().length === 0) return []
  const seen = new Set()
  const paragraphs = []
  const lines = rawText.split(/\n+/).map(l => l.trim()).filter(Boolean)
  for (const line of lines) {
    const key = line.toLowerCase().slice(0, 80)
    if (seen.has(key)) continue
    seen.add(key)
    if (NOISE_PATTERNS.some(p => p.test(line))) continue
    const wordCount = line.split(/\s+/).length
    if (wordCount < MIN_WORD_COUNT) continue
    if (/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},\s+\d{4}$/i.test(line)) continue
    if (/^updated\s*[-–]\s*/i.test(line)) continue
    if (/^[A-Z\s]+$/.test(line) && wordCount <= 3) continue
    paragraphs.push(line)
  }
  return paragraphs
}

function extractCaption(rawText) {
  if (!rawText) return null
  const match = rawText.match(/([^.\n]{20,120})\s*\|\s*photo credit[:\s]+([^\n]+)/i)
  if (match) return { caption: match[1].trim(), credit: match[2].trim() }
  return null
}

function extractDateline(rawText) {
  if (!rawText) return null
  const match = rawText.match(/IST\s*[-–]\s*([A-Z][A-Za-z\s]+)\s/)
  if (match) return match[1].trim()
  return null
}

// ─── Article Detail ───────────────────────────────────────────────────────────
export default function ArticleDetail({ theme, toggleTheme }) {
  const location = useLocation()
  const article = location.state?.article

  if (!article) return <Navigate to="/" replace />

  const { date, time } = formatLocalTime(article.date, article.time)
  const rawText = article.summary || article.detailed_description || article.description || ''

  const paragraphs = useMemo(() => cleanArticleText(rawText), [rawText])
  const caption = useMemo(() => extractCaption(rawText), [rawText])
  const dateline = useMemo(() => extractDateline(rawText), [rawText])

  const hasContent = paragraphs.length > 0
  const isContentSparse = paragraphs.length < 3

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      <div style={{ flex: 1 }}>
        {/* ── Subnav ── */}
        <div style={{ padding: '1rem 0', borderBottom: '1px solid var(--rule-gray)' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--masthead-red)'} onMouseLeave={e => e.currentTarget.style.color='var(--text)'}>
              <ArrowLeft size={16} /> Back to Archives
            </Link>
          </div>
        </div>

        <article className="container" style={{ maxWidth: '800px', padding: '4rem 1.5rem 6rem' }}>
          
          {/* ── Metadata strip ── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', background: 'var(--masthead-red)', padding: '0.25rem 0.75rem', letterSpacing: '0.05em' }}>
              {article.source || 'INKED'}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {date} {time && `• ${time}`}
            </span>
            {dateline && (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                • {dateline}
              </span>
            )}
          </div>

          {/* ── Headline ── */}
          <h1 
            className="font-serif"
            style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
              fontWeight: 900, 
              color: 'var(--text)', 
              lineHeight: 1.1,
              marginBottom: '2rem',
              letterSpacing: '-0.02em'
            }}
          >
            {article.headline}
          </h1>

          {/* Lead / description */}
          {article.description && (
            <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '3rem', fontWeight: 500 }}>
              {article.description}
            </p>
          )}

          {/* ── Hero Image ── */}
          {article.image_link && (
            <figure style={{ margin: '0 0 3rem 0' }}>
              <img
                src={article.image_link}
                alt={article.headline}
                style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.closest('figure').style.display = 'none'; }}
              />
              {caption ? (
                <figcaption style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--rule-gray)' }}>
                  <span style={{ fontStyle: 'italic', marginRight: '0.5rem' }}>{caption.caption}</span>
                  <span style={{ fontWeight: 600 }}>| Photo: {caption.credit}</span>
                </figcaption>
              ) : (
                <figcaption style={{ padding: '1rem 0', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)', borderBottom: '1px solid var(--rule-gray)' }}>
                  Image via {article.source || 'Source'}
                </figcaption>
              )}
            </figure>
          )}

          {/* ── Article Body ── */}
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            {hasContent ? (
              <div>
                {paragraphs.map((para, i) => (
                  <p
                    key={i}
                    style={{
                      marginBottom: '1.75rem',
                      lineHeight: 1.8,
                      color: 'var(--text)',
                      fontSize: '1.15rem',
                    }}
                  >
                    {i === 0 && <span style={{ float: 'left', fontSize: '4.5rem', lineHeight: '4.5rem', paddingTop: '0.2rem', paddingRight: '0.5rem', color: 'var(--masthead-red)', fontFamily: 'serif', fontWeight: 900 }}>{para.charAt(0)}</span>}
                    {i === 0 ? para.substring(1) : para}
                  </p>
                ))}
              </div>
            ) : (
              // ── No content state ──
              <div style={{ padding: '2rem', border: '1px solid var(--rule-gray)', textAlign: 'center', marginBottom: '3rem' }}>
                <AlertTriangle size={32} style={{ color: 'var(--masthead-red)', margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Full Article Not Available</h3>
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
                  The article body could not be extracted. It may be behind a paywall.
                </p>
              </div>
            )}

            {/* Sparse content nudge */}
            {isContentSparse && hasContent && (
              <div style={{ padding: '1.5rem', background: '#f9f9f9', borderLeft: '4px solid var(--masthead-red)', fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
                💡 This preview contains only limited details. Read the complete story at the original source.
              </div>
            )}

            {/* ── CTA: Read Original ── */}
            {article.link && (
              <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'center' }}>
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                >
                  Read Full Story <ExternalLink size={18} />
                </a>
              </div>
            )}
          </div>
        </article>
      </div>

      <Footer />
    </div>
  )
}
