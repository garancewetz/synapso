import crypto, { timingSafeEqual } from 'crypto';

export const AUTH_COOKIE_NAME = 'synapso_auth';
export const IMPERSONATE_COOKIE_NAME = 'synapso_impersonate';

function getSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (secret) return secret;
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    throw new Error('COOKIE_SECRET environment variable is required in production');
  }
  return 'dev-only-secret-not-for-production';
}

const SECRET = getSecret();

export function signValue(value: string): string {
  const hmac = crypto
    .createHmac('sha256', SECRET)
    .update(value)
    .digest('hex');
  return `${value}.${hmac}`;
}

export function verifySignedValue(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;

  const [value, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(value)
    .digest('hex');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (timingSafeEqual(sigBuffer, expectedBuffer)) return value;
  return null;
}

export function readUserIdFromCookieValue(rawValue: string | undefined): number | null {
  if (!rawValue) return null;
  const verified = verifySignedValue(rawValue);
  if (!verified) return null;
  const parsed = parseInt(verified, 10);
  return isNaN(parsed) ? null : parsed;
}

export const authUserSelect = {
  id: true,
  name: true,
  role: true,
  resetFrequency: true,
  dominantHand: true,
  hasJournal: true,
  createdAt: true,
} as const;
