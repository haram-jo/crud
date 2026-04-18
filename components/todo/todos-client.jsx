'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TodoFormDialog } from './todo-form-dialog';

const STATUSES = ['TODO', 'DOING', 'DONE'];
const STATUS_LABEL = { TODO: '할 일', DOING: '진행 중', DONE: '완료' };
const PRIORITY_LABEL = { LOW: '낮음', MEDIUM: '보통', HIGH: '높음' };

export function TodosClient() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [priority, setPriority] = useState('ALL');
  const [q, setQ] = useState('');
  const [editTarget, setEditTarget] = useState(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== 'ALL') params.set('status', status);
    if (priority !== 'ALL') params.set('priority', priority);
    if (q.trim()) params.set('q', q.trim());
    const res = await fetch(`/api/todos?${params.toString()}`);
    const body = await res.json();
    if (res.ok) setTodos(body.data.todos);
    else toast.error(body?.error?.message ?? '불러오기 실패');
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority]);

  async function updateStatus(id, nextStatus) {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (res.ok) load();
    else toast.error('상태 변경 실패');
  }

  async function remove(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      toast.success('삭제되었습니다.');
      load();
    } else {
      toast.error('삭제 실패');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            <TabsTrigger value="ALL">전체</TabsTrigger>
            {STATUSES.map((s) => (
              <TabsTrigger key={s} value={s}>
                {STATUS_LABEL[s]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="우선순위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 우선순위</SelectItem>
            <SelectItem value="HIGH">높음</SelectItem>
            <SelectItem value="MEDIUM">보통</SelectItem>
            <SelectItem value="LOW">낮음</SelectItem>
          </SelectContent>
        </Select>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <Input
            placeholder="검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-[180px]"
          />
          <Button type="submit" variant="secondary">
            검색
          </Button>
        </form>
        <div className="ml-auto">
          <Button onClick={() => setCreating(true)}>새 업무</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      ) : todos.length === 0 ? (
        <p className="text-muted-foreground text-sm">업무가 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((t) => (
            <li key={t.id} className="bg-card rounded border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{t.title}</span>
                    <Badge variant="outline">{PRIORITY_LABEL[t.priority]}</Badge>
                    <Badge>{STATUS_LABEL[t.status]}</Badge>
                  </div>
                  {t.memo ? (
                    <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                      {t.memo}
                    </p>
                  ) : null}
                  {t.dueDt ? (
                    <p className="text-muted-foreground mt-1 text-xs">
                      마감 {new Date(t.dueDt).toLocaleDateString('ko-KR')}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v)}>
                    <SelectTrigger className="h-8 w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => setEditTarget(t)}>
                    수정
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => remove(t.id)}>
                    삭제
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <TodoFormDialog
          open
          onOpenChange={(o) => !o && setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      ) : null}
      {editTarget ? (
        <TodoFormDialog
          open
          todo={editTarget}
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
