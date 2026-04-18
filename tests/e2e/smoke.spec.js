import { test, expect } from '@playwright/test';

test('signup_login_todo_schedule_logout flow', async ({ page }) => {
  const email = `user+${Date.now()}@example.com`;
  const password = 'pw123456';

  await page.goto('/signup');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('이름').fill('홍길동');
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '회원가입' }).click();

  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto('/todos');
  await page.getByRole('button', { name: '새 업무' }).click();
  await page.getByLabel('제목').fill('기획서 작성');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByText('기획서 작성')).toBeVisible();

  await page.goto('/schedules');
  await page.getByRole('button', { name: '새 일정' }).click();
  await page.getByLabel('제목').fill('팀 미팅');
  await page.getByRole('button', { name: '저장' }).click();
  await expect(page.getByText('팀 미팅')).toBeVisible();

  await page.getByRole('button', { name: '로그아웃' }).click();
  await expect(page).toHaveURL(/\/login/);
});
