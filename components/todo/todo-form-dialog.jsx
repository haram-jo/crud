'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function toDateInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function TodoFormDialog({ open, onOpenChange, todo, onSaved }) {
  const isEdit = !!todo;
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      title: todo?.title ?? '',
      memo: todo?.memo ?? '',
      dueDt: toDateInput(todo?.dueDt),
      priority: todo?.priority ?? 'MEDIUM',
      status: todo?.status ?? 'TODO',
    },
  });

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        memo: values.memo || null,
        dueDt: values.dueDt ? new Date(`${values.dueDt}T00:00:00`).toISOString() : null,
        priority: values.priority,
        status: values.status,
      };
      const res = await fetch(isEdit ? `/api/todos/${todo.id}` : '/api/todos', {
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
          <DialogTitle>{isEdit ? '업무 수정' : '새 업무'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">제목</Label>
            <Input id="title" {...register('title', { required: true })} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="memo">메모</Label>
            <Textarea id="memo" rows={3} {...register('memo')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="dueDt">마감일</Label>
              <Input id="dueDt" type="date" {...register('dueDt')} />
            </div>
            <div className="space-y-1">
              <Label>우선순위</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">높음</SelectItem>
                      <SelectItem value="MEDIUM">보통</SelectItem>
                      <SelectItem value="LOW">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label>상태</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">할 일</SelectItem>
                    <SelectItem value="DOING">진행 중</SelectItem>
                    <SelectItem value="DONE">완료</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
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
