import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';
import { signupSchema } from '@/lib/validation/auth';
import { errorResponse, parseJson, successResponse, validationError } from '@/lib/http';

export async function POST(request) {
  const body = await parseJson(request);
  if (!body) return errorResponse('INVALID_JSON', '요청 본문이 올바르지 않습니다.', 400);

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const { email, name, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return errorResponse('EMAIL_ALREADY_EXISTS', '이미 사용 중인 이메일입니다.', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email: normalizedEmail, name, passwordHash },
    select: { id: true, email: true, name: true },
  });

  await setSessionCookie(user);
  return successResponse({ user }, 201);
}
