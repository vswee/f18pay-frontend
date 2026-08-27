<template>
  <div class="home-page">
    <section class="home-hero home-shell">
      <div class="hero-copy">
        <p class="eyebrow"><span class="eyebrow-dot"></span> Open, practical crypto payments</p>
        <h1>Take crypto payments without handing over the keys.</h1>
        <p class="hero-lede">
          F18 Pay gives you a simple way to create stores, issue invoices, and accept BTC and ETH payments while your funds go straight to your wallet.
        </p>
        <div class="hero-actions">
          <a class="btn pri" href="/signup">Create your free account <i class="fas fa-arrow-right"></i></a>
          <a class="btn home-btn-secondary" href="#features">Explore features <i class="fas fa-arrow-down"></i></a>
        </div>
        <div class="hero-proof" aria-label="F18 Pay principles">
          <span><i class="fas fa-check"></i> Free to use</span>
          <span><i class="fas fa-check"></i> No KYC</span>
          <span><i class="fas fa-check"></i> No cookies</span>
        </div>
      </div>

      <div class="hero-visual" aria-label="F18 Pay payment dashboard preview">
        <div class="visual-glow visual-glow-one"></div>
        <div class="visual-glow visual-glow-two"></div>
        <div class="payment-window">
          <div class="payment-window-topline">
            <span class="window-dots"><i></i><i></i><i></i></span>
            <span class="mono">f18 / checkout</span>
            <i class="fas fa-lock"></i>
          </div>
          <div class="payment-window-brand">
            <span class="mini-mark">F18</span>
            <span>Northstar Goods</span>
            <span class="badge btc">BTC</span>
          </div>
          <p class="payment-label">Payment request</p>
          <div class="payment-total">£10.00</div>
          <div class="payment-address mono">bc1q...7d9z <i class="fas fa-copy"></i></div>
          <div class="payment-status"><span></span> Waiting for payment</div>
          <div class="payment-window-footer">
            <span><i class="fas fa-shield-alt"></i> Direct to wallet</span>
            <span class="mono">00:14:32</span>
          </div>
        </div>
        <div class="floating-chip chip-api"><i class="fas fa-code"></i><span>API + webhooks</span></div>
        <div class="floating-chip chip-wallet"><i class="fas fa-wallet"></i><span>Your wallet</span></div>
      </div>
    </section>

    <div class="home-shell principle-strip">
      <span class="strip-label">Built for people who want</span>
      <span><i class="fas fa-bolt"></i> Less friction</span>
      <span><i class="fas fa-eye-slash"></i> More privacy</span>
      <span><i class="fas fa-sliders-h"></i> Useful control</span>
      <span><i class="fas fa-link"></i> Open integrations</span>
    </div>

    <section id="features" class="home-section home-shell">
      <div class="section-heading">
        <p class="eyebrow">The useful bits, upfront</p>
        <h2>Everything you need to start accepting payments.</h2>
        <p>F18 Pay keeps the day-to-day experience straightforward, with the tools you need as your payment flow grows.</p>
      </div>
      <div class="feature-grid">
        <article class="feature-card feature-card-highlight">
          <span class="feature-icon"><i class="fas fa-wallet"></i></span>
          <h3>Keep control of your funds</h3>
          <p>Generate payment requests that settle to your own wallet, including external wallet and internal store options.</p>
          <span class="feature-tag">Wallet-first payments</span>
        </article>
        <article class="feature-card">
          <span class="feature-icon"><i class="fas fa-store"></i></span>
          <h3>Manage multiple stores</h3>
          <p>Separate projects, currencies, wallets, and payment activity without needing a new account for every idea.</p>
          <span class="feature-tag">One dashboard</span>
        </article>
        <article class="feature-card">
          <span class="feature-icon"><i class="fas fa-file-invoice-dollar"></i></span>
          <h3>Invoices and payment links</h3>
          <p>Create clear payment requests for customers and share a checkout link wherever your business lives.</p>
          <span class="feature-tag">Made for real workflows</span>
        </article>
        <article class="feature-card">
          <span class="feature-icon"><i class="fas fa-plug"></i></span>
          <h3>Invoice Ninja ready</h3>
          <p>Use a BTCPay-compatible API shape with store credentials, invoice creation, status checks, and payment methods.</p>
          <span class="feature-tag">Compatibility first</span>
        </article>
        <article class="feature-card">
          <span class="feature-icon"><i class="fas fa-broadcast-tower"></i></span>
          <h3>Webhooks that keep moving</h3>
          <p>Send invoice lifecycle events back to your systems with signed webhook secrets and configurable events.</p>
          <span class="feature-tag">Stay in sync</span>
        </article>
        <article class="feature-card">
          <span class="feature-icon"><i class="fas fa-user-shield"></i></span>
          <h3>Privacy-minded accounts</h3>
          <p>No KYC and no cookies. Account security includes email verification, password protection, and multi-factor flows.</p>
          <span class="feature-tag">Less data, less noise</span>
        </article>
      </div>
    </section>

    <section class="workflow-section">
      <div class="home-shell workflow-grid">
        <div class="workflow-copy">
          <p class="eyebrow">From first invoice to settlement</p>
          <h2>A payment stack that stays understandable.</h2>
          <p>Start with a store and a wallet. Add API keys and webhooks when you need automation. Keep the customer-facing payment experience simple throughout.</p>
          <div class="workflow-steps">
            <div class="workflow-step"><span>01</span><div><h3>Create a store</h3><p>Choose your network and payment destination.</p></div></div>
            <div class="workflow-step"><span>02</span><div><h3>Ask for payment</h3><p>Use the dashboard, a payment link, or the API.</p></div></div>
            <div class="workflow-step"><span>03</span><div><h3>Connect your systems</h3><p>Use webhooks to react when invoice status changes.</p></div></div>
          </div>
        </div>
        <div class="code-window">
          <div class="code-window-bar"><span class="window-dots"><i></i><i></i><i></i></span><span class="mono">invoice.js</span></div>
          <pre><code><span class="code-muted">POST</span> /api/v1/stores/{storeId}/invoices

