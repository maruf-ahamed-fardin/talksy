const STORAGE_KEY = 'talksy.created-rooms.v1';
const DEFAULT_ROOMS = ['demo-room'];

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function normalizeRoomId(roomId) {
  return roomId?.trim().replace(/\s+/g, '-').toLowerCase() || '';
}

function readCreatedRooms() {
  const defaultRooms = DEFAULT_ROOMS.map((roomId) => ({
    roomId,
    createdAt: 'system',
  }));

  if (!hasStorage()) {
    return defaultRooms;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultRooms;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return defaultRooms;
    }

    const merged = [...defaultRooms];

    parsed.forEach((entry) => {
      const roomId = normalizeRoomId(entry?.roomId);

      if (!roomId || merged.some((room) => room.roomId === roomId)) {
        return;
      }

      merged.push({
        roomId,
        createdAt: entry?.createdAt ?? new Date().toISOString(),
      });
    });

    return merged;
  } catch {
    return defaultRooms;
  }
}

function writeCreatedRooms(rooms) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

export function roomExists(roomId) {
  const normalizedRoomId = normalizeRoomId(roomId);

  if (!normalizedRoomId) {
    return false;
  }

  return readCreatedRooms().some((room) => room.roomId === normalizedRoomId);
}

export function createRoom(roomId) {
  const normalizedRoomId = normalizeRoomId(roomId);

  if (!normalizedRoomId) {
    return null;
  }

  const existingRooms = readCreatedRooms();

  if (existingRooms.some((room) => room.roomId === normalizedRoomId)) {
    return null;
  }

  const nextRoom = {
    roomId: normalizedRoomId,
    createdAt: new Date().toISOString(),
  };

  writeCreatedRooms([...existingRooms, nextRoom]);
  return nextRoom;
}
