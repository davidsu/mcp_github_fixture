import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskRow({ task, onToggle }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(task)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F1F5F9] min-h-[48px]"
      >
        <span
          className={cn(
            "flex h-[22px] w-[22px] sm:h-[18px] sm:w-[18px] shrink-0 items-center justify-center rounded-[4px] border",
            task.done ? "border-[#10B981] bg-[#10B981]" : "border-[#CBD5E1] bg-white"
          )}
        >
          {task.done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </span>
        <span className={cn("font-body text-[14px]", task.done ? "text-[#64748B] line-through" : "text-[#09090B]")}>
          {task.title}
        </span>
      </button>
    </li>
  );
}