import { Link } from 'react-router-dom';

const steps = [
  'Pick the room style that fits your call rhythm',
  'Invite collaborators or participants with one link',
  'Launch your first meeting and capture action items immediately',
];

function GetStartedPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Get started</span>
        <h1>Set up your first Talksy workflow in a few clean steps.</h1>
        <p>
          The platform is designed to feel familiar quickly. Start with one room,
          test your call flow, and expand only when you need more structure.
        </p>
      </div>

      <div className="page-band">
        <article className="detail-card accent-mint">
          <span className="card-label">Fast onboarding</span>
          <h3>What your first session looks like</h3>
          <ol className="step-list">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="detail-card">
          <span className="card-label">Need direction?</span>
          <h3>Recommended path</h3>
          <p className="get-started-note">
            Start with a demo room, review the feature overview, then choose a plan only when you know your workflow.
          </p>
          <div className="stacked-actions">
            <Link className="inline-button" to="/video/demo-room">
              Open demo room
            </Link>
            <Link className="inline-button inline-button--secondary" to="/features">
              Review features
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export default GetStartedPage;
