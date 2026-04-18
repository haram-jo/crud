import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password utils', () => {
  it('hashPassword_returnsHash_verifiable', async () => {
    const hash = await hashPassword('my-secret-pass');
    expect(hash).toBeTypeOf('string');
    expect(hash).not.toBe('my-secret-pass');
    expect(await verifyPassword('my-secret-pass', hash)).toBe(true);
  });

  it('verifyPassword_withWrongPassword_returnsFalse', async () => {
    const hash = await hashPassword('correct');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('verifyPassword_withEmptyInput_returnsFalse', async () => {
    expect(await verifyPassword('', 'x')).toBe(false);
    expect(await verifyPassword('x', '')).toBe(false);
  });
});
