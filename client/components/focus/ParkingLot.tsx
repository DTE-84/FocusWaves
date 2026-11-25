import { useState, type FormEvent } from "react";
import { Check, Plus, StickyNote, Trash2 } from "lucide-react";
import type { ParkingLotItem } from "@/hooks/useFocusTelemetry";

interface ParkingLotProps {
  items: ParkingLotItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClearCompleted: () => void;
}

export function ParkingLot({
  items,
  onAdd,
  onToggle,
  onRemove,
  onClearCompleted,
}: ParkingLotProps) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAdd(draft);
    setDraft("");
  };

  const completedCount = items.filter((i) => i.done).length;

  return (
    <div className="fw-card rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="fw-eyebrow mb-1">
            <StickyNote className="w-3.5 h-3.5" />
            Brain-Dump Parking Lot
          </div>
          <h3 className="text-lg font-display font-bold text-[#EEF4FA]">
            Capture Stray Thoughts Without Breaking Flow
          </h3>
          <p className="text-xs text-[#97A7C0] mt-1">
            Park sudden distractions in two seconds and return to your active objective. Stored locally.
          </p>
        </div>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={onClearCompleted}
            className="text-[11px] font-mono uppercase tracking-wider text-[#97A7C0] hover:text-[#D4E78A] transition whitespace-nowrap"
          >
            Clear Done ({completedCount})
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Dump a thought and press Enter..."
          className="flex-1 rounded-xl border border-[#43B0F8]/20 bg-[#070C1B] px-3.5 py-2.5 text-sm text-[#EEF4FA] placeholder:text-[#6B7E9E] focus:border-[#43B0F8]/60 focus:outline-none focus:ring-1 focus:ring-[#43B0F8]/40 transition"
        />
        <button
          type="submit"
          aria-label="Park thought"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#43B0F8] px-4 py-2.5 text-xs font-display font-bold text-[#070B18] hover:bg-[#6EC5FF] transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          Park
        </button>
      </form>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#43B0F8]/20 bg-[#070C1B]/60 px-4 py-8 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-[#6B7E9E]">
            Parking Lot Clear
          </p>
          <p className="text-xs text-[#97A7C0] mt-1.5 max-w-xs">
            When an urge to check email, texts, or a side idea hits mid-session, type it above instead of switching tabs.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0B1226] px-3.5 py-2.5 transition hover:border-[#43B0F8]/30"
            >
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="flex items-center gap-3 text-left flex-1 min-w-0"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                    item.done
                      ? "border-[#D4E78A] bg-[#D4E78A]/20 text-[#D4E78A]"
                      : "border-white/20 text-transparent group-hover:border-[#43B0F8]/60"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span
                  className={`text-sm truncate ${
                    item.done ? "line-through text-[#6B7E9E]" : "text-[#EEF4FA]"
                  }`}
                >
                  {item.text}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Remove item"
                className="text-[#6B7E9E] hover:text-rose-400 transition p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
