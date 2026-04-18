import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/guard';
import { updateTodoSchema } from '@/lib/validation/todo';
import { errorResponse, parseJson, successResponse, validationError } from '@/lib/http';

async function getOwnedTodo(userId, id) {
  const todo = await prisma.todo.findUnique({ where: { id } });
  if (!todo || todo.userId !== userId) return null;
  return todo;
}

export async function GET(_request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;
  const todo = await getOwnedTodo(user.id, id);
  if (!todo) return errorResponse('TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.', 404);
  return successResponse({ todo });
}

export async function PATCH(request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  const body = await parseJson(request);
  if (!body) return errorResponse('INVALID_JSON', '요청 본문이 올바르지 않습니다.', 400);

  const parsed = updateTodoSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const existing = await getOwnedTodo(user.id, id);
  if (!existing) return errorResponse('TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.', 404);

  const data = { ...parsed.data };
  if ('dueDt' in data) data.dueDt = data.dueDt ? new Date(data.dueDt) : null;

  const todo = await prisma.todo.update({ where: { id }, data });
  return successResponse({ todo });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await requireUser();
  if (response) return response;
  const { id } = await params;

  const existing = await getOwnedTodo(user.id, id);
  if (!existing) return errorResponse('TODO_NOT_FOUND', '할 일을 찾을 수 없습니다.', 404);

  await prisma.todo.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
