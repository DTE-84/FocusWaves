import { useState, useEffect, useCallback } from "react";
import type { EntrainmentMode, NoiseColor } from "@/data/soundLibrary";
import { useAuth } from "@/context/AuthContext";
import { apiGet, apiPost } from "@/lib/apiFetch";

const FOUNDER_STORAGE_KEY = "focuswaves.founder.unlocked.v1";

export type BillingPlan = "annual" | "monthly";

export interface SubscriptionSnapshot {
  isPro: boolean;
  tier: "free" | "monthly" | "annual";
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasStripeCustomer: boolean;
}

// Free Preview entitlements (3 core ADHD states: Deep Focus, Clarity, Zen Mind)
export const FREE_TRACK_IDS = new Set<number>([1, 3, 4]);
export const FREE_TIMER_MINUTES = new Set<number>([15, 25]);
export const FREE_NOISE_COLORS = new Set<NoiseColor>(["off", "brown"]);
export const FREE_ENTRAINMENT_MODES = new Set<EntrainmentMode>(["binaural"]);

// Private Founder / Friends access keys for complimentary Pro access
const VALID_FOUNDER_KEYS = new Set([
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

const EMPTY_SUBSCRIPTION: SubscriptionSnapshot = {
  isPro: false,
  tier: "free",
  status: "none",
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  hasStripeCustomer: false,
};

export function useProAccess() {
  const { user, isConfigured } = useAuth();

  const [founderUnlocked, setFounderUnlocked] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(FOUNDER_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [subscription, setSubscription] =
    useState<SubscriptionSnapshot>(EMPTY_SUBSCRIPTION);
  const [checkingSub, setCheckingSub] = useState<boolean>(false);
  const [billingBusy, setBillingBusy] = useState<boolean>(false);

  const [upgradeOpen, setUpgradeOpen] = useState<boolean>(false);
  const [lockedFeatureLabel, setLockedFeatureLabel] = useState<string>(
    "Full FocusWaves Pro Suite"
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        FOUNDER_STORAGE_KEY,
        founderUnlocked ? "true" : "false"
      );
    } catch {
      // Ignore storage errors
    }
  }, [founderUnlocked]);

  const refreshSubscription = useCallback(async () => {
    if (!user || !isConfigured) {
      setSubscription(EMPTY_SUBSCRIPTION);
      return;
    }
    setCheckingSub(true);
    try {
      const data = await apiGet<SubscriptionSnapshot>("/api/subscription-status");
      setSubscription(data);
    } catch (err) {
      console.error("Subscription check failed:", err);
    } finally {
      setCheckingSub(false);
    }
  }, [user, isConfigured]);

  useEffect(() => {
    void refreshSubscription();
  }, [refreshSubscription]);

  const startCheckout = useCallback(async (plan: BillingPlan) => {
    setBillingBusy(true);
    try {
      const { url } = await apiPost<{ url: string }>("/api/create-checkout-session", {
        plan,
      });
      if (!url) {
        throw new Error("Checkout URL was not returned.");
      }
      window.location.href = url;
    } finally {
      setBillingBusy(false);
    }
  }, []);

  const openManageSubscription = useCallback(async () => {
    setBillingBusy(true);
    try {
      const { url } = await apiPost<{ url: string }>("/api/create-portal-session", {});
      if (!url) {
        throw new Error("Billing portal URL was not returned.");
      }
      window.location.href = url;
    } finally {
      setBillingBusy(false);
    }
  }, []);

  const openUpgrade = useCallback((featureLabel?: string) => {
    setLockedFeatureLabel(featureLabel || "Full FocusWaves Pro Suite");
    setUpgradeOpen(true);
  }, []);

  const closeUpgrade = useCallback(() => {
    setUpgradeOpen(false);
  }, []);

  const redeemAccessKey = useCallback((rawKey: string): boolean => {
    const normalized = rawKey.trim().toUpperCase();
    if (VALID_FOUNDER_KEYS.has(normalized)) {
      setFounderUnlocked(true);
      setUpgradeOpen(false);
      return true;
    }
    return false;
  }, []);

  const revokeFounderAccess = useCallback(() => {
    setFounderUnlocked(false);
  }, []);

  const isPro = subscription.isPro || founderUnlocked;

  return {
    isPro,
    founderUnlocked,
    subscription,
    checkingSub,
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
  };
}
