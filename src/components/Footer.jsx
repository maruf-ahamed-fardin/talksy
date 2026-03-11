import { useState } from 'react';
import { Link } from 'react-router-dom';
import InstallHelpDialog from './InstallHelpDialog';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const columns = [
  {
    title: 'Discover',
    links: [
      { label: 'About Us', to: '/features' },
      { label: 'Our Services', to: '/solutions' },
      { label: 'Testimonials', to: '/' },
      { label: 'Careers', to: '/get-started' },
    ],
  },
  {
    title: 'Assistance',
    links: [
      { label: 'Help Center', to: '/resources' },
      { label: 'Return Policy', to: '/pricing' },
      { label: 'Terms of Service', to: '/resources' },
      { label: 'Privacy Policy', to: '/resources' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Blog Articles', to: '/resources' },
      { label: 'Guides & Tutorials', to: '/resources' },
      { label: 'Partner with Us', to: '/solutions' },
      { label: 'Contact Us', to: '/get-started' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Community Forum', to: '/resources' },
      { label: 'Events & Webinars', to: '/features' },
      { label: 'Social Media', to: '/get-started' },
      { label: 'Newsletter', to: '/get-started' },
    ],
  },
];

function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const {
    handleInstallClick,
    isInstalled,
    isIos,
    isSafari,
    setShowInstallHelp,
    showInstallHelp,
  } = useInstallPrompt();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setSubmitted(true);
    setEmail('');
  };

  return (
    <footer className="site-footer">
      <div className="section-shell footer-top">
        {!isInstalled ? (
          <div className="footer-install-card">
            <div className="footer-install-card__copy">
              <span className="eyebrow eyebrow-light">Install Talksy</span>
              <h3>Do you want to install our app?</h3>
              <p>Get a faster desktop launch, quick access to your rooms, and an app-like Talksy experience.</p>
            </div>

            <button
              className="nav-install footer-install__button"
              onClick={handleInstallClick}
              title="Install the Talksy app"
              type="button"
            >
              <span aria-hidden="true" className="nav-install__icon">
                <svg fill="none" viewBox="0 0 24 24">
                  <path d="M12 4.5v8.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                  <path d="m8.5 10.75 3.5 3.5 3.5-3.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                  <path d="M5.5 16.5h13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </span>
              <span className="nav-install__label">Install</span>
            </button>
          </div>
        ) : null}

        <div className="newsletter-card">
          <div>
            <span className="eyebrow eyebrow-light">Stay in the loop</span>
            <h2>Get exclusive offers and updates directly to your inbox</h2>
          </div>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              aria-label="Email address"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
              type="email"
              value={email}
            />
            <button type="submit">Subscribe</button>
          </form>

          {submitted ? <p className="newsletter-note">You are on the list. Watch for the next update.</p> : null}
        </div>
      </div>

      <div className="section-shell footer-grid">
        {columns.map((column) => (
          <div className="footer-column" key={column.title}>
            <h3>{column.title}</h3>
            <div className="footer-links">
              {column.links.map((link) => (
                <Link key={`${column.title}-${link.label}`} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showInstallHelp && !isInstalled ? (
        <InstallHelpDialog isIos={isIos} isSafari={isSafari} onClose={() => setShowInstallHelp(false)} />
      ) : null}
    </footer>
  );
}

export default Footer;
