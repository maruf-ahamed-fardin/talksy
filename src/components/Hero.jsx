import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createRoom, normalizeRoomId, roomExists } from '../data/roomRegistry';

const RETURN_DELAY_MS = 120000;
const GENERATED_ROOM_PREFIX = 'room-';

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
  const returnTimerRef = useRef(null);
  const returnFrameRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    originX: 0,
    originY: 0,
    pointerId: null,
    startX: 0,
    startY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const releasePointerCapture = (node, pointerId) => {
    if (!node || pointerId === undefined || typeof node.hasPointerCapture !== 'function') {
      return;
    }

    if (node.hasPointerCapture(pointerId)) {
      node.releasePointerCapture(pointerId);
    }
  };

  const clearPendingReturn = () => {
    if (returnTimerRef.current) {
      window.clearTimeout(returnTimerRef.current);
      returnTimerRef.current = null;
    }

    if (returnFrameRef.current) {
      window.cancelAnimationFrame(returnFrameRef.current);
      returnFrameRef.current = null;
    }
  };

  const syncOffset = (node, x, y) => {
    node.dataset.dragX = `${x}`;
    node.dataset.dragY = `${y}`;
    node.style.setProperty('--drag-x', `${x}px`);
    node.style.setProperty('--drag-y', `${y}px`);
  };

  const scheduleReturn = () => {
    clearPendingReturn();

    returnTimerRef.current = window.setTimeout(() => {
      const node = nodeRef.current;

      if (!node) {
        return;
      }

      const { x, y } = getCurrentOffset(node);

      if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) {
        syncOffset(node, 0, 0);
        setIsReturning(false);
        return;
      }

      syncOffset(node, x, y);
      setIsReturning(true);

      returnFrameRef.current = window.requestAnimationFrame(() => {
        const activeNode = nodeRef.current;

        if (!activeNode) {
          return;
        }

        syncOffset(activeNode, 0, 0);
        returnFrameRef.current = null;
      });
    }, RETURN_DELAY_MS);
  };

  useEffect(() => () => {
    clearPendingReturn();
  }, []);

  const handleDragMove = useEffectEvent((event) => {
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
  });

  const handleDragEnd = useEffectEvent((pointerId) => {
    const node = nodeRef.current;

    releasePointerCapture(node, pointerId);
    endDrag(pointerId);
  });

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
  }, []);

  const endDrag = (pointerId) => {
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
    scheduleReturn();
  };

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
    clearPendingReturn();

    const { x, y } = getCurrentOffset(node);

    syncOffset(node, x, y);
    setIsReturning(false);

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
      className={`hero-float ${className}${isDragging ? ' is-dragging' : ''}${isReturning ? ' is-returning' : ''}`}
      data-drag-scope={dragHandleSelector ? 'handle' : 'full'}
      data-dragging={isDragging}
      onDragStart={(event) => event.preventDefault()}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerCancel={handlePointerUp}
        onPointerDownCapture={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'transform') {
          setIsReturning(false);
        }
      }}
      ref={nodeRef}
    >
      <div className="hero-float__item">
        {children}
      </div>
    </div>
  );
}

function Hero() {
  const [roomMode, setRoomMode] = useState('join');
  const [roomId, setRoomId] = useState('');
  const [roomError, setRoomError] = useState('');
  const navigate = useNavigate();

  const roomHint = roomMode === 'join'
    ? 'Join only works with an existing room ID.'
    : 'Create only makes a new room. Leave the field empty to generate a code.';

  const handleRoomModeChange = (nextMode) => {
    setRoomMode(nextMode);
    setRoomError('');
  };

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
    setRoomError('');
  };

  const handleRoomSubmit = (event) => {
    event.preventDefault();

    const normalizedRoomId = normalizeRoomId(roomId);

    if (roomMode === 'join') {
      if (!normalizedRoomId) {
        setRoomError('Enter an existing room ID to join.');
        return;
      }

      if (!roomExists(normalizedRoomId)) {
        setRoomError('This room ID has not been created yet. Use Create to start a new room.');
        return;
      }

      setRoomError('');
      navigate(`/video/${encodeURIComponent(normalizedRoomId)}`);
      return;
    }

    const nextRoomId = normalizedRoomId || `${GENERATED_ROOM_PREFIX}${Date.now().toString(36)}`;
    const createdRoom = createRoom(nextRoomId);

    if (!createdRoom) {
      setRoomError('This room ID already exists. Choose a new code or switch to Join.');
      return;
    }

    setRoomError('');
    navigate(`/video/${encodeURIComponent(createdRoom.roomId)}`);
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
            <div aria-label="Room action" className="hero-mode-toggle" role="tablist">
              <button
                aria-selected={roomMode === 'join'}
                className={`hero-mode-toggle__option${roomMode === 'join' ? ' is-active' : ''}`}
                onClick={() => handleRoomModeChange('join')}
                role="tab"
                type="button"
              >
                Join
              </button>
              <button
                aria-selected={roomMode === 'create'}
                className={`hero-mode-toggle__option${roomMode === 'create' ? ' is-active' : ''}`}
                onClick={() => handleRoomModeChange('create')}
                role="tab"
                type="button"
              >
                Create
              </button>
            </div>
            <form className="hero-form" onSubmit={handleRoomSubmit}>
              <div className="hero-form__row">
                <input
                  aria-label={roomMode === 'join' ? 'Room ID' : 'New room ID'}
                  aria-describedby="hero-room-message"
                  className={`hero-input${roomError ? ' is-invalid' : ''}`}
                  onChange={handleRoomIdChange}
                  placeholder={roomMode === 'join' ? 'Enter existing room ID' : 'Choose a new room ID'}
                  type="text"
                  value={roomId}
                />
                <button
                  className={`hero-button ${roomMode === 'create' ? 'hero-button--create' : 'hero-button--join'}`}
                  type="submit"
                >
                  {roomMode === 'join' ? 'Join Room' : 'Create Room'}
                </button>
              </div>
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
