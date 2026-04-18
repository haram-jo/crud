import '@testing-library/jest-dom/vitest';

process.env.AUTH_JWT_SECRET =
  process.env.AUTH_JWT_SECRET ?? 'test-secret-value-at-least-16-chars-long';
