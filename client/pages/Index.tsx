import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  AudioWaveform,
  Brain,
  ExternalLink,
  Headphones,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { soundLibrary, type Track } from "@/data/soundLibrary";
import { useAudioGenerator } from "@/hooks/useAudioGenerator";
import { useFocusTelemetry } from "@/hooks/useFocusTelemetry";
import { FocusConsole } from "@/components/focus/FocusConsole";
import { ParkingLot } from "@/components/focus/ParkingLot";
import { SoundLibrary } from "@/components/focus/SoundLibrary";
import { ScienceSection } from "@/components/focus/ScienceSection";
import { TelemetryStrip } from "@/components/focus/TelemetryStrip";

const BREAKDOWN_URL = "https://dte-solutions.icu/focuswaves-breakdown.html";
const HUB_URL = "https://dte-solutions.icu";

export default function Index() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState<number>(25);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [focusMode, setFocusMode] = useState<boolean>(false);

  const {
    isPlaying,
    volume,
    setVolume,
    noiseColor,
    setNoiseColor,
    noiseMix,
    setNoiseMix,
    entrainmentMode,
    setEntrainmentMode,
    analyserRef,
    togglePlay,
    startTrack,
    stopTrack,
    playCompletionChime,
  } = useAudioGenerator();

  const {
    sessions,
    stats,
    activeObjective,
    setActiveObjective,
    recordSession,
    clearTelemetry,
    parkingItems,
    addParkingItem,
    toggleParkingItem,
    removeParkingItem,
    clearCompletedParking,
  } = useFocusTelemetry();

  const currentTrack = soundLibrary[currentTrackIdx];
  const logoSrc = `${import.meta.env.BASE_URL}focuswaveslogo.png`;

  const handleTogglePlay = useCallback(() => {
    togglePlay(currentTrack.baseFrequency, currentTrack.beatFrequency);
  }, [togglePlay, currentTrack.baseFrequency, currentTrack.beatFrequency]);

  const handleSelectTrack = useCallback(
    (track: Track, autoPlay = false) => {
      const idx = soundLibrary.findIndex((t) => t.id === track.id);
      if (idx === -1) return;

      setCurrentTrackIdx(idx);
      setSessionMinutes(track.recommendedMinutes);
      setElapsedSeconds(0);
      setNoiseColor(track.recommendedNoise);

      if (autoPlay || isPlaying) {
        startTrack(
          track.baseFrequency,
          track.beatFrequency,
          entrainmentMode,
          track.recommendedNoise
        );
      }
    },
    [entrainmentMode, isPlaying, setNoiseColor, startTrack]
  );

  const handlePrevTrack = useCallback(() => {
    const prevIdx = (currentTrackIdx - 1 + soundLibrary.length) % soundLibrary.length;
    handleSelectTrack(soundLibrary[prevIdx], isPlaying);
  }, [currentTrackIdx, handleSelectTrack, isPlaying]);

  const handleNextTrack = useCallback(() => {
    const nextIdx = (currentTrackIdx + 1) % soundLibrary.length;
    handleSelectTrack(soundLibrary[nextIdx], isPlaying);
  }, [currentTrackIdx, handleSelectTrack, isPlaying]);

  const handleSelectSessionMinutes = useCallback((mins: number) => {
    setSessionMinutes(mins);
    setElapsedSeconds(0);
  }, []);

  const handleResetTimer = useCallback(() => {
    setElapsedSeconds(0);
  }, []);

  const handleLogBlockNow = useCallback(() => {
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    recordSession(currentTrack.name, currentTrack.band, mins, activeObjective);
    setElapsedSeconds(0);
    toast.success(`Logged ${mins}m ${currentTrack.band} focus block`, {
      description: activeObjective.trim() || currentTrack.name,
    });
  }, [elapsedSeconds, recordSession, currentTrack.name, currentTrack.band, activeObjective]);

  // Real-time session timer + completion chime & automatic telemetry logging
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (sessionMinutes > 0 && next >= sessionMinutes * 60) {
          stopTrack();
          playCompletionChime();
          recordSession(
            currentTrack.name,
            currentTrack.band,
            sessionMinutes,
            activeObjective
          );
          toast.success(`Focus block complete (${sessionMinutes}m)`, {
            description: `${currentTrack.name} · ${activeObjective.trim() || "Session logged to local telemetry"}`,
          });
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    isPlaying,
    sessionMinutes,
    stopTrack,
    playCompletionChime,
    recordSession,
    currentTrack.name,
    currentTrack.band,
    activeObjective,
  ]);

  // Spacebar shortcut for low-friction play/pause when not typing in an input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === "Escape" && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleTogglePlay, focusMode]);

  // Media Session API for OS & mobile lock-screen controls
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: `FocusWaves · ${currentTrack.band} ${currentTrack.beatFrequency} Hz`,
        album: "DTE Solutions Acoustic Engine",
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
      navigator.mediaSession.setActionHandler("play", () =>
        startTrack(currentTrack.baseFrequency, currentTrack.beatFrequency)
      );
      navigator.mediaSession.setActionHandler("pause", () => stopTrack());
      navigator.mediaSession.setActionHandler("previoustrack", handlePrevTrack);
      navigator.mediaSession.setActionHandler("nexttrack", handleNextTrack);
    } catch {
      // Ignore MediaSession errors in unsupported browsers
    }
  }, [currentTrack, isPlaying, startTrack, stopTrack, handlePrevTrack, handleNextTrack]);

  // Quick-start ADHD presets
  const launchQuickPreset = (trackId: number, mins: number) => {
    const found = soundLibrary.find((t) => t.id === trackId);
    if (!found) return;
    const idx = soundLibrary.findIndex((t) => t.id === trackId);
    setCurrentTrackIdx(idx);
    setSessionMinutes(mins);
    setElapsedSeconds(0);
    setNoiseColor(found.recommendedNoise);
    startTrack(found.baseFrequency, found.beatFrequency, entrainmentMode, found.recommendedNoise);
    toast.message(`Loaded ${found.name} (${mins}m)`, {
      description: `${found.band} ${found.beatFrequency} Hz + ${found.recommendedNoise} noise`,
    });
  };

  return (
    <div className="min-h-screen text-[#EEF4FA] flex flex-col">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#070B18]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <a
              href={HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-[#97A7C0] hover:border-[#43B0F8]/40 hover:text-[#EEF4FA] transition"
            >
              DTE Hub
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <span className="hidden sm:block h-5 w-px bg-white/10" />
            <a href="#console" className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-full border border-[#43B0F8]/40 bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_16px_rgba(67,176,248,0.22)]">
                <img
                  src={logoSrc}
                  alt="FocusWaves"
                  className="h-full w-full object-cover scale-125"
                />
              </div>
              <div className="leading-tight">
                <div className="font-display text-base font-bold tracking-tight text-[#EEF4FA]">
                  Focus<span className="text-[#43B0F8]">Waves</span>
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#D4E78A]/80">
                  Acoustic Studio · 2026
                </div>
              </div>
            </a>
          </div>

          {!focusMode && (
            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#97A7C0]">
              <a href="#console" className="hover:text-[#EEF4FA] transition">
                Console
              </a>
              <a href="#workspace" className="hover:text-[#EEF4FA] transition">
                ADHD Tools
              </a>
              <a href="#library" className="hover:text-[#EEF4FA] transition">
                Library
              </a>
              <a href="#science" className="hover:text-[#EEF4FA] transition">
                Science
              </a>
              <a
                href={BREAKDOWN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#D4E78A] hover:text-[#E7F3B5] transition"
              >
                Breakdown
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setFocusMode((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-display font-bold transition ${
                focusMode
                  ? "border-[#43B0F8]/45 bg-[#43B0F8]/15 text-[#7AC8FF]"
                  : "border-white/12 bg-[#0F172D] text-[#EEF4FA] hover:border-[#43B0F8]/45"
              }`}
            >
              {focusMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  Exit Focus
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#43B0F8]" />
                  Focus Mode
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {focusMode ? (
          /* Distraction-Free Execution Cockpit */
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="fw-eyebrow">
                <span className="h-2 w-2 rounded-full bg-[#43B0F8] animate-pulse" />
                Distraction-Free Execution Cockpit · Press Space to Play/Pause · Esc to Exit
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <FocusConsole
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  volume={volume}
                  onVolumeChange={setVolume}
                  noiseColor={noiseColor}
                  onNoiseColorChange={setNoiseColor}
                  noiseMix={noiseMix}
                  onNoiseMixChange={setNoiseMix}
                  entrainmentMode={entrainmentMode}
                  onEntrainmentModeChange={setEntrainmentMode}
                  analyserRef={analyserRef}
                  onTogglePlay={handleTogglePlay}
                  onPrevTrack={handlePrevTrack}
                  onNextTrack={handleNextTrack}
                  sessionMinutes={sessionMinutes}
                  onSelectSessionMinutes={handleSelectSessionMinutes}
                  elapsedSeconds={elapsedSeconds}
                  onResetTimer={handleResetTimer}
                  onLogBlockNow={handleLogBlockNow}
                  activeObjective={activeObjective}
                  onActiveObjectiveChange={setActiveObjective}
                  focusMode={focusMode}
                  onToggleFocusMode={() => setFocusMode(false)}
                />
              </div>
              <div className="lg:col-span-5">
                <ParkingLot
                  items={parkingItems}
                  onAdd={addParkingItem}
                  onToggle={toggleParkingItem}
                  onRemove={removeParkingItem}
                  onClearCompleted={clearCompletedParking}
                />
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Hero + Live Console */}
            <section id="console" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Copy & Quick Presets */}
                <div className="lg:col-span-5 space-y-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#43B0F8]/30 bg-[#43B0F8]/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7AC8FF]">
                    <span className="h-2 w-2 rounded-full bg-[#43B0F8] shadow-[0_0_10px_#43B0F8] animate-pulse" />
                    Web Audio DSP · Zero-Server Privacy
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-4xl sm:text-5xl font-display font-extrabold leading-[1.06] tracking-tight text-[#EEF4FA]">
                      Acoustic Focus,
                      <br />
                      <span className="font-serif italic font-normal text-5xl sm:text-[3.5rem] text-[#43B0F8]">
                        engineered for{" "}
                      </span>
                      <span className="text-[#D4E78A]">ADHD.</span>
                    </h1>
                    <p className="text-base text-[#97A7C0] leading-relaxed">
                      Real-time binaural beats, speaker-safe isochronic pulses, and brown/pink noise masking paired with a single-task anchor and brain-dump parking lot. Built to quiet noise and cut task-initiation friction.
                    </p>
                  </div>

                  {/* Quick-Start 1-Tap ADHD Presets */}
                  <div className="space-y-2.5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7E9E]">
                      1-Tap Quick Launch
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => launchQuickPreset(3, 15)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#43B0F8]/40 bg-[#43B0F8]/14 px-3.5 py-2 text-xs font-display font-bold text-[#7AC8FF] hover:bg-[#43B0F8]/22 transition"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        15m Task Initiation
                      </button>
                      <button
                        type="button"
                        onClick={() => launchQuickPreset(1, 45)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F172D] px-3.5 py-2 text-xs font-display font-bold text-[#EEF4FA] hover:border-[#43B0F8]/45 transition"
                      >
                        <Brain className="w-3.5 h-3.5 text-[#43B0F8]" />
                        45m Deep Focus
                      </button>
                      <button
                        type="button"
                        onClick={() => launchQuickPreset(4, 15)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F172D] px-3.5 py-2 text-xs font-display font-bold text-[#EEF4FA] hover:border-[#D4E78A]/45 transition"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4E78A]" />
                        Sensory Reset
                      </button>
                    </div>
                  </div>

                  {/* Trust Specs */}
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-display font-bold text-[#EEF4FA]">
                        <AudioWaveform className="w-3.5 h-3.5 text-[#43B0F8]" />
                        Live Synth
                      </div>
                      <p className="text-[11px] text-[#6B7E9E] mt-0.5">No static loops</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-display font-bold text-[#EEF4FA]">
                        <Headphones className="w-3.5 h-3.5 text-[#D4E78A]" />
                        Dual Mode
                      </div>
                      <p className="text-[11px] text-[#6B7E9E] mt-0.5">Binaural + Iso</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-display font-bold text-[#EEF4FA]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#43B0F8]" />
                        100% Local
                      </div>
                      <p className="text-[11px] text-[#6B7E9E] mt-0.5">Zero sign-up</p>
                    </div>
                  </div>
                </div>

                {/* Right Live Acoustic Console */}
                <div className="lg:col-span-7">
                  <FocusConsole
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    volume={volume}
                    onVolumeChange={setVolume}
                    noiseColor={noiseColor}
                    onNoiseColorChange={setNoiseColor}
                    noiseMix={noiseMix}
                    onNoiseMixChange={setNoiseMix}
                    entrainmentMode={entrainmentMode}
                    onEntrainmentModeChange={setEntrainmentMode}
                    analyserRef={analyserRef}
                    onTogglePlay={handleTogglePlay}
                    onPrevTrack={handlePrevTrack}
                    onNextTrack={handleNextTrack}
                    sessionMinutes={sessionMinutes}
                    onSelectSessionMinutes={handleSelectSessionMinutes}
                    elapsedSeconds={elapsedSeconds}
                    onResetTimer={handleResetTimer}
                    onLogBlockNow={handleLogBlockNow}
                    activeObjective={activeObjective}
                    onActiveObjectiveChange={setActiveObjective}
                    focusMode={focusMode}
                    onToggleFocusMode={() => setFocusMode(true)}
                  />
                </div>
              </div>
            </section>

            {/* ADHD Executive Workspace: Brain-Dump Parking Lot + Local Telemetry */}
            <section
              id="workspace"
              className="border-t border-white/[0.08] py-16 bg-[#0A1022]/60"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ParkingLot
                    items={parkingItems}
                    onAdd={addParkingItem}
                    onToggle={toggleParkingItem}
                    onRemove={removeParkingItem}
                    onClearCompleted={clearCompletedParking}
                  />
                  <TelemetryStrip
                    stats={stats}
                    sessions={sessions}
                    onClearTelemetry={clearTelemetry}
                  />
                </div>
              </div>
            </section>

            {/* 15-Program Neural Sound Library */}
            <SoundLibrary
              tracks={soundLibrary}
              currentTrackId={currentTrack.id}
              isPlaying={isPlaying}
              onSelectTrack={handleSelectTrack}
            />

            {/* Acoustic Science & Architecture */}
            <ScienceSection />
          </>
        )}
      </main>

      {/* DTE Solutions Footer */}
      {!focusMode && (
        <footer className="border-t border-white/[0.08] bg-[#060914] py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="font-display text-base font-bold text-[#EEF4FA]">
                Focus<span className="text-[#43B0F8]">Waves</span>
              </div>
              <p className="font-mono text-[11px] text-[#6B7E9E] mt-1">
                © 2026 DTE Solutions LLC · Zero-Server Acoustic Focus Platform
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#97A7C0]">
              <a
                href={HUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#43B0F8] transition"
              >
                DTE Solutions Hub
              </a>
              <a
                href={BREAKDOWN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4E78A] transition"
              >
                Product Breakdown
              </a>
              <a
                href="https://dte-solutions.icu/privacy-policy.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EEF4FA] transition"
              >
                Privacy Policy
              </a>
              <a
                href="https://dte-solutions.icu/terms.html"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#EEF4FA] transition"
              >
                Terms
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
