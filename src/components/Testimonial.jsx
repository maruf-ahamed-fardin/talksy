const reviews = [
  {
    author: 'Michael Kim',
    role: 'Software Engineer',
    quote:
      'Absolutely amazing! Their services exceeded my expectations. I am thrilled with the results.',
    accent: 'mint',
  },
  {
    author: 'Melissa Reynolds',
    role: 'UX Designer',
    quote:
      'Impressed beyond words. Their professionalism and attention to detail are unmatched.',
    accent: 'violet',
  },
  {
    author: 'Sarah Morgan',
    role: 'Content Strategist',
    quote:
      'Outstanding experience. Their support team is exceptional and the quality of the work is top-notch.',
    accent: 'amber',
  },
];

function Testimonial() {
  return (
    <section className="testimonial-section">
      <div className="section-shell section-gap">
        <span className="section-note">3,421 people loved our amazing services</span>
        <h2 className="section-title centered">See what our awesome clients have to say</h2>

        <div className="testimonial-grid">
          {reviews.map((review) => (
            <article className={`testimonial-card accent-${review.accent}`} key={review.author}>
              <span className="rating-pill">4.9 / 5 rating</span>
              <p>{review.quote}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {review.author.split(' ').map((part) => part[0]).join('')}
                </div>
                <div>
                  <strong>{review.author}</strong>
                  <span>{review.role}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="testimonial-link-row">
          <a className="inline-link" href="#faq">
            Check all 3,421 reviews
          </a>
        </div>
      </div>
    </section>
  );
}

export default Testimonial;
