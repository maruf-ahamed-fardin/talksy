import { useState } from 'react';
import { Link } from 'react-router-dom';

const items = [
  {
    question: 'How do I boost productivity at work?',
    answer:
      'Use focused rooms for short decision meetings, assign one owner per call, and keep notes visible in the room sidebar so action items do not disappear after the call ends.',
  },
  {
    question: 'What are the best books to read for personal growth?',
    answer:
      'Choose one practical title, one mindset title, and one biography. Take one action from each chapter and discuss it in a recurring Talksy learning circle.',
  },
  {
    question: 'How can I maintain a healthy work-life balance?',
    answer:
      'Set meeting windows, decline calls without agendas, and use quick asynchronous updates when a live room is not necessary.',
  },
  {
    question: 'How do I stay motivated on a challenging project?',
    answer:
      'Break the project into weekly milestones, celebrate small wins, and host 15-minute checkpoint calls so momentum stays visible.',
  },
];

function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section-shell section-gap faq-section" id="faq">
      <span className="eyebrow centered">Helpful answers before you join</span>
      <h2 className="section-title centered">You Have Questions, We Have Answers!</h2>
      <p className="section-copy centered">
        Have a question in mind? Check out the most common ones below.
      </p>

      <div className="faq-list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <article className={`faq-item ${isOpen ? 'is-open' : ''}`} key={item.question}>
              <button
                className="faq-question"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                type="button"
              >
                <span>{item.question}</span>
                <span className="faq-symbol">{isOpen ? '-' : '+'}</span>
              </button>
              {isOpen ? (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <p className="faq-footer">
        Still have questions on your mind?{' '}
        <Link className="inline-link" to="/get-started">
          Reach out to us
        </Link>{' '}
        for personalized assistance.
      </p>
    </section>
  );
}

export default Faq;
