import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { clearCallHistory, getCallHistory } from '../data/callHistory';

function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function HistoryPage() {
  const [records, setRecords] = useState(() => getCallHistory());
  const [selectedId, setSelectedId] = useState(() => getCallHistory()[0]?.id ?? null);

  useEffect(() => {
    const syncHistory = () => {
      const nextRecords = getCallHistory();
      setRecords(nextRecords);
      setSelectedId((current) => (nextRecords.some((record) => record.id === current) ? current : nextRecords[0]?.id ?? null));
    };

    window.addEventListener('storage', syncHistory);
    window.addEventListener('focus', syncHistory);

    return () => {
      window.removeEventListener('storage', syncHistory);
      window.removeEventListener('focus', syncHistory);
    };
  }, []);

  const selectedRecord = records.find((record) => record.id === selectedId) ?? records[0] ?? null;

  const stats = useMemo(() => {
    const uniqueRooms = new Set(records.map((record) => record.roomId)).size;

    return {
      totalCalls: records.length,
      uniqueRooms,
      latestCall: records[0] ? formatDateTime(records[0].createdAt) : 'No calls yet',
    };
  }, [records]);

  const handleClearHistory = () => {
    clearCallHistory();
    setRecords([]);
    setSelectedId(null);
  };

  return (
    <section className="page-shell history-page">
      <div className="page-hero">
        <span className="eyebrow">History</span>
        <h1>Keep every call record and room detail in one place.</h1>
        <p>
          Talksy now stores your room history locally so you can revisit room IDs,
          participants, setup notes, and recent activity from a single screen.
        </p>
      </div>

      <div className="history-summary-grid">
        <article className="history-summary-card accent-ice">
          <span className="card-label">Total calls</span>
          <strong>{stats.totalCalls}</strong>
          <p>Every room visit is logged as a separate entry.</p>
        </article>

        <article className="history-summary-card accent-mint">
          <span className="card-label">Unique rooms</span>
          <strong>{stats.uniqueRooms}</strong>
          <p>Track how many different rooms have been opened.</p>
        </article>

        <article className="history-summary-card accent-peach">
          <span className="card-label">Latest activity</span>
          <strong>{stats.latestCall}</strong>
          <p>Always see the most recent room access instantly.</p>
        </article>
      </div>

      <div className="history-layout">
        <section className="history-list-panel detail-card">
          <div className="history-toolbar">
            <div>
              <span className="card-label">Saved sessions</span>
              <h3>Call log</h3>
            </div>

            {records.length ? (
              <button className="history-clear-button" onClick={handleClearHistory} type="button">
                Clear history
              </button>
            ) : null}
          </div>

          {records.length ? (
            <div className="history-list">
              {records.map((record) => (
                <button
                  className={`history-record${selectedRecord?.id === record.id ? ' is-active' : ''}`}
                  key={record.id}
                  onClick={() => setSelectedId(record.id)}
                  type="button"
                >
                  <div className="history-record__top">
                    <strong>{record.title}</strong>
                    <span>{record.status}</span>
                  </div>
                  <p>{record.roomId}</p>
                  <div className="history-record__meta">
                    <span>{formatDateTime(record.createdAt)}</span>
                    <span>{record.participantCount} participants</span>
                    <span>{record.resolution}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="history-empty">
              <h3>No call history yet</h3>
              <p>
                Open any Talksy room and it will appear here with the room ID,
                participants, and preparation details.
              </p>
              <Link className="inline-button" to="/video/demo-room">
                Open demo room
              </Link>
            </div>
          )}
        </section>

        <aside className="history-detail-card detail-card">
          {selectedRecord ? (
            <>
              <span className="card-label">Call details</span>
              <h3>{selectedRecord.title}</h3>
              <p>{selectedRecord.note}</p>

              <div className="history-detail-grid">
                <div className="history-detail-stat">
                  <span>Room ID</span>
                  <strong>{selectedRecord.roomId}</strong>
                </div>
                <div className="history-detail-stat">
                  <span>Source</span>
                  <strong>{selectedRecord.source}</strong>
                </div>
                <div className="history-detail-stat">
                  <span>Resolution</span>
                  <strong>{selectedRecord.resolution}</strong>
                </div>
                <div className="history-detail-stat">
                  <span>Saved at</span>
                  <strong>{formatDateTime(selectedRecord.createdAt)}</strong>
                </div>
              </div>

              <div className="history-detail-section">
                <h4>Participants</h4>
                <div className="history-pill-list">
                  {selectedRecord.participants.map((participant) => (
                    <span className="history-pill" key={`${selectedRecord.id}-${participant}`}>
                      {participant}
                    </span>
                  ))}
                </div>
              </div>

              <div className="history-detail-section">
                <h4>Meeting checklist</h4>
                <ul className="detail-list">
                  {selectedRecord.checklist.map((item) => (
                    <li key={`${selectedRecord.id}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="stacked-actions">
                <Link className="inline-button" to={`/video/${encodeURIComponent(selectedRecord.roomId)}`}>
                  Reopen room
                </Link>
                <Link className="inline-button inline-button--secondary" to="/support">
                  Ask support
                </Link>
              </div>
            </>
          ) : (
            <div className="history-empty history-empty--detail">
              <h3>Select a call</h3>
              <p>Your saved room details will appear here once a call is stored.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default HistoryPage;
