const features = [
  {
    icon: 'HD',
    title: 'Crystal-clear rooms',
    description:
      'Launch instant video rooms with stable audio, clean layouts, and a fast join flow that keeps drop-off low.',
  },
  {
    icon: 'AI',
    title: 'Smart meeting follow-up',
    description:
      'Highlight decisions, capture owners, and keep call outcomes visible so meetings actually move work forward.',
  },
  {
    icon: 'SYNC',
    title: 'Shared collaboration tools',
    description:
      'Screen sharing, quick notes, and in-room prompts help the whole group stay aligned without switching tabs.',
  },
];

const workflow = [
  {
    step: 'Step 01',
    title: 'Start a room',
    description: 'Create a room code and share it in seconds without making anyone sign up first.',
  },
  {
    step: 'Step 02',
    title: 'Run the call',
    description: 'Use focus tools, live notes, and clean layouts to keep the conversation on track.',
  },
  {
    step: 'Step 03',
    title: 'Finish with clarity',
    description: 'Capture decisions and action items before the room closes so nothing gets lost.',
  },
];

function FeaturesPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Features</span>
        <h1>Everything you need for polished, lightweight online meetings.</h1>
        <p>
          Talksy keeps calls fast to start, simple to run, and structured enough to
          turn conversations into outcomes.
        </p>
      </div>

      <div className="page-grid page-grid-three">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>

      <div className="page-band">
        <article className="insight-card accent-mint">
          <span className="card-label">What teams notice first</span>
          <h3>Less setup friction, fewer dropped attendees, and better call follow-through.</h3>
          <p>
            Great meeting software should disappear into the background. Talksy is
            designed to remove the overhead that slows teams down.
          </p>
        </article>

        <article className="detail-card">
          <span className="card-label">Included in every plan</span>
          <ul className="detail-list">
            <li>Quick room codes and one-click joins</li>
            <li>Meeting notes and action-item prompts</li>
            <li>Responsive layouts across desktop and mobile</li>
          </ul>
        </article>
      </div>

      <div className="timeline-grid">
        {workflow.map((item) => (
          <article className="timeline-card" key={item.title}>
            <span className="timeline-step">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeaturesPage;
