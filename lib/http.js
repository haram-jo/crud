import { NextResponse } from 'next/server';

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(code, message, status = 400, details) {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return NextResponse.json(body, { status });
}

export function validationError(zodError) {
  const details = zodError.issues.map((i) => ({
    path: i.path.join('.'),
    message: i.message,
  }));
  return errorResponse('VALIDATION_ERROR', '입력값이 올바르지 않습니다.', 400, details);
}

export async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
