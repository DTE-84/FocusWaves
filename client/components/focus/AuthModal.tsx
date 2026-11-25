import { useState, type FormEvent } from "react";
import { Loader2, LogIn, Mail, ShieldCheck, UserPlus, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  open: boolean;
  subtitle?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = "signin" | "signup" | "reset";

export function AuthModal({ open, subtitle, onClose, onSuccess }: AuthModalProps) {
  const {
    isConfigured,
    signInWithPassword,
    signUp,
    signInWithGoogle,
    sendPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (mode === "reset") {
        const res = await sendPasswordReset(email.trim());
        if (res.error) setError(res.error);
        else setNotice("Password reset link sent. Check your inbox.");
      } else if (mode === "signup") {
        const res = await signUp(email.trim(), password);
        if (res.error) {
          setError(res.error);
        } else if (res.needsEmailConfirm) {
          setNotice("Account created! Check your email to confirm, then sign in.");
        } else {
          onSuccess?.();
          onClose();
        }
      } else {
        const res = await signInWithPassword(email.trim(), password);
        if (res.error) {
          setError(res.error);
        } else {
          onSuccess?.();
          onClose();
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setBusy(true);
    const res = await signInWithGoogle();
    if (res.error) {
      setError(res.error);
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#040712]/85 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="fw-card w-full max-w-md rounded-2xl p-6 sm:p-7 space-y-5 relative border border-[#43B0F8]/35">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign in dialog"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[#97A7C0] hover:bg-white/10 hover:text-[#EEF4FA] transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4E78A]">
            <ShieldCheck className="w-3.5 h-3.5" />
            FocusWaves Account
          </div>
          <h3 id="auth-modal-title" className="text-xl font-display font-bold text-[#EEF4FA]">
            {mode === "signin"
              ? "Sign in to FocusWaves"
              : mode === "signup"
              ? "Create your FocusWaves account"
              : "Reset your password"}
          </h3>
          <p className="text-xs sm:text-sm text-[#97A7C0]">
            {subtitle || "Sync your Pro subscription across web, PWA, and mobile devices."}
          </p>
        </div>

        {!isConfigured && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2.5 text-xs text-amber-200">
            Supabase environment variables aren&apos;t configured on this deployment yet. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel to enable sign-in.
          </div>
        )}

        {/* Mode Switcher */}
        {mode !== "reset" && (
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#070C1B] p-1 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
                setNotice("");
              }}
              className={`rounded-lg py-2 text-xs font-display font-bold transition ${
                mode === "signin"
                  ? "bg-[#43B0F8] text-[#070B18]"
                  : "text-[#97A7C0] hover:text-[#EEF4FA]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setNotice("");
              }}
              className={`rounded-lg py-2 text-xs font-display font-bold transition ${
                mode === "signup"
                  ? "bg-[#43B0F8] text-[#070B18]"
                  : "text-[#97A7C0] hover:text-[#EEF4FA]"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#97A7C0]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#43B0F8]/25 bg-[#070C1B] px-3.5 py-2.5 text-sm text-[#EEF4FA] placeholder:text-[#6B7E9E] focus:border-[#43B0F8] focus:outline-none"
            />
          </div>

          {mode !== "reset" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#97A7C0]">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError("");
                      setNotice("");
                    }}
                    className="font-mono text-[10px] text-[#7AC8FF] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-[#43B0F8]/25 bg-[#070C1B] px-3.5 py-2.5 text-sm text-[#EEF4FA] placeholder:text-[#6B7E9E] focus:border-[#43B0F8] focus:outline-none"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-lg border border-[#D4E78A]/35 bg-[#D4E78A]/10 px-3 py-2 text-xs text-[#D4E78A]">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !isConfigured}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5AC4FF] to-[#349BE8] py-3 text-sm font-display font-bold text-[#070B18] hover:brightness-110 disabled:opacity-50 transition"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "signup" ? (
              <UserPlus className="w-4 h-4" />
            ) : mode === "reset" ? (
              <Mail className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {mode === "signin"
              ? "Sign In"
              : mode === "signup"
              ? "Create Account"
              : "Send Reset Link"}
          </button>
        </form>

        {mode !== "reset" ? (
          <>
            <div className="relative flex items-center justify-center">
              <span className="w-full border-t border-white/[0.08]" />
              <span className="bg-[#0F172D] px-3 font-mono text-[10px] uppercase tracking-wider text-[#6B7E9E]">
                or
              </span>
              <span className="w-full border-t border-white/[0.08]" />
            </div>

            <button
              type="button"
              disabled={busy || !isConfigured}
              onClick={handleGoogle}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0B1226] py-2.5 text-xs font-display font-semibold text-[#EEF4FA] hover:border-[#43B0F8]/45 disabled:opacity-50 transition"
            >
              Continue with Google
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setNotice("");
            }}
            className="w-full text-center font-mono text-xs text-[#97A7C0] hover:text-[#EEF4FA] transition"
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  );
}
