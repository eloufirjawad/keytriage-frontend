import Link from 'next/link'

import styles from './landing.module.css'

const LandingPage = () => {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>KeyTriage</p>
          <h1>Resolve login and passkey tickets faster inside Zendesk.</h1>
          <p className={styles.subtitle}>
            Send one secure debug link, collect a safe support packet, classify the failure, and respond with guided
            macro steps.
          </p>
          <div className={styles.actions}>
            <Link href='/register' className={styles.primaryCta}>
              Create Workspace
            </Link>
            <Link href='/login' className={styles.secondaryCta}>
              Sign In
            </Link>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.panelCard}>
            <h3>Agent workflow in minutes</h3>
            <ul>
              <li>Send debug link from ticket</li>
              <li>Auto-attach packet summary and tags</li>
              <li>Insert macro with one click</li>
              <li>Escalate unknowns with clean context</li>
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>How it works</h2>
        <div className={styles.grid}>
          <article>
            <span>1</span>
            <h3>Trigger</h3>
            <p>Agent sends a one-time debug link directly from Zendesk.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Collect</h3>
            <p>User provides consent, symptom, and optional error/screenshot.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Classify</h3>
            <p>Rule engine returns category, confidence, and recommended macro set.</p>
          </article>
          <article>
            <span>4</span>
            <h3>Resolve</h3>
            <p>Support packet is attached to ticket with tags and analytics events.</p>
          </article>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <h2>Built for support teams, not auth engineers</h2>
        <div className={styles.featureList}>
          <div>
            <h3>No sensitive credential capture</h3>
            <p>No WebAuthn payloads, challenges, attestation objects, biometrics, or private keys are collected.</p>
          </div>
          <div>
            <h3>Zendesk-native operations</h3>
            <p>
              Ticket comments, internal notes, tags, macro insertion, and escalation actions are all first-class
              operations.
            </p>
          </div>
          <div>
            <h3>Actionable analytics</h3>
            <p>Track packet completion, top failure categories, platform breakdown, escalation rate, and TTR trends.</p>
          </div>
        </div>
      </section>

      <section className={styles.footerCta}>
        <h2>Start with your own ticket flow now</h2>
        <p>Open the app workspace and run the full loop in your local environment.</p>
        <div className={styles.actions}>
          <Link href='/app/dashboard' className={styles.primaryCta}>
            Open Workspace
          </Link>
          <Link href='/app/settings' className={styles.secondaryCta}>
            Configure Tenant
          </Link>
        </div>
      </section>
    </main>
  )
}

export default LandingPage
