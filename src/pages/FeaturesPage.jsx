const features = [
  {
    icon: 'LIVE',
    title: 'Instant live rooms',
    description:
      'Create a room in seconds, generate a clean code, and move people into a live video session without extra ceremony.',
  },
  {
    icon: 'JOIN',
    title: 'No-friction joining',
    description:
      'Guests can join from one link, set a display name, and get into the room quickly on desktop or mobile.',
  },
  {
    icon: 'VIEW',
    title: 'Focused room experience',
    description:
      'Fullscreen mode, clean room layouts, and simple controls keep attention on the conversation instead of the interface.',
  },
  {
    icon: 'LINK',
    title: 'Shareable room flow',
    description:
      'Copy the room URL from the live sidebar, open it in another tab, and keep invites moving with one consistent link.',
  },
  {
    icon: 'LOG',
    title: 'Room history that helps',
    description:
      'Recent room visits are stored locally so you can revisit room IDs, participants, timestamps, and quick room details later.',
  },
  {
    icon: 'APP',
    title: 'Support and install built in',
    description:
      'Guide new users with the support assistant and install Talksy like an app for a faster, more native-feeling return.',
  },
];

const workflow = [
  {
    step: 'Step 01',
    title: 'Choose create or join',
    description: 'Launch a fresh room code or jump into an existing one from the homepage without slowing down the start.',
  },
  {
    step: 'Step 02',
    title: 'Share and go live',
    description: 'Send one link, set a display name, and move into the live room with a clear layout that works across devices.',
  },
  {
    step: 'Step 03',
    title: 'Return with context',
    description: 'Use history, demo rooms, and install shortcuts to make the next session even faster to reopen and run.',
  },
];

function FeaturesPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Features</span>
        <h1>Everything Talksy gives you to launch, run, and revisit live rooms without friction.</h1>
        <p>
          From instant room creation to shareable links, fullscreen video, room history,
          install shortcuts, and built-in support, Talksy keeps the product lightweight
          without feeling bare.
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
          <span className="card-label">Why it feels faster</span>
          <h3>Fewer steps before the conversation starts, and better context after it ends.</h3>
          <p>
            Talksy is intentionally opinionated: create or join quickly, keep the live
            room clear, and make it easy to return to the same workflow later.
          </p>
        </article>

        <article className="detail-card">
          <span className="card-label">Inside the product today</span>
          <ul className="detail-list">
            <li>Create and join modes directly from the homepage</li>
            <li>No-sign-up guest entry with display names</li>
            <li>Copyable room links and fullscreen live mode</li>
            <li>Local room history with quick reopen context</li>
            <li>Responsive layouts with light and dark themes</li>
            <li>Support assistant, demo room access, and install help</li>
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
