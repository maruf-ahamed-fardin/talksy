import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Hero() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = (event) => {
    event.preventDefault();

    const normalizedRoomId = roomId.trim().replace(/\s+/g, '-').toLowerCase() || 'instant-room';
    navigate(`/video/${encodeURIComponent(normalizedRoomId)}`);
  };

  return (
    <section className="hero-section">
      <div className="section-shell hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Fast video meetups for remote teams</span>
          <h1>Meet with your family or friends</h1>
          <p>
            Start a free conference call with your friends, family or team members.
            No sign up required. Launch a room, share the code, and be talking in seconds.
          </p>

          <form className="hero-form" onSubmit={handleJoinRoom}>
            <input
              aria-label="Room ID"
              className="hero-input"
              onChange={(event) => setRoomId(event.target.value)}
              placeholder="Enter Room Id"
              type="text"
              value={roomId}
            />
            <button className="hero-button" type="submit">
              Join Room
            </button>
          </form>

          <div className="hero-actions">
            <Link className="text-link" to="/features">
              Explore platform
            </Link>
            <Link className="text-link" to="/pricing">
              See pricing
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-glow hero-glow--pink" />
          <div className="hero-glow hero-glow--blue" />

          <div className="hero-avatar-card hero-avatar-card--left">
            <div className="mini-avatar mini-avatar--blue">AK</div>
            <span>Ali Khan</span>
          </div>

          <div className="hero-avatar-card hero-avatar-card--right">
            <div className="mini-avatar mini-avatar--peach">SN</div>
            <span>Sara Noor</span>
          </div>

          <div className="hero-status hero-status--top">Mic</div>
          <div className="hero-status hero-status--middle">Chat</div>
          <div className="hero-status hero-status--bottom">Share</div>

          <div className="hero-figure">
            <div className="hero-seat" />
            <div className="hero-body">
              <div className="hero-head">
                <div className="hero-hair" />
                <div className="hero-glasses">
                  <span />
                  <span />
                </div>
              </div>
              <div className="hero-torso" />
              <div className="hero-arm hero-arm--left" />
              <div className="hero-arm hero-arm--right" />
              <div className="hero-tablet" />
              <div className="hero-leg hero-leg--left" />
              <div className="hero-leg hero-leg--right" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
