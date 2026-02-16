import Image from 'next/image'
import Link from 'next/link'

import styles from './landing.module.css'

const heroImage =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=75'

const showcaseImages = [
  {
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=75',
    alt: 'Support and product team collaboration',
    title: 'Cross-team handoff clarity',
    summary: 'Escalations carry complete context instead of guesswork.'
  },
  {
    src: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=75',
    alt: 'Customer support workflow review',
    title: 'Faster ticket investigation',
    summary: 'Agents classify login failures in minutes, not hours.'
  },
  {
    src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=75',
    alt: 'Analytics dashboard planning session',
    title: 'Operational visibility for leads',
    summary: 'Track trends by category, platform, and resolution path.'
  }
]

const outcomeCards = [
  {
    title: 'Lower escalations',
    value: '-31%',
    description: 'Agents solve more passkey issues at first touch with guided packet context.'
  },
  {
    title: 'Faster response cycle',
    value: '2.7x',
    description: 'Debug links and one-click macros remove repetitive triage back-and-forth.'
  },
  {
    title: 'Cleaner support data',
    value: '100%',
    description: 'Every packet includes standardized evidence for analytics and QA reviews.'
  }
]

const workflowSteps = [
  {
    title: 'Launch debug link',
    text: 'Agent sends a secure packet link from the Zendesk sidebar.'
  },
  {
    title: 'Collect signal',
    text: 'Customer submits symptom, environment, and optional screenshot.'
  },
  {
    title: 'Classify failure',
    text: 'Rules return category, confidence, and recommended macro path.'
  },
  {
    title: 'Resolve or escalate',
    text: 'Insert public/internal notes or escalate with engineering-ready context.'
  }
]

const faqItems = [
  {
    q: 'Do agents need a separate KeyTriage account?',
    a: 'No. Zendesk admin connects once, then agents authenticate through Zendesk and can use the app inside tickets.'
  },
  {
    q: 'What sensitive data is stored?',
    a: 'KeyTriage does not collect passwords, private keys, biometric templates, or raw WebAuthn credentials.'
  },
  {
    q: 'Can we start without AI?',
    a: 'Yes. The core $99 plan runs on deterministic rules and macro workflows. AI can be added later as an upgrade.'
  }
]

const LandingPage = () => {
  return (
    <main className={styles.page}>
      <div className={styles.glowLayer} aria-hidden />

      <header className={styles.topbar}>
        <div className={styles.brandWrap}>
          <div className={styles.brand}>KeyTriage</div>
          <span className={styles.brandTag}>for Zendesk support teams</span>
        </div>
        <nav className={styles.navLinks}>
          <Link href='/register' className={styles.navGhost}>
            Start Setup
          </Link>
          <Link href='/login' className={styles.navPrimary}>
            Agent Login
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroLead}>
          <p className={styles.kicker}>Ticket diagnosis that actually scales</p>
          <h1 className={styles.heroTitle}>Your team can resolve passkey tickets with confidence, not guesswork.</h1>
          <p className={styles.heroSubtitle}>
            KeyTriage standardizes investigation inside Zendesk: secure debug links, structured packets, rule-based
            diagnosis, and one-click macro responses.
          </p>
          <div className={styles.heroStats}>
            {outcomeCards.map(item => (
              <div key={item.title} className={styles.heroStat}>
                <strong>{item.value}</strong>
                <span>{item.title}</span>
              </div>
            ))}
          </div>
          <div className={styles.heroActions}>
            <Link href='/register' className={styles.ctaPrimary}>
              Create Workspace
            </Link>
            <Link href='/login' className={styles.ctaSecondary}>
              Open Existing Workspace
            </Link>
          </div>
          <p className={styles.heroNote}>No SDK required. Admin connects once, agents get instant access.</p>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroImageFrame}>
            <Image
              src={heroImage}
              alt='Support operations center reviewing authentication support tickets'
              fill
              priority
              sizes='(max-width: 1024px) 100vw, 45vw'
              className={styles.heroImage}
            />
          </div>
          <div className={styles.floatCardTop}>
            <p>Latest packet</p>
            <strong>completed</strong>
            <span>Category: BIOMETRIC_OR_DEVICE_LOCK_UNAVAILABLE</span>
          </div>
          <div className={styles.floatCardBottom}>
            <p>Suggested action</p>
            <strong>Insert Public Macro</strong>
            <span>Escalate to engineering if confidence &lt; 0.45</span>
          </div>
        </div>
      </section>

      <section className={styles.trustStrip}>
        <p>Built around real Zendesk operations:</p>
        <div className={styles.trustBadges}>
          <span>Debug Links</span>
          <span>Support Packets</span>
          <span>Macro Insertion</span>
          <span>Escalation Notes</span>
          <span>Tenant Analytics</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>Impact</p>
          <h2>What changes when KeyTriage is in your workflow</h2>
        </div>
        <div className={styles.outcomeGrid}>
          {outcomeCards.map(item => (
            <article key={item.title} className={styles.outcomeCard}>
              <p className={styles.outcomeValue}>{item.value}</p>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.workflowSection}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>Workflow</p>
          <h2>One tight loop from ticket to resolution</h2>
        </div>
        <div className={styles.workflowGrid}>
          {workflowSteps.map((step, index) => (
            <article key={step.title} className={styles.stepCard}>
              <span className={styles.stepIndex}>0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.gallerySection}>
        {showcaseImages.map(item => (
          <article key={item.src} className={styles.galleryCard}>
            <div className={styles.galleryImageWrap}>
              <Image src={item.src} alt={item.alt} fill sizes='(max-width: 1024px) 100vw, 32vw' className={styles.galleryImage} />
            </div>
            <div className={styles.galleryCopy}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>Pricing</p>
          <h2>Start lean, add AI when you are ready</h2>
        </div>
        <div className={styles.pricingGrid}>
          <article className={styles.priceCardPrimary}>
            <p className={styles.priceLabel}>Core platform</p>
            <h3>$99</h3>
            <p className={styles.priceMeta}>per month / workspace</p>
            <ul>
              <li>Zendesk app + debug link flow</li>
              <li>Rule-based diagnosis and confidence scoring</li>
              <li>Public/internal macro actions</li>
              <li>Escalation + analytics dashboard</li>
            </ul>
            <Link href='/register' className={styles.priceCtaPrimary}>
              Start Core Plan
            </Link>
          </article>
          <article className={styles.priceCard}>
            <p className={styles.priceLabel}>AI Copilot (phase 2)</p>
            <h3>+$99</h3>
            <p className={styles.priceMeta}>per month / workspace</p>
            <ul>
              <li>Richer diagnosis narratives</li>
              <li>Response draft generation</li>
              <li>Smarter escalation summaries</li>
              <li>Higher automation depth</li>
            </ul>
            <p className={styles.priceSoon}>Planned add-on after core rollout.</p>
          </article>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.sectionHead}>
          <p className={styles.sectionKicker}>FAQ</p>
          <h2>Everything support leads ask before rollout</h2>
        </div>
        <div className={styles.faqList}>
          {faqItems.map((item, index) => (
            <details key={item.q} open={index === 0} className={styles.faqItem}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <h2>Deploy once. Let every agent triage with confidence.</h2>
        <p>Connect your Zendesk workspace now and run your first full debug-to-resolution flow today.</p>
        <div className={styles.finalActions}>
          <Link href='/register' className={styles.ctaPrimary}>
            Create Workspace
          </Link>
          <Link href='/app/dashboard' className={styles.ctaSecondary}>
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
