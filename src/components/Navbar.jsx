import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import InstallHelpDialog from './InstallHelpDialog';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Resources', to: '/resources' },
  { label: 'Support', to: '/support' },
  { label: 'Pricing', to: '/pricing' },
];

function Navbar({ theme, onToggleTheme }) {
  const [openPath, setOpenPath] = useState(null);
  const { pathname } = useLocation();
  const menuOpen = openPath === pathname;
  const isDarkTheme = theme === 'dark';
  const {
    handleInstallClick,
    isInstalled,
    isIos,
    isSafari,
    setShowInstallHelp,
    showInstallHelp,
  } = useInstallPrompt();

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand-mark" to="/">
          <span className="brand-mark__glyph">T</span>
          Talksy
        </Link>

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
              className="nav-install nav-install--mobile-only"
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

        <div className="nav-actions">
          <button
            aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={isDarkTheme}
            className="nav-theme-switch"
            onClick={onToggleTheme}
            type="button"
          >
            <span aria-hidden="true" className="nav-theme-switch__icon">
              {isDarkTheme ? (
                <svg fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              ) : (
                <svg fill="none" viewBox="0 0 24 24">
                  <path d="M20.2 14.6a8.55 8.55 0 1 1-10.8-10.8 7.1 7.1 0 0 0 10.8 10.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
                </svg>
              )}
            </span>
            <span className="nav-theme-switch__label">{isDarkTheme ? 'Dark' : 'Light'}</span>
          </button>

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
        </div>
      </div>

      {showInstallHelp && !isInstalled ? (
        <InstallHelpDialog isIos={isIos} isSafari={isSafari} onClose={() => setShowInstallHelp(false)} />
      ) : null}
    </header>
  );
}

export default Navbar;