{
  <span class="code-key">"amounts"</span>: {
    <span class="code-key">"GBP"</span>: <span class="code-value">"10.00"</span>
  },
  <span class="code-key">"checkoutDesc"</span>: <span class="code-value">"Northstar order"</span>,
  <span class="code-key">"metadata"</span>: {
    <span class="code-key">"orderId"</span>: <span class="code-value">"order_1042"</span>
  }
}

<span class="code-success">✓ webhook: InvoiceSettled</span></code></pre>
        </div>
      </div>
    </section>

    <section id="comparison" class="home-section comparison-section home-shell">
      <div class="section-heading comparison-heading">
        <p class="eyebrow">A fair comparison</p>
        <h2>F18 Pay or BTCPay Server?</h2>
        <p>They solve a similar problem with a different trade-off. The right choice depends on how much infrastructure you want to own.</p>
      </div>
      <div class="comparison-grid">
        <article class="comparison-card comparison-card-f18">
          <div class="comparison-card-top"><span class="mini-mark">F18</span><span class="comparison-label">Managed simplicity</span></div>
          <h3>Choose F18 Pay when you want to get moving.</h3>
          <p class="comparison-intro">A hosted, opinionated payment service with a fast setup and an API designed to fit familiar BTCPay-style integrations.</p>
          <div class="comparison-columns">
            <div><h4><i class="fas fa-plus"></i> Benefits</h4><ul><li>Free to use with no server to deploy or maintain</li><li>Quick store, invoice, API key, and webhook setup</li><li>Invoice Ninja compatibility out of the box</li><li>No KYC and no cookies in the user experience</li></ul></div>
            <div><h4 class="drawback-heading"><i class="fas fa-minus"></i> Drawbacks</h4><ul><li>You trust F18 Pay to operate the service and protect availability</li><li>Less control over infrastructure, upgrades, and customisation</li><li>Hosted service policies and limits can change over time</li></ul></div>
          </div>
          <a class="btn pri comparison-cta" href="/signup">Try F18 Pay <i class="fas fa-arrow-right"></i></a>
        </article>
        <article class="comparison-card comparison-card-btcpay">
          <div class="comparison-card-top"><span class="btcpay-mark">B</span><span class="comparison-label">Self-hosted control</span></div>
          <h3>Choose BTCPay Server when you want to own the stack.</h3>
          <p class="comparison-intro">A powerful open-source platform for teams that want to run, configure, and extend their own payment infrastructure.</p>
          <div class="comparison-columns">
            <div><h4><i class="fas fa-plus"></i> Benefits</h4><ul><li>Maximum control over hosting, data, configuration, and updates</li><li>Strong self-hosting story for technical teams</li><li>Broad ecosystem and deep customisation potential</li><li>Can be operated on infrastructure you control</li></ul></div>
            <div><h4 class="drawback-heading"><i class="fas fa-minus"></i> Drawbacks</h4><ul><li>You own deployment, monitoring, backups, upgrades, and security</li><li>Infrastructure and maintenance have real time and cost</li><li>More setup work before the first payment can be accepted</li></ul></div>
          </div>
          <a class="btn home-btn-secondary comparison-cta" href="https://btcpayserver.org" target="_blank" rel="noopener">Explore BTCPay Server <i class="fas fa-external-link-alt"></i></a>
        </article>
      </div>
      <p class="comparison-note"><i class="fas fa-info-circle"></i> There is no universal winner: F18 Pay is about a lighter operational burden, while BTCPay Server is about maximum ownership and control. Both still require sensible wallet security and operational care.</p>
    </section>

    <section class="demo-section home-shell">
      <div class="demo-copy"><p class="eyebrow">Try the customer experience</p><h2>See how a payment request feels.</h2><p>Open a sample checkout page and experience the simple side of F18 Pay. Your real integrations can use the API when you are ready.</p></div>
      <form target="_blank" method="GET" :action="base_url" class="demo-card">
        <div><span class="demo-card-icon"><i class="fas fa-shopping-bag"></i></span><div><strong>Northstar Goods</strong><span>Digital field guide</span></div></div>
        <div class="demo-price"><span>Sample payment</span><strong>£10.00</strong></div>
        <input type="hidden" name="store_id" value="I1wxWgfpeUCfsIKSx9sqvLvdGXCKUqTKGt8EXDUkdZbsgouxUInNLrxQEyK1b3R6P0cAGhT6YFjNvd1V3RMTe6RwB6SDOay1eOdgDgLVSUXljlsI83QNOcZJDRdbnqnFnLhrwL87exLP9ymIgP0HMfeT59OiVApX4BROH4xV1G61KhkViIFXzrbfTPM73YObf6kUQODIyzqod778Ya62YYZ6elWIu1lksZsdggkcRneN5VqR4dHsClu75b3hHKXoPWzTHPgKbdf1YqdvlCgio4iG6lwZ9zDB2cCf4bAVFP3BRN7hRjaoDkLbAWg37iNYxN4rjaWpCp0zDPDHJUWGTY7l49hdU7YOoS2IuvFzRkAyti2uE8eurgUU2XRIV4Hb9SfA4AirZT2PMOWbxhzftomYYbpZgnMHagkHsAX80z70lwosOoufnjmNvErZNvTwP6buMVXcHI6FCv1ZOX4LqaM4GpLwMXhfjpFMqWZiBzxmWpZL574n3DEFVNgELd9z" />
        <input type="hidden" name="redirectURL" value="" />
        <input type="hidden" name="price" value="10" />
        <input type="hidden" name="currency" value="GBP" />
        <button class="btn pri demo-button" name="submit" type="submit">Open sample checkout <i class="fas fa-arrow-right"></i></button>
      </form>
    </section>

    <section class="final-cta home-shell">
      <div><p class="eyebrow">Ready when you are</p><h2>Make your first store today.</h2><p>Start with a free account, then bring your own wallet and workflow when you are ready.</p></div>
      <a class="btn pri" href="/signup">Get started with F18 Pay <i class="fas fa-arrow-right"></i></a>
    </section>
  </div>
