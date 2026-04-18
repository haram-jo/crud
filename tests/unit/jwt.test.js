import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '@/lib/auth/jwt';

describe('jwt utils', () => {
  it('signToken_thenVerify_returnsPayload', () => {
    const token = signToken({ sub: 'user-1', email: 'a@b.c' });
    const payload = verifyToken(token);
    expect(payload?.sub).toBe('user-1');
    expect(payload?.email).toBe('a@b.c');
  });

  it('verifyToken_withGarbage_returnsNull', () => {
    expect(verifyToken('not-a-jwt')).toBeNull();
  });

  it('verifyToken_withExpired_returnsNull', () => {
    const token = signToken({ sub: 'u' }, { expiresIn: -1 });
    expect(verifyToken(token)).toBeNull();
  });
});
