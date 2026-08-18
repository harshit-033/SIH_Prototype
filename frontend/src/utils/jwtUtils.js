/**
 * Utilities for decoding and inspecting JWT tokens on the frontend.
 * NOTE: Frontend decoding is for DISPLAY/INSPECTION ONLY. Backend Spring Security is authoritative.
 */

export function parseJwt(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return {
        header: { error: 'Invalid JWT structure (expected 3 parts)' },
        payload: { error: 'Invalid JWT structure' },
        isValid: false,
        isExpired: true,
        expiresAt: null,
        remainingSeconds: 0,
        remainingFormatted: 'INVALID'
      };
    }

    const decodeBase64Url = (str) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    };

    const header = decodeBase64Url(parts[0]);
    const payload = decodeBase64Url(parts[1]);

    const expTimestampMs = payload.exp ? payload.exp * 1000 : null;
    const nowMs = Date.now();
    const remainingSeconds = expTimestampMs ? Math.max(0, Math.floor((expTimestampMs - nowMs) / 1000)) : 0;
    const isExpired = expTimestampMs ? expTimestampMs <= nowMs : false;

    return {
      header,
      payload,
      isValid: true,
      isExpired,
      expiresAt: expTimestampMs ? new Date(expTimestampMs) : null,
      remainingSeconds,
      remainingFormatted: formatRemainingTime(remainingSeconds, isExpired)
    };
  } catch (err) {
    return {
      header: { error: 'Failed to decode header: ' + err.message },
      payload: { error: 'Failed to decode payload: ' + err.message },
      isValid: false,
      isExpired: true,
      expiresAt: null,
      remainingSeconds: 0,
      remainingFormatted: 'ERROR'
    };
  }
}

export function formatRemainingTime(totalSeconds, isExpired) {
  if (isExpired || totalSeconds <= 0) return 'EXPIRED';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
