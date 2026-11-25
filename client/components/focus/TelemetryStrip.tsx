import { Activity, Award, Clock, Radio, RotateCcw } from "lucide-react";
import type { FocusSessionRecord } from "@/hooks/useFocusTelemetry";
import type { WaveBand } from "@/data/soundLibrary";

interface TelemetryStripProps {
  stats: {
    totalMinutes: number;
    totalSessions: number;
    streakDays: number;
    topBand: WaveBand | "—";
  };
  sessions: FocusSessionRecord[];
  onClearTelemetry: () => void;
}

export function TelemetryStrip({
  stats,
  sessions,
  onClearTelemetry,
}: TelemetryStripProps) {
  const cards = [
    {
      label: "Focused Time",
      value:
        stats.totalMinutes >= 60
          ? `${(stats.totalMinutes / 60).toFixed(1)} hrs`
          : `${stats.totalMinutes} min`,
      icon: Clock,
      accent: "text-[#43B0F8]",
    },
    {
      label: "Completed Blocks",
      value: String(stats.totalSessions),
      icon: Activity,
      accent: "text-[#D4E78A]",
    },
    {
      label: "Active Streak",
      value: `${stats.streakDays} ${stats.streakDays === 1 ? "day" : "days"}`,
      icon: Award,
      accent: "text-[#F5C26B]",
    },
    {
      label: "Dominant Band",
      value: stats.topBand,
      icon: Radio,
      accent: "text-[#7AC8FF]",
    },
  ];

  return (
    <div className="fw-card rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="fw-eyebrow mb-1">
            <Activity className="w-3.5 h-3.5" />
            Local Focus Telemetry
          </div>
          <h3 className="text-lg font-display font-bold text-[#EEF4FA]">
            Deterministic Session Log
          </h3>
          <p className="text-xs text-[#97A7C0] mt-1">
            100% client-side metrics. No tracking pixels, no account required.
          </p>
        </div>
        {sessions.length > 0 && (
          <button
            type="button"
            onClick={onClearTelemetry}
            className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-[#6B7E9E] hover:text-rose-400 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-white/[0.08] bg-[#070C1B] p-3.5"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7E9E]">
                  {card.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${card.accent}`} />
              </div>
              <div className="font-display text-xl font-bold text-[#EEF4FA]">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {sessions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#43B0F8]/20 bg-[#070C1B]/60 px-4 py-6 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-[#6B7E9E]">
            No Completed Blocks Yet
          </p>
          <p className="text-xs text-[#97A7C0] mt-1">
            Finish a timed sprint or hit "Log Block" after 1+ minute of playback to record telemetry.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {sessions.slice(0, 6).map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-[#0B1226] px-3 py-2 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium text-[#EEF4FA] truncate">{s.objective}</p>
                <p className="font-mono text-[10px] text-[#6B7E9E]">
                  {s.trackName} · {s.band}
                </p>
              </div>
              <span className="font-mono text-[#D4E78A] shrink-0">
                +{s.minutes}m
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
