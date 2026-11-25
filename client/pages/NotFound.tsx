import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Radio } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#070B18] text-[#EEF4FA] flex items-center justify-center px-4">
      <div className="fw-card max-w-md w-full rounded-2xl p-8 text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#43B0F8]/35 bg-[#43B0F8]/12 text-[#7AC8FF]">
          <Radio className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4E78A]">
            Signal Lost · 404
          </p>
          <h1 className="text-3xl font-display font-bold">Frequency Not Found</h1>
          <p className="text-sm text-[#97A7C0]">
            The route <code className="font-mono text-xs text-[#7AC8FF]">{location.pathname}</code> does not exist in FocusWaves.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#43B0F8] px-5 py-2.5 text-sm font-display font-bold text-[#070B18] hover:bg-[#6EC5FF] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Console
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