</template>

<script setup>
defineOptions({ name: 'HomePage' });

import { useMainStore } from '@/stores';
import { storeToRefs } from 'pinia';

const store = useMainStore();
const { getURL } = storeToRefs(store);
const base_url = getURL;
</script>

<style lang="scss">
.home-page {
  --home-panel: rgba(255, 255, 255, 0.045);
  --home-panel-strong: rgba(255, 255, 255, 0.08);
  min-height: 100%;
  overflow: hidden;
  background: radial-gradient(circle at 75% 8%, var(--accent-bg), transparent 30rem), var(--primary);
}

.home-shell { max-width: 1240px; margin: 0 auto; padding-left: 32px; padding-right: 32px; }
.home-page h1, .home-page h2, .home-page h3, .home-page h4, .home-page p { max-width: none; }
.home-page h1, .home-page h2, .home-page h3 { letter-spacing: -0.035em; }
.home-page h2 { font-size: clamp(2rem, 4vw, 3.5rem); line-height: 1.03; margin: 0 0 18px; }
.home-page p { line-height: 1.65; color: var(--accent-5); }
.eyebrow { color: var(--accent-4) !important; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.16em; text-transform: uppercase; }
.eyebrow-dot { display: inline-block; width: 8px; height: 8px; margin-right: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 18px var(--green); }
.home-page .btn { align-items: center; justify-content: center; width: auto; margin: 0; border: none; text-transform: none; line-height: 1.2; }
.home-page .home-btn-secondary { background: var(--home-panel-strong) !important; color: var(--white) !important; }

