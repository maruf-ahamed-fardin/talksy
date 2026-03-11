import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Resources', to: '/resources' },
  { label: 'Support', to: '/support' },
  { label: 'Pricing', to: '/pricing' },
];

function Navbar() {
  const [openPath, setOpenPath] = useState(null);
  const { pathname } = useLocation();
  const menuOpen = openPath === pathname;

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

          <Link className="nav-cta" onClick={() => setOpenPath(null)} to="/get-started">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
