import { Link } from 'react-router-dom';

const steps = [
  'Choose Create or Join and decide whether you need a fresh room code or an existing one',
  'Share the link, set your display name, and test the live room on desktop or mobile',
  'Use fullscreen when presenting, then revisit history to reopen rooms and keep the workflow moving',
];

function GetStartedPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Get started</span>
        <h1>Go from first test room to repeatable Talksy workflow in minutes.</h1>
        <p>
          Talksy is built to feel obvious on the first try. Start with one room, learn
          the live flow, then layer in history, support, and install shortcuts as your
          routine grows.
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
          <h3>Fastest path into the product</h3>
          <p className="get-started-note">
            Open the demo room, test the join flow on both desktop and mobile, then
            review features and pricing once the experience feels right.
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
