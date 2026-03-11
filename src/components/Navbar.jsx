import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Features', to: '/features' },
  { label: 'Solutions', to: '/solutions' },
  { label: 'Resources', to: '/resources' },
  { label: 'Pricing', to: '/pricing' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link className="brand-mark" to="/">
          <span className="brand-mark__glyph">T</span>
          Talksy
        </Link>

        <button
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          className="nav-toggle"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>

        <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}

          <Link className="nav-cta" to="/get-started">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
