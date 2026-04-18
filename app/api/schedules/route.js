import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guard';
import { createScheduleSchema, scheduleListQuerySchema } from '@/lib/validation/schedule';
import { errorResponse, parseJson, successResponse, validationError } from '@/lib/http';

export async function GET(request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const parsed = scheduleListQuerySchema.safeParse({
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  });
  if (!parsed.success) return validationError(parsed.error);
  const { from, to } = parsed.data;

  const where = { userId: user.id };
  if (from || to) {
    where.AND = [];
    if (to) where.AND.push({ startAt: { lte: new Date(to) } });
    if (from) where.AND.push({ endAt: { gte: new Date(from) } });
  }

  const schedules = await prisma.schedule.findMany({
    where,
    orderBy: [{ startAt: 'asc' }],
  });

  return successResponse({ schedules });
}

export async function POST(request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await parseJson(request);
  if (!body) return errorResponse('INVALID_JSON', '요청 본문이 올바르지 않습니다.', 400);

  const parsed = createScheduleSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { title, memo, startAt, endAt } = parsed.data;
  const schedule = await prisma.schedule.create({
    data: {
      userId: user.id,
      title,
      memo: memo ?? null,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
    },
  });

  return successResponse({ schedule }, 201);
}
