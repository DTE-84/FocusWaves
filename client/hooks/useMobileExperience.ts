import { useState, useEffect, useRef, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface CapacitorBridge {
  isNativePlatform?: () => boolean;
  Plugins?: {
    Haptics?: {
      impact?: (opts: { style: "LIGHT" | "MEDIUM" | "HEAVY" }) => Promise<void>;
      notification?: (opts: { type: "SUCCESS" | "WARNING" | "ERROR" }) => Promise<void>;
    };
  };
}

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
}

interface NavigatorWithMobile extends Navigator {
  standalone?: boolean;
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
}

function getCapacitor(): CapacitorBridge | undefined {
  return (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor;
}

export function isRunningNativeApp(): boolean {
  try {
    return Boolean(getCapacitor()?.isNativePlatform?.());
  } catch {
    return false;
  }
}

export function useMobileExperience(isPlaying: boolean) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [keepAwake, setKeepAwake] = useState<boolean>(true);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);
  const [installHelpOpen, setInstallHelpOpen] = useState<boolean>(false);

  const wakeLockRef = useRef<WakeLockSentinelLike | null>(null);

  // Detect standalone PWA / Capacitor native mode & iOS Safari
  useEffect(() => {
    const nav = navigator as NavigatorWithMobile;
    const standalone =
      isRunningNativeApp() ||
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(nav.standalone);
    setIsInstalled(standalone);

    const ua = navigator.userAgent || "";
    const ios =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallHelpOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Screen Wake Lock while audio session is active
  const acquireWakeLock = useCallback(async () => {
    const nav = navigator as NavigatorWithMobile;
    if (!nav.wakeLock || document.visibilityState !== "visible") return;
    try {
      const sentinel = await nav.wakeLock.request("screen");
      wakeLockRef.current = sentinel;
      setWakeLockActive(true);
    } catch {
      setWakeLockActive(false);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // Ignore release errors
      }
      wakeLockRef.current = null;
    }
    setWakeLockActive(false);
  }, []);

  useEffect(() => {
    if (isPlaying && keepAwake) {
      void acquireWakeLock();
    } else {
      void releaseWakeLock();
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible" && isPlaying && keepAwake) {
        void acquireWakeLock();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isPlaying, keepAwake, acquireWakeLock, releaseWakeLock]);

  useEffect(() => {
    return () => {
      void releaseWakeLock();
    };
  }, [releaseWakeLock]);

  // Tactile haptic feedback (Capacitor native first, Web Vibration fallback)
  const triggerHaptic = useCallback((kind: "tap" | "success" = "tap") => {
    try {
      const haptics = getCapacitor()?.Plugins?.Haptics;
      if (haptics) {
        if (kind === "success" && haptics.notification) {
          void haptics.notification({ type: "SUCCESS" });
          return;
        }
        if (haptics.impact) {
          void haptics.impact({ style: "LIGHT" });
          return;
        }
      }
      if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
        navigator.vibrate(kind === "success" ? [28, 60, 42] : 12);
      }
    } catch {
      // Ignore unsupported environments
    }
  }, []);

  const handleInstallClick = useCallback(async () => {
    triggerHaptic("tap");
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setInstallHelpOpen(true);
    }
  }, [deferredPrompt, triggerHaptic]);

  return {
    isInstalled,
    isIOS,
    canNativePrompt: Boolean(deferredPrompt),
    keepAwake,
    setKeepAwake,
    wakeLockActive,
    installHelpOpen,
    setInstallHelpOpen,
    handleInstallClick,
    triggerHaptic,
  };
}
