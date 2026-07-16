import React from 'react'
import { LegalLayout, Clause } from './LegalLayout'

export default function Privacy({ theme, toggleTheme }) {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy Policy" theme={theme} toggleTheme={toggleTheme}>
      <p>This policy explains what data Inked collects, why, how long we keep it, and your rights over it.</p>

      <Clause title="1. Data we collect">
        <p><strong style={{ color: 'var(--text)' }}>For all users:</strong> Device type, OS version, approximate location (country/city level), content read, session duration, and app events (opens, taps, scrolls). This data is used to improve the app and show relevant content.</p>
        <p style={{ marginTop: '0.75rem' }}><strong style={{ color: 'var(--text)' }}>For account holders:</strong> Email address, username, and reading preferences. If you are a writer: identity verification documents (stored encrypted, never displayed publicly), bank account details for earnings payouts (processed by a licensed payment provider, not stored on Inked servers).</p>
      </Clause>

      <Clause title="2. What we do not collect">
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['Precise GPS location', 'Contact list or address book', 'Browsing history outside the app', 'Any data from users aged under 13'].map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Clause>

      <Clause title="3. How we use your data">
        <p>We use collected data to: personalise your news feed, calculate writer engagement scores for earnings distribution, troubleshoot bugs, prevent abuse, and send transactional emails (account notifications, earnings summaries). We do not sell your personal data to third parties. We do not serve targeted advertising based on your data.</p>
      </Clause>

      <Clause title="4. Data sharing">
        <p>We share data only with: identity verification providers (for writer onboarding), payment processors (for earnings payouts), cloud infrastructure providers hosting the platform, and law enforcement when legally required. All third-party providers are bound by data processing agreements.</p>
      </Clause>

      <Clause title="5. Retention">
        <p>Account data is retained for as long as your account is active. After deletion, personal data is removed within 30 days, except where retention is required by law (e.g., financial records for tax compliance, which are retained for 7 years). Anonymous analytics data may be retained indefinitely.</p>
      </Clause>

      <Clause title="6. Your rights">
        <p>You can: access all personal data we hold about you, correct inaccurate data, request deletion of your account and personal data, and export your published articles. To exercise these rights: <a href="mailto:privacy@inked.app" style={{ color: 'var(--masthead-red)', textDecoration: 'none' }}>privacy@inked.app</a>. We respond within 30 days.</p>
      </Clause>

      <Clause title="7. Cookies">
        <p>The Inked app does not use tracking cookies. The website uses only strictly necessary session cookies and does not use advertising or analytics cookies from third-party networks.</p>
      </Clause>

      <Clause title="8. Contact">
        <p>Privacy questions: <a href="mailto:privacy@inked.app" style={{ color: 'var(--masthead-red)', textDecoration: 'none' }}>privacy@inked.app</a></p>
      </Clause>
    </LegalLayout>
  )
}
