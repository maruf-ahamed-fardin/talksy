const STORAGE_KEY = 'talksy.created-rooms.v2';
const LEGACY_STORAGE_KEY = 'talksy.created-rooms.v1';
const ACCESS_STORAGE_PREFIX = 'talksy.room-access.';
const PRIVATE_ROOM_SALT = 'talksy-private-room-lock';
const DEFAULT_ROOMS = [
  {
    roomId: 'demo-room',
    createdAt: 'system',
    visibility: 'public',
    passwordHash: '',
  },
];

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function hasSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function normalizeRoomId(roomId) {
  return roomId?.trim().replace(/\s+/g, '-').toLowerCase() || '';
}

export function isValidPrivateRoomPassword(password) {
  return /^\d{4}$/.test(`${password ?? ''}`.trim());
}

function hashPrivateRoomPassword(roomId, password) {
  const normalizedRoomId = normalizeRoomId(roomId);
  const normalizedPassword = `${password ?? ''}`.trim();
  const hashInput = `${normalizedRoomId}:${normalizedPassword}:${PRIVATE_ROOM_SALT}`;
  let hash = 2166136261;

  for (let index = 0; index < hashInput.length; index += 1) {
    hash ^= hashInput.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }

  return `lock-${(hash >>> 0).toString(36)}`;
}

function normalizeRoomEntry(entry) {
  if (typeof entry === 'string') {
    const roomId = normalizeRoomId(entry);

    if (!roomId) {
      return null;
    }

    return {
      roomId,
      createdAt: new Date().toISOString(),
      visibility: 'public',
      passwordHash: '',
    };
  }

  const roomId = normalizeRoomId(entry?.roomId);

  if (!roomId) {
    return null;
  }

  const visibility = entry?.visibility === 'private' ? 'private' : 'public';
  const passwordHash = visibility === 'private' ? `${entry?.passwordHash ?? ''}`.trim() : '';

  return {
    roomId,
    createdAt: entry?.createdAt ?? new Date().toISOString(),
    visibility,
    passwordHash,
  };
}

function readStoredRooms() {
  if (!hasStorage()) {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCreatedRooms() {
  const mergedRooms = [...DEFAULT_ROOMS];

  readStoredRooms().forEach((entry) => {
    const normalizedEntry = normalizeRoomEntry(entry);

    if (!normalizedEntry || mergedRooms.some((room) => room.roomId === normalizedEntry.roomId)) {
      return;
    }

    mergedRooms.push(normalizedEntry);
  });

  return mergedRooms;
}

function writeCreatedRooms(rooms) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

export function getRoom(roomId) {
  const normalizedRoomId = normalizeRoomId(roomId);

  if (!normalizedRoomId) {
    return null;
  }

  return readCreatedRooms().find((room) => room.roomId === normalizedRoomId) ?? null;
}

export function roomExists(roomId) {
  return Boolean(getRoom(roomId));
}

export function generateRoomId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `room-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`;

    if (!roomExists(candidate)) {
      return candidate;
    }
  }

  return `room-${Date.now().toString(36)}`;
}

export function createRoom(roomId, options = {}) {
  const normalizedRoomId = normalizeRoomId(roomId);

  if (!normalizedRoomId) {
    return null;
  }

  const existingRooms = readCreatedRooms();

  if (existingRooms.some((room) => room.roomId === normalizedRoomId)) {
    return null;
  }

  const visibility = options.visibility === 'private' ? 'private' : 'public';
  const password = `${options.password ?? ''}`.trim();

  if (visibility === 'private' && !isValidPrivateRoomPassword(password)) {
    return null;
  }

  const nextRoom = {
    roomId: normalizedRoomId,
    createdAt: new Date().toISOString(),
    visibility,
    passwordHash: visibility === 'private' ? hashPrivateRoomPassword(normalizedRoomId, password) : '',
  };

  writeCreatedRooms([...existingRooms, nextRoom]);
  return nextRoom;
}

export function buildRoomPath(roomId, options = {}) {
  const normalizedRoomId = normalizeRoomId(roomId);

  if (!normalizedRoomId) {
    return '/video/demo-room';
  }

  const visibility = options.visibility === 'private' ? 'private' : 'public';
  const passwordHash = visibility === 'private' ? `${options.passwordHash ?? ''}`.trim() : '';
  const params = new URLSearchParams();

  if (visibility === 'private' && passwordHash) {
    params.set('roomType', 'private');
    params.set('lock', passwordHash);
  }

  const query = params.toString();

  return `/video/${encodeURIComponent(normalizedRoomId)}${query ? `?${query}` : ''}`;
}

export function verifyPrivateRoomPassword(roomId, password, expectedHash) {
  if (!expectedHash || !isValidPrivateRoomPassword(password)) {
    return false;
  }

  return hashPrivateRoomPassword(roomId, password) === `${expectedHash}`.trim();
}

export function rememberRoomAccess(roomId, passwordHash) {
  const normalizedRoomId = normalizeRoomId(roomId);
  const normalizedHash = `${passwordHash ?? ''}`.trim();

  if (!hasSessionStorage() || !normalizedRoomId || !normalizedHash) {
    return;
  }

  window.sessionStorage.setItem(`${ACCESS_STORAGE_PREFIX}${normalizedRoomId}`, normalizedHash);
}

export function hasRoomAccess(roomId, passwordHash) {
  const normalizedRoomId = normalizeRoomId(roomId);
  const normalizedHash = `${passwordHash ?? ''}`.trim();

  if (!hasSessionStorage() || !normalizedRoomId || !normalizedHash) {
    return false;
  }

  return window.sessionStorage.getItem(`${ACCESS_STORAGE_PREFIX}${normalizedRoomId}`) === normalizedHash;
}
