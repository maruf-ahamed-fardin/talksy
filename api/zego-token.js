import { createZegoKitToken, normalizeRoomId, readZegoServerConfig } from './_lib/zegoToken.js';

function readRequestBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return req.body;
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { appId, configError, serverSecret, isConfigured } = readZegoServerConfig();

  if (!isConfigured) {
    return res.status(500).json({
      error: configError || 'ZEGO credentials are missing on the server. Add ZEGO_APP_ID and ZEGO_SERVER_SECRET, then redeploy.',
    });
  }

  const body = readRequestBody(req);

  if (!body) {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const roomId = normalizeRoomId(body.roomId);
  const userId = `${body.userId ?? ''}`.trim();
  const userName = `${body.userName ?? ''}`.trim();

  if (!userId || !userName) {
    return res.status(400).json({ error: 'roomId, userId, and userName are required.' });
  }

  try {
    const kitToken = createZegoKitToken({
      appId,
      roomId,
      serverSecret,
      userId,
      userName,
    });

    return res.status(200).json({ kitToken });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unable to prepare the ZEGO room token.',
    });
  }
}
