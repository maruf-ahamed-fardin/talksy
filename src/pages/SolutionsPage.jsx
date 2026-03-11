import { Link } from 'react-router-dom';

const solutions = [
  {
    title: 'Product teams and startups',
    description:
      'Run stand-ups, sprint reviews, design critiques, and stakeholder check-ins with room links that are fast to share and easy to reopen.',
    meta: 'Best for product, engineering, operations, and founders',
  },
  {
    title: 'Agencies and client services',
    description:
      'Send one room link to clients, jump into fullscreen when presenting, and keep recurring reviews tidy with reusable room habits.',
    meta: 'Best for account teams, consultants, and delivery calls',
  },
  {
    title: 'Educators and mentors',
    description:
      'Teach live classes, host office hours, or run mentoring sessions with a join flow that stays simple for students on phones and laptops.',
    meta: 'Best for tutoring, cohort sessions, and training programs',
  },
  {
    title: 'Communities and internal operations',
    description:
      'Host meetups, volunteer check-ins, member calls, and internal huddles in a lightweight setup that keeps attention on the discussion.',
    meta: 'Best for clubs, member spaces, support teams, and event ops',
  },
];

function SolutionsPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Solutions</span>
        <h1>Talksy works best anywhere speed, clarity, and low-friction joining matter.</h1>
        <p>
          Whether your calls are internal, client-facing, educational, or community-led,
          Talksy gives hosts one clean workflow for launching rooms, sharing links, and
          keeping the live experience polished.
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
          <span className="card-label">Need the cleanest rollout?</span>
          <p>
            Start in a demo room, test the flow on mobile and desktop, then use support
            and pricing to shape the right Talksy setup for your group.
          </p>
        </div>
        <div className="stacked-actions">
          <Link className="inline-button" to="/video/demo-room">
            Try demo room
          </Link>
          <Link className="inline-button inline-button--secondary" to="/support">
            Open support
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
