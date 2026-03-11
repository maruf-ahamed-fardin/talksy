import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Resources', to: '/resources' },
  { label: 'Support', to: '/support' },
  { label: 'Pricing', to: '/pricing' },
];

function isStandaloneMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function isIosDevice() {
  if (typeof window === 'undefined') {
    return false;
  }

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isSafariBrowser() {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  return /safari/i.test(userAgent) && !/crios|fxios|edgios|chrome|android/i.test(userAgent);
}

function Navbar() {
  const [openPath, setOpenPath] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const { pathname } = useLocation();
  const menuOpen = openPath === pathname;
  const isIos = isIosDevice();
  const isSafari = isSafariBrowser();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setIsInstalled(false);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    const handleDisplayModeChange = (event) => {
      setIsInstalled(event.matches || window.navigator.standalone === true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    mediaQuery.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      mediaQuery.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isInstalled) {
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice.catch(() => undefined);
      setInstallPrompt(null);
      return;
    }

    setShowInstallHelp(true);
  };

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand-mark" to="/">
          <span className="brand-mark__glyph">T</span>
          Talksy
        </Link>

        <button
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className={`nav-toggle ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setOpenPath((current) => (current === pathname ? null : pathname))}
          type="button"
        >
          <span aria-hidden="true" className="nav-toggle__icon">
            <span className="nav-toggle__line" />
            <span className="nav-toggle__line" />
            <span className="nav-toggle__line" />
          </span>
        </button>

        <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setOpenPath(null)}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}

          {!isInstalled ? (
            <button
              className="nav-install"
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
              <span className="nav-install__label">App</span>
            </button>
          ) : null}

          <Link className="nav-cta" onClick={() => setOpenPath(null)} to="/get-started">
            Get started
          </Link>
        </nav>
      </div>

      {showInstallHelp && !isInstalled ? (
        <div className="install-help-backdrop" onClick={() => setShowInstallHelp(false)} role="presentation">
          <div
            aria-labelledby="install-help-title"
            aria-modal="true"
            className="install-help-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <span className="card-label">Install Talksy</span>
            <h3 id="install-help-title">
              {isIos ? 'Install on your iPhone or iPad' : 'Install from your browser menu'}
            </h3>
            <p>
              {isIos && isSafari
                ? 'Tap the Share button in Safari, then choose Add to Home Screen.'
                : null}
              {isIos && !isSafari
                ? 'Open this site in Safari first, then tap Share and choose Add to Home Screen.'
                : null}
              {!isIos
                ? 'If the native install prompt is not ready yet, open your browser menu and choose Install app or Add to Home screen. This also requires HTTPS or a production preview build.'
                : null}
            </p>
            <div className="install-help-steps">
              {isIos ? (
                <>
                  <span>1. Open the browser share menu.</span>
                  <span>2. Find Add to Home Screen.</span>
                  <span>3. Confirm to install Talksy.</span>
                </>
              ) : (
                <>
                  <span>1. Open the browser menu.</span>
                  <span>2. Tap Install app or Add to Home screen.</span>
                  <span>3. Accept the install prompt.</span>
                </>
              )}
            </div>
            <button className="nav-install install-help-close" onClick={() => setShowInstallHelp(false)} type="button">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
