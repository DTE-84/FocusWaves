import { Download, Share, Smartphone, X } from "lucide-react";

interface InstallAppDialogProps {
  open: boolean;
  isIOS: boolean;
  onClose: () => void;
}

export function InstallAppDialog({ open, isIOS, onClose }: InstallAppDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040712]/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-dialog-title"
    >
      <div className="fw-card w-full max-w-md rounded-2xl p-6 space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close install instructions"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#97A7C0] hover:bg-white/10 hover:text-[#EEF4FA] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#43B0F8]/35 bg-[#43B0F8]/12 text-[#7AC8FF]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#D4E78A]">
              Installable Mobile App
            </div>
            <h3
              id="install-dialog-title"
              className="text-lg font-display font-bold text-[#EEF4FA]"
            >
              Add FocusWaves to Your Device
            </h3>
          </div>
        </div>

        <p className="text-sm text-[#97A7C0] leading-relaxed">
          Install FocusWaves as a standalone full-screen app with offline access, lock-screen media controls, and zero browser bars.
        </p>

        {isIOS ? (
          <ol className="space-y-3 rounded-xl border border-[#43B0F8]/20 bg-[#070C1B] p-4 text-xs sm:text-sm text-[#EEF4FA]">
            <li className="flex items-start gap-2.5">
              <span className="font-mono text-[#D4E78A] font-bold">01.</span>
              <span>
                Tap the <strong className="inline-flex items-center gap-1 text-[#7AC8FF]">Share <Share className="w-3.5 h-3.5 inline" /></strong> button in Safari&apos;s bottom bar.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-mono text-[#D4E78A] font-bold">02.</span>
              <span>
                Scroll down and tap <strong className="text-[#7AC8FF]">Add to Home Screen</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-mono text-[#D4E78A] font-bold">03.</span>
              <span>
                Tap <strong className="text-[#D4E78A]">Add</strong> to launch FocusWaves full-screen from your Home Screen.
              </span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-3 rounded-xl border border-[#43B0F8]/20 bg-[#070C1B] p-4 text-xs sm:text-sm text-[#EEF4FA]">
            <li className="flex items-start gap-2.5">
              <span className="font-mono text-[#D4E78A] font-bold">01.</span>
              <span>
                Open your browser menu (<strong>⋮</strong> in Chrome/Android or the install icon in the desktop address bar).
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-mono text-[#D4E78A] font-bold">02.</span>
              <span>
                Select <strong className="inline-flex items-center gap-1 text-[#7AC8FF]"><Download className="w-3.5 h-3.5 inline" /> Install App</strong> or <strong>Add to Home Screen</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="font-mono text-[#D4E78A] font-bold">03.</span>
              <span>
                FocusWaves runs offline with zero sign-up and full local telemetry persistence.
              </span>
            </li>
          </ol>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-[#43B0F8] py-2.5 text-sm font-display font-bold text-[#070B18] hover:bg-[#6EC5FF] transition"
        >
          Got It
        </button>
      </div>
    </div>
  );
}