.home-hero { display: grid; grid-template-columns: minmax(0, 1fr) minmax(400px, 0.9fr); gap: clamp(36px, 7vw, 110px); align-items: center; min-height: 680px; padding-top: 72px; padding-bottom: 88px; }
.hero-copy h1 { max-width: 720px; margin: 12px 0 24px; font-size: clamp(3.25rem, 6.4vw, 6.1rem); line-height: 0.96; font-weight: 900; }
.hero-lede { max-width: 600px !important; margin: 0; font-size: clamp(1.05rem, 1.6vw, 1.3rem); }
.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }
.hero-actions .btn { min-height: 50px; padding: 14px 19px; }
.hero-proof { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 28px; color: var(--accent-5); font-size: 0.85rem; }
.hero-proof i { margin-right: 6px; color: var(--green); }

.hero-visual { position: relative; min-height: 500px; display: grid; place-items: center; isolation: isolate; }
.hero-visual::before { content: ''; position: absolute; width: 90%; height: 75%; border: 1px solid var(--accent-bg); border-radius: 50%; transform: rotate(-18deg); z-index: -1; }
.visual-glow { position: absolute; border-radius: 50%; filter: blur(50px); opacity: 0.32; z-index: -2; }
.visual-glow-one { width: 220px; height: 220px; top: 5%; right: 3%; background: var(--accent); }
.visual-glow-two { width: 180px; height: 180px; bottom: 8%; left: 4%; background: var(--green); }
.payment-window { position: relative; width: min(100%, 430px); padding: 18px; border: 1px solid var(--gauze-20); border-radius: 18px; background: linear-gradient(145deg, var(--home-panel-strong), var(--home-panel)); box-shadow: 0 35px 70px -30px #000, inset 0 1px 0 var(--gauze-20); transform: rotate(2deg); }
.payment-window-topline, .payment-window-brand, .payment-window-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.payment-window-topline { color: var(--accent-5); font-size: 0.72rem; }
.window-dots { display: flex; gap: 4px; }.window-dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-4); opacity: 0.7; }
.payment-window-brand { justify-content: flex-start; margin-top: 40px; font-size: 1rem; font-weight: 700; }.mini-mark, .btcpay-mark { display: inline-grid; place-items: center; width: 34px; height: 34px; border-radius: 10px; background: var(--accent); color: var(--white); font-size: 0.75rem; font-weight: 900; letter-spacing: -0.08em; }.btcpay-mark { border-radius: 50%; background: #f7931a; color: #171b24; font-size: 1.1rem; }
.badge.btc { margin-left: auto; color: var(--accent-4); background: var(--accent-bg); }.payment-label { margin: 34px 0 3px; color: var(--accent-5) !important; font-size: 0.8rem; }.payment-total { font-size: 3.6rem; font-weight: 900; letter-spacing: -0.06em; }.payment-address { margin-top: 22px; padding: 12px; border-radius: 8px; background: var(--shadow-30); color: var(--accent-4); font-size: 0.8rem; }.payment-address i { float: right; }.payment-status { display: flex; align-items: center; gap: 9px; margin: 18px 0; color: var(--accent-5); font-size: 0.8rem; }.payment-status span { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--accent); }.payment-window-footer { padding-top: 15px; border-top: 1px solid var(--gauze-20); color: var(--accent-5); font-size: 0.7rem; }.payment-window-footer i { color: var(--green); }.floating-chip { position: absolute; display: flex; align-items: center; gap: 9px; padding: 12px 15px; border: 1px solid var(--gauze-20); border-radius: 12px; background: var(--black); box-shadow: 0 20px 40px -20px #000; color: var(--white); font-size: 0.8rem; font-weight: 700; }.floating-chip i { color: var(--green); }.chip-api { top: 12%; right: -2%; }.chip-wallet { bottom: 13%; left: -2%; }.mono { font-family: 'IBM Plex Mono', 'Courier', monospace; }

.principle-strip { display: flex; align-items: center; flex-wrap: wrap; gap: 26px; padding-top: 20px; padding-bottom: 20px; border-top: 1px solid var(--gauze-20); border-bottom: 1px solid var(--gauze-20); color: var(--accent-5); font-size: 0.82rem; }.strip-label { color: var(--accent-4); font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.68rem; }.principle-strip i { margin-right: 6px; color: var(--accent); }
.home-section { padding-top: 120px; padding-bottom: 120px; }.section-heading { max-width: 700px; margin-bottom: 46px; }.section-heading > p:last-child { font-size: 1.05rem; }.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }.feature-card { min-height: 265px; padding: 28px; border-radius: 15px; background: var(--home-panel); transition: transform 0.2s ease, background 0.2s ease; }.feature-card:hover { transform: translateY(-4px); background: var(--home-panel-strong); }.feature-card-highlight { background: linear-gradient(145deg, var(--accent-bg), var(--home-panel)); }.feature-icon { display: grid; place-items: center; width: 42px; height: 42px; margin-bottom: 30px; border-radius: 11px; background: var(--accent-bg); color: var(--accent-4); }.feature-card h3 { margin: 0 0 10px; font-size: 1.25rem; }.feature-card p { margin: 0 0 20px; font-size: 0.9rem; }.feature-tag { color: var(--accent-4); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }

