import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addCallHistoryEntry } from '../data/callHistory';

const participants = [
  { name: 'Ari', color: 'blue' },
  { name: 'Mina', color: 'pink' },
  { name: 'Jo', color: 'mint' },
  { name: 'Rafi', color: 'amber' },
];

const checklist = [
  'Camera and mic permissions granted',
  'Room code shared with participants',
  'Agenda prepared for a quick start',
];

function VideoCompo() {
  const { roomId } = useParams();
  const activeRoom = roomId || 'instant-room';

  useEffect(() => {
    addCallHistoryEntry({
      roomId: activeRoom,
      participants: participants.map((participant) => participant.name),
      checklist,
    });
  }, [activeRoom]);

  return (
    <section className="page-shell room-page">
      <div className="page-hero compact">
        <span className="eyebrow">Room ready</span>
        <h1>{activeRoom}</h1>
        <p>
          Share this room ID with your team and jump in when everyone is ready.
          Talksy rooms stay lightweight, fast, and simple to join.
        </p>
      </div>

      <div className="room-layout">
        <div className="room-screen">
          <div className="room-screen__header">
            <span>Live now</span>
            <span>1280 x 720</span>
          </div>

          <div className="room-grid">
            {participants.map((participant) => (
              <div className={`room-tile room-tile--${participant.color}`} key={participant.name}>
                <div className="room-avatar">{participant.name.slice(0, 1)}</div>
                <strong>{participant.name}</strong>
                <span>Ready to join</span>
              </div>
            ))}
          </div>

          <div className="room-controls">
            <button className="control-button" type="button">Mic</button>
            <button className="control-button" type="button">Camera</button>
            <button className="control-button" type="button">Share</button>
            <button className="control-button control-button--danger" type="button">Leave</button>
          </div>
        </div>

        <aside className="room-sidebar">
          <div className="detail-card">
            <span className="card-label">Meeting checklist</span>
            <ul className="detail-list">
              {checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="detail-card">
            <span className="card-label">Next steps</span>
            <p>Need a better setup before you start? Review history, explore templates, or compare plans.</p>
            <div className="stacked-actions">
              <Link className="inline-button" to="/history">
                View history
              </Link>
              <Link className="inline-button inline-button--secondary" to="/pricing">
                Compare plans
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default VideoCompo;
