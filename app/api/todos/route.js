import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guard';
import { createTodoSchema, todoListQuerySchema } from '@/lib/validation/todo';
import { errorResponse, parseJson, successResponse, validationError } from '@/lib/http';

export async function GET(request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const parsed = todoListQuerySchema.safeParse({
    status: searchParams.get('status') ?? undefined,
    priority: searchParams.get('priority') ?? undefined,
    q: searchParams.get('q') ?? undefined,
  });
  if (!parsed.success) return validationError(parsed.error);

  const { status, priority, q } = parsed.data;
  const todos = await prisma.todo.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { memo: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  return successResponse({ todos });
}

export async function POST(request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await parseJson(request);
  if (!body) return errorResponse('INVALID_JSON', '요청 본문이 올바르지 않습니다.', 400);

  const parsed = createTodoSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { title, memo, dueDt, priority, status } = parsed.data;
  const todo = await prisma.todo.create({
    data: {
      userId: user.id,
      title,
      memo: memo ?? null,
      dueDt: dueDt ? new Date(dueDt) : null,
      priority,
      status,
    },
  });

  return successResponse({ todo }, 201);
}
