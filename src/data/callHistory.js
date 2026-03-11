const STORAGE_KEY = 'talksy.call-history.v1';
const MAX_HISTORY_ITEMS = 30;

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function formatRoomTitle(roomId) {
  return roomId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function resolveSource(roomId) {
  if (roomId === 'demo-room') {
    return 'Demo room';
  }

  if (roomId === 'instant-room') {
    return 'Quick launch';
  }

  return 'Custom room';
}

function readCallHistory() {
  if (!hasStorage()) {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCallHistory(records) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getCallHistory() {
  return readCallHistory();
}

export function addCallHistoryEntry({
  roomId,
  participants = [],
  checklist = [],
  resolution = '1280 x 720',
}) {
  const normalizedRoomId = roomId?.trim() || 'instant-room';
  const timestamp = new Date().toISOString();
  const nextEntry = {
    id: `${normalizedRoomId}-${Date.now()}`,
    roomId: normalizedRoomId,
    title: formatRoomTitle(normalizedRoomId),
    source: resolveSource(normalizedRoomId),
    status: 'Ready to join',
    resolution,
    participants,
    participantCount: participants.length,
    checklist,
    createdAt: timestamp,
    note: 'Room opened in Talksy and stored locally for quick follow-up.',
  };
  const nextRecords = [nextEntry, ...readCallHistory()].slice(0, MAX_HISTORY_ITEMS);

  writeCallHistory(nextRecords);
  return nextEntry;
}

export function clearCallHistory() {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
