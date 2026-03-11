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
      'Talksy has three plan directions. Starter is free for personal calls and casual small-group rooms. Team is $24 per month for structured collaboration, meeting notes, action prompts, priority branding, and advanced layouts. Scale is $79 per month for higher-volume teams, onboarding, reporting, and custom support workflows.',
    actions: [
      { label: 'Review pricing', to: '/pricing' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  },
  {
    id: 'rooms',
    title: 'Rooms and joining',
    keywords: ['room', 'join', 'link', 'code', 'invite', 'meeting', 'demo', 'call', 'launch'],
    phrases: ['start a room', 'join room', 'share a link', 'demo room', 'room code'],
    answer:
      'Talksy is designed for fast room setup. You can launch a room, share the room code or link, and let participants join without heavy setup. The product positioning across the site emphasizes quick room codes, one-click joins, and a lightweight meeting flow.',
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
      'The current Talksy experience is framed around low-friction joining. The homepage copy says there is no sign up required, and the onboarding flow focuses on sharing one link and launching rooms quickly.',
    actions: [
      { label: 'Get started', to: '/get-started' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  },
  {
    id: 'features',
    title: 'Product features',
    keywords: ['feature', 'features', 'notes', 'actions', 'follow-up', 'share', 'screen', 'mobile', 'responsive', 'layout', 'audio', 'video'],
    phrases: ['what features', 'screen share', 'meeting notes', 'action items', 'mobile support'],
    answer:
      'Talksy focuses on crystal-clear rooms, smart meeting follow-up, and shared collaboration tools. The feature pages also mention meeting notes, action-item prompts, responsive layouts, quick joins, and collaboration support that keeps calls simple and polished.',
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
      'The resources section is built around practical guidance: concise weekly syncs, meeting agenda starters, remote collaboration playbooks, and room launch checklists for first-time hosts.',
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
      'A good first path is: choose the room style that fits your call rhythm, invite people with one link, launch your first meeting, and capture action items immediately. The site also recommends starting with a demo room, reviewing features, then choosing a plan when your workflow is clearer.',
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
      'If someone needs more direction, Talksy points them toward a walkthrough, a demo room, or the pricing and feature pages depending on where they are in the decision process. For custom workflows, the solutions and pricing paths are the best next step.',
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
      body: 'You are welcome. If you want, ask another question or jump to pricing, features, or a demo room.',
      actions: [
        { label: 'Open demo room', to: '/video/demo-room' },
        { label: 'Go to features', to: '/features' },
      ],
    };
  }

  if (hasGreeting(message)) {
    return {
      body: 'Hi. I am the Talksy support assistant. I can help viewers with pricing, room setup, features, onboarding, resources, and use cases.',
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
      'I can answer viewer questions about Talksy pricing, joining rooms, no-sign-up access, features, onboarding, resources, and supported use cases. Ask in a more specific way and I will point you to the right answer.',
    actions: [
      { label: 'See solutions', to: '/solutions' },
      { label: 'Open demo room', to: '/video/demo-room' },
    ],
  };
}
