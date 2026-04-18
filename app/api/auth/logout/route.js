import { clearSessionCookie } from '@/lib/auth/session';
import { successResponse } from '@/lib/http';

export async function POST() {
  await clearSessionCookie();
  return successResponse({ loggedOut: true });
}
