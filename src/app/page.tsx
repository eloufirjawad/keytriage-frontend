import Image from 'next/image'
import Link from 'next/link'

import styles from './landing.module.css'

const heroImage =
  'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=75'

const imagePanels = [
  {
    src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=75',
    alt: 'Support operations team reviewing customer cases',
    title: 'Clear handoffs between support and engineering',
    text: 'Escalations include category, confidence, and debugging context in one packet.'
  },
  {
    src: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1400&q=75',
    alt: 'Analytics and dashboard review',
    title: 'Team-level visibility without manual spreadsheets',
    text: 'Leads monitor packet completion, top categories, escalations, and resolution patterns.'
  }
]

const benefitCards = [
  {
    title: 'Structured packet evidence',
    description: 'Stop ad hoc troubleshooting. Every ticket gets standardized context before action.'
  },
  {
    title: 'Macro-first resolution',
    description: 'Insert public and internal responses from diagnosis output in one click.'
  },
  {
    title: 'Escalation discipline',
    description: 'When a case needs engineering, your note is complete and immediately actionable.'
  }
]

const stats = [
  { value: '10 min', label: 'setup time for first workspace' },
  { value: '$99', label: 'monthly core plan per workspace' },
  { value: '+$99', label: 'optional AI tier later' }
]

const steps = [
  {
    title: 'Agent sends debug link',
    text: 'From the Zendesk sidebar app, no tab switching.'
  },
  {
    title: 'Customer submits packet',
    text: 'Consent + symptom + device/browser context.'
  },
  {
    title: 'Rule engine classifies',
    text: 'Category, confidence, and next best action.'
  },
  {
    title: 'Agent resolves or escalates',
    text: 'Macro insertion, tags, notes, and tracked outcomes.'
  }
]

const faq = [
  {
    q: 'Is this safe for customer-facing support?',
    a: 'Yes. KeyTriage does not store passwords, private keys, biometric templates, or raw WebAuthn credentials.'
  },
  {
    q: 'Do agents need separate onboarding?',
    a: 'No. Admin connects once; agents authenticate via Zendesk and use the app inside tickets.'
  },
  {
    q: 'Can we start without AI?',
    a: 'Yes. The core workflow is deterministic and production-ready. AI is an optional upgrade later.'
  }
]

const LandingPage = () => {
  return (
    <main className={styles.page}>
      <section className={styles.masthead}>
        <header className={styles.topbar}>
          <div className={styles.logoWrap}>
            <span className={styles.logo}>KeyTriage</span>
            <span className={styles.logoHint}>Zendesk-first support diagnosis</span>
          </div>
          <nav className={styles.actionsTop}>
            <Link href='/login' className={styles.ghostTop}>
              Agent Login
            </Link>
            <Link href='/register' className={styles.primaryTop}>
              Create Workspace
            </Link>
          </nav>
        </header>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Support teams deserve better triage</p>
            <h1>Make login and passkey tickets predictable across your entire team.</h1>
            <p>
              KeyTriage turns messy troubleshooting into a repeatable Zendesk workflow: debug link, packet capture,
              classification, macro response, and escalation with context.
            </p>
            <div className={styles.heroButtons}>
              <Link href='/register' className={styles.primaryButton}>
                Connect Zendesk
              </Link>
              <Link href='/app/dashboard' className={styles.secondaryButton}>
                View Dashboard
              </Link>
            </div>
            <div className={styles.metricPills}>
              {stats.map(item => (
                <div key={item.label} className={styles.metricPill}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroFrame}>
              <Image
                src={heroImage}
                alt='Support team handling customer incidents'
                fill
                priority
                sizes='(max-width: 980px) 100vw, 46vw'
                className={styles.heroImage}
              />
            </div>
            <div className={styles.ticketCard}>
              <p>Ticket #4182</p>
              <strong>Packet completed</strong>
              <span>Category: BIOMETRIC_OR_DEVICE_LOCK_UNAVAILABLE</span>
            </div>
            <div className={styles.actionCard}>
              <p>Next action</p>
              <strong>Insert Public Macro</strong>
              <span>Escalate to engineering when confidence is low.</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ribbon}>
        <span>Debug Links</span>
        <span>Support Packets</span>
        <span>Macro Insertion</span>
        <span>Engineering Escalation</span>
        <span>Tenant Analytics</span>
      </section>

      <section className={styles.benefits}>
        <div className={styles.sectionTitle}>
          <p>Core advantages</p>
          <h2>Designed for support speed, not technical complexity.</h2>
        </div>
        <div className={styles.benefitGrid}>
          {benefitCards.map(item => (
            <article key={item.title} className={styles.benefitCard}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.panelShowcase}>
        {imagePanels.map(item => (
          <article key={item.src} className={styles.panelCard}>
            <div className={styles.panelImageWrap}>
              <Image src={item.src} alt={item.alt} fill sizes='(max-width: 980px) 100vw, 47vw' className={styles.panelImage} />
            </div>
            <div className={styles.panelText}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.flowSection}>
        <div className={styles.sectionTitle}>
          <p>Workflow</p>
          <h2>Four moves from ticket to clear next step.</h2>
        </div>
        <ol className={styles.flowList}>
          {steps.map(item => (
            <li key={item.title} className={styles.flowItem}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.sectionTitle}>
          <p>Pricing</p>
          <h2>Start with a focused core, expand with AI later.</h2>
        </div>
        <div className={styles.priceGrid}>
          <article className={styles.corePlan}>
            <h3>Core Plan</h3>
            <p className={styles.price}>$99<span>/month</span></p>
            <ul>
              <li>Zendesk sidebar app</li>
              <li>Debug link and packet workflow</li>
              <li>Rule-based diagnosis</li>
              <li>Macro + escalation actions</li>
              <li>Team analytics dashboard</li>
            </ul>
            <Link href='/register' className={styles.primaryButton}>
              Start Core Plan
            </Link>
          </article>
          <article className={styles.addonPlan}>
            <h3>AI Add-on</h3>
            <p className={styles.price}>+$99<span>/month</span></p>
            <ul>
              <li>Richer diagnosis narratives and suggestions</li>
              <li>Response draft generation</li>
              <li>Priority escalation intelligence</li>
              <li>Deeper automation paths</li>
            </ul>
            <p className={styles.note}>Planned phase after core rollout.</p>
          </article>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.sectionTitle}>
          <p>FAQ</p>
          <h2>Quick answers before you deploy.</h2>
        </div>
        <div className={styles.faqGrid}>
          {faq.map((item, index) => (
            <details key={item.q} open={index === 0} className={styles.faqBox}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.closeSection}>
        <h2>Roll out once. Every agent gets a better playbook.</h2>
        <p>Connect your Zendesk workspace and run your first production triage cycle today.</p>
        <div className={styles.closeActions}>
          <Link href='/register' className={styles.primaryButton}>
            Create Workspace
          </Link>
          <Link href='/app/dashboard' className={styles.secondaryButton}>
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
