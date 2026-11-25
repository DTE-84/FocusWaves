import { useState, type FormEvent } from "react";
import { Check, Crown, KeyRound, Lock, Mail, Sparkles, X } from "lucide-react";

interface ProUpgradeModalProps {
  open: boolean;
  featureLabel: string;
  onClose: () => void;
  onRedeemKey: (key: string) => boolean;
}

const PRO_BENEFITS = [
  "All 15 calibrated neural protocols (Delta Sleep to 40 Hz Gamma)",
  "Speaker-safe Isochronic entrainment mode (no headphones required)",
  "Full Brown, Pink & White acoustic masking mixer",
  "Extended 45m, 60m & Continuous focus blocks",
  "Distraction-Free Focus Mode & Brain-Dump Parking Lot",
  "Native Android & iOS mobile app access when released",
];

export function ProUpgradeModal({
  open,
  featureLabel,
  onClose,
  onRedeemKey,
}: ProUpgradeModalProps) {
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [keyError, setKeyError] = useState("");

  if (!open) return null;

  const handleRedeem = (e: FormEvent) => {
    e.preventDefault();
    const ok = onRedeemKey(accessKey);
    if (!ok) {
      setKeyError("Invalid access key. Double-check your code and try again.");
    } else {
      setAccessKey("");
      setKeyError("");
      setShowKeyInput(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#040712]/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-upgrade-title"
    >
      <div className="fw-card w-full max-w-lg rounded-2xl p-6 sm:p-7 space-y-5 relative border border-[#43B0F8]/35 shadow-[0_0_50px_rgba(67,176,248,0.2)]">
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

        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#43B0F8]/40 bg-[#43B0F8]/15 text-[#7AC8FF]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="pro-upgrade-title"
                className="text-xl sm:text-2xl font-display font-bold text-[#EEF4FA]"
              >
                Unlock Focus<span className="text-[#43B0F8]">Waves</span>{" "}
                <span className="text-[#D4E78A]">Pro</span>
              </h3>
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#97A7C0]">
                Founding Access · Pricing Releasing Soon
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-[#97A7C0] leading-relaxed">
          You&apos;re currently using the <strong className="text-[#EEF4FA]">Free Preview</strong> (3 core protocols, Binaural + Brown Noise, 15m/25m sprints). Upgrade to unlock the full ADHD acoustic studio and executive workspace.
        </p>

        {/* Pro Checklist */}
        <ul className="space-y-2.5 rounded-xl border border-white/[0.08] bg-[#070C1B] p-4">
          {PRO_BENEFITS.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#EEF4FA]">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#43B0F8]/20 text-[#7AC8FF]">
                <Check className="w-3 h-3" />
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Primary CTA — Early Access / Waitlist until Checkout is wired */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href="mailto:dte.solutions.llc@gmail.com?subject=FocusWaves%20Pro%20Founding%20Access&body=Hi%20Drew%2C%20please%20notify%20me%20when%20FocusWaves%20Pro%20opens%20for%20Founding%20Access!"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5AC4FF] to-[#349BE8] px-5 py-3 text-sm font-display font-bold text-[#070B18] hover:brightness-110 transition"
          >
            <Mail className="w-4 h-4" />
            Request Founding Access
          </a>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/12 bg-[#0B1226] px-4 py-3 text-xs font-display font-semibold text-[#97A7C0] hover:text-[#EEF4FA] transition"
          >
            Continue Free Preview
          </button>
        </div>

        {/* Founder / Beta Key Drawer */}
        <div className="border-t border-white/[0.08] pt-3.5">
          {!showKeyInput ? (
            <button
              type="button"
              onClick={() => setShowKeyInput(true)}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#6B7E9E] hover:text-[#D4E78A] transition"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Have a Founder or Beta Access Key?
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
                  placeholder="Enter access key..."
                  className="flex-1 rounded-lg border border-[#43B0F8]/30 bg-[#070C1B] px-3 py-2 font-mono text-xs uppercase text-[#EEF4FA] placeholder:text-[#6B7E9E] focus:border-[#43B0F8] focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4E78A] px-3.5 py-2 text-xs font-display font-bold text-[#070B18] hover:bg-[#E7F3B5] transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Unlock
                </button>
              </div>
              {keyError && (
                <p className="text-[11px] text-rose-400 font-mono">{keyError}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
