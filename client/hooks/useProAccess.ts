import { useState, useEffect, useCallback } from "react";
import type { EntrainmentMode, NoiseColor } from "@/data/soundLibrary";

const PRO_STORAGE_KEY = "focuswaves.pro.unlocked.v1";

// Free Preview entitlements (3 core ADHD states: Deep Focus, Clarity, Zen Mind)
export const FREE_TRACK_IDS = new Set<number>([1, 3, 4]);
export const FREE_TIMER_MINUTES = new Set<number>([15, 25]);
export const FREE_NOISE_COLORS = new Set<NoiseColor>(["off", "brown"]);
export const FREE_ENTRAINMENT_MODES = new Set<EntrainmentMode>(["binaural"]);

// Founder / Beta bypass codes so you can demo full Pro anytime (swap for Stripe/RevenueCat later)
const VALID_ACCESS_KEYS = new Set([
  "DTE-FOUNDER",
  "FOCUSWAVES-PRO",
  "DTE-VIP",
]);

export function isTrackFree(trackId: number): boolean {
  return FREE_TRACK_IDS.has(trackId);
}

export function isTimerFree(minutes: number): boolean {
  return FREE_TIMER_MINUTES.has(minutes);
}

export function isNoiseFree(color: NoiseColor): boolean {
  return FREE_NOISE_COLORS.has(color);
}

export function isEntrainmentFree(mode: EntrainmentMode): boolean {
  return FREE_ENTRAINMENT_MODES.has(mode);
}

export function useProAccess() {
  const [isPro, setIsPro] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(PRO_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);
  const [lockedFeatureLabel, setLockedFeatureLabel] = useState<string>(
    "Full FocusWaves Pro Suite"
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(PRO_STORAGE_KEY, isPro ? "true" : "false");
    } catch {
      // Ignore storage errors
    }
  }, [isPro]);

  const openUpgrade = useCallback((featureLabel?: string) => {
    setLockedFeatureLabel(featureLabel || "Full FocusWaves Pro Suite");
    setUpgradeOpen(true);
  }, []);

  const closeUpgrade = useCallback(() => {
    setUpgradeOpen(false);
  }, []);

  const redeemAccessKey = useCallback((rawKey: string): boolean => {
    const normalized = rawKey.trim().toUpperCase();
    if (VALID_ACCESS_KEYS.has(normalized)) {
      setIsPro(true);
      setUpgradeOpen(false);
      return true;
    }
    return false;
  }, []);

  const revokeProPreview = useCallback(() => {
    setIsPro(false);
  }, []);

  return {
    isPro,
    upgradeOpen,
    lockedFeatureLabel,
    openUpgrade,
    closeUpgrade,
    redeemAccessKey,
    revokeProPreview,
  };
}
