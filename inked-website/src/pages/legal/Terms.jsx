import React from 'react'
import { LegalLayout, Clause } from './LegalLayout'

export default function Terms({ theme, toggleTheme }) {
  return (
    <LegalLayout eyebrow="Legal" title="Terms of Service" theme={theme} toggleTheme={toggleTheme}>
      <p>By accessing or using NewsOnTip ("the Platform," "we," "us"), you agree to these Terms of Service. If you do not agree, do not use the Platform.</p>

      <Clause title="1. Who can use NewsOnTip">
        <p>NewsOnTip is open to users aged 13 and above. Users under 18 must have parental or guardian consent. By creating an account, you confirm you meet the eligibility requirements for your jurisdiction.</p>
      </Clause>

      <Clause title="2. Reader accounts">
        <p>Reading content on NewsOnTip is free and does not require an account. Creating a reader account allows you to save articles, follow writers, and receive personalized recommendations. You are responsible for keeping your login credentials confidential.</p>
      </Clause>

      <Clause title="3. Writer accounts">
        <p>Writer accounts are subject to identity verification. By applying as a writer, you consent to the verification process and confirm that the identity documents you submit are accurate and belong to you. Submitting false identity documents is grounds for permanent ban and may be reported to relevant authorities.</p>
      </Clause>

      <Clause title="4. Content you publish">
        <p>You retain ownership of original content you publish on NewsOnTip. By publishing, you grant NewsOnTip a non-exclusive, royalty-free license to display, distribute, and promote your content within the platform and in platform marketing materials. You can remove your content at any time, which terminates this license for future use (previously distributed content may remain in caches for a reasonable period).</p>
        <p style={{ marginTop: '0.75rem' }}>You are solely responsible for the accuracy, legality, and originality of content you publish. Publishing false factual claims, plagiarized content, or content that violates third-party rights may result in removal and account suspension.</p>
      </Clause>

      <Clause title="5. Earnings">
        <p>Writer earnings are distributed from a monthly pool based on the engagement-weighted model described in the Writer Earnings documentation. NewsOnTip does not guarantee any minimum earnings. Pool amounts and per-writer distributions will be disclosed to writers before each distribution cycle. Earnings are subject to applicable tax laws in your jurisdiction — you are responsible for declaring and paying applicable taxes.</p>
      </Clause>

      <Clause title="6. Aggregated content">
        <p>NewsOnTip aggregates publicly available news from third-party publishers via RSS feeds and APIs. This content remains the property of its original publishers. NewsOnTip displays summaries with source attribution and links back to the original publication. If you are a publisher and believe your content is being displayed in a way that violates your rights, please use our <a href="/legal/takedown" style={{ color: 'var(--masthead-red)', textDecoration: 'none' }}>Takedown Request</a> process.</p>
      </Clause>

      <Clause title="7. Prohibited conduct">
        <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {['Publishing misinformation or fabricated news', 'Harassment, hate speech, or threats', 'Impersonating other people or organisations', 'Attempting to manipulate engagement signals', 'Scraping platform content without written permission', 'Using automated accounts to inflate metrics'].map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Clause>

      <Clause title="8. Termination">
        <p>We may suspend or terminate accounts that violate these Terms. Writers will receive a written explanation of any termination decision. Readers may terminate their account at any time from account settings.</p>
      </Clause>

      <Clause title="9. Limitation of liability">
        <p>NewsOnTip is provided "as is." We do not guarantee uninterrupted availability or earnings outcomes. To the maximum extent permitted by applicable law, NewsOnTip's liability for any claim related to the platform is limited to the amount you paid to use the platform in the three months preceding the claim.</p>
      </Clause>

      <Clause title="10. Governing law">
        <p>These Terms are governed by the laws of India. Disputes will be resolved through binding arbitration in accordance with Indian Arbitration and Conciliation Act, 1996, unless you are a consumer with statutory rights under applicable consumer protection laws.</p>
      </Clause>

      <Clause title="11. Contact">
        <p>Questions about these Terms: <a href="mailto:legal@newsontip.app" style={{ color: 'var(--masthead-red)', textDecoration: 'none' }}>legal@newsontip.app</a></p>
      </Clause>
    </LegalLayout>
  )
}
