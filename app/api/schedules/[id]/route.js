import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guard';
import { updateScheduleSchema } from '@/lib/validation/schedule';
import { errorResponse, parseJson, successResponse, validationError } from '@/lib/http';

async function getOwnedSchedule(userId, id) {
  const schedule = await prisma.schedule.findUnique({ where: { id } });
  if (!schedule || schedule.userId !== userId) return null;
  return schedule;
}

export async function GET(_request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const schedule = await getOwnedSchedule(user.id, id);
  if (!schedule) return errorResponse('SCHEDULE_NOT_FOUND', '일정을 찾을 수 없습니다.', 404);
  return successResponse({ schedule });
}

export async function PATCH(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  const body = await parseJson(request);
  if (!body) return errorResponse('INVALID_JSON', '요청 본문이 올바르지 않습니다.', 400);

  const parsed = updateScheduleSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await getOwnedSchedule(user.id, id);
  if (!existing) return errorResponse('SCHEDULE_NOT_FOUND', '일정을 찾을 수 없습니다.', 404);

  const data = { ...parsed.data };
  if (data.startAt) data.startAt = new Date(data.startAt);
  if (data.endAt) data.endAt = new Date(data.endAt);

  const schedule = await prisma.schedule.update({ where: { id }, data });
  return successResponse({ schedule });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  const existing = await getOwnedSchedule(user.id, id);
  if (!existing) return errorResponse('SCHEDULE_NOT_FOUND', '일정을 찾을 수 없습니다.', 404);

  await prisma.schedule.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
