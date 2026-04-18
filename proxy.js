import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { SESSION_COOKIE } from '@/lib/auth/session';

const PROTECTED_PREFIXES = ['/dashboard', '/todos', '/schedules'];
const PROTECTED_API_PREFIXES = ['/api/todos', '/api/schedules'];
const AUTH_PAGES = ['/login', '/signup'];

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
function isProtectedApi(pathname) {
  return PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? verifyToken(token) : null;
  const isAuthed = !!payload?.sub;

  if (isProtectedApi(pathname) && !isAuthed) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
      { status: 401 },
    );
  }

  if (isProtectedPath(pathname) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/todos/:path*',
    '/schedules/:path*',
    '/login',
    '/signup',
    '/api/todos/:path*',
    '/api/schedules/:path*',
  ],
};
