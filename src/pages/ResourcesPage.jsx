const guides = [
  {
    tag: 'Guide',
    title: 'How to run concise weekly syncs',
    description:
      'A practical outline for planning short meetings that still end with clear decisions and ownership.',
  },
  {
    tag: 'Template',
    title: 'Meeting agenda starters',
    description:
      'Use ready-made prompts to structure planning calls, client reviews, and team retrospectives.',
  },
  {
    tag: 'Library',
    title: 'Remote collaboration playbooks',
    description:
      'Explore repeatable systems for async updates, recurring check-ins, and recorded room summaries.',
  },
];

function ResourcesPage() {
  return (
    <section className="page-shell">
      <div className="page-hero">
        <span className="eyebrow">Resources</span>
        <h1>Guides, templates, and ideas for smoother conversations.</h1>
        <p>
          The best meetings are designed before the room opens. Browse practical material
          that helps teams communicate with less friction.
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
          <span className="card-label">Most popular topics</span>
          <ul className="resource-list">
            <li>Facilitation frameworks for high-stakes calls</li>
            <li>Joining instructions that reduce attendee confusion</li>
            <li>Ways to capture decisions without bloated documentation</li>
          </ul>
        </article>

        <article className="insight-card accent-lavender">
          <span className="card-label">New this month</span>
          <h3>Room launch checklist for first-time hosts</h3>
          <p>
            A simple checklist covering room names, introductions, call flow, and close-out actions.
          </p>
        </article>
      </div>
    </section>
  );
}

export default ResourcesPage;
