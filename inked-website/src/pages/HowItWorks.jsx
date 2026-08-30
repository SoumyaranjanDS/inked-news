import React from 'react'
import Masthead from '../components/Masthead'
import Footer from '../components/Footer'
import useReveal from '../hooks/useReveal'

function Section({ children }) {
  const ref = useReveal()
  return <div ref={ref} className="reveal" style={{ marginBottom: '4rem' }}>{children}</div>
}

export default function HowItWorks({ theme, toggleTheme }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Masthead theme={theme} toggleTheme={toggleTheme} />

      <div style={{ borderBottom: '1px solid var(--rule-gray)' }}>
        <div className="container" style={{ padding: '3rem 1.5rem' }}>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>How It Works · About</p>
          <h1 className="font-serif" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, color: 'var(--text)', lineHeight: 1.15 }}>
            Why NewsOnTip exists.<br />How it runs.
          </h1>
        </div>
      </div>

      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '760px' }}>

        {/* Founder narrative */}
        <Section>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>The Origin</p>
          <hr className="rule" style={{ marginBottom: '2rem' }} />
          <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
            Existing news apps don't pay the people who make news possible.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: 'var(--caption-gray)', fontSize: '1rem', lineHeight: 1.75 }}>
            <p>News aggregation has been a solved technical problem for years. Pull from RSS feeds, surface headlines, show ads. The reader gets a digest; the platform takes the revenue; the original publisher and definitely the writer see almost nothing.</p>
            <p>NewsOnTip was built on a different assumption: the people who report, write, and analyze news are the product. Not the aggregation engine. A platform that captures attention from journalism but doesn't share value with journalists is extracting, not building.</p>
            <p>The mechanics of NewsOnTip — source attribution on every aggregated story, an identity-verified writing platform, a transparent engagement-weighted earnings pool — are all responses to that one premise. It's not a feature list. It's a position.</p>
            <p style={{ color: 'var(--text)', fontWeight: 500, fontStyle: 'italic', borderLeft: '3px solid var(--masthead-red)', paddingLeft: '1rem' }}>
              "If a platform builds an audience on journalism, it should share value with journalists. That's the whole idea."
            </p>
          </div>
        </Section>

        {/* The aggregation pipeline */}
        <Section>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>The Aggregation Pipeline</p>
          <hr className="rule" style={{ marginBottom: '2rem' }} />
          <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
            How news gets into NewsOnTip.
          </h2>
          <p style={{ color: 'var(--caption-gray)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
            In plain language, not a tech spec:
          </p>
          {[
            { step: 'Pull', body: 'NewsOnTip connects to 20+ public RSS feeds and licensed APIs from Indian and international publishers — Times of India, The Hindu, Reuters, BBC, TechCrunch, and more. These are public distribution channels that publishers deliberately maintain for exactly this purpose.' },
            { step: 'Attribute', body: 'Every story that enters NewsOnTip carries the original publisher\'s name, the author\'s name where available, the publication date, and a direct link to the original article. We don\'t strip attribution. It\'s the first thing shown on every story.' },
            { step: 'Display', body: 'Stories are shown in the app as summaries with the source clearly labeled. Readers can read the summary or tap through to the full article at the original publication. NewsOnTip doesn\'t try to keep you on NewsOnTip instead of the publisher.' },
            { step: 'Separate', body: 'Original writing from NewsOnTip creators is clearly labeled as such — it never appears as if it\'s from an external publication, and aggregated content never appears as if it was written by an NewsOnTip creator.' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--rule-gray)', marginTop: i > 0 ? '0' : '0' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--masthead-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '0.85rem', fontFamily: 'Playfair Display, serif' }}>{i + 1}</span>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.step}</p>
                <p style={{ fontSize: '0.92rem', color: 'var(--caption-gray)', lineHeight: 1.7 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </Section>

        {/* Moderation */}
        <Section>
          <p className="eyebrow" style={{ marginBottom: '0.75rem' }}>Moderation</p>
          <hr className="rule" style={{ marginBottom: '2rem' }} />
          <h2 className="font-serif" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)' }}>
            What happens before an article goes live.
          </h2>
          <p style={{ color: 'var(--caption-gray)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1rem' }}>
            For <strong style={{ color: 'var(--text)' }}>aggregated news</strong>: stories are pulled automatically from established, credentialed publishers. We don't re-moderate content that The Hindu or Reuters have already published — we rely on their editorial standards and link back to them.
          </p>
          <p style={{ color: 'var(--caption-gray)', fontSize: '1rem', lineHeight: 1.75 }}>
            For <strong style={{ color: 'var(--text)' }}>original writing on NewsOnTip</strong>: every piece is reviewed by a moderator before publication. We check that factual claims are sourced, that no content violates our content policy, and that the piece is genuinely original. This review typically completes within 24 hours.
          </p>
        </Section>

      </div>

      <Footer />
    </div>
  )
}
