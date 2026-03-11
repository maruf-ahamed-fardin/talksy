import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RETURN_DELAY_MS = 120000;

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

function DraggableFloat({ className, children }) {
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
    const dragState = dragStateRef.current;

    if (!dragState.active || dragState.pointerId !== event.pointerId) {
      return;
    }

    const node = nodeRef.current;

    if (!node) {
      return;
    }

    const nextX = dragState.originX + (event.clientX - dragState.startX);
    const nextY = dragState.originY + (event.clientY - dragState.startY);

    syncOffset(node, nextX, nextY);
  };

  const handlePointerUp = (event) => {
    const node = nodeRef.current;

    if (node?.hasPointerCapture(event.pointerId)) {
      node.releasePointerCapture(event.pointerId);
    }

    endDrag(event.pointerId);
  };

  const handleLostPointerCapture = (event) => {
    endDrag(event.pointerId);
  };

  return (
    <div
      className={`hero-float ${className}${isDragging ? ' is-dragging' : ''}${isReturning ? ' is-returning' : ''}`}
      data-dragging={isDragging}
      onDragStart={(event) => event.preventDefault()}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerCancel={handlePointerUp}
      onPointerDown={handlePointerDown}
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
  const navigate = useNavigate();

  const handleRoomSubmit = (event) => {
    event.preventDefault();

    const normalizedRoomId = roomId.trim().replace(/\s+/g, '-').toLowerCase();
    const fallbackRoomId = roomMode === 'create'
      ? `room-${Date.now().toString(36)}`
      : 'instant-room';

    const nextRoomId = normalizedRoomId || fallbackRoomId;

    navigate(`/video/${encodeURIComponent(nextRoomId)}`);
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
                onClick={() => setRoomMode('join')}
                role="tab"
                type="button"
              >
                Join
              </button>
              <button
                aria-selected={roomMode === 'create'}
                className={`hero-mode-toggle__option${roomMode === 'create' ? ' is-active' : ''}`}
                onClick={() => setRoomMode('create')}
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
                  className="hero-input"
                  onChange={(event) => setRoomId(event.target.value)}
                  placeholder={roomMode === 'join' ? 'Enter Room Id' : 'Choose Room Id'}
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

          <DraggableFloat className="hero-float--figure">
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
