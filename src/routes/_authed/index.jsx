import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TaskRow from "@/components/TaskRow";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "mcp_github_fixture" }] }),
  component: TasksPage,
});

function TasksPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const tasksQ = useQuery({
    queryKey: ["tasks"],
    queryFn: () => base44.entities.Task.filter({}, { sort: "-created_date", limit: 50 }),
  });
  const countsQ = useQuery({
    queryKey: ["tasks", "counts"],
    queryFn: async () => {
      const [done, remaining] = await Promise.all([
        base44.entities.Task.count({ done: true }),
        base44.entities.Task.count({ done: { $ne: true } }),
      ]);
      return { total: done + remaining, remaining };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["tasks"] });
  const addM = useMutation({
    mutationFn: (t) => base44.entities.Task.create({ title: t, done: false }),
    onSuccess: () => { setTitle(""); refresh(); },
  });
  const toggleM = useMutation({
    mutationFn: (task) => base44.entities.Task.update(task.id, { done: !task.done }),
    onSuccess: refresh,
  });

  const tasks = tasksQ.data?.items ?? [];
  const add = (e) => {
    e.preventDefault();
    if (title.trim()) addM.mutate(title.trim());
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] px-4 py-6 sm:py-16">
      <div className="mx-auto max-w-[560px] rounded-[6px] border border-[#E5E7EB] bg-white">
        <header className="flex items-center justify-between gap-3 px-4 py-4">
          <h1 className="font-display text-[20px] leading-[1.2] font-bold text-[#09090B] truncate">mcp_github_fixture</h1>
          <span className="font-display text-[11px] rounded-full border border-[#E5E7EB] px-2 py-0.5 text-[#64748B]">{countsQ.data?.total ?? 0} tasks</span>
        </header>
        <form onSubmit={add} className="flex gap-2 px-4 pb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a new task..."
            className="font-display min-w-0 flex-1 rounded-[6px] border border-[#E5E7EB] px-3 h-11 text-[16px] sm:text-[14px] text-[#09090B] placeholder:text-[#64748B] outline-none focus:border-[#0F172A]"
          />
          <button type="submit" disabled={!title.trim() || addM.isPending} className="font-display h-11 rounded-[6px] bg-[#0F172A] px-4 text-[14px] text-white disabled:opacity-50">
            {addM.isPending ? "Adding…" : "Add ↵"}
          </button>
        </form>
        <ul className="divide-y divide-[#E5E7EB] border-t border-[#E5E7EB]">
          {tasksQ.isLoading && <li className="px-4 py-8 text-center font-display text-[14px] text-[#64748B]">Loading…</li>}
          {!tasksQ.isLoading && tasks.length === 0 && <li className="px-4 py-8 text-center font-display text-[14px] text-[#64748B]">No tasks yet.</li>}
          {tasks.map((t) => <TaskRow key={t.id} task={t} onToggle={(task) => toggleM.mutate(task)} />)}
        </ul>
        <footer className="border-t border-[#E5E7EB] px-4 py-3 font-display text-[12px] text-[#64748B]">{countsQ.data?.remaining ?? 0} remaining</footer>
      </div>
    </main>
  );
}