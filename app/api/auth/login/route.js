import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';
import { loginSchema } from '@/lib/validation/auth';
import { errorResponse, parseJson, successResponse, validationError } from '@/lib/http';

export async function POST(request) {
  const body = await parseJson(request);
  if (!body) return errorResponse('INVALID_JSON', '요청 본문이 올바르지 않습니다.', 400);

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return errorResponse('INVALID_CREDENTIALS', '이메일 또는 비밀번호가 올바르지 않습니다.', 401);
  }

  await setSessionCookie(user);
  return successResponse({
    user: { id: user.id, email: user.email, name: user.name },
  });
}
