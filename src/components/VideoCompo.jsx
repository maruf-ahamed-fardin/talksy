import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { addCallHistoryEntry } from '../data/callHistory';
import {
  buildRoomPath,
  getRoom,
  hasRoomAccess,
  isValidPrivateRoomPassword,
  rememberRoomAccess,
  verifyPrivateRoomPassword,
} from '../data/roomRegistry';
import { loadZegoUIKitPrebuilt } from '../lib/loadZegoUIKit';

const DEV_ZEGO_APP_ID = Number.parseInt(import.meta.env.VITE_ZEGO_APP_ID ?? '', 10);
const DEV_ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET ?? '';
const DISPLAY_NAME_STORAGE_KEY = 'talksy.display-name';

const checklist = [
  'Camera and mic permissions granted',
  'Room link copied and shared',
  'Join from another browser tab to test the full flow',
];

function configureRoomMediaElement(mediaElement) {
  if (!(mediaElement instanceof HTMLMediaElement)) {
    return;
  }

  mediaElement.setAttribute('autoplay', '');
  mediaElement.autoplay = true;

  if (mediaElement instanceof HTMLVideoElement) {
    mediaElement.setAttribute('playsinline', '');
    mediaElement.setAttribute('webkit-playsinline', 'true');
    mediaElement.playsInline = true;
  }
}

