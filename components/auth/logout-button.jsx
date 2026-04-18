'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      toast.success('로그아웃되었습니다.');
      router.replace('/login');
      router.refresh();
    } else {
      toast.error('로그아웃 실패');
    }
  }
  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      로그아웃
    </Button>
  );
}
