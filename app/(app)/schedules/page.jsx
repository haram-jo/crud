import { SchedulesClient } from '@/components/schedule/schedules-client';

export const metadata = { title: '일정 관리' };

export default function SchedulesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">일정 관리</h1>
      <SchedulesClient />
    </div>
  );
}
