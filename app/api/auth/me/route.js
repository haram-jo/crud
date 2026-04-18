import { getCurrentUser } from '@/lib/auth/session';
import { errorResponse, successResponse } from '@/lib/http';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse('UNAUTHORIZED', '로그인이 필요합니다.', 401);
  return successResponse({ user });
}
