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
            <Link
              className={`inline-button price-card__action${plan.ctaSecondary ? ' inline-button--secondary' : ''}`}
              to={plan.ctaTo}
            >
              {plan.ctaLabel}
            </Link>
          </article>
        ))}
      </div>

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
