import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { addCallHistoryEntry } from '../data/callHistory';

const ZEGO_APP_ID = Number.parseInt(import.meta.env.VITE_ZEGO_APP_ID ?? '', 10);
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET ?? '';
const DISPLAY_NAME_STORAGE_KEY = 'talksy.display-name';

const checklist = [
  'Camera and mic permissions granted',
  'Room link copied and shared',
  'Join from another browser tab to test the full flow',
];

function randomID(length = 5) {
  const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP';
  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

function normalizeRoomId(value) {
  return value?.trim().replace(/\s+/g, '-').toLowerCase() || 'instant-room';
}

function getStoredDisplayName() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) ?? '';
}

function VideoCompo() {
  const { roomId } = useParams();
  const location = useLocation();
  const [userID] = useState(() => `user-${randomID(8)}`);
  const [displayName, setDisplayName] = useState('');
  const [nameDraft, setNameDraft] = useState(() => getStoredDisplayName());
  const [copyStatus, setCopyStatus] = useState('Copy invite link');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [hasLeftRoom, setHasLeftRoom] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [joinSession, setJoinSession] = useState(0);
  const roomScreenRef = useRef(null);
  const meetingContainerRef = useRef(null);
  const suppressLeaveEventRef = useRef(false);
  const queryRoomId = new URLSearchParams(location.search).get('roomID');
  const activeRoom = normalizeRoomId(roomId || queryRoomId);
  const roomUrl = `${window.location.origin}/video/${encodeURIComponent(activeRoom)}`;
  const hasZegoConfig = ZEGO_APP_ID > 0 && ZEGO_SERVER_SECRET.length > 0;
  const shouldShowNamePrompt = !hasJoinedRoom && !hasLeftRoom;

  const showLeaveState = () => {
    setIsFullscreen(false);
    setHasJoinedRoom(true);
    setHasLeftRoom(true);
  };

  useEffect(() => {
    setHasJoinedRoom(false);
    setHasLeftRoom(false);
    setDisplayName('');
    setCopyStatus('Copy invite link');
    setJoinSession(0);
  }, [activeRoom]);

  useEffect(() => {
    if (!hasJoinedRoom || hasLeftRoom || !displayName) {
      return;
    }

    const historyKey = `talksy.room-log.${activeRoom}`;
    const lastLoggedAt = Number.parseInt(window.sessionStorage.getItem(historyKey) ?? '0', 10);
    const now = Date.now();

    if (Number.isFinite(lastLoggedAt) && now - lastLoggedAt < 5000) {
      return;
    }

    window.sessionStorage.setItem(historyKey, `${now}`);

    addCallHistoryEntry({
      roomId: activeRoom,
      participants: [displayName],
      checklist,
      resolution: 'ZegoCloud adaptive',
    });
  }, [activeRoom, displayName, hasJoinedRoom, hasLeftRoom]);

  useEffect(() => {
    if (!isFullscreen) {
      document.body.classList.remove('room-fullscreen-active');
      return undefined;
    }

    document.body.classList.add('room-fullscreen-active');

    return () => {
      document.body.classList.remove('room-fullscreen-active');
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!hasZegoConfig || !meetingContainerRef.current || hasLeftRoom || !hasJoinedRoom || !displayName) {
      return undefined;
    }

    const container = meetingContainerRef.current;
    let leftRoom = false;
    suppressLeaveEventRef.current = false;

    // This test token flow is fine for local development. Production should generate tokens server-side.
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID,
      ZEGO_SERVER_SECRET,
      activeRoom,
      userID,
      displayName,
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container,
      sharedLinks: [
        {
          name: 'Room link',
          url: roomUrl,
        },
      ],
      showLeavingView: false,
      showPreJoinView: false,
      leaveRoomDialogConfig: {
        confirmCallback: () => {
          setIsFullscreen(false);
        },
      },
      onLeaveRoom: () => {
        if (suppressLeaveEventRef.current) {
          return;
        }

        leftRoom = true;
        showLeaveState();
      },
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });

    return () => {
      if (leftRoom) {
        return;
      }

      suppressLeaveEventRef.current = true;
      try {
        zp.destroy();
      } catch {
        // Ignore Zego teardown errors during React cleanup.
      }

      if (container === meetingContainerRef.current) {
        container.innerHTML = '';
      }
    };
  }, [activeRoom, displayName, hasJoinedRoom, hasLeftRoom, hasZegoConfig, joinSession, roomUrl, userID]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopyStatus('Invite link copied');
    } catch {
      setCopyStatus('Copy failed');
    }
  };

  const handleRejoin = () => {
    setHasJoinedRoom(true);
    setHasLeftRoom(false);
    setJoinSession((current) => current + 1);
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();

    const normalizedName = nameDraft.trim();

    if (!normalizedName) {
      return;
    }

    window.localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, normalizedName);
    setDisplayName(normalizedName);
    setHasJoinedRoom(true);
    setJoinSession((current) => current + 1);
  };

  const handleFullscreenToggle = async () => {
    setIsFullscreen((current) => !current);
  };

  return (
    <section className="page-shell room-page">
      <div className="page-hero compact">
        <span className="eyebrow">Room ready</span>
        <h1>{activeRoom}</h1>
        <p>
          Share this room link with your team and join instantly. This page now runs the
          live ZegoCloud meeting experience instead of the old mock room.
        </p>
      </div>

      <div className="room-layout">
        <div
          className={`room-screen room-screen--live${isFullscreen ? ' is-room-fullscreen' : ''}`}
          ref={roomScreenRef}
        >
          <div className="room-screen__header">
            <span>Live now</span>
            <div className="room-screen__actions">
              <span>{displayName || 'Display name required'}</span>
              <button className="control-button room-screen__action" onClick={handleFullscreenToggle} type="button">
                {isFullscreen ? 'Exit full screen' : 'Full screen'}
              </button>
            </div>
          </div>

          {hasLeftRoom ? (
            <div className="room-stage">
              <div className="zego-room-container" key={joinSession} ref={meetingContainerRef} />
              <div className="room-stage__overlay">
                <div className="room-left-state">
                  <h2>You have left the room.</h2>
                  <div className="room-left-state__actions">
                    <button className="hero-button hero-button--create room-left-state__primary" onClick={handleRejoin} type="button">
                      Rejoin
                    </button>
                    <Link className="inline-button inline-button--secondary room-left-state__secondary" to="/">
                      Back home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : hasJoinedRoom && hasZegoConfig ? (
            <div className="room-stage">
              <div className="zego-room-container" key={joinSession} ref={meetingContainerRef} />
            </div>
          ) : hasJoinedRoom ? (
            <div className="room-fallback">
              <span className="card-label">Missing credentials</span>
              <h3>Add your Zego credentials to `.env.local`</h3>
              <pre className="room-fallback__code">
                {`VITE_ZEGO_APP_ID=your_app_id
VITE_ZEGO_SERVER_SECRET=your_server_secret`}
              </pre>
            </div>
          ) : (
            <div className="room-standby">
              <span className="card-label">Ready to join</span>
              <h2>{activeRoom}</h2>
              <p>Set your display name in the popup to enter this room.</p>
            </div>
          )}
        </div>

        <aside className="room-sidebar">
          <div className="detail-card">
            <span className="card-label">Invite</span>
            <h3>Share this room</h3>
            <p className="room-sidebar__link">{roomUrl}</p>
            <div className="stacked-actions">
              <button className="control-button" onClick={handleCopyLink} type="button">
                {copyStatus}
              </button>
              <a className="inline-button inline-button--secondary" href={roomUrl} rel="noreferrer" target="_blank">
                Open in new tab
              </a>
            </div>
          </div>

          <div className="detail-card">
            <span className="card-label">Session details</span>
            <ul className="detail-list">
              <li>Room ID: {activeRoom}</li>
              <li>Display name: {displayName || 'Not set yet'}</li>
              <li>Mode: Group call</li>
            </ul>
          </div>

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
            <p>Need another room or want to review previous sessions? Use the shortcuts below.</p>
            <div className="stacked-actions">
              <Link className="inline-button" to="/history">
                View history
              </Link>
              <Link className="inline-button inline-button--secondary" to="/">
                Start another room
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {shouldShowNamePrompt ? (
        <div className="room-name-backdrop">
          <div
            aria-labelledby="room-name-title"
            aria-modal="true"
            className="room-name-dialog"
            role="dialog"
          >
            <span className="card-label">Before you join</span>
            <h2 id="room-name-title">Set your display name</h2>
            <p>
              Set a display name before joining room <strong>{activeRoom}</strong>.
              Other participants will see you by this name.
            </p>
            <form className="room-name-form" onSubmit={handleNameSubmit}>
              <input
                autoFocus
                className="room-name-input"
                onChange={(event) => setNameDraft(event.target.value)}
                placeholder="Enter your display name"
                type="text"
                value={nameDraft}
              />
              <button className="hero-button hero-button--create" disabled={!nameDraft.trim()} type="submit">
                Join room
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default VideoCompo;
