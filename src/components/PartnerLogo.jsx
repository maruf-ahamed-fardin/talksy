const partners = [
  { name: 'VERTEX', accent: 'gold' },
  { name: 'martino', accent: 'lavender' },
  { name: 'SquareStone', accent: 'ice' },
  { name: 'waverio', accent: 'sunset' },
  { name: 'fireli', accent: 'peach' },
  { name: 'Virogan', accent: 'mint' },
  { name: 'aromix', accent: 'amber' },
  { name: 'Natroma', accent: 'cloud' },
  { name: 'waverio', accent: 'rose' },
];

function PartnerLogo() {
  return (
    <section className="section-shell section-gap brand-section">
      <div className="brand-copy">
        <span className="eyebrow">Trusted by modern teams</span>
        <h2>Customers and brands we&apos;ve worked with</h2>
        <p>
          From private coaching calls to cross-functional product reviews, Talksy
          keeps every conversation sharp, simple, and easy to join.
        </p>
      </div>

      <div className="brand-grid">
        {partners.map((partner, index) => (
          <div className={`brand-chip accent-${partner.accent}`} key={`${partner.name}-${index}`}>
            {partner.name}
          </div>
        ))}
      </div>
    </section>
  );
}

export default PartnerLogo;