async function attemptRoomMediaPlayback(mediaElement) {
  if (!(mediaElement instanceof HTMLMediaElement)) {
    return false;
  }

  configureRoomMediaElement(mediaElement);

  if (!mediaElement.paused) {
    return true;
  }

  try {
    await mediaElement.play();
    return true;
  } catch {
    return false;
  }
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  if (typeof document === 'undefined') {
    return false;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';
  textArea.style.inset = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  try {
    return typeof document.execCommand === 'function' && document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

function getFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

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
  const searchParams = new URLSearchParams(location.search);
  const [userID] = useState(() => `user-${randomID(8)}`);
  const [displayName, setDisplayName] = useState('');
  const [nameDraft, setNameDraft] = useState(() => getStoredDisplayName());
  const [passwordDraft, setPasswordDraft] = useState('');
  const [roomPasswordError, setRoomPasswordError] = useState('');
  const [copyStatus, setCopyStatus] = useState('Copy invite link');
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const [hasLeftRoom, setHasLeftRoom] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [joinSession, setJoinSession] = useState(0);
  const [kitToken, setKitToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isPreparingRoom, setIsPreparingRoom] = useState(false);
  const roomScreenRef = useRef(null);
  const meetingContainerRef = useRef(null);
  const suppressLeaveEventRef = useRef(false);
  const nativeFullscreenRef = useRef(false);
  const queryRoomId = searchParams.get('roomID');
  const activeRoom = normalizeRoomId(roomId || queryRoomId);
  const storedRoom = getRoom(activeRoom);
  const sharedRoomType = searchParams.get('roomType');
  const sharedRoomLock = `${searchParams.get('lock') ?? ''}`.trim();
  const roomVisibility = storedRoom?.visibility ?? (sharedRoomType === 'private' && sharedRoomLock ? 'private' : 'public');
  const roomPasswordHash = storedRoom?.passwordHash || (roomVisibility === 'private' ? sharedRoomLock : '');
  const isPrivateRoom = roomVisibility === 'private' && Boolean(roomPasswordHash);
  const [isPrivateRoomUnlocked, setIsPrivateRoomUnlocked] = useState(() =>
    !roomPasswordHash || hasRoomAccess(activeRoom, roomPasswordHash),
  );
  const roomUrl = `${window.location.origin}${buildRoomPath(activeRoom, {
    visibility: roomVisibility,
    passwordHash: roomPasswordHash,
  })}`;
  const canUseLocalDevToken = import.meta.env.DEV && DEV_ZEGO_APP_ID > 0 && DEV_ZEGO_SERVER_SECRET.length > 0;
  const shouldShowPrivateRoomPrompt = isPrivateRoom && !isPrivateRoomUnlocked;
  const shouldShowNamePrompt = !shouldShowPrivateRoomPrompt && !hasJoinedRoom && !hasLeftRoom;
  const roomFallbackSnippet = import.meta.env.DEV
    ? `VITE_ZEGO_APP_ID=your_app_id
VITE_ZEGO_SERVER_SECRET=your_server_secret`
    : `ZEGO_APP_ID=your_app_id
ZEGO_SERVER_SECRET=your_server_secret`;

  const exitNativeFullscreen = useCallback(async () => {
    if (!getFullscreenElement()) {
      nativeFullscreenRef.current = false;
      return;
    }

    try {
      if (typeof document.exitFullscreen === 'function') {
        await document.exitFullscreen();
      } else if (typeof document.webkitExitFullscreen === 'function') {
        await document.webkitExitFullscreen();
      }
    } catch {
      // Ignore native fullscreen exit failures and fall back to CSS fullscreen only.
    } finally {
      nativeFullscreenRef.current = false;
    }
  }, []);

  const showLeaveState = useCallback(() => {
    void exitNativeFullscreen();
    setIsFullscreen(false);
    setHasJoinedRoom(true);
    setHasLeftRoom(true);
  }, [exitNativeFullscreen]);

  useEffect(() => {
    setHasJoinedRoom(false);
    setHasLeftRoom(false);
    setDisplayName('');
    setPasswordDraft('');
    setRoomPasswordError('');
    setIsPrivateRoomUnlocked(!roomPasswordHash || hasRoomAccess(activeRoom, roomPasswordHash));
    setCopyStatus('Copy invite link');
    setJoinSession(0);
    setKitToken('');
    setTokenError('');
    setIsPreparingRoom(false);
  }, [activeRoom, roomPasswordHash]);

  useEffect(() => {
    if (!hasJoinedRoom || hasLeftRoom || !displayName || !kitToken) {
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
  }, [activeRoom, displayName, hasJoinedRoom, hasLeftRoom, kitToken]);

  useEffect(() => {
    if (!hasJoinedRoom || hasLeftRoom || !displayName) {
      setKitToken('');
      setTokenError('');
      setIsPreparingRoom(false);
      return undefined;
    }

    const abortController = new AbortController();
    let cancelled = false;

    const prepareRoom = async () => {
      setKitToken('');
      setTokenError('');
      setIsPreparingRoom(true);

      try {
        const response = await fetch('/api/zego-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomId: activeRoom,
            userId: userID,
            userName: displayName,
          }),
          signal: abortController.signal,
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || 'Unable to prepare the live room token.');
        }

        if (!payload.kitToken) {
          throw new Error('The token service returned an empty room token.');
        }

        if (!cancelled) {
          setKitToken(payload.kitToken);
        }
      } catch (error) {
        if (abortController.signal.aborted || cancelled) {
          return;
        }

        if (canUseLocalDevToken) {
          const ZegoUIKitPrebuilt = await loadZegoUIKitPrebuilt();
          const localKitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            DEV_ZEGO_APP_ID,
            DEV_ZEGO_SERVER_SECRET,
            activeRoom,
            userID,
            displayName,
          );

          setKitToken(localKitToken);
          setTokenError('');
          return;
        }

        setTokenError(
          error instanceof Error
            ? error.message
            : 'Unable to prepare the live room token.',
        );
      } finally {
        if (!cancelled) {
          setIsPreparingRoom(false);
        }
      }
    };

    prepareRoom();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [activeRoom, canUseLocalDevToken, displayName, hasJoinedRoom, hasLeftRoom, joinSession, userID]);

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
    const syncViewportHeight = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--room-viewport-height', `${Math.round(viewportHeight)}px`);
    };

    syncViewportHeight();
    window.addEventListener('resize', syncViewportHeight);
    window.addEventListener('orientationchange', syncViewportHeight);
    window.visualViewport?.addEventListener('resize', syncViewportHeight);
    window.visualViewport?.addEventListener('scroll', syncViewportHeight);

    return () => {
      window.removeEventListener('resize', syncViewportHeight);
      window.removeEventListener('orientationchange', syncViewportHeight);
      window.visualViewport?.removeEventListener('resize', syncViewportHeight);
      window.visualViewport?.removeEventListener('scroll', syncViewportHeight);
      document.documentElement.style.removeProperty('--room-viewport-height');
    };
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      const fullscreenElement = getFullscreenElement();
      const isNativeFullscreen = fullscreenElement === roomScreenRef.current;

      nativeFullscreenRef.current = isNativeFullscreen;
      setIsFullscreen(isNativeFullscreen);
    };

    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener('webkitfullscreenchange', syncFullscreenState);

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    if (!kitToken || !meetingContainerRef.current || hasLeftRoom || !hasJoinedRoom || !displayName) {
      return undefined;
    }

    let cancelled = false;
    let cleanupRoom = null;
    let videoObserver = null;

    const joinRoom = async () => {
      try {
        const ZegoUIKitPrebuilt = await loadZegoUIKitPrebuilt();

        if (cancelled || !meetingContainerRef.current) {
          return;
        }

        const container = meetingContainerRef.current;
        const mediaPlaybackCleanup = [];
        const initializedMediaElements = new WeakSet();
        let leftRoom = false;
        suppressLeaveEventRef.current = false;

        const syncRoomMediaPlayback = () => {
          container.querySelectorAll('video, audio').forEach((mediaElement) => {
            configureRoomMediaElement(mediaElement);

            if (!initializedMediaElements.has(mediaElement)) {
              initializedMediaElements.add(mediaElement);

              const retryPlayback = () => {
                void attemptRoomMediaPlayback(mediaElement);
              };

              mediaElement.addEventListener('loadedmetadata', retryPlayback);
              mediaElement.addEventListener('canplay', retryPlayback);
              mediaPlaybackCleanup.push(() => {
                mediaElement.removeEventListener('loadedmetadata', retryPlayback);
                mediaElement.removeEventListener('canplay', retryPlayback);
              });
            }

            void attemptRoomMediaPlayback(mediaElement);
          });
        };

        const unlockRoomMediaPlayback = () => {
          syncRoomMediaPlayback();
        };

        window.addEventListener('pointerdown', unlockRoomMediaPlayback, { passive: true });
        window.addEventListener('touchstart', unlockRoomMediaPlayback, { passive: true });
        window.addEventListener('keydown', unlockRoomMediaPlayback);
        mediaPlaybackCleanup.push(() => {
          window.removeEventListener('pointerdown', unlockRoomMediaPlayback);
          window.removeEventListener('touchstart', unlockRoomMediaPlayback);
          window.removeEventListener('keydown', unlockRoomMediaPlayback);
        });
        syncRoomMediaPlayback();

        if (typeof MutationObserver !== 'undefined') {
          videoObserver = new MutationObserver(() => {
            syncRoomMediaPlayback();
          });
          videoObserver.observe(container, {
            childList: true,
            subtree: true,
          });
        }

        const zp = ZegoUIKitPrebuilt.create(kitToken);

        zp.joinRoom({
          container,
          layout: 'Grid',
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
              void exitNativeFullscreen();
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

        cleanupRoom = () => {
          videoObserver?.disconnect();
          videoObserver = null;
          mediaPlaybackCleanup.splice(0).forEach((cleanup) => cleanup());

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
      } catch (error) {
        videoObserver?.disconnect();
        videoObserver = null;

        if (cancelled) {
          return;
        }

        setTokenError(
          error instanceof Error
            ? error.message
            : 'Unable to load the ZEGO meeting SDK.',
        );
        setKitToken('');
      }
    };

    joinRoom();

    return () => {
      cancelled = true;
      cleanupRoom?.();
    };
  }, [displayName, exitNativeFullscreen, hasJoinedRoom, hasLeftRoom, joinSession, kitToken, roomUrl, showLeaveState]);

  const handleCopyLink = async () => {
    try {
      const copied = await copyTextToClipboard(roomUrl);
      setCopyStatus(copied ? 'Invite link copied' : 'Copy failed');
    } catch {
      setCopyStatus('Copy failed');
    }
  };

  const handleRejoin = () => {
    setHasJoinedRoom(true);
    setHasLeftRoom(false);
    setJoinSession((current) => current + 1);
  };

  const handlePrivateRoomSubmit = (event) => {
    event.preventDefault();

    if (!isValidPrivateRoomPassword(passwordDraft)) {
      setRoomPasswordError('Enter the 4-digit password for this room.');
      return;
    }

    if (!verifyPrivateRoomPassword(activeRoom, passwordDraft, roomPasswordHash)) {
      setRoomPasswordError('That password is not correct for this private room.');
      return;
    }

    rememberRoomAccess(activeRoom, roomPasswordHash);
    setRoomPasswordError('');
    setIsPrivateRoomUnlocked(true);
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
    const nextState = !isFullscreen;

    if (!nextState) {
      await exitNativeFullscreen();
      setIsFullscreen(false);
      return;
    }

    const target = roomScreenRef.current;

    if (!target) {
      setIsFullscreen(true);
      return;
    }

    try {
      if (typeof target.requestFullscreen === 'function') {
        await target.requestFullscreen();
        nativeFullscreenRef.current = true;
        setIsFullscreen(true);
        return;
      }

      if (typeof target.webkitRequestFullscreen === 'function') {
        await target.webkitRequestFullscreen();
        nativeFullscreenRef.current = true;
        setIsFullscreen(true);
        return;
      }
    } catch {
      nativeFullscreenRef.current = false;
    }

    setIsFullscreen(true);
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
          ) : hasJoinedRoom && kitToken ? (
            <div className="room-stage">
              <div className="zego-room-container" key={joinSession} ref={meetingContainerRef} />
            </div>
          ) : hasJoinedRoom && isPreparingRoom ? (
            <div className="room-standby">
              <span className="card-label">Connecting</span>
              <h2>Preparing your live room</h2>
              <p>Generating a secure session token and loading the meeting controls.</p>
            </div>
          ) : hasJoinedRoom ? (
            <div className="room-fallback">
              <span className="card-label">Secure setup required</span>
              <h3>{tokenError || 'The live room could not get a secure ZEGO token.'}</h3>
              <p>
                For local Vite development use <code>.env.local</code>. For Vercel or any
                deployed environment, add the server variables below and redeploy.
              </p>
              <pre className="room-fallback__code">
                {roomFallbackSnippet}
              </pre>
            </div>
          ) : shouldShowPrivateRoomPrompt ? (
            <div className="room-standby">
              <span className="card-label">Private room</span>
              <h2>{activeRoom}</h2>
              <p>Enter the 4-digit room password in the popup to unlock this call.</p>
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
              <li>Room type: {roomVisibility === 'private' ? 'Private' : 'Public'}</li>
              <li>Access: {roomVisibility === 'private' ? '4-digit password required' : 'Open invite link'}</li>
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

      {shouldShowPrivateRoomPrompt ? (
        <div className="room-name-backdrop">
          <div
            aria-labelledby="room-password-title"
            aria-modal="true"
            className="room-name-dialog"
            role="dialog"
          >
            <span className="card-label">Private room</span>
            <h2 id="room-password-title">Enter room password</h2>
            <p>
              Room <strong>{activeRoom}</strong> is private. Enter the 4-digit password before joining.
            </p>
            <form className="room-name-form" onSubmit={handlePrivateRoomSubmit}>
              <input
                autoFocus
                className={`room-name-input${roomPasswordError ? ' is-invalid' : ''}`}
                inputMode="numeric"
                maxLength="4"
                onChange={(event) => {
                  setPasswordDraft(event.target.value.replace(/\D/g, '').slice(0, 4));
                  setRoomPasswordError('');
                }}
                placeholder="4-digit password"
                type="password"
                value={passwordDraft}
              />
              <button className="hero-button hero-button--create" disabled={passwordDraft.length !== 4} type="submit">
                Unlock room
              </button>
            </form>
            {roomPasswordError ? (
              <p className="room-name-error" role="alert">
                {roomPasswordError}
              </p>
            ) : null}
          </div>
        </div>
      ) : shouldShowNamePrompt ? (
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
