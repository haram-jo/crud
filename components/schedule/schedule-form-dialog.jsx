'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function toLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(9, 0, 0, 0);
  return toLocalInput(d.toISOString());
}
function defaultEnd(date) {
  const d = date ? new Date(date) : new Date();
  d.setHours(10, 0, 0, 0);
  return toLocalInput(d.toISOString());
}

export function ScheduleFormDialog({ open, onOpenChange, schedule, defaultDate, onSaved }) {
  const isEdit = !!schedule;
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: schedule?.title ?? '',
      memo: schedule?.memo ?? '',
      startAt: schedule ? toLocalInput(schedule.startAt) : defaultStart(defaultDate),
      endAt: schedule ? toLocalInput(schedule.endAt) : defaultEnd(defaultDate),
    },
  });

  async function onSubmit(values) {
    if (!values.title?.trim()) {
      toast.error('제목을 입력하세요.');
      return;
    }
    const startAt = new Date(values.startAt);
    const endAt = new Date(values.endAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      toast.error('시작/종료 시간을 확인하세요.');
      return;
    }
    if (startAt > endAt) {
      toast.error('종료 시각은 시작 시각 이후여야 합니다.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        memo: values.memo || null,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
      };
      const res = await fetch(isEdit ? `/api/schedules/${schedule.id}` : '/api/schedules', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error?.message ?? '저장 실패');
        return;
      }
      toast.success(isEdit ? '수정되었습니다.' : '생성되었습니다.');
      onSaved?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? '일정 수정' : '새 일정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">제목</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="startAt">시작</Label>
              <Input
                id="startAt"
                type="datetime-local"
                {...register('startAt', { required: true })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endAt">종료</Label>
              <Input id="endAt" type="datetime-local" {...register('endAt', { required: true })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="memo">메모</Label>
            <Textarea id="memo" rows={3} {...register('memo')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
