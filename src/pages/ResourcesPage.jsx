const guides = [
  {
    tag: 'Setup',
    title: 'Room launch checklist',
    description:
      'A host-first checklist for naming rooms, checking audio and video, copying the link, and entering with the right display name.',
  },
  {
    tag: 'Workflow',
    title: 'Repeatable meeting playbooks',
    description:
      'Starter ideas for stand-ups, client reviews, mentor sessions, and demo calls built around Talksy\'s create-or-join flow.',
  },
  {
    tag: 'Follow-up',
    title: 'History-first review routine',
    description:
      'Use the history page to revisit room IDs, participant counts, timestamps, and quick room context without guessing later.',
  },
];

function ResourcesPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Resources</span>
        <h1>Practical playbooks for getting more out of every Talksy room.</h1>
        <p>
          These starter resources mirror the way the product actually works: create or
          join quickly, share one link, keep the room clear, and return with history
          when you need context.
        </p>
      </div>

      <div className="page-grid page-grid-three">
        {guides.map((guide) => (
          <article className="resource-card" key={guide.title}>
            <span className="resource-tag">{guide.tag}</span>
            <h3>{guide.title}</h3>
            <p>{guide.description}</p>
          </article>
        ))}
      </div>

      <div className="page-band">
        <article className="detail-card">
          <span className="card-label">Most useful topics</span>
          <ul className="resource-list">
            <li>Room naming systems for recurring sessions</li>
            <li>Share-link habits that reduce attendee confusion</li>
            <li>Mobile host checks before a live meeting starts</li>
            <li>Demo-room rehearsal before a high-stakes call</li>
          </ul>
        </article>

        <article className="insight-card accent-lavender">
          <span className="card-label">Best first read</span>
          <h3>From first room test to repeatable host routine</h3>
          <p>
            Start with the launch checklist, then pair it with the support assistant and
            pricing page when you are ready to turn a simple test into a repeatable rollout.
          </p>
        </article>
      </div>
    </section>
  );
}

export default ResourcesPage;
