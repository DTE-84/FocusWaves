import type { RefObject } from "react";
import {
  CheckCircle2,
  Clock,
  Headphones,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Speaker,
  Target,
  Volume2,
  Waves,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { EntrainmentMode, NoiseColor, Track } from "@/data/soundLibrary";
import { AudioVisualizer } from "./AudioVisualizer";
import { TrackIcon } from "./TrackIcon";

export const TIMER_PRESETS = [
  { label: "15m", minutes: 15 },
  { label: "25m", minutes: 25 },
  { label: "45m", minutes: 45 },
  { label: "60m", minutes: 60 },
  { label: "∞", minutes: 0 },
] as const;

const NOISE_OPTIONS: Array<{ value: NoiseColor; label: string }> = [
  { value: "off", label: "Off" },
  { value: "brown", label: "Brown" },
  { value: "pink", label: "Pink" },
  { value: "white", label: "White" },
];

interface FocusConsoleProps {
  currentTrack: Track;
  isPlaying: boolean;
  volume: number;
  onVolumeChange: (val: number) => void;
  noiseColor: NoiseColor;
  onNoiseColorChange: (color: NoiseColor) => void;
  noiseMix: number;
  onNoiseMixChange: (val: number) => void;
  entrainmentMode: EntrainmentMode;
  onEntrainmentModeChange: (mode: EntrainmentMode) => void;
  analyserRef: RefObject<AnalyserNode | null>;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  sessionMinutes: number;
  onSelectSessionMinutes: (mins: number) => void;
  elapsedSeconds: number;
  onResetTimer: () => void;
  onLogBlockNow: () => void;
  activeObjective: string;
  onActiveObjectiveChange: (val: string) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function FocusConsole({
  currentTrack,
  isPlaying,
  volume,
  onVolumeChange,
  noiseColor,
  onNoiseColorChange,
  noiseMix,
  onNoiseMixChange,
  entrainmentMode,
  onEntrainmentModeChange,
  analyserRef,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  sessionMinutes,
  onSelectSessionMinutes,
  elapsedSeconds,
  onResetTimer,
  onLogBlockNow,
  activeObjective,
  onActiveObjectiveChange,
  focusMode,
  onToggleFocusMode,
}: FocusConsoleProps) {
  const totalSeconds = sessionMinutes > 0 ? sessionMinutes * 60 : 0;
  const remainingSeconds = totalSeconds > 0 ? Math.max(0, totalSeconds - elapsedSeconds) : 0;
  const progressPct =
    totalSeconds > 0 ? Math.min(100, (elapsedSeconds / totalSeconds) * 100) : 0;

  return (
    <div className="fw-card rounded-2xl p-6 sm:p-7 space-y-6 relative overflow-hidden">
      {/* Top Bar: Track Identity + Focus Mode Toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#43B0F8]/35 bg-[#43B0F8]/12 text-[#5CC0FF] shadow-[0_0_24px_rgba(67,176,248,0.2)]">
            <TrackIcon name={currentTrack.icon} className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#EEF4FA] truncate">
                {currentTrack.name}
              </h2>
              <span className="rounded-md border border-[#D4E78A]/30 bg-[#D4E78A]/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#D4E78A]">
                {currentTrack.category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#97A7C0] mt-0.5 line-clamp-1">
              {currentTrack.adhdUseCase}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleFocusMode}
          title={focusMode ? "Exit Distraction-Free Focus Mode" : "Enter Distraction-Free Focus Mode"}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition shrink-0 ${
            focusMode
              ? "border-[#43B0F8]/45 bg-[#43B0F8]/15 text-[#7AC8FF]"
              : "border-white/10 bg-[#0B1226] text-[#97A7C0] hover:border-[#43B0F8]/35 hover:text-[#EEF4FA]"
          }`}
        >
          {focusMode ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Focus</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Single-Task Anchor (ADHD Executive Function Lock) */}
      <div className="rounded-xl border border-[#43B0F8]/20 bg-[#070C1B] px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-[#D4E78A]/55 transition">
        <Target className="w-4 h-4 text-[#D4E78A] shrink-0" />
        <input
          type="text"
          value={activeObjective}
          onChange={(e) => onActiveObjectiveChange(e.target.value)}
          placeholder="Single-task anchor: What is your ONE objective for this block?"
          className="w-full bg-transparent text-sm text-[#EEF4FA] placeholder:text-[#6B7E9E] focus:outline-none"
        />
      </div>

      {/* Live Web Audio Canvas Visualizer */}
      <AudioVisualizer
        analyserRef={analyserRef}
        isPlaying={isPlaying}
        baseFrequency={currentTrack.baseFrequency}
        beatFrequency={currentTrack.beatFrequency}
        band={currentTrack.band}
        entrainmentMode={entrainmentMode}
        noiseColor={noiseColor}
      />

      {/* Timer Strip & Progress */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#97A7C0]" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#97A7C0]">
              Session Block
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSelectSessionMinutes(preset.minutes)}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition ${
                  sessionMinutes === preset.minutes
                    ? "bg-[#43B0F8] text-[#070B18]"
                    : "border border-white/10 bg-[#0B1226] text-[#97A7C0] hover:border-[#43B0F8]/30 hover:text-[#EEF4FA]"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#182442]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#43B0F8] to-[#D4E78A] transition-all duration-500"
            style={{
              width: sessionMinutes === 0 ? (isPlaying ? "100%" : "0%") : `${progressPct}%`,
              opacity: sessionMinutes === 0 && isPlaying ? 0.6 : 1,
            }}
          />
        </div>

        <div className="flex items-center justify-between font-mono text-xs text-[#97A7C0]">
          <span>Elapsed {formatClock(elapsedSeconds)}</span>
          <div className="flex items-center gap-3">
            {elapsedSeconds >= 60 && (
              <button
                type="button"
                onClick={onLogBlockNow}
                className="inline-flex items-center gap-1 text-[11px] text-[#D4E78A] hover:text-[#E5F2B0] transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Log Block
              </button>
            )}
            {elapsedSeconds > 0 && (
              <button
                type="button"
                onClick={onResetTimer}
                className="inline-flex items-center gap-1 text-[11px] text-[#6B7E9E] hover:text-[#EEF4FA] transition"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
            <span className="text-[#EEF4FA] font-semibold">
              {sessionMinutes === 0 ? "Continuous" : `${formatClock(remainingSeconds)} left`}
            </span>
          </div>
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-5 pt-1">
        <button
          type="button"
          onClick={onPrevTrack}
          aria-label="Previous program"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0B1226] text-[#97A7C0] hover:border-[#43B0F8]/40 hover:text-[#EEF4FA] transition"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause audio" : "Start focus session"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#5AC4FF] to-[#349BE8] text-[#070B18] shadow-[0_0_32px_rgba(67,176,248,0.45)] hover:from-[#7ACFFF] hover:to-[#43B0F8] hover:scale-105 active:scale-95 transition"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 ml-0.5 fill-current" />
          )}
        </button>

        <button
          type="button"
          onClick={onNextTrack}
          aria-label="Next program"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#0B1226] text-[#97A7C0] hover:border-[#43B0F8]/40 hover:text-[#EEF4FA] transition"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Acoustic DSP Mixer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-white/[0.08] bg-[#070C1B] p-4">
        {/* Entrainment Mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7E9E]">
              Entrainment Mode
            </span>
            <span className="font-mono text-[10px] text-[#D4E78A]">
              {entrainmentMode === "binaural" ? "Headphones" : "Speakers OK"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => onEntrainmentModeChange("binaural")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                entrainmentMode === "binaural"
                  ? "border-[#43B0F8]/45 bg-[#43B0F8]/15 text-[#7AC8FF]"
                  : "border-white/10 bg-[#0D162E] text-[#97A7C0] hover:text-[#EEF4FA]"
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Binaural
            </button>
            <button
              type="button"
              onClick={() => onEntrainmentModeChange("isochronic")}
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                entrainmentMode === "isochronic"
                  ? "border-[#D4E78A]/45 bg-[#D4E78A]/15 text-[#D4E78A]"
                  : "border-white/10 bg-[#0D162E] text-[#97A7C0] hover:text-[#EEF4FA]"
              }`}
            >
              <Speaker className="w-3.5 h-3.5" />
              Isochronic
            </button>
          </div>
        </div>

        {/* Colored Noise Layer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7E9E]">
              ADHD Noise Masking
            </span>
            <span className="font-mono text-[10px] text-[#7AC8FF] uppercase">
              {noiseColor}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {NOISE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onNoiseColorChange(opt.value)}
                className={`rounded-lg border py-2 text-[11px] font-semibold transition ${
                  noiseColor === opt.value
                    ? "border-[#43B0F8]/45 bg-[#43B0F8]/15 text-[#7AC8FF]"
                    : "border-white/10 bg-[#0D162E] text-[#97A7C0] hover:text-[#EEF4FA]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Master Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#97A7C0]">
              <Volume2 className="w-3.5 h-3.5 text-[#43B0F8]" />
              Master Gain
            </span>
            <span className="font-mono text-[11px] text-[#EEF4FA]">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <Slider
            value={[Math.round(volume * 100)]}
            max={100}
            step={1}
            onValueChange={(vals) => onVolumeChange(vals[0] / 100)}
          />
        </div>

        {/* Noise Mix */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 text-[#97A7C0]">
              <Waves className="w-3.5 h-3.5 text-[#D4E78A]" />
              Noise Layer Mix
            </span>
            <span className="font-mono text-[11px] text-[#EEF4FA]">
              {noiseColor === "off" ? "Muted" : `${Math.round(noiseMix * 100)}%`}
            </span>
          </div>
          <Slider
            value={[Math.round(noiseMix * 100)]}
            max={100}
            step={1}
            disabled={noiseColor === "off"}
            onValueChange={(vals) => onNoiseMixChange(vals[0] / 100)}
          />
        </div>
      </div>
    </div>
  );
}
