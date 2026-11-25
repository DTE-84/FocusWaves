import { useState } from "react";
import { Clock, Play, Radio, Waves } from "lucide-react";
import {
  TRACK_CATEGORIES,
  type Track,
  type TrackCategory,
} from "@/data/soundLibrary";
import { TrackIcon } from "./TrackIcon";

interface SoundLibraryProps {
  tracks: Track[];
  currentTrackId: number;
  isPlaying: boolean;
  onSelectTrack: (track: Track, autoPlay?: boolean) => void;
}

const BAND_COLORS: Record<Track["band"], string> = {
  Delta: "border-indigo-400/35 bg-indigo-400/12 text-indigo-200",
  Theta: "border-violet-400/35 bg-violet-400/12 text-violet-200",
  Alpha: "border-[#43B0F8]/35 bg-[#43B0F8]/12 text-[#7AC8FF]",
  Beta: "border-[#D4E78A]/35 bg-[#D4E78A]/12 text-[#D4E78A]",
  Gamma: "border-amber-300/35 bg-amber-300/12 text-amber-200",
};

export function SoundLibrary({
  tracks,
  currentTrackId,
  isPlaying,
  onSelectTrack,
}: SoundLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | TrackCategory>("All");

  const filtered =
    selectedCategory === "All"
      ? tracks
      : tracks.filter((t) => t.category === selectedCategory);

  return (
    <section id="library" className="border-t border-white/[0.08] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="fw-eyebrow">
              <Radio className="w-3.5 h-3.5" />
              Acoustic Program Matrix
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#EEF4FA]">
              15 Calibrated Neural Protocols
            </h2>
            <p className="text-sm sm:text-base text-[#97A7C0]">
              Every protocol pairs a target brainwave differential with an optimal default noise profile and session length. Click any card to load and play immediately.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {TRACK_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3.5 py-2 text-xs font-mono font-semibold uppercase tracking-wider transition ${
                  selectedCategory === category
                    ? "bg-[#43B0F8] text-[#070B18] shadow-[0_0_22px_rgba(67,176,248,0.28)]"
                    : "border border-white/10 bg-[#0E162B] text-[#97A7C0] hover:border-[#43B0F8]/35 hover:text-[#EEF4FA]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((track) => {
            const isActive = track.id === currentTrackId;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => onSelectTrack(track, true)}
                className={`group text-left rounded-2xl p-6 transition duration-200 flex flex-col justify-between ${
                  isActive
                    ? "fw-card-active"
                    : "fw-card hover:border-[#43B0F8]/30 hover:-translate-y-0.5"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                        isActive
                          ? "border-[#43B0F8]/50 bg-[#43B0F8]/15 text-[#7AC8FF]"
                          : "border-white/10 bg-[#0B1226] text-[#97A7C0] group-hover:border-[#43B0F8]/35 group-hover:text-[#7AC8FF]"
                      }`}
                    >
                      <TrackIcon name={track.icon} className="w-5 h-5" />
                    </div>

                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${BAND_COLORS[track.band]}`}
                    >
                      {track.band} · {track.beatFrequency} Hz
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="text-lg font-display font-bold text-[#EEF4FA]">
                      {track.name}
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#6B7E9E]">
                      {track.category}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-[#D4E78A]/90 mb-2">
                    {track.adhdUseCase}
                  </p>

                  <p className="text-sm text-[#97A7C0] leading-relaxed mb-5">
                    {track.description}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.07] pt-3.5 text-xs text-[#6B7E9E] font-mono">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {track.recommendedMinutes}m
                    </span>
                    <span className="inline-flex items-center gap-1 uppercase">
                      <Waves className="w-3.5 h-3.5" />
                      {track.recommendedNoise}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      isActive && isPlaying
                        ? "text-[#43B0F8]"
                        : "text-[#97A7C0] group-hover:text-[#7AC8FF]"
                    }`}
                  >
                    {isActive && isPlaying ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-[#43B0F8] animate-pulse" />
                        Active
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-current" />
                        Load
                      </>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
