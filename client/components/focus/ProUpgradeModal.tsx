import { useState, type FormEvent } from "react";
import {
  Check,
  CreditCard,
  Crown,
  KeyRound,
  Loader2,
  Lock,
  Sparkles,
  X,
} from "lucide-react";
import type { BillingPlan, SubscriptionSnapshot } from "@/hooks/useProAccess";

interface ProUpgradeModalProps {
  open: boolean;
  featureLabel: string;
  isSignedIn: boolean;
  subscription: SubscriptionSnapshot;
  billingBusy: boolean;
  onClose: () => void;
  onStartCheckout: (plan: BillingPlan) => Promise<void>;
  onManageSubscription: () => Promise<void>;
  onNeedAuth: (pendingPlan: BillingPlan) => void;
  onRedeemKey: (key: string) => boolean;
}

const PRO_BENEFITS = [
  "All 15 calibrated neural protocols (Delta Sleep to 40 Hz Gamma)",
  "Speaker-safe Isochronic entrainment mode (no headphones needed)",
  "Full Brown, Pink & White acoustic masking mixer",
  "Extended 45m, 60m & Continuous focus blocks",
  "Distraction-Free Focus Mode & Brain-Dump Parking Lot",
  "Synced across Web, PWA & Android/iOS mobile app",
];

