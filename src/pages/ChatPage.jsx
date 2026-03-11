import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildSupportReply } from '../data/supportKnowledge';

const quickPrompts = [
  'How do I create and share a room?',
  'Where can I see previous room history?',
  'What is included in the Team plan?',
  'Can guests join without sign-up?',
];

const initialMessages = [
  {
    id: 1,
    author: 'Support AI',
    body: 'Hi. I am the Talksy support assistant. Ask about live rooms, sharing links, room history, pricing, onboarding, install help, or which plan fits your workflow.',
    role: 'assistant',
    actions: [
      { label: 'Review pricing', to: '/pricing' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  },
];

function ChatPage() {
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const pendingRepliesRef = useRef(0);
  const timeoutsRef = useRef([]);
  const nextMessageIdRef = useRef(initialMessages.length + 1);

  useEffect(() => () => {
    timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
  }, []);

  const queueReply = (message) => {
    pendingRepliesRef.current += 1;
    setIsTyping(true);

    const timeoutId = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageIdRef.current++,
          author: 'Support AI',
          ...buildSupportReply(message),
          role: 'assistant',
        },
      ]);
      pendingRepliesRef.current -= 1;
      setIsTyping(pendingRepliesRef.current > 0);
      timeoutsRef.current = timeoutsRef.current.filter((currentTimeoutId) => currentTimeoutId !== timeoutId);
    }, 700);

    timeoutsRef.current.push(timeoutId);
  };

  const submitMessage = (message) => {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: nextMessageIdRef.current++,
        author: 'You',
        body: trimmed,
        role: 'user',
      },
    ]);
    setDraft('');
    queueReply(trimmed);
  };

  return (
    <section className="page-shell chat-page">
      <div className="page-hero">
        <span className="eyebrow">Support</span>
        <h1>Get fast product answers before your next room goes live.</h1>
        <p>
          Ask the Talksy support assistant about rooms, sharing flow, pricing, history,
          onboarding, install help, and which Talksy path fits your team best.
        </p>
      </div>

      <div className="chat-layout">
        <section className="chat-panel">
          <div className="chat-panel__header">
            <div>
              <span className="card-label">Product support</span>
              <h3>Talksy assistant</h3>
            </div>
            <span className="chat-status">
              <span className="chat-status__dot" />
              Online now
            </span>
          </div>

          <div className="chat-thread" role="log" aria-live="polite">
            {messages.map((message) => (
              <article className={`chat-message chat-message--${message.role}`} key={message.id}>
                <span className="chat-message__author">{message.author}</span>
                <p>{message.body}</p>
                {message.actions?.length ? (
                  <div className="chat-message__actions">
                    {message.actions.map((action) => (
                      <Link className="chat-message__action" key={`${message.id}-${action.to}`} to={action.to}>
                        {action.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {isTyping ? (
              <div className="chat-message chat-message--assistant chat-message--typing">
                <span className="chat-message__author">Support AI</span>
                <div className="chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ) : null}
          </div>

          <form
            className="chat-composer"
            onSubmit={(event) => {
              event.preventDefault();
              submitMessage(draft);
            }}
          >
            <input
              aria-label="Chat message"
              className="chat-input"
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask anything about Talksy"
              type="text"
              value={draft}
            />
            <button className="hero-button" type="submit">
              Send
            </button>
          </form>
        </section>

        <aside className="chat-sidebar">
          <article className="detail-card accent-ice">
            <span className="card-label">Quick prompts</span>
            <div className="chat-prompt-list">
              {quickPrompts.map((prompt) => (
                <button
                  className="chat-prompt"
                  key={prompt}
                  onClick={() => submitMessage(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </article>

          <article className="detail-card">
            <span className="card-label">Need a next step?</span>
            <p>
              Open a demo room, review features, or compare plans while the assistant
              helps you map the right Talksy setup.
            </p>
            <div className="stacked-actions">
              <Link className="inline-button" to="/video/demo-room">
                Open demo room
              </Link>
              <Link className="inline-button inline-button--secondary" to="/features">
                Explore features
              </Link>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default ChatPage;
