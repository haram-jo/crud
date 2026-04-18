import { z } from 'zod';

const isoDateTime = z.string().datetime({ offset: true }).or(z.string().datetime());

export const createScheduleSchema = z
  .object({
    title: z.string().min(1, '제목을 입력하세요.').max(200),
    memo: z.string().max(2000).nullish(),
    startAt: isoDateTime,
    endAt: isoDateTime,
  })
  .refine((v) => new Date(v.startAt) <= new Date(v.endAt), {
    message: '종료 시각은 시작 시각 이후여야 합니다.',
    path: ['endAt'],
  });

export const updateScheduleSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    memo: z.string().max(2000).nullish(),
    startAt: isoDateTime.optional(),
    endAt: isoDateTime.optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: '수정할 값이 없습니다.' })
  .refine((v) => !(v.startAt && v.endAt) || new Date(v.startAt) <= new Date(v.endAt), {
    message: '종료 시각은 시작 시각 이후여야 합니다.',
    path: ['endAt'],
  });

export const scheduleListQuerySchema = z.object({
  from: isoDateTime.optional(),
  to: isoDateTime.optional(),
});
