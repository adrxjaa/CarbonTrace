"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthSidePanel } from "@/components/auth/side-panel";

const inputClass =
  "w-full bg-[#0c1a14] border border-white/10 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all duration-200";

const labelClass =
  "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-2";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (name.trim().length < 2) { setError("Enter your full name."); return; }
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!/\d/.test(password)) { setError("Password must contain at least one digit."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (!agreed) { setError("Please agree to the terms to continue."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "citizen", location }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Registration failed. Please try again.");
      } else {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        setSuccess(true);
        setTimeout(() => { window.location.href = "/"; }, 1500);
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
        <div className="flex flex-col items-center mb-8">
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
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white mb-1">Join the Movement</h1>
            <p className="text-white/40 text-sm">Become a Citizen participant and track your impact.</p>
          </div>

          {success ? (
            <div className="py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-white font-semibold">Account created!</p>
              <p className="text-white/40 text-sm mt-1">Redirecting to dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className={labelClass}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  Full Name
                </label>
                <input id="signup-name" type="text" placeholder="Alex Sterling"
                  value={name} onChange={(e) => setName(e.target.value)}
                  className={inputClass} required />
              </div>

              <div>
                <label htmlFor="signup-email" className={labelClass}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                  </svg>
                  Email Address
                </label>
                <input id="signup-email" type="email" placeholder="alex@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputClass} required />
              </div>

              <div>
                <label htmlFor="signup-location" className={labelClass}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  Location
                </label>
                <input id="signup-location" type="text" placeholder="San Francisco, CA"
                  value={location} onChange={(e) => setLocation(e.target.value)}
                  className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="signup-password" className={labelClass}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Password
                  </label>
                  <input id="signup-password" type="password" placeholder="••••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className={inputClass} required />
                </div>
                <div>
                  <label htmlFor="signup-confirm" className={labelClass}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Confirm
                  </label>
                  <input id="signup-confirm" type="password" placeholder="••••••••••"
                    value={confirm} onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass} required />
                </div>
              </div>

              {/* Terms toggle */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  role="switch"
                  aria-checked={agreed}
                  id="signup-terms"
                  onClick={() => setAgreed(!agreed)}
                  className={`relative inline-flex h-5 w-10 shrink-0 rounded-full transition-colors duration-200 ${
                    agreed ? "bg-[#1D9E75]" : "bg-white/15"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow transition-transform duration-200 ${
                    agreed ? "translate-x-5" : "translate-x-0.5"
                  }`} />
                </button>
                <label htmlFor="signup-terms" className="text-sm text-white/50 cursor-pointer select-none">
                  I agree to the{" "}
                  <span className="text-[#1D9E75] hover:underline cursor-pointer">Terms</span>{" "}
                  and acknowledge program rules.
                </label>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                  {error}
                </div>
              )}

              <button
                type="submit"
                id="signup-submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#17896a] active:scale-[0.98] disabled:opacity-60 transition-all duration-200 shadow-[0_4px_20px_rgba(29,158,117,0.3)]"
              >
                {loading ? "Creating account…" : (
                  <>
                    Create Citizen Account
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-white/40 text-sm">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#1D9E75] font-semibold hover:underline">
            Login instead
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
            <span className="font-mono text-[10px] uppercase tracking-widest">Web3 Ready</span>
          </div>
        </div>
      </div>

      <AuthSidePanel />
    </main>
  );
}