export function ProUpgradeModal({
  open,
  featureLabel,
  isSignedIn,
  subscription,
  billingBusy,
  onClose,
  onStartCheckout,
  onManageSubscription,
  onNeedAuth,
  onRedeemKey,
}: ProUpgradeModalProps) {
  // Annual selected first by default
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>("annual");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [keyError, setKeyError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  if (!open) return null;

  const handleCheckoutClick = async () => {
    setCheckoutError("");
    if (!isSignedIn) {
      onNeedAuth(selectedPlan);
      return;
    }
    try {
      await onStartCheckout(selectedPlan);
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Could not launch checkout."
      );
    }
  };

  const handlePortalClick = async () => {
    setCheckoutError("");
    try {
      await onManageSubscription();
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Could not open billing portal."
      );
    }
  };

  const handleRedeem = (e: FormEvent) => {
    e.preventDefault();
    const ok = onRedeemKey(accessKey);
    if (!ok) {
      setKeyError("Invalid founder access key.");
    } else {
      setAccessKey("");
      setKeyError("");
      setShowKeyInput(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#040712]/85 backdrop-blur-md p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
    >
      <div className="fw-card w-full max-w-xl rounded-2xl p-6 sm:p-7 space-y-5 relative border border-[#43B0F8]/35 shadow-[0_0_50px_rgba(67,176,248,0.2)] my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close upgrade dialog"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#97A7C0] hover:bg-white/10 hover:text-[#EEF4FA] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Triggered Feature Context */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E78A]/35 bg-[#D4E78A]/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D4E78A]">
          <Lock className="w-3 h-3" />
          Pro Feature · {featureLabel}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#43B0F8]/40 bg-[#43B0F8]/15 text-[#7AC8FF] shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h3
              id="pro-upgrade-title"
              className="text-xl sm:text-2xl font-display font-bold text-[#EEF4FA]"
            >
              Focus<span className="text-[#43B0F8]">Waves</span>{" "}
              <span className="text-[#D4E78A]">Pro</span>
            </h3>
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#97A7C0]">
              7-Day Free Trial · Cancel Anytime
            </p>
          </div>
        </div>

        {subscription.isPro ? (
          <div className="rounded-xl border border-[#43B0F8]/35 bg-[#070C1B] p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display font-bold text-[#EEF4FA]">
                Active Plan: {subscription.tier === "annual" ? "Annual ($49.99/yr)" : "Monthly ($7.99/mo)"}
              </span>
              <span className="rounded-md border border-[#D4E78A]/40 bg-[#D4E78A]/12 px-2 py-0.5 font-mono text-[10px] uppercase text-[#D4E78A]">
                {subscription.status}
              </span>
            </div>
            {subscription.currentPeriodEnd && (
              <p className="text-xs text-[#97A7C0] font-mono">
                {subscription.cancelAtPeriodEnd ? "Ends on " : "Renews on "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            <button
              type="button"
              disabled={billingBusy}
              onClick={handlePortalClick}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5AC4FF] to-[#349BE8] py-3 text-sm font-display font-bold text-[#070B18] hover:brightness-110 disabled:opacity-50 transition"
            >
              {billingBusy ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Manage Subscription
            </button>
          </div>
        ) : (
          <>
            {/* Plan Selector — Annual First (Default) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Annual Plan (First / Highlighted) */}
              <button
                type="button"
                onClick={() => setSelectedPlan("annual")}
                className={`relative text-left rounded-xl p-4 border transition ${
                  selectedPlan === "annual"
                    ? "border-[#43B0F8] bg-[#43B0F8]/14 shadow-[0_0_24px_rgba(67,176,248,0.2)]"
                    : "border-white/10 bg-[#070C1B] hover:border-white/25"
                }`}
              >
                <span className="absolute -top-2.5 right-3 rounded-full bg-[#D4E78A] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#070B18]">
                  Save ~48%
                </span>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#7AC8FF] mb-1">
                  Annual · Best Value
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-extrabold text-[#EEF4FA]">
                    $49.99
                  </span>
                  <span className="text-xs text-[#97A7C0]">/ year</span>
                </div>
                <p className="font-mono text-[11px] text-[#D4E78A] mt-1">
                  $4.17/mo · 7-day free trial
                </p>
              </button>

              {/* Monthly Plan */}
              <button
                type="button"
                onClick={() => setSelectedPlan("monthly")}
                className={`text-left rounded-xl p-4 border transition ${
                  selectedPlan === "monthly"
                    ? "border-[#43B0F8] bg-[#43B0F8]/14 shadow-[0_0_24px_rgba(67,176,248,0.2)]"
                    : "border-white/10 bg-[#070C1B] hover:border-white/25"
                }`}
              >
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#97A7C0] mb-1">
                  Monthly · Flexible
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-display font-extrabold text-[#EEF4FA]">
                    $7.99
                  </span>
                  <span className="text-xs text-[#97A7C0]">/ month</span>
                </div>
                <p className="font-mono text-[11px] text-[#97A7C0] mt-1">
                  7-day free trial · Cancel anytime
                </p>
              </button>
            </div>

            {/* Pro Checklist */}
            <ul className="space-y-2 rounded-xl border border-white/[0.08] bg-[#070C1B] p-4">
              {PRO_BENEFITS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-[#EEF4FA]"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#43B0F8]/20 text-[#7AC8FF]">
                    <Check className="w-3 h-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {checkoutError && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3.5 py-2 text-xs text-rose-200">
                {checkoutError}
              </div>
            )}

            {/* Primary Checkout CTA */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={billingBusy}
                onClick={handleCheckoutClick}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5AC4FF] to-[#349BE8] px-5 py-3 text-sm font-display font-bold text-[#070B18] hover:brightness-110 disabled:opacity-50 transition"
              >
                {billingBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Crown className="w-4 h-4" />
                )}
                {isSignedIn
                  ? `Start 7-Day Free Trial (${selectedPlan === "annual" ? "$49.99/yr" : "$7.99/mo"})`
                  : "Sign In & Start 7-Day Free Trial"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-[#0B1226] px-4 py-3 text-xs font-display font-semibold text-[#97A7C0] hover:text-[#EEF4FA] transition"
              >
                Stay on Free
              </button>
            </div>
          </>
        )}

        {/* Private Founder / Friends Key Drawer */}
        {!subscription.isPro && (
          <div className="border-t border-white/[0.08] pt-3.5">
            {!showKeyInput ? (
              <button
                type="button"
                onClick={() => setShowKeyInput(true)}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#6B7E9E] hover:text-[#D4E78A] transition"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Have a Founder or Friend Access Code?
              </button>
            ) : (
              <form onSubmit={handleRedeem} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accessKey}
                    onChange={(e) => {
                      setAccessKey(e.target.value);
                      if (keyError) setKeyError("");
                    }}
                    placeholder="Enter access code..."
                    className="flex-1 rounded-lg border border-[#43B0F8]/30 bg-[#070C1B] px-3 py-2 font-mono text-xs uppercase text-[#EEF4FA] placeholder:text-[#6B7E9E] focus:border-[#43B0F8] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4E78A] px-3.5 py-2 text-xs font-display font-bold text-[#070B18] hover:bg-[#E7F3B5] transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Redeem
                  </button>
                </div>
                {keyError && (
                  <p className="text-[11px] text-rose-400 font-mono">{keyError}</p>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