.workflow-section { padding: 115px 0; background: linear-gradient(100deg, var(--home-panel), transparent 75%); }.workflow-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 90px; align-items: center; }.workflow-copy > p:not(.eyebrow) { max-width: 580px; }.workflow-steps { margin-top: 36px; }.workflow-step { display: grid; grid-template-columns: 44px 1fr; gap: 16px; padding: 17px 0; border-top: 1px solid var(--gauze-20); }.workflow-step > span { color: var(--accent); font: 700 0.8rem 'IBM Plex Mono', monospace; }.workflow-step h3 { margin: 0 0 3px; font-size: 1rem; letter-spacing: 0; }.workflow-step p { margin: 0; font-size: 0.85rem; }.code-window { overflow: hidden; border: 1px solid var(--gauze-20); border-radius: 15px; background: #0a0e17; box-shadow: 0 30px 80px -40px #000; }.code-window-bar { display: flex; align-items: center; gap: 14px; padding: 15px 18px; border-bottom: 1px solid var(--gauze-20); color: var(--accent-5); font-size: 0.75rem; }.code-window pre { margin: 0; padding: 28px; overflow: auto; color: var(--white); font: 0.82rem/2 'IBM Plex Mono', monospace; }.code-muted { color: var(--accent-4); }.code-key { color: #8fb5ff; }.code-value { color: #8fe8b6; }.code-success { color: var(--green); }

.comparison-section { padding-bottom: 130px; }.comparison-heading { max-width: 800px; }.comparison-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }.comparison-card { padding: 34px; border-radius: 16px; background: var(--home-panel); }.comparison-card-f18 { background: linear-gradient(145deg, var(--accent-bg), var(--home-panel) 55%); }.comparison-card-top { display: flex; align-items: center; gap: 12px; color: var(--accent-5); font-size: 0.8rem; font-weight: 700; }.comparison-label { text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.65rem; }.comparison-card h3 { max-width: 450px; margin: 28px 0 14px; font-size: 1.7rem; line-height: 1.1; }.comparison-intro { min-height: 82px; margin-bottom: 22px; font-size: 0.9rem; }.comparison-columns { display: grid; grid-template-columns: repeat(2, 1fr); gap: 23px; }.comparison-columns h4 { margin: 0 0 12px; color: var(--green); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; }.comparison-columns h4 i { margin-right: 5px; }.comparison-columns .drawback-heading { color: var(--accent-5); }.comparison-columns ul { margin: 0; padding: 0; list-style: none; }.comparison-columns li { position: relative; margin: 0 0 12px; padding-left: 14px; color: var(--accent-5); font-size: 0.82rem; line-height: 1.5; }.comparison-columns li::before { content: '•'; position: absolute; left: 0; color: var(--accent); }.comparison-cta { margin-top: 26px !important; }.comparison-note { display: flex; gap: 10px; max-width: 820px; margin: 24px auto 0; padding: 15px 18px; border-radius: 9px; background: var(--home-panel); font-size: 0.8rem; }.comparison-note i { color: var(--accent); }

