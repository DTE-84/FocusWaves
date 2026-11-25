import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  AudioWaveform,
  Brain,
  CreditCard,
  Crown,
  Download,
  ExternalLink,
  Headphones,
  Lock,
  LogIn,
  LogOut,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { soundLibrary, type Track } from "@/data/soundLibrary";
import { useAuth } from "@/context/AuthContext";
import { useAudioGenerator } from "@/hooks/useAudioGenerator";
import { useFocusTelemetry } from "@/hooks/useFocusTelemetry";
import { useMobileExperience } from "@/hooks/useMobileExperience";
import {
  isEntrainmentFree,
  isNoiseFree,
  isTimerFree,
  isTrackFree,
  useProAccess,
  type BillingPlan,
} from "@/hooks/useProAccess";
import { AuthModal } from "@/components/focus/AuthModal";
import { FocusConsole } from "@/components/focus/FocusConsole";
import { InstallAppDialog } from "@/components/focus/InstallAppDialog";
import { ParkingLot } from "@/components/focus/ParkingLot";
import { ProUpgradeModal } from "@/components/focus/ProUpgradeModal";
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
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<BillingPlan | null>(null);

  const { user, signOut } = useAuth();

  const {
    isPro,
    founderUnlocked,
    subscription,
    billingBusy,
    upgradeOpen,
    lockedFeatureLabel,
    openUpgrade,
    closeUpgrade,
    refreshSubscription,
    startCheckout,
    openManageSubscription,
    redeemAccessKey,
    revokeFounderAccess,
  } = useProAccess();

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

  const {
    isInstalled,
    isIOS,
    keepAwake,
    setKeepAwake,
    wakeLockActive,
    installHelpOpen,
    setInstallHelpOpen,
    handleInstallClick,
    triggerHaptic,
  } = useMobileExperience(isPlaying);

  const currentTrack = soundLibrary[currentTrackIdx];
  const logoSrc = `${import.meta.env.BASE_URL}focuswaveslogo.png`;

  // Handle Stripe Checkout return (?checkout=success | cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;

    if (checkout === "success") {
      void refreshSubscription();
      toast.success("Welcome to FocusWaves Pro!", {
        description: "Your 7-day free trial is active. All 15 protocols & Pro tools are unlocked.",
      });
    } else if (checkout === "cancelled") {
      toast.message("Checkout cancelled — still on Free Preview.");
    }

    params.delete("checkout");
    const clean = params.toString();
    const nextUrl = `${window.location.pathname}${clean ? `?${clean}` : ""}`;
    window.history.replaceState({}, "", nextUrl);
  }, [refreshSubscription]);

  // If user signed in right after clicking Start Trial, continue directly to Stripe Checkout
  useEffect(() => {
    if (user && pendingCheckoutPlan) {
      const plan = pendingCheckoutPlan;
      setPendingCheckoutPlan(null);
      startCheckout(plan).catch((err) => {
        toast.error(err instanceof Error ? err.message : "Could not start checkout.");
      });
    }
  }, [user, pendingCheckoutPlan, startCheckout]);

  // Ensure Free Preview stays cleanly within unlocked settings if Pro is revoked
  useEffect(() => {
    if (!isPro) {
      if (!isTrackFree(currentTrack.id)) {
        setCurrentTrackIdx(0);
      }
      if (!isTimerFree(sessionMinutes)) {
        setSessionMinutes(25);
      }
      if (!isNoiseFree(noiseColor)) {
        setNoiseColor("brown");
      }
      if (!isEntrainmentFree(entrainmentMode)) {
        setEntrainmentMode("binaural");
      }
      if (focusMode) {
        setFocusMode(false);
      }
    }
  }, [
    isPro,
    currentTrack.id,
    sessionMinutes,
    noiseColor,
    entrainmentMode,
    focusMode,
    setNoiseColor,
    setEntrainmentMode,
  ]);

  const handleTogglePlay = useCallback(() => {
    triggerHaptic("tap");
    togglePlay(currentTrack.baseFrequency, currentTrack.beatFrequency);
  }, [triggerHaptic, togglePlay, currentTrack.baseFrequency, currentTrack.beatFrequency]);

  const handleSelectTrack = useCallback(
    (track: Track, autoPlay = false) => {
      if (!isPro && !isTrackFree(track.id)) {
        openUpgrade(`${track.name} (${track.band} ${track.beatFrequency} Hz)`);
        return;
      }

      const idx = soundLibrary.findIndex((t) => t.id === track.id);
      if (idx === -1) return;

      const resolvedMinutes =
        isPro || isTimerFree(track.recommendedMinutes) ? track.recommendedMinutes : 25;
      const resolvedNoise =
        isPro || isNoiseFree(track.recommendedNoise) ? track.recommendedNoise : "brown";

      triggerHaptic("tap");
      setCurrentTrackIdx(idx);
      setSessionMinutes(resolvedMinutes);
      setElapsedSeconds(0);
      setNoiseColor(resolvedNoise);

      if (autoPlay || isPlaying) {
        startTrack(
          track.baseFrequency,
          track.beatFrequency,
          entrainmentMode,
          resolvedNoise
        );
      }
    },
    [isPro, openUpgrade, triggerHaptic, entrainmentMode, isPlaying, setNoiseColor, startTrack]
  );

  const handlePrevTrack = useCallback(() => {
    const pool = isPro
      ? soundLibrary
      : soundLibrary.filter((t) => isTrackFree(t.id));
    const curPoolIdx = pool.findIndex((t) => t.id === currentTrack.id);
    const prevTrack = pool[(curPoolIdx - 1 + pool.length) % pool.length];
    if (prevTrack) handleSelectTrack(prevTrack, isPlaying);
  }, [isPro, currentTrack.id, handleSelectTrack, isPlaying]);

  const handleNextTrack = useCallback(() => {
    const pool = isPro
      ? soundLibrary
      : soundLibrary.filter((t) => isTrackFree(t.id));
    const curPoolIdx = pool.findIndex((t) => t.id === currentTrack.id);
    const nextTrack = pool[(curPoolIdx + 1) % pool.length];
    if (nextTrack) handleSelectTrack(nextTrack, isPlaying);
  }, [isPro, currentTrack.id, handleSelectTrack, isPlaying]);

  const handleSelectSessionMinutes = useCallback(
    (mins: number) => {
      if (!isPro && !isTimerFree(mins)) {
        openUpgrade(mins === 0 ? "Continuous Playback Block" : `${mins}-Minute Extended Block`);
        return;
      }
      triggerHaptic("tap");
      setSessionMinutes(mins);
      setElapsedSeconds(0);
    },
    [isPro, openUpgrade, triggerHaptic]
  );

  const handleResetTimer = useCallback(() => {
    triggerHaptic("tap");
    setElapsedSeconds(0);
  }, [triggerHaptic]);

  const handleLogBlockNow = useCallback(() => {
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    recordSession(currentTrack.name, currentTrack.band, mins, activeObjective);
    setElapsedSeconds(0);
    triggerHaptic("success");
    toast.success(`Logged ${mins}m ${currentTrack.band} focus block`, {
      description: activeObjective.trim() || currentTrack.name,
    });
  }, [elapsedSeconds, recordSession, currentTrack.name, currentTrack.band, activeObjective, triggerHaptic]);

  const handleManageSubscriptionClick = useCallback(async () => {
    try {
      await openManageSubscription();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not open subscription management."
      );
    }
  }, [openManageSubscription]);

  // Honor PWA Home Screen shortcut query parameters (?preset=initiation|deep|reset)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("preset");
    if (!preset) return;

    const map: Record<string, { trackId: number; mins: number }> = {
      initiation: { trackId: 3, mins: 15 },
      deep: { trackId: 1, mins: isPro ? 45 : 25 },
      reset: { trackId: 4, mins: 15 },
    };

    const match = map[preset];
    if (!match) return;
    const idx = soundLibrary.findIndex((t) => t.id === match.trackId);
    if (idx !== -1) {
      const target = soundLibrary[idx];
      setCurrentTrackIdx(idx);
      setSessionMinutes(match.mins);
      setNoiseColor(isPro || isNoiseFree(target.recommendedNoise) ? target.recommendedNoise : "brown");
      if (isPro) setFocusMode(true);
    }
  }, [isPro, setNoiseColor]);

  // Real-time session timer + completion chime & automatic telemetry logging
  useEffect(() => {
    if (!isPlaying) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (sessionMinutes > 0 && next >= sessionMinutes * 60) {
          stopTrack();
          playCompletionChime();
          triggerHaptic("success");
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
    triggerHaptic,
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

  // Quick-start ADHD presets (all 3 work seamlessly in Free Preview)
  const launchQuickPreset = (trackId: number, mins: number) => {
    const found = soundLibrary.find((t) => t.id === trackId);
    if (!found) return;
    const idx = soundLibrary.findIndex((t) => t.id === trackId);
    const resolvedMins = isPro || isTimerFree(mins) ? mins : 25;
    const resolvedNoise =
      isPro || isNoiseFree(found.recommendedNoise) ? found.recommendedNoise : "brown";

    triggerHaptic("tap");
    setCurrentTrackIdx(idx);
    setSessionMinutes(resolvedMins);
    setElapsedSeconds(0);
    setNoiseColor(resolvedNoise);
    startTrack(found.baseFrequency, found.beatFrequency, entrainmentMode, resolvedNoise);
    toast.message(`Loaded ${found.name} (${resolvedMins}m)`, {
      description: `${found.band} ${found.beatFrequency} Hz + ${resolvedNoise} noise`,
    });
  };

  return (
    <div className="min-h-screen text-[#EEF4FA] flex flex-col">
      {/* Top Navigation */}
      <nav className="safe-top sticky top-0 z-50 border-b border-white/[0.08] bg-[#070B18]/85 backdrop-blur-xl">
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
                  {subscription.isPro
                    ? `Pro · ${subscription.tier}`
                    : founderUnlocked
                    ? "Founder Pro"
                    : "Free Preview"}
                </div>
              </div>
            </a>
          </div>

          {!focusMode && (
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#97A7C0]">
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

          <div className="flex items-center gap-2">
            {/* Billing / Pro Controls */}
            {subscription.isPro || subscription.hasStripeCustomer ? (
              <button
                type="button"
                disabled={billingBusy}
                onClick={handleManageSubscriptionClick}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4E78A]/40 bg-[#D4E78A]/12 px-3 py-2 text-xs font-display font-bold text-[#D4E78A] hover:bg-[#D4E78A]/20 disabled:opacity-50 transition"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manage Subscription</span>
              </button>
            ) : founderUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  revokeFounderAccess();
                  toast.message("Switched back to Free Preview mode");
                }}
                title="Click to test Free Preview mode"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4E78A]/40 bg-[#D4E78A]/12 px-3 py-2 text-xs font-mono font-bold uppercase tracking-wider text-[#D4E78A] hover:bg-[#D4E78A]/20 transition"
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Founder Pro</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => openUpgrade("Full FocusWaves Pro Suite")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4E78A] px-3 py-2 text-xs font-display font-bold text-[#070B18] hover:bg-[#E7F3B5] transition"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Unlock Pro</span>
              </button>
            )}

            {/* Auth Button */}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  void signOut();
                  toast.message("Signed out");
                }}
                title={`Signed in as ${user.email ?? "account"} — click to sign out`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F172D] px-2.5 py-2 text-xs font-medium text-[#97A7C0] hover:border-white/25 hover:text-[#EEF4FA] transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline max-w-[110px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F172D] px-3 py-2 text-xs font-display font-semibold text-[#EEF4FA] hover:border-[#43B0F8]/45 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-[#43B0F8]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {!isInstalled && (
              <button
                type="button"
                onClick={handleInstallClick}
                aria-label="Install FocusWaves App"
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-[#43B0F8]/35 bg-[#43B0F8]/12 px-2.5 py-2 text-xs font-display font-bold text-[#7AC8FF] hover:bg-[#43B0F8]/22 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic("tap");
                if (!isPro && !focusMode) {
                  openUpgrade("Distraction-Free Focus Mode");
                  return;
                }
                setFocusMode((prev) => !prev);
              }}
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-display font-bold transition ${
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
                  {!isPro ? (
                    <Lock className="w-3 h-3 text-[#D4E78A]" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5 text-[#43B0F8]" />
                  )}
                  Focus
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
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="fw-eyebrow">
                <span className="h-2 w-2 rounded-full bg-[#43B0F8] animate-pulse" />
                Distraction-Free Execution Cockpit · Space to Play/Pause · Esc to Exit
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <FocusConsole
                  currentTrack={currentTrack}
                  isPlaying={isPlaying}
                  isPro={isPro}
                  onRequestPro={openUpgrade}
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
                  keepAwake={keepAwake}
                  onToggleKeepAwake={() => {
                    triggerHaptic("tap");
                    setKeepAwake((prev) => !prev);
                  }}
                  wakeLockActive={wakeLockActive}
                />
              </div>
              <div className="lg:col-span-5">
                <ParkingLot
                  items={parkingItems}
                  isPro={isPro}
                  onRequestPro={openUpgrade}
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
            <section id="console" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                {/* Left Copy & Quick Presets */}
                <div className="lg:col-span-5 space-y-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#43B0F8]/30 bg-[#43B0F8]/10 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7AC8FF]">
                    <span className="h-2 w-2 rounded-full bg-[#43B0F8] shadow-[0_0_10px_#43B0F8] animate-pulse" />
                    {isPro ? "FocusWaves Pro · Full Suite Active" : "Free Preview · 7-Day Pro Trial Available"}
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
                      Real-time binaural beats, speaker-safe isochronic pulses, and brown/pink noise masking paired with a single-task anchor and brain-dump parking lot. Test 3 core protocols free—or start a 7-day Pro trial for the complete studio.
                    </p>
                  </div>

                  {/* Quick-Start 1-Tap ADHD Presets */}
                  <div className="space-y-2.5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6B7E9E]">
                      1-Tap Free Preview Launch
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
                        onClick={() => launchQuickPreset(1, isPro ? 45 : 25)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#0F172D] px-3.5 py-2 text-xs font-display font-bold text-[#EEF4FA] hover:border-[#43B0F8]/45 transition"
                      >
                        <Brain className="w-3.5 h-3.5 text-[#43B0F8]" />
                        {isPro ? "45m Deep Focus" : "25m Deep Focus"}
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
                      <p className="text-[11px] text-[#6B7E9E] mt-0.5">Offline capable</p>
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
                        $49.99/yr
                      </div>
                      <p className="text-[11px] text-[#6B7E9E] mt-0.5">7-day free trial</p>
                    </div>
                  </div>
                </div>

                {/* Right Live Acoustic Console */}
                <div className="lg:col-span-7">
                  <FocusConsole
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    isPro={isPro}
                    onRequestPro={openUpgrade}
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
                    keepAwake={keepAwake}
                    onToggleKeepAwake={() => {
                      triggerHaptic("tap");
                      setKeepAwake((prev) => !prev);
                    }}
                    wakeLockActive={wakeLockActive}
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
                    isPro={isPro}
                    onRequestPro={openUpgrade}
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
              isPro={isPro}
              onSelectTrack={handleSelectTrack}
              onRequestPro={openUpgrade}
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
                © 2026 DTE Solutions LLC · Acoustic Focus &amp; Neurodivergent Productivity
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

      <InstallAppDialog
        open={installHelpOpen}
        isIOS={isIOS}
        onClose={() => setInstallHelpOpen(false)}
      />

      <ProUpgradeModal
        open={upgradeOpen}
        featureLabel={lockedFeatureLabel}
        isSignedIn={Boolean(user)}
        subscription={subscription}
        billingBusy={billingBusy}
        onClose={closeUpgrade}
        onStartCheckout={startCheckout}
        onManageSubscription={handleManageSubscriptionClick}
        onNeedAuth={(plan) => {
          setPendingCheckoutPlan(plan);
          closeUpgrade();
          setAuthModalOpen(true);
        }}
        onRedeemKey={(key) => {
          const ok = redeemAccessKey(key);
          if (ok) {
            triggerHaptic("success");
            toast.success("Founder Pro access unlocked", {
              description: "All 15 neural protocols and Pro executive tools are active.",
            });
          }
          return ok;
        }}
      />

      <AuthModal
        open={authModalOpen}
        subtitle={
          pendingCheckoutPlan
            ? `Sign in or create an account to start your 7-day FocusWaves Pro trial (${
                pendingCheckoutPlan === "annual" ? "$49.99/yr" : "$7.99/mo"
              }).`
            : "Sign in to manage or sync your FocusWaves Pro subscription."
        }
        onClose={() => {
          setAuthModalOpen(false);
          setPendingCheckoutPlan(null);
        }}
      />
    </div>
  );
}
