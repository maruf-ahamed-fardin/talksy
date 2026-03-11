import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'For solo use, testing the product, and simple recurring calls.',
    ctaLabel: 'Start free',
    ctaTo: '/video/demo-room',
    ctaSecondary: true,
    features: [
      'Create or join rooms with a code',
      'One clean shareable room link',
      'Guest display-name entry',
      'Demo room access and local room history',
    ],
  },
  {
    name: 'Team',
    price: '$24',
    description: 'For small teams that want a sharper, more repeatable meeting workflow.',
    ctaLabel: 'Buy Team',
    ctaTo: '/get-started?plan=team',
    features: [
      'Everything in Starter',
      'Installable app experience for faster relaunch',
      'Recommended workflows for recurring rooms',
      'Priority setup guidance for hosts',
      'Better handoff for demos and client-facing calls',
    ],
    featured: true,
  },
  {
    name: 'Scale',
    price: '$79',
    description: 'For larger organizations rolling Talksy out across multiple teams or audiences.',
    ctaLabel: 'Buy Scale',
    ctaTo: '/get-started?plan=scale',
    features: [
      'Everything in Team',
      'Multi-team rollout guidance',
      'Room naming and repeat-session planning',
      'Launch support for larger groups and events',
      'Usage review and custom support workflows',
    ],
  },
];

function PricingPage() {
  const [selectedPlanName, setSelectedPlanName] = useState(null);
  const checkoutRef = useRef(null);
  const selectedPlan = plans.find((plan) => plan.name === selectedPlanName) ?? null;

  useEffect(() => {
    if (!selectedPlan || !checkoutRef.current) {
      return;
    }

    checkoutRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [selectedPlan]);

  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Pricing</span>
        <h1>Choose the Talksy plan that matches how often and how seriously you meet.</h1>
        <p>
          Every plan keeps the core product light: live rooms, shareable links, room
          history, responsive layouts, and fast setup from day one.
        </p>
      </div>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`price-card ${plan.featured ? 'featured' : ''}`} key={plan.name}>
            <span className="price-badge">{plan.featured ? 'Most popular' : 'Plan'}</span>
            <h3>{plan.name}</h3>
            <span className="price-amount">
              {plan.price}
              <small>{plan.price === '$0' ? ' forever' : ' / month'}</small>
            </span>
            <p>{plan.description}</p>
            <ul className="price-features">
              {plan.features.map((feature) => (
                <li className="price-feature" key={feature}>
                  {feature}
                </li>
              ))}
            </ul>
              {plan.price === '$0' ? (
                <Link
                  className={`inline-button price-card__action${plan.ctaSecondary ? ' inline-button--secondary' : ''}`}
                  to={plan.ctaTo}
                >
                  {plan.ctaLabel}
                </Link>
              ) : (
                <button
                  className="inline-button price-card__action"
                  onClick={() => setSelectedPlanName(plan.name)}
                  type="button"
                >
                  {plan.ctaLabel}
                </button>
              )}
            </article>
          ))}
        </div>

      {selectedPlan ? (
        <section className="checkout-demo" ref={checkoutRef}>
          <div className="checkout-demo__summary detail-card accent-lavender">
            <span className="card-label">Demo checkout</span>
            <h3>{selectedPlan.name} plan selected</h3>
            <p>
              This is a front-end demo card section for showing how a purchase flow could
              feel inside Talksy before a real payment gateway is connected.
            </p>
            <div className="checkout-demo__price">
              <strong>{selectedPlan.price}</strong>
              <span>/ month</span>
            </div>
            <ul className="detail-list">
              {selectedPlan.features.slice(0, 4).map((feature) => (
                <li key={`${selectedPlan.name}-${feature}`}>{feature}</li>
              ))}
            </ul>
          </div>

          <div className="checkout-demo__panel detail-card accent-ice">
            <div className="checkout-demo__panel-top">
              <div>
                <span className="card-label">Card details</span>
                <h3>Complete your demo purchase</h3>
              </div>
              <button
                className="inline-button inline-button--secondary checkout-demo__close"
                onClick={() => setSelectedPlanName(null)}
                type="button"
              >
                Close
              </button>
            </div>

            <div className="checkout-demo__card-preview">
              <span>Talksy Pay</span>
              <strong>4242 4242 4242 4242</strong>
              <div className="checkout-demo__card-preview-meta">
                <span>Exp 12/28</span>
                <span>{selectedPlan.name}</span>
              </div>
            </div>

            <form className="checkout-demo__form">
              <label className="checkout-demo__field">
                <span>Email address</span>
                <input defaultValue="team@talksy.app" type="email" />
              </label>
              <label className="checkout-demo__field">
                <span>Name on card</span>
                <input defaultValue="Talksy Demo Buyer" type="text" />
              </label>
              <label className="checkout-demo__field">
                <span>Card number</span>
                <input defaultValue="4242 4242 4242 4242" inputMode="numeric" type="text" />
              </label>
              <div className="checkout-demo__form-row">
                <label className="checkout-demo__field">
                  <span>Expiry</span>
                  <input defaultValue="12/28" inputMode="numeric" type="text" />
                </label>
                <label className="checkout-demo__field">
                  <span>CVC</span>
                  <input defaultValue="123" inputMode="numeric" type="text" />
                </label>
              </div>
              <button className="inline-button checkout-demo__submit" type="button">
                Confirm demo purchase
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <div className="page-cta">
        <div>
          <span className="card-label">Still comparing?</span>
          <p>
            Start free, test the live room flow, then upgrade only when you need more
            rollout help and a stronger repeatable team setup.
          </p>
        </div>
        <div className="stacked-actions">
          <Link className="inline-button" to="/get-started">
            Plan rollout
          </Link>
          <Link className="inline-button inline-button--secondary" to="/video/demo-room">
            Try a demo room
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PricingPage;
