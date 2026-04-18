import { TodosClient } from '@/components/todo/todos-client';

export const metadata = { title: '업무 관리' };

export default function TodosPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">업무 관리</h1>
      <TodosClient />
    </div>
  );
}
