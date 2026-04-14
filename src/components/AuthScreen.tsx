import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not sign in as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 245, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 245, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#00f5d4]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff6b9d]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-[fadeIn_0.5s_ease-out]">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00f5d4] to-[#ff6b9d] rounded-lg flex items-center justify-center shadow-lg shadow-[#00f5d4]/20">
              <svg className="w-7 h-7 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Vibe<span className="text-[#00f5d4]">Builder</span>
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm">
            // AI-powered app generation
          </p>
        </div>

        {/* Auth card */}
        <div
          className="bg-[#12121a]/80 backdrop-blur-xl border border-[#00f5d4]/20 rounded-2xl p-6 md:p-8 shadow-2xl shadow-[#00f5d4]/5 animate-[slideUp_0.5s_ease-out]"
          style={{
            boxShadow: '0 0 60px rgba(0, 245, 212, 0.1), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-[#0a0a0f] border border-[#00f5d4]/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] transition-all placeholder-gray-600"
                placeholder="hacker@matrix.io"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-[#0a0a0f] border border-[#00f5d4]/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00f5d4] to-[#00d4aa] text-[#0a0a0f] font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-[#00f5d4]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase tracking-wider text-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                flow === "signIn" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00f5d4]/20 to-transparent" />
            <span className="text-gray-500 text-xs font-mono">OR</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#00f5d4]/20 to-transparent" />
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="w-full mt-6 bg-[#0a0a0f] border border-[#ff6b9d]/30 text-[#ff6b9d] font-mono py-3 rounded-lg hover:bg-[#ff6b9d]/10 hover:border-[#ff6b9d]/50 transition-all disabled:opacity-50 text-sm"
          >
            Continue as Guest
          </button>

          <p className="mt-6 text-center text-gray-500 text-sm font-mono">
            {flow === "signIn" ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-[#00f5d4] hover:underline"
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-600 text-xs font-mono">
          Requested by @web-user · Built by @clonkbot
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
