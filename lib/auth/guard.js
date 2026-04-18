import { getCurrentUser } from './session';
import { errorResponse } from '@/lib/http';

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: errorResponse('UNAUTHORIZED', '로그인이 필요합니다.', 401) };
  }
  return { user, response: null };
}
