import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  buildRoomPath,
  createRoom,
  generateRoomId,
  getRoom,
  isValidPrivateRoomPassword,
  normalizeRoomId,
  rememberRoomAccess,
} from '../data/roomRegistry';

function getCurrentOffset(node) {
  if (!node) {
    return { x: 0, y: 0 };
  }

  const computedTransform = window.getComputedStyle(node).transform;

  if (!computedTransform || computedTransform === 'none') {
    return {
      x: Number.parseFloat(node.dataset.dragX || '0'),
      y: Number.parseFloat(node.dataset.dragY || '0'),
    };
  }

  const matrix = new DOMMatrixReadOnly(computedTransform);

  return { x: matrix.m41, y: matrix.m42 };
}

function DraggableFloat({ className, children, dragHandleSelector = null }) {
  const nodeRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    originX: 0,
    originY: 0,
    pointerId: null,
    startX: 0,
    startY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const releasePointerCapture = (node, pointerId) => {
    if (!node || pointerId === undefined || typeof node.hasPointerCapture !== 'function') {
      return;
    }

    if (node.hasPointerCapture(pointerId)) {
      node.releasePointerCapture(pointerId);
    }
  };

  const syncOffset = (node, x, y) => {
    node.dataset.dragX = `${x}`;
    node.dataset.dragY = `${y}`;
    node.style.setProperty('--drag-x', `${x}px`);
    node.style.setProperty('--drag-y', `${y}px`);
  };

  const endDrag = useCallback((pointerId) => {
    const dragState = dragStateRef.current;

    if (!dragState.active || (pointerId !== undefined && dragState.pointerId !== pointerId)) {
      return;
    }

    dragStateRef.current = {
      active: false,
      originX: dragState.originX,
      originY: dragState.originY,
      pointerId: null,
      startX: 0,
      startY: 0,
    };

    setIsDragging(false);
  }, []);

  const handleDragMove = useCallback((event) => {
    const dragState = dragStateRef.current;

    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
    }

    const node = nodeRef.current;

    if (!node) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    const nextX = dragState.originX + (event.clientX - dragState.startX);
    const nextY = dragState.originY + (event.clientY - dragState.startY);

    syncOffset(node, nextX, nextY);
  }, []);

  const handleDragEnd = useCallback((pointerId) => {
    const node = nodeRef.current;

    releasePointerCapture(node, pointerId);
    endDrag(pointerId);
  }, [endDrag]);

  useEffect(() => {
    const handleWindowPointerMove = (event) => {
      handleDragMove(event);
    };

    const handleWindowPointerUp = (event) => {
      handleDragEnd(event.pointerId);
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: false });
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [handleDragEnd, handleDragMove]);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const node = nodeRef.current;

    if (!node) {
      return;
    }

    if (dragHandleSelector) {
      const pointerTarget = event.target instanceof Element ? event.target : null;
      const dragHandle = pointerTarget?.closest(dragHandleSelector);

      if (!dragHandle || !node.contains(dragHandle)) {
        return;
      }
    }

    event.preventDefault();

    const { x, y } = getCurrentOffset(node);

    syncOffset(node, x, y);

    dragStateRef.current = {
      active: true,
      originX: x,
      originY: y,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
    };

    node.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    handleDragMove(event);
  };

  const handlePointerUp = (event) => {
    handleDragEnd(event.pointerId);
  };

  const handleLostPointerCapture = (event) => {
    endDrag(event.pointerId);
  };

  return (
    <div
      className={`hero-float ${className}${isDragging ? ' is-dragging' : ''}`}
      data-drag-scope={dragHandleSelector ? 'handle' : 'full'}
      data-dragging={isDragging}
      onDragStart={(event) => event.preventDefault()}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerCancel={handlePointerUp}
      onPointerDownCapture={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={nodeRef}
    >
      <div className="hero-float__item">
        {children}
      </div>
    </div>
  );
}

