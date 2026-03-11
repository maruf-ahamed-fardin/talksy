const STOP_WORDS = new Set([
  'a',
  'about',
  'an',
  'and',
  'any',
  'are',
  'can',
  'do',
  'for',
  'from',
  'get',
  'give',
  'help',
  'how',
  'i',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'our',
  'the',
  'this',
  'to',
  'what',
  'when',
  'with',
  'you',
  'your',
]);

const SUPPORT_KNOWLEDGE = [
  {
    id: 'pricing',
    title: 'Pricing and plans',
    keywords: ['price', 'pricing', 'plan', 'plans', 'cost', 'starter', 'team', 'scale', 'free'],
    phrases: ['free plan', 'pricing plan', 'how much', 'monthly price'],
    answer:
      'Talksy has three plan directions. Starter is free and covers the core flow: create or join rooms, share one clean link, let guests enter with a display name, and keep local room history. Team is $24 per month for a more repeatable workflow with install support, recurring room guidance, and stronger host setup. Scale is $79 per month for broader rollouts, launch support, room planning, and custom support workflows.',
    actions: [
      { label: 'Review pricing', to: '/pricing' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  },
  {
    id: 'rooms',
    title: 'Rooms and joining',
    keywords: ['room', 'join', 'link', 'code', 'invite', 'meeting', 'demo', 'call', 'launch', 'share', 'fullscreen'],
    phrases: ['start a room', 'join room', 'share a link', 'demo room', 'room code'],
    answer:
      'Talksy is designed for fast room setup. You can create or join a room from the homepage, share the room code or full link, let guests set a display name, and move into a live room with a clear layout and fullscreen option.',
    actions: [
      { label: 'Try a demo room', to: '/video/demo-room' },
      { label: 'See features', to: '/features' },
    ],
  },
  {
    id: 'signup',
    title: 'Sign-up and access',
    keywords: ['signup', 'sign', 'account', 'login', 'register', 'registration', 'without'],
    phrases: ['no sign up', 'without sign up', 'need an account', 'create account'],
    answer:
      'Talksy is positioned around low-friction access. Guests can join with a room link, enter a display name, and get into the meeting flow without being forced through a heavy account or sign-up step first.',
    actions: [
      { label: 'Get started', to: '/get-started' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  },
  {
    id: 'features',
    title: 'Product features',
    keywords: ['feature', 'features', 'share', 'screen', 'mobile', 'responsive', 'layout', 'audio', 'video', 'history', 'install', 'fullscreen', 'theme'],
    phrases: ['what features', 'mobile support', 'room history', 'install app', 'fullscreen mode'],
    answer:
      'Talksy focuses on instant live rooms, no-sign-up guest entry, shareable room links, fullscreen viewing, local room history, responsive layouts, light and dark themes, install help, and a built-in support assistant that helps people understand the product fast.',
    actions: [
      { label: 'Explore features', to: '/features' },
      { label: 'Review plans', to: '/pricing' },
    ],
  },
  {
    id: 'solutions',
    title: 'Use cases and audiences',
    keywords: ['remote', 'team', 'teams', 'coach', 'consultant', 'educator', 'mentor', 'community', 'event', 'use', 'case'],
    phrases: ['who is this for', 'use case', 'remote teams', 'for educators', 'for consultants'],
    answer:
      'Talksy is positioned for remote teams, coaches and consultants, educators and mentors, plus communities and events. The message is that joining stays simple while calls remain structured and professional.',
    actions: [
      { label: 'See solutions', to: '/solutions' },
      { label: 'Talk to support', to: '/support' },
    ],
  },
  {
    id: 'resources',
    title: 'Guides and templates',
    keywords: ['resource', 'resources', 'guide', 'template', 'playbook', 'agenda', 'checklist', 'library'],
    phrases: ['meeting agenda', 'resources page', 'guides and templates'],
    answer:
      'The resources section is built around practical Talksy workflows: room launch checklists, repeatable meeting playbooks, room naming habits, mobile host checks, and history-first routines for reviewing previous sessions.',
    actions: [
      { label: 'Browse resources', to: '/resources' },
      { label: 'Get started', to: '/get-started' },
    ],
  },
  {
    id: 'onboarding',
    title: 'Getting started',
    keywords: ['start', 'started', 'onboarding', 'setup', 'first', 'session', 'onboard', 'workflow'],
    phrases: ['get started', 'first session', 'how to begin', 'set up'],
    answer:
      'A strong first path is: choose Create or Join, share the room link, set a display name, test the live room on mobile and desktop, then use history and install shortcuts once the workflow starts repeating. The site also recommends beginning with a demo room before choosing a plan.',
    actions: [
      { label: 'Get started', to: '/get-started' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  },
  {
    id: 'support',
    title: 'Support and walkthroughs',
    keywords: ['support', 'human', 'talk', 'contact', 'walkthrough', 'custom', 'workflow', 'direction'],
    phrases: ['need support', 'talk to someone', 'book walkthrough', 'custom workflow'],
    answer:
      'If someone needs more direction, Talksy can point them toward a demo room, the features page, pricing, or a rollout path depending on where they are in the decision process. Support is best for explaining setup, features, room flow, and which plan fits.',
    actions: [
      { label: 'Book walkthrough', to: '/get-started' },
      { label: 'See pricing', to: '/pricing' },
    ],
  },
];

function tokenize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !STOP_WORDS.has(token));
}

function hasGreeting(message) {
  return /\b(hi|hello|hey|assalamualaikum|hola)\b/i.test(message);
}

function hasThanks(message) {
  return /\b(thanks|thank you|thx)\b/i.test(message);
}

function scoreEntry(message, tokens, entry) {
  let score = 0;

  entry.keywords.forEach((keyword) => {
    if (tokens.includes(keyword)) {
      score += 4;
    }
  });

  entry.phrases.forEach((phrase) => {
    if (message.includes(phrase)) {
      score += 8;
    }
  });

  if (message.includes(entry.id)) {
    score += 3;
  }

  return score;
}

export function buildSupportReply(input) {
  const message = input.toLowerCase().trim();
  const tokens = tokenize(message);

  if (!message) {
    return {
      body: 'Ask about pricing, rooms, setup, resources, or who Talksy is for.',
      actions: [
        { label: 'See features', to: '/features' },
        { label: 'Review pricing', to: '/pricing' },
      ],
    };
  }

  if (hasThanks(message)) {
    return {
      body: 'You are welcome. Ask another question or jump to pricing, features, support, or a demo room when you are ready.',
      actions: [
        { label: 'Open demo room', to: '/video/demo-room' },
        { label: 'Go to features', to: '/features' },
      ],
    };
  }

  if (hasGreeting(message)) {
    return {
      body: 'Hi. I am the Talksy support assistant. I can help with pricing, room setup, link sharing, room history, product features, onboarding, resources, and use cases.',
      actions: [
        { label: 'Ask about plans', to: '/pricing' },
        { label: 'Open support', to: '/support' },
      ],
    };
  }

  const rankedEntries = SUPPORT_KNOWLEDGE
    .map((entry) => ({ entry, score: scoreEntry(message, tokens, entry) }))
    .sort((left, right) => right.score - left.score);

  const bestMatch = rankedEntries[0];

  if (bestMatch && bestMatch.score > 0) {
    const secondaryMatch = rankedEntries[1];
    const extraLine =
      secondaryMatch && secondaryMatch.score >= 7
        ? ` If you also mean ${secondaryMatch.entry.title.toLowerCase()}, the best next page is ${secondaryMatch.entry.actions[0]?.label || 'that section'}.`
        : '';

    return {
      body: `${bestMatch.entry.answer}${extraLine}`,
      actions: bestMatch.entry.actions,
    };
  }

  return {
    body:
      'I can answer questions about Talksy pricing, creating or joining rooms, no-sign-up access, room history, product features, onboarding, resources, install help, and supported use cases. Ask in a more specific way and I will point you to the right answer.',
    actions: [
      { label: 'See solutions', to: '/solutions' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  };
}
