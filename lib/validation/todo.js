import { z } from 'zod';

export const TodoStatus = z.enum(['TODO', 'DOING', 'DONE']);
export const TodoPriority = z.enum(['LOW', 'MEDIUM', 'HIGH']);

const isoDateTime = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .nullable()
  .optional();

export const createTodoSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요.').max(200),
  memo: z.string().max(2000).nullish(),
  dueDt: isoDateTime,
  priority: TodoPriority.default('MEDIUM'),
  status: TodoStatus.default('TODO'),
});

export const updateTodoSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    memo: z.string().max(2000).nullish(),
    dueDt: isoDateTime,
    priority: TodoPriority.optional(),
    status: TodoStatus.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: '수정할 값이 없습니다.' });

export const todoListQuerySchema = z.object({
  status: TodoStatus.optional(),
  priority: TodoPriority.optional(),
  q: z.string().max(100).optional(),
});