.demo-section { display: grid; grid-template-columns: 1fr 0.8fr; gap: 70px; align-items: center; padding-top: 40px; padding-bottom: 120px; }.demo-copy h2 { max-width: 500px; }.demo-copy p:last-child { max-width: 500px; }.demo-card { display: grid; gap: 23px; padding: 25px; border-radius: 15px; background: var(--home-panel-strong); box-shadow: 0 25px 70px -45px #000; }.demo-card > div:first-child { display: flex; align-items: center; gap: 13px; }.demo-card-icon { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 11px; background: var(--accent); }.demo-card strong, .demo-card span { display: block; }.demo-card > div:first-child span:last-child { margin-top: 3px; color: var(--accent-5); font-size: 0.75rem; }.demo-price { display: flex; justify-content: space-between; align-items: baseline; padding: 16px 0; border-top: 1px solid var(--gauze-20); border-bottom: 1px solid var(--gauze-20); }.demo-price span { color: var(--accent-5); font-size: 0.8rem; }.demo-price strong { font-size: 1.65rem; }.demo-button { width: 100% !important; }
.final-cta { display: flex; align-items: center; justify-content: space-between; gap: 30px; margin-bottom: 80px; padding-top: 58px; padding-bottom: 58px; border-top: 1px solid var(--gauze-20); border-bottom: 1px solid var(--gauze-20); }.final-cta h2 { margin-bottom: 8px; }.final-cta p:last-child { margin: 0; }.final-cta .btn { flex: 0 0 auto; }

#appContainer.light .home-page {
  --home-panel: rgba(15, 23, 42, 0.045);
  --home-panel-strong: rgba(15, 23, 42, 0.08);
}
#appContainer.light .home-page p,
#appContainer.light .home-page .hero-proof,
#appContainer.light .home-page .payment-window-topline,
#appContainer.light .home-page .payment-window-footer,
#appContainer.light .home-page .principle-strip,
#appContainer.light .home-page .comparison-card-top,
#appContainer.light .home-page .comparison-columns li { color: #334155; }
#appContainer.light .home-page .eyebrow,
#appContainer.light .home-page .strip-label,
#appContainer.light .home-page .feature-tag { color: #174ea6 !important; }
#appContainer.light .home-page .payment-label,
#appContainer.light .home-page .payment-address,
#appContainer.light .home-page .payment-status,
#appContainer.light .home-page .demo-card > div:first-child span:last-child,
#appContainer.light .home-page .demo-price span { color: #475569 !important; }
#appContainer.light .home-page .principle-strip,
#appContainer.light .home-page .payment-window-footer,
#appContainer.light .home-page .workflow-step,
#appContainer.light .home-page .demo-price,
#appContainer.light .home-page .final-cta { border-color: rgba(15, 23, 42, 0.16); }
#appContainer.light .home-page .payment-window,
#appContainer.light .home-page .floating-chip { border-color: rgba(15, 23, 42, 0.16); }
#appContainer.light .home-page .code-window,
#appContainer.light .home-page .code-window-bar,
#appContainer.light .home-page .code-window pre { color: #f8fafc; }
#appContainer.light .home-page .code-window-bar { border-color: rgba(255, 255, 255, 0.2); }

@media (max-width: 980px) { .home-hero { grid-template-columns: 1fr; min-height: auto; padding-top: 65px; }.hero-copy { max-width: 750px; }.hero-visual { min-height: 450px; max-width: 650px; width: 100%; margin: 0 auto; }.feature-grid { grid-template-columns: repeat(2, 1fr); }.workflow-grid { gap: 45px; }.demo-section { gap: 35px; } }
@media (max-width: 700px) { .home-shell { padding-left: 20px; padding-right: 20px; }.home-hero { padding-top: 45px; padding-bottom: 55px; }.hero-copy h1 { font-size: clamp(2.8rem, 14vw, 4.5rem); }.hero-actions, .hero-actions .btn { width: 100%; }.hero-proof { gap: 10px 17px; }.hero-visual { min-height: 390px; }.payment-window { width: 93%; }.floating-chip { padding: 9px 11px; font-size: 0.7rem; }.chip-api { top: 4%; right: 0; }.chip-wallet { bottom: 4%; left: 0; }.principle-strip { gap: 14px 22px; }.strip-label { flex-basis: 100%; }.home-section { padding-top: 75px; padding-bottom: 75px; }.feature-grid, .comparison-grid, .workflow-grid, .demo-section { grid-template-columns: 1fr; }.feature-card { min-height: auto; }.workflow-section { padding: 75px 0; }.comparison-card { padding: 24px 20px; }.comparison-columns { grid-template-columns: 1fr; gap: 18px; }.comparison-intro { min-height: auto; }.demo-section { padding-top: 10px; padding-bottom: 75px; }.final-cta { align-items: flex-start; flex-direction: column; margin-bottom: 40px; }.final-cta .btn { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .feature-card { transition: none; } .feature-card:hover { transform: none; } }
</style>
