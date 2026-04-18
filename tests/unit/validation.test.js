import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema } from '@/lib/validation/auth';
import { createTodoSchema, updateTodoSchema } from '@/lib/validation/todo';
import { createScheduleSchema } from '@/lib/validation/schedule';

describe('auth schemas', () => {
  it('signupSchema_validInput_parses', () => {
    expect(
      signupSchema.safeParse({ email: 'a@example.com', name: '홍길동', password: 'pw123456' })
        .success,
    ).toBe(true);
  });
  it('signupSchema_shortPassword_fails', () => {
    expect(signupSchema.safeParse({ email: 'a@b.c', name: 'x', password: '123' }).success).toBe(
      false,
    );
  });
  it('loginSchema_missingFields_fails', () => {
    expect(loginSchema.safeParse({ email: 'x', password: '' }).success).toBe(false);
  });
});

describe('todo schemas', () => {
  it('createTodoSchema_defaults_applied', () => {
    const r = createTodoSchema.parse({ title: 'work' });
    expect(r.priority).toBe('MEDIUM');
    expect(r.status).toBe('TODO');
  });
  it('updateTodoSchema_emptyObject_fails', () => {
    expect(updateTodoSchema.safeParse({}).success).toBe(false);
  });
});

describe('schedule schemas', () => {
  it('createScheduleSchema_endBeforeStart_fails', () => {
    const r = createScheduleSchema.safeParse({
      title: 'x',
      startAt: '2026-01-02T00:00:00.000Z',
      endAt: '2026-01-01T00:00:00.000Z',
    });
    expect(r.success).toBe(false);
  });
  it('createScheduleSchema_valid_parses', () => {
    const r = createScheduleSchema.safeParse({
      title: 'x',
      startAt: '2026-01-01T00:00:00.000Z',
      endAt: '2026-01-01T01:00:00.000Z',
    });
    expect(r.success).toBe(true);
  });
});
