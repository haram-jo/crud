import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRES_IN = '7d';

function getSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_JWT_SECRET is missing or too short (>=16 chars required).');
  }
  return secret;
}

export function signToken(payload, options = {}) {
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: options.expiresIn ?? DEFAULT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret(), { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}
