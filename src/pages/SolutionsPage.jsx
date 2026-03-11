import { Link } from 'react-router-dom';

const solutions = [
  {
    title: 'Remote teams',
    description:
      'Daily stand-ups, stakeholder check-ins, and design reviews move faster with focused rooms and reliable join links.',
    meta: 'Best for product, engineering, and operations',
  },
  {
    title: 'Coaches and consultants',
    description:
      'Run sessions with clients, share a room instantly, and keep every conversation professional without technical overhead.',
    meta: 'Best for solo operators and service teams',
  },
  {
    title: 'Educators and mentors',
    description:
      'Teach live, support office hours, and create smaller discussion rooms that students can join without confusion.',
    meta: 'Best for live classes and training sessions',
  },
  {
    title: 'Communities and events',
    description:
      'Host virtual meetups, breakout sessions, and member calls in a simple environment that feels easy to enter.',
    meta: 'Best for networks, clubs, and member spaces',
  },
];

function SolutionsPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Solutions</span>
        <h1>Built for the people who need conversations to stay simple and effective.</h1>
        <p>
          Whether you are coordinating a small team or hosting a large workshop, Talksy
          keeps the joining experience clear and the meeting flow under control.
        </p>
      </div>

      <div className="page-grid page-grid-two">
        {solutions.map((solution, index) => (
          <article className={`solution-card ${index % 2 === 0 ? 'accent-blue' : 'accent-peach'}`} key={solution.title}>
            <span className="card-label">Use case</span>
            <h3>{solution.title}</h3>
            <p>{solution.description}</p>
            <span className="solution-meta">{solution.meta}</span>
          </article>
        ))}
      </div>

      <div className="page-cta">
        <div>
          <span className="card-label">Need a custom workflow?</span>
          <p>
            Mix meeting templates, pricing tiers, and onboarding guidance to match the way your group already works.
          </p>
        </div>
        <div className="stacked-actions">
          <Link className="inline-button" to="/get-started">
            Talk to us
          </Link>
          <Link className="inline-button inline-button--secondary" to="/pricing">
            Review plans
          </Link>
        </div>
      </div>
    </section>
  );
}

export default SolutionsPage;
