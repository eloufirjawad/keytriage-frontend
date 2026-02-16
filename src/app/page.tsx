import Image from 'next/image'
import Link from 'next/link'

import styles from './landing.module.css'

const heroImage =
  'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1400&q=75'

const showcaseImages = [
  {
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=75',
    alt: 'Support and product team collaboration',
    title: 'Cross-team triage handoff'
  },
  {
    src: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=75',
    alt: 'Customer support workflow review',
    title: 'Faster ticket investigation'
  },
  {
    src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=75',
    alt: 'Analytics dashboard planning session',
    title: 'Operational visibility for leads'
  }
]

const LandingPage = () => {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>KeyTriage</div>
        <nav className={styles.navLinks}>
          <Link href='/register' className={styles.secondaryCta}>
            Start Free Setup
          </Link>
          <Link href='/login' className={styles.primaryCta}>
            Agent Login
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Zendesk-native support acceleration</p>
          <h1>Turn passkey chaos into predictable ticket resolution.</h1>
          <p className={styles.subtitle}>
            KeyTriage gives agents a structured debug flow, packet-based diagnosis, and one-click response macros
            directly inside Zendesk.
          </p>
          <div className={styles.badges}>
            <span>10-minute onboarding</span>
            <span>No credential capture</span>
            <span>Built for teams</span>
          </div>
          <div className={styles.actions}>
            <Link href='/register' className={styles.primaryCta}>
              Connect Zendesk
            </Link>
            <Link href='/login' className={styles.secondaryCta}>
              Open Existing Workspace
            </Link>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.panelCard}>
            <div className={styles.panelImageWrap}>
              <Image
                src={heroImage}
                alt='Zendesk support team reviewing authentication tickets'
                fill
                priority
                sizes='(max-width: 980px) 100vw, 42vw'
                className={styles.panelImage}
              />
            </div>
            <p className={styles.panelLabel}>Live workflow snapshot</p>
            <h3>Ticket #4182: Passkey prompt failed</h3>
            <div className={styles.panelMetricRow}>
              <div>
                <strong>Category</strong>
                <span>BIOMETRIC_OR_DEVICE_LOCK_UNAVAILABLE</span>
              </div>
              <div>
                <strong>Confidence</strong>
                <span>0.91</span>
              </div>
            </div>
            <ul>
              <li>Packet status: Completed</li>
              <li>Suggested macro: Public + internal variants</li>
              <li>Action: Escalation with engineering note</li>
            </ul>
            <p className={styles.panelFoot}>Result: faster triage, cleaner handoffs, lower repeat tickets.</p>
          </div>
        </div>
      </section>

      <section className={styles.imageShowcase}>
        {showcaseImages.map(item => (
          <article key={item.src} className={styles.showcaseCard}>
            <div className={styles.showcaseImageWrap}>
              <Image src={item.src} alt={item.alt} fill sizes='(max-width: 980px) 100vw, 32vw' className={styles.showcaseImage} />
            </div>
            <p>{item.title}</p>
          </article>
        ))}
      </section>

      <section className={styles.section}>
        <h2>How the loop works</h2>
        <div className={styles.grid}>
          <article>
            <span>1</span>
            <h3>Send</h3>
            <p>Agent sends a secure debug link from the sidebar app.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Collect</h3>
            <p>User completes a guided form with environment and symptom context.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Classify</h3>
            <p>Rules return category, confidence, and recommended next actions.</p>
          </article>
          <article>
            <span>4</span>
            <h3>Respond</h3>
            <p>Insert public/internal macro, tag ticket, or escalate to engineering.</p>
          </article>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <h2>Built for support teams, not auth specialists</h2>
        <div className={styles.featureList}>
          <div>
            <h3>Safe by default</h3>
            <p>No passwords, private keys, biometric templates, or raw WebAuthn credentials are stored.</p>
          </div>
          <div>
            <h3>Zendesk-native workflow</h3>
            <p>Agents stay in tickets while running debug links, inserting macros, and escalating with context.</p>
          </div>
          <div>
            <h3>Actionable visibility</h3>
            <p>Track categories, completion rate, escalation rate, and time-to-resolution trends by team.</p>
          </div>
        </div>
      </section>

      <section className={styles.pricingSection}>
        <h2>Simple pricing for support teams</h2>
        <div className={styles.pricingGrid}>
          <article className={styles.priceCardPrimary}>
            <p className={styles.priceLabel}>Core platform</p>
            <h3>$99</h3>
            <p className={styles.priceMeta}>per month / workspace</p>
            <ul>
              <li>Zendesk app + debug link flow</li>
              <li>Packet classification (rules)</li>
              <li>Macros, tags, and escalation actions</li>
              <li>Tenant analytics dashboard</li>
            </ul>
          </article>
          <article className={styles.priceCard}>
            <p className={styles.priceLabel}>AI Copilot (next phase)</p>
            <h3>+$99</h3>
            <p className={styles.priceMeta}>per month / workspace</p>
            <ul>
              <li>Richer diagnosis generation</li>
              <li>Drafted response suggestions</li>
              <li>Escalation intelligence</li>
              <li>Priority for automation workflows</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.footerCta}>
        <h2>Launch your support workspace today</h2>
        <p>Admin connects once. Agents receive the app and start triaging immediately.</p>
        <div className={styles.actions}>
          <Link href='/register' className={styles.primaryCta}>
            Create Workspace
          </Link>
          <Link href='/app/dashboard' className={styles.secondaryCta}>
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
