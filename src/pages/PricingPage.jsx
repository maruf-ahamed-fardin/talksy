import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'For personal calls and casual small-group rooms.',
    features: [
      'Instant rooms',
      'Basic call controls',
      'Simple participant links',
    ],
  },
  {
    name: 'Team',
    price: '$24',
    description: 'For teams that need structure, polish, and follow-up.',
    features: [
      'Everything in Starter',
      'Meeting notes and action prompts',
      'Priority room branding',
      'Advanced collaboration layouts',
    ],
    featured: true,
  },
  {
    name: 'Scale',
    price: '$79',
    description: 'For high-volume operations, events, and larger organizations.',
    features: [
      'Everything in Team',
      'Dedicated onboarding',
      'Usage reporting',
      'Custom support workflows',
    ],
  },
];

function PricingPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Pricing</span>
        <h1>Choose a plan that matches the way your people actually meet.</h1>
        <p>
          Start free, upgrade when you need more structure, and keep your meeting stack
          lightweight from day one.
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
          </article>
        ))}
      </div>

      <div className="page-cta">
        <div>
          <span className="card-label">Still comparing?</span>
          <p>Start with the free plan or book a quick walkthrough if you need help mapping the right setup.</p>
        </div>
        <div className="stacked-actions">
          <Link className="inline-button" to="/get-started">
            Book walkthrough
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
