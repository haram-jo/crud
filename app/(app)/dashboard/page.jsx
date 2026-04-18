import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: '대시보드' };

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const [openTodos, todaysSchedules] = await Promise.all([
    prisma.todo.findMany({
      where: { userId: user.id, status: { not: 'DONE' } },
      orderBy: [{ dueDt: 'asc' }, { createdAt: 'desc' }],
      take: 5,
    }),
    prisma.schedule.findMany({
      where: {
        userId: user.id,
        startAt: { lt: endOfToday },
        endAt: { gte: startOfToday },
      },
      orderBy: [{ startAt: 'asc' }],
      take: 5,
    }),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>진행 중인 업무</CardTitle>
          <Link href="/todos" className="text-muted-foreground hover:text-primary text-sm">
            전체 보기
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {openTodos.length === 0 ? (
            <p className="text-muted-foreground text-sm">진행 중인 업무가 없습니다.</p>
          ) : (
            openTodos.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded border p-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.title}</div>
                  {t.dueDt ? (
                    <div className="text-muted-foreground text-xs">
                      마감 {new Date(t.dueDt).toLocaleDateString('ko-KR')}
                    </div>
                  ) : null}
                </div>
                <Badge variant="secondary">{t.status}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>오늘 일정</CardTitle>
          <Link href="/schedules" className="text-muted-foreground hover:text-primary text-sm">
            캘린더
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {todaysSchedules.length === 0 ? (
            <p className="text-muted-foreground text-sm">오늘 예정된 일정이 없습니다.</p>
          ) : (
            todaysSchedules.map((s) => (
              <div key={s.id} className="rounded border p-2">
                <div className="font-medium">{s.title}</div>
                <div className="text-muted-foreground text-xs">
                  {new Date(s.startAt).toLocaleString('ko-KR')} ~{' '}
                  {new Date(s.endAt).toLocaleString('ko-KR')}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
