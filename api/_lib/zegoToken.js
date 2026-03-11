import { createCipheriv, randomBytes } from 'node:crypto';

function resolveAesAlgorithm(serverSecret) {
  const secretLength = Buffer.byteLength(serverSecret, 'utf8');

  if (secretLength === 16) {
    return 'aes-128-cbc';
  }

  if (secretLength === 24) {
    return 'aes-192-cbc';
  }

  if (secretLength === 32) {
    return 'aes-256-cbc';
  }

  throw new Error('ZEGO_SERVER_SECRET must be 16, 24, or 32 characters long.');
}

function createNonce() {
  return Math.floor(Math.random() * 2147483647);
}

function createIvString() {
  return randomBytes(12).toString('hex').slice(0, 16);
}

export function normalizeRoomId(value) {
  return value?.trim().replace(/\s+/g, '-').toLowerCase() || 'instant-room';
}

export function readZegoServerConfig() {
  const appId = Number.parseInt(process.env.ZEGO_APP_ID ?? process.env.VITE_ZEGO_APP_ID ?? '', 10);
  const serverSecret = (process.env.ZEGO_SERVER_SECRET ?? process.env.VITE_ZEGO_SERVER_SECRET ?? '').trim();

  return {
    appId,
    serverSecret,
    isConfigured: appId > 0 && serverSecret.length > 0,
  };
}

export function createZegoKitToken({
  appId,
  roomId,
  serverSecret,
  userId,
  userName,
  expiresInSeconds = 7200,
}) {
  const normalizedUserId = `${userId}`.trim();
  const normalizedUserName = `${userName}`.trim();

  if (!appId || typeof appId !== 'number') {
    throw new Error('A valid ZEGO app ID is required.');
  }

  if (!serverSecret) {
    throw new Error('ZEGO server secret is required.');
  }

  if (!normalizedUserId) {
    throw new Error('A valid user ID is required.');
  }

  if (!normalizedUserName) {
    throw new Error('A valid user name is required.');
  }

  const now = Math.floor(Date.now() / 1000);
  const expireAt = now + expiresInSeconds;
  const payload = {
    app_id: appId,
    user_id: normalizedUserId,
    nonce: createNonce(),
    ctime: now,
    expire: expireAt,
  };
  const iv = createIvString();
  const cipher = createCipheriv(
    resolveAesAlgorithm(serverSecret),
    Buffer.from(serverSecret, 'utf8'),
    Buffer.from(iv, 'utf8'),
  );
  const encryptedPayload = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);
  const header = Buffer.alloc(28);

  header.writeUInt32BE(expireAt >>> 0, 4);
  header.writeUInt16BE(Buffer.byteLength(iv, 'utf8'), 8);
  header.write(iv, 10, 'utf8');
  header.writeUInt16BE(encryptedPayload.length, 26);

  const metadata = Buffer.from(
    JSON.stringify({
      userID: normalizedUserId,
      roomID: normalizeRoomId(roomId),
      userName: encodeURIComponent(normalizedUserName),
      appID: appId,
    }),
    'utf8',
  ).toString('base64');

  return `04${Buffer.concat([header, encryptedPayload]).toString('base64')}#${metadata}`;
}