function parseRoomDestination(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { roomId: '', path: '' };
  }

  const looksLikeRoomPath =
    trimmedValue.startsWith('/video/') ||
    trimmedValue.startsWith('video/') ||
    /^https?:\/\//i.test(trimmedValue);

  if (looksLikeRoomPath && typeof window !== 'undefined') {
    try {
      const parsedUrl = new URL(trimmedValue.startsWith('video/') ? `/${trimmedValue}` : trimmedValue, window.location.origin);
      const matchedSegments = parsedUrl.pathname.match(/^\/video\/([^/?#]+)/i);

      if (matchedSegments?.[1]) {
        const parsedRoomId = normalizeRoomId(decodeURIComponent(matchedSegments[1]));

        if (parsedRoomId) {
          return {
            roomId: parsedRoomId,
            path: `${buildRoomPath(parsedRoomId)}${parsedUrl.search}`.replace(/\?$/, ''),
          };
        }
      }
    } catch {
      // Fall through to a plain room-id parse.
    }
  }

  return {
    roomId: normalizeRoomId(trimmedValue),
    path: '',
  };
}

function Hero() {
  const [roomMode, setRoomMode] = useState('join');
  const [roomVisibility, setRoomVisibility] = useState('public');
  const [isRoomVisibilityMenuOpen, setIsRoomVisibilityMenuOpen] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [privatePassword, setPrivatePassword] = useState('');
  const [isPrivatePasswordVisible, setIsPrivatePasswordVisible] = useState(false);
  const [roomError, setRoomError] = useState('');
  const [generateSpinCycle, setGenerateSpinCycle] = useState(0);
  const [roomModeGliderStyle, setRoomModeGliderStyle] = useState({
    opacity: '0',
    transform: 'translate3d(0px, 0, 0)',
    width: '0px',
  });
  const roomModeToggleRef = useRef(null);
  const roomModeButtonRefs = useRef({
    join: null,
    create: null,
  });
  const roomVisibilityMenuRef = useRef(null);
  const navigate = useNavigate();
  const hasPrivatePasswordError =
    roomMode === 'create' &&
    roomVisibility === 'private' &&
    roomError === 'Private rooms need a 4-digit password.';
  const isRoomInputInvalid = Boolean(roomError) && !hasPrivatePasswordError;

  const roomHint = roomMode === 'join'
    ? 'Join with an existing room ID or paste a full invite link.'
    : roomVisibility === 'private'
      ? 'Private rooms need a 4-digit password. Share the room link and password with guests.'
      : 'Create a public room. Leave the field empty or click Generate ID for an instant code.';

  const handleRoomModeChange = (nextMode) => {
    setRoomMode(nextMode);
    setRoomError('');
    setIsRoomVisibilityMenuOpen(false);

    if (nextMode !== 'create') {
      setRoomVisibility('public');
      setPrivatePassword('');
      setIsPrivatePasswordVisible(false);
    }
  };

  const syncRoomModeGlider = useCallback(() => {
    const container = roomModeToggleRef.current;
    const activeButton = roomModeButtonRefs.current[roomMode];

    if (!container || !activeButton) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeButtonRect = activeButton.getBoundingClientRect();
    const nextStyle = {
      opacity: '1',
      transform: `translate3d(${activeButtonRect.left - containerRect.left}px, 0, 0)`,
      width: `${activeButtonRect.width}px`,
    };

    setRoomModeGliderStyle((current) => (
      current.opacity === nextStyle.opacity &&
      current.transform === nextStyle.transform &&
      current.width === nextStyle.width
        ? current
        : nextStyle
    ));
  }, [roomMode]);

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
    setRoomError('');
  };

  const handleRoomVisibilityChange = (nextVisibility) => {
    setRoomVisibility(nextVisibility);
    setRoomError('');
    setIsRoomVisibilityMenuOpen(false);

    if (nextVisibility === 'public') {
      setPrivatePassword('');
      setIsPrivatePasswordVisible(false);
    }
  };

  useLayoutEffect(() => {
    syncRoomModeGlider();
  }, [syncRoomModeGlider]);

  useEffect(() => {
    const handleResize = () => {
      syncRoomModeGlider();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [syncRoomModeGlider]);

  useEffect(() => {
    if (!isRoomVisibilityMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const menu = roomVisibilityMenuRef.current;

      if (menu && event.target instanceof Node && !menu.contains(event.target)) {
        setIsRoomVisibilityMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsRoomVisibilityMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRoomVisibilityMenuOpen]);

  const handlePrivatePasswordChange = (event) => {
    setPrivatePassword(event.target.value.replace(/\D/g, '').slice(0, 4));
    setRoomError('');
  };

  const handleGenerateRoomId = () => {
    setRoomId(generateRoomId());
    setRoomError('');
    setGenerateSpinCycle((current) => current + 1);
  };

  const handleRoomSubmit = (event) => {
    event.preventDefault();

    if (roomMode === 'join') {
      const destination = parseRoomDestination(roomId);

      if (!destination.roomId) {
        setRoomError('Enter an existing room ID to join.');
        return;
      }

      if (destination.path) {
        setRoomError('');
        navigate(destination.path);
        return;
      }

      const existingRoom = getRoom(destination.roomId);

      if (!existingRoom) {
        setRoomError('This room ID is not available here. Paste the full invite link or use Create to start a new room.');
        return;
      }

      setRoomError('');
      navigate(buildRoomPath(existingRoom.roomId, existingRoom));
      return;
    }

    const normalizedRoomId = normalizeRoomId(roomId);
    const nextRoomId = normalizedRoomId || generateRoomId();

    if (roomVisibility === 'private' && !isValidPrivateRoomPassword(privatePassword)) {
      setRoomError('Private rooms need a 4-digit password.');
      return;
    }

    const createdRoom = createRoom(nextRoomId, {
      visibility: roomVisibility,
      password: privatePassword,
    });

    if (!createdRoom) {
      setRoomError('This room ID already exists. Choose a new code or switch to Join.');
      return;
    }

    if (createdRoom.visibility === 'private' && createdRoom.passwordHash) {
      rememberRoomAccess(createdRoom.roomId, createdRoom.passwordHash);
    }

    setRoomId(createdRoom.roomId);
    setRoomError('');
    navigate(buildRoomPath(createdRoom.roomId, createdRoom));
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

          <div className="hero-room-entry">
            <div className="hero-room-toolbar">
              <div
                aria-label="Room action"
                className="hero-mode-toggle"
                role="tablist"
                ref={roomModeToggleRef}
              >
                <span aria-hidden="true" className="hero-mode-toggle__glider" style={roomModeGliderStyle} />
                <button
                  aria-selected={roomMode === 'join'}
                  className={`hero-mode-toggle__option${roomMode === 'join' ? ' is-active' : ''}`}
                  onClick={() => handleRoomModeChange('join')}
                  ref={(node) => {
                    roomModeButtonRefs.current.join = node;
                  }}
                  role="tab"
                  type="button"
                >
                  Join
                </button>
                <button
                  aria-selected={roomMode === 'create'}
                  className={`hero-mode-toggle__option${roomMode === 'create' ? ' is-active' : ''}`}
                  onClick={() => handleRoomModeChange('create')}
                  ref={(node) => {
                    roomModeButtonRefs.current.create = node;
                  }}
                  role="tab"
                  type="button"
                >
                  Create
                </button>
              </div>
              {roomMode === 'create' ? (
                <label className="hero-form__select-wrap hero-form__select-wrap--toolbar">
                  <span className="hero-form__select-label">Room type</span>
                  <div className="hero-select-menu" ref={roomVisibilityMenuRef}>
                    <button
                      aria-controls="hero-room-visibility-options"
                      aria-expanded={isRoomVisibilityMenuOpen}
                      aria-haspopup="listbox"
                      className={`hero-select hero-select--centered hero-select-trigger${isRoomVisibilityMenuOpen ? ' is-open' : ''}`}
                      onClick={() => setIsRoomVisibilityMenuOpen((current) => !current)}
                      type="button"
                    >
                      <span>{roomVisibility === 'private' ? 'Private' : 'Public'}</span>
                    </button>
                    <div className={`hero-select-popover${isRoomVisibilityMenuOpen ? ' is-open' : ''}`}>
                      <div className="hero-select-popover__panel" id="hero-room-visibility-options" role="listbox">
                        <button
                          aria-selected={roomVisibility === 'public'}
                          className={`hero-select-popover__option${roomVisibility === 'public' ? ' is-selected' : ''}`}
                          onClick={() => handleRoomVisibilityChange('public')}
                          role="option"
                          type="button"
                        >
                          Public
                        </button>
                        <button
                          aria-selected={roomVisibility === 'private'}
                          className={`hero-select-popover__option${roomVisibility === 'private' ? ' is-selected' : ''}`}
                          onClick={() => handleRoomVisibilityChange('private')}
                          role="option"
                          type="button"
                        >
                          Private
                        </button>
                      </div>
                    </div>
                  </div>
                </label>
              ) : null}
            </div>
            <form className="hero-form" onSubmit={handleRoomSubmit}>
              <div className={`hero-form__row${roomMode === 'create' ? ' hero-form__row--create' : ''}`}>
                <input
                  aria-label={roomMode === 'join' ? 'Room ID' : 'New room ID'}
                  aria-describedby="hero-room-message"
                  className={`hero-input${isRoomInputInvalid ? ' is-invalid' : ''}`}
                  onChange={handleRoomIdChange}
                  placeholder={roomMode === 'join' ? 'Enter room ID or invite link' : 'Choose a room ID'}
                  type="text"
                  value={roomId}
                />
                {roomMode === 'create' ? (
                  <div className="hero-form__action-stack">
                    <div className="hero-form__actions">
                      <button
                        aria-label="Generate room ID"
                        className="control-button hero-form__icon-button"
                        onClick={handleGenerateRoomId}
                        title="Generate room ID"
                        type="button"
                      >
                        <svg
                          aria-hidden="true"
                          className={generateSpinCycle > 0 ? 'hero-form__icon-spin' : ''}
                          fill="none"
                          key={generateSpinCycle}
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12 3.5v4.2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M12 16.3v4.2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M3.5 12h4.2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M16.3 12h4.2"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M6.7 6.7l2.9 2.9"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M14.4 14.4l2.9 2.9"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M17.3 6.7l-2.9 2.9"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                          <path
                            d="M9.6 14.4l-2.9 2.9"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.8"
                          />
                        </svg>
                      </button>
                      <button className="hero-button hero-button--create" type="submit">
                        Create Room
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="hero-button hero-button--join" type="submit">
                    Join Room
                  </button>
                )}
              </div>
              {roomMode === 'create' && roomVisibility === 'private' ? (
                <div className="hero-form__row hero-form__row--single">
                  <div className={`hero-password-card${hasPrivatePasswordError ? ' is-invalid' : ''}`}>
                    <div className="hero-password-card__header">
                      <span className="hero-password-card__label">Private room passcode</span>
                      <span className="hero-password-card__hint">4 digits only</span>
                    </div>
                    <div className="hero-password-field">
                      <input
                        aria-label="Private room password"
                        className={`hero-input hero-input--password hero-password-field__input${hasPrivatePasswordError ? ' is-invalid' : ''}`}
                        inputMode="numeric"
                        maxLength="4"
                        onChange={handlePrivatePasswordChange}
                        placeholder="Set 4-digit password"
                        type={isPrivatePasswordVisible ? 'text' : 'password'}
                        value={privatePassword}
                      />
                      <button
                        aria-label={isPrivatePasswordVisible ? 'Hide password' : 'Show password'}
                        className="hero-password-field__toggle"
                        onClick={() => setIsPrivatePasswordVisible((current) => !current)}
                        type="button"
                      >
                        {isPrivatePasswordVisible ? (
                          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                            <path d="M3 3l18 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                            <path
                              d="M10.6 10.8A2.8 2.8 0 0 0 14 14.2"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M9.9 5.4A10.2 10.2 0 0 1 21 12c-1 1.8-2.3 3.2-3.8 4.2"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M14.1 18.5A10.3 10.3 0 0 1 3 12c.7-1.3 1.6-2.5 2.6-3.4"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                          </svg>
                        ) : (
                          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                            <path
                              d="M3 12c1.7-3.3 5.1-5.8 9-5.8s7.3 2.5 9 5.8c-1.7 3.3-5.1 5.8-9 5.8S4.7 15.3 3 12Z"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.8"
                            />
                            <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
              <p
                className={`hero-form__message${roomError ? ' is-error' : ''}`}
                id="hero-room-message"
                role={roomError ? 'alert' : undefined}
              >
                {roomError || roomHint}
              </p>
            </form>
          </div>

          <div className="hero-actions">
            <Link className="hero-shortcut" to="/history">
              <span aria-hidden="true" className="hero-shortcut__icon">
                <svg fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M12 7.6v4.8l3 1.7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </span>
              <span>History</span>
            </Link>
            <Link className="text-link" to="/features">
              Explore platform
            </Link>
            <Link className="text-link" to="/pricing">
              See pricing
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual__mesh" />
          <div className="hero-visual__beam" />

          <DraggableFloat className="hero-float--glow-pink">
            <div className="hero-glow hero-glow--pink" />
          </DraggableFloat>

          <DraggableFloat className="hero-float--glow-blue">
            <div className="hero-glow hero-glow--blue" />
          </DraggableFloat>

          <DraggableFloat className="hero-float--avatar-left">
            <div className="hero-avatar-card">
              <div className="mini-avatar mini-avatar--blue">AK</div>
              <span>Ali Khan</span>
            </div>
          </DraggableFloat>

          <DraggableFloat className="hero-float--avatar-right">
            <div className="hero-avatar-card">
              <div className="mini-avatar mini-avatar--peach">SN</div>
              <span>Sara Noor</span>
            </div>
          </DraggableFloat>

          <DraggableFloat className="hero-float--status-top">
            <div className="hero-status hero-status--top">Mic</div>
          </DraggableFloat>

          <DraggableFloat className="hero-float--status-middle">
            <div className="hero-status hero-status--middle">Chat</div>
          </DraggableFloat>

          <DraggableFloat className="hero-float--status-bottom">
            <div className="hero-status hero-status--bottom">Share</div>
          </DraggableFloat>

          <DraggableFloat className="hero-float--figure" dragHandleSelector=".hero-body, .hero-seat">
            <div className="hero-figure">
              <div className="hero-seat" />
              <div className="hero-body">
                <div className="hero-head">
                  <div className="hero-ear hero-ear--left" />
                  <div className="hero-ear hero-ear--right" />
                  <div className="hero-face-shadow" />
                  <div className="hero-hair" />
                  <div className="hero-brows">
                    <span />
                    <span />
                  </div>
                  <div className="hero-eyes">
                    <span />
                    <span />
                  </div>
                  <div className="hero-glasses">
                    <span className="hero-glasses__lens" />
                    <span className="hero-glasses__lens" />
                  </div>
                  <div className="hero-nose" />
                  <div className="hero-mouth" />
                </div>
                <div className="hero-torso" />
                <div className="hero-arm hero-arm--left" />
                <div className="hero-arm hero-arm--right" />
                <div className="hero-hand hero-hand--left" />
                <div className="hero-hand hero-hand--right" />
                <div className="hero-tablet">
                  <div className="hero-tablet__screen">
                    <div className="hero-tablet__topbar">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="hero-tablet__call">
                      <div className="hero-tablet__portrait">
                        <div className="hero-tablet__portrait-face">
                          <div className="hero-tablet__portrait-hair" />
                          <div className="hero-tablet__portrait-eyes">
                            <span />
                            <span />
                          </div>
                          <div className="hero-tablet__portrait-mouth" />
                        </div>
                        <div className="hero-tablet__portrait-body" />
                      </div>
                      <div className="hero-tablet__details">
                        <span className="hero-tablet__detail hero-tablet__detail--wide" />
                        <span className="hero-tablet__detail" />
                        <div className="hero-tablet__signal">
                          <span />
                        </div>
                      </div>
                    </div>
                    <div className="hero-tablet__footer">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
                <div className="hero-leg hero-leg--left" />
                <div className="hero-leg hero-leg--right" />
              </div>
            </div>
          </DraggableFloat>
        </div>
      </div>
    </section>
  );
}

export default Hero;
