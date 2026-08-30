import React from 'react'
import { LegalLayout, Clause } from './LegalLayout'

export default function ContentPolicy({ theme, toggleTheme }) {
  return (
    <LegalLayout eyebrow="Legal" title="Content & Moderation Policy" theme={theme} toggleTheme={toggleTheme}>
      <p>This policy defines the standards for all original content published by writers on NewsOnTip. Aggregated third-party news is subject to the editorial standards of its original publisher — this policy applies to NewsOnTip-native articles only.</p>

      <Clause title="1. What is required of every NewsOnTip article">
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            'Every factual claim must be supported by a cited source (a named publication, study, official statement, or on-the-record interview)',
            'The article must be original — not a reprint, paraphrase, or summary of another article without transformative analysis',
            'The author must be the work\'s genuine originator, not a ghostwriter or AI-generated submission',
            'Opinion and analysis must be clearly labeled as such — not presented as news reporting',
          ].map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Clause>

      <Clause title="2. What is not permitted">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
          {[
            { category: 'Misinformation', detail: 'Publishing factual claims the author knows to be false, or presenting speculation as confirmed fact without labeling.' },
            { category: 'Plagiarism', detail: 'Reproducing another writer\'s work without attribution, even partially. Direct quotes must be clearly marked and attributed.' },
            { category: 'Hate speech', detail: 'Content that dehumanises individuals or groups on the basis of race, religion, gender, sexual orientation, nationality, disability, or caste.' },
            { category: 'Harassment', detail: 'Content targeting a private individual with the intent to intimidate, humiliate, or incite others against them.' },
            { category: 'Undisclosed conflicts', detail: 'Writing about companies, products, or people in which the author has an undisclosed financial or personal interest.' },
            { category: 'AI-generated content', detail: 'Submitting AI-generated text as original writing without meaningful human authorship, editing, and verification.' },
          ].map((item, i) => (
            <div key={i} style={{ borderTop: '2px solid var(--masthead-red)', paddingTop: '0.75rem' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{item.category}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--caption-gray)', lineHeight: 1.6 }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </Clause>

      <Clause title="3. Review process">
        <p>Every article submitted by a writer is reviewed by an NewsOnTip moderator before publication. We check for compliance with this policy. Review typically completes within 24 hours of submission. During periods of high volume, this may extend to 48 hours.</p>
        <p style={{ marginTop: '0.75rem' }}>If an article is declined, the writer receives a specific, written explanation of which policy clause was triggered and, where possible, what change would make the article publishable.</p>
      </Clause>

      <Clause title="4. Post-publication moderation">
        <p>If a published article is later found to violate this policy — including via reader reports or journalist notifications — the article will be unpublished pending review. The writer is notified immediately. If the violation is confirmed, the article may be permanently removed and the engagement data for that period excluded from earnings calculations.</p>
      </Clause>

      <Clause title="5. Appeals">
        <p>Writers who believe a moderation decision was incorrect may appeal within 14 days by emailing <a href="mailto:moderation@newsontip.app" style={{ color: 'var(--masthead-red)', textDecoration: 'none' }}>moderation@newsontip.app</a> with the article in question and the basis for the appeal. Appeals are reviewed by a different moderator from the original decision. We respond within 7 business days.</p>
      </Clause>

      <Clause title="6. Repeat violations">
        <p>First violation: written warning and article removal. Second violation within 6 months: 30-day publishing suspension. Third violation: permanent removal of writer status. Severe violations (deliberate misinformation, hate speech, harassment) may result in immediate permanent removal on the first instance.</p>
      </Clause>

      <Clause title="7. Contact">
        <p>Moderation questions: <a href="mailto:moderation@newsontip.app" style={{ color: 'var(--masthead-red)', textDecoration: 'none' }}>moderation@newsontip.app</a></p>
      </Clause>
    </LegalLayout>
  )
}
