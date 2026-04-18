'use client';

import { useEffect, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ScheduleFormDialog } from './schedule-form-dialog';

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isOnDay(schedule, day) {
  const start = new Date(schedule.startAt);
  const end = new Date(schedule.endAt);
  const d0 = new Date(day);
  d0.setHours(0, 0, 0, 0);
  const d1 = new Date(day);
  d1.setHours(23, 59, 59, 999);
  return start <= d1 && end >= d0;
}

export function SchedulesClient() {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selected, setSelected] = useState(() => new Date());
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  async function load() {
    setLoading(true);
    const from = new Date(month);
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
    const params = new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    const res = await fetch(`/api/schedules?${params.toString()}`);
    const body = await res.json();
    if (res.ok) setSchedules(body.data.schedules);
    else toast.error(body?.error?.message ?? '불러오기 실패');
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const daySchedules = useMemo(
    () => schedules.filter((s) => isOnDay(s, selected)),
    [schedules, selected],
  );

  const busyDays = useMemo(() => {
    const days = [];
    schedules.forEach((s) => {
      const start = new Date(s.startAt);
      const end = new Date(s.endAt);
      const d = new Date(start);
      d.setHours(0, 0, 0, 0);
      while (d <= end) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    });
    return days;
  }, [schedules]);

  async function remove(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      toast.success('삭제되었습니다.');
      load();
    } else {
      toast.error('삭제 실패');
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <div className="bg-card rounded border p-3">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(d) => d && setSelected(d)}
          month={month}
          onMonthChange={setMonth}
          modifiers={{ busy: busyDays }}
          modifiersClassNames={{ busy: 'font-bold underline' }}
          locale={undefined}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {selected.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </h2>
          <Button onClick={() => setCreating(true)}>새 일정</Button>
        </div>
        {loading ? (
          <p className="text-muted-foreground text-sm">불러오는 중...</p>
        ) : daySchedules.length === 0 ? (
          <p className="text-muted-foreground text-sm">일정이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {daySchedules.map((s) => (
              <li key={s.id} className="bg-card rounded border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.title}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(s.startAt).toLocaleString('ko-KR')} ~{' '}
                      {new Date(s.endAt).toLocaleString('ko-KR')}
                    </div>
                    {s.memo ? (
                      <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                        {s.memo}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setEditTarget(s)}>
                      수정
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(s.id)}>
                      삭제
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {creating ? (
        <ScheduleFormDialog
          open
          defaultDate={selected}
          onOpenChange={(o) => !o && setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      ) : null}
      {editTarget ? (
        <ScheduleFormDialog
          open
          schedule={editTarget}
          onOpenChange={(o) => !o && setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            load();
          }}
        />
      ) : null}
    </div>
  );
}

export { sameDay };
