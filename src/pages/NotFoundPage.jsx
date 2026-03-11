import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="page-shell not-found">
      <span className="eyebrow">Page not found</span>
      <h1>This route does not exist in Talksy.</h1>
      <p className="section-copy centered">
        Head back to the homepage or jump into a demo room to keep exploring the site.
      </p>
      <div className="stacked-actions">
        <Link className="inline-button" to="/">
          Back home
        </Link>
        <Link className="inline-button inline-button--secondary" to="/video/demo-room">
          Open demo room
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
