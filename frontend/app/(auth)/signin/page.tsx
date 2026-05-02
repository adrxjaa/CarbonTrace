"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthSidePanel } from "@/components/auth/side-panel";

const inputClass =
  "w-full bg-[#0c1a14] border border-white/10 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all duration-200";

const labelClass =
  "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Invalid email or password.");
      } else {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem("ct_user", JSON.stringify(data.user));
        if (remember) localStorage.setItem("remember_email", email);
        
        if (data.user.role === "admin") {
          window.location.href = "/admin/dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }
    } catch {
      setError("Could not connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center lg:justify-start p-6 lg:pl-20">
      <div className="w-full max-w-md lg:max-w-[440px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#1D9E75]/20 border border-[#1D9E75]/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-4 h-4">
                <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
              </svg>
            </div>
            <span className="font-semibold text-white tracking-tight">CarbonTrace</span>
          </div>
          <p className="text-white/40 text-sm">Verify your climate impact</p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-[28px] p-7 sm:p-9"
          style={{
            background: "rgba(17,28,24,0.72)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-white/40 text-sm">Enter your credentials to access the terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="signin-email" className={labelClass}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                  <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                </svg>
                Email Address
              </label>
              <input id="signin-email" type="email" placeholder="name@organization.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputClass} required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="signin-password" className={`${labelClass} mb-0`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Password
                </label>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1D9E75] hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <input id="signin-password" type="password" placeholder="••••••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className={inputClass} required />
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                role="switch"
                aria-checked={remember}
                id="signin-remember"
                onClick={() => setRemember(!remember)}
                className={`relative inline-flex h-5 w-10 shrink-0 rounded-full transition-colors duration-200 ${
                  remember ? "bg-[#1D9E75]" : "bg-white/15"
                }`}
              >
                <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                  remember ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
              <label htmlFor="signin-remember" className="text-sm text-white/50 cursor-pointer select-none">
                Remember this device
              </label>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              id="signin-submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#17896a] active:scale-[0.98] disabled:opacity-60 transition-all duration-200 shadow-[0_4px_20px_rgba(29,158,117,0.3)]"
            >
              {loading ? "Signing in…" : (
                <>
                  Sign In
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Enterprise SSO */}
          <div className="mt-7 pt-7 border-t border-white/8">
            <button
              type="button"
              className="w-full py-3 rounded-xl flex items-center justify-center gap-3 text-sm text-white/60 hover:text-white/80 transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
              Continue with Enterprise Identity
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-white/40 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#1D9E75] font-semibold hover:underline">
            Create organization profile
          </Link>
        </p>

        {/* Security badges */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-widest">AES-256 Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-widest">Node v4.2 Verified</span>
          </div>
        </div>
      </div>

      <AuthSidePanel />
    </main>
  );
}
