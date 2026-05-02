"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { StepIndicator } from "@/components/auth/step-indicator";

const inputClass =
  "w-full bg-[#0c1a14] border border-white/10 focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none transition-all duration-200";

const labelClass = "block text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-2";

const STEPS = [
  { label: "Account" },
  { label: "Details" },
  { label: "Verify" },
];

const INDUSTRY_SECTORS = [
  "Energy & Utilities",
  "Manufacturing",
  "Transportation & Logistics",
  "Real Estate & Construction",
  "Financial Services",
  "Technology",
  "Retail & Consumer Goods",
  "Agriculture & Food",
  "Healthcare",
  "Other",
];

export default function SponsorRegisterPage() {
  const [step] = useState(2); // Display step 2 matching screenshot

  const [entityName, setEntityName] = useState("");
  const [sector, setSector] = useState("");
  const [taxId, setTaxId] = useState("");
  const [website, setWebsite] = useState("");
  const [goals, setGoals] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!entityName.trim()) { setError("Entity name is required."); return; }
    if (!sector) { setError("Select an industry sector."); return; }
    if (!email.includes("@")) { setError("Enter a valid contact email."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/providers/sponsor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_name: entityName,
          industry_sector: sector,
          tax_id: taxId || null,
          corporate_website: website || null,
          sustainability_goals: goals || null,
          contact_email: email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Application failed. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Could not connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
            style={{ background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.2)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.6" className="w-7 h-7">
              <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Corporate Sponsor</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#1D9E75] shadow-[0_0_6px_rgba(29,158,117,0.8)]" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#1D9E75]">
              Secure Onboarding Pipeline
            </span>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-[24px] p-8"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,23,18,0.9)" }}
        >
          {/* Step indicator */}
          <div className="mb-8">
            <StepIndicator steps={STEPS} currentStep={step} />
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Partnership Request Sent!</h2>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                Our enterprise team will review your application and reach out to {email} within 3–5 business days.
              </p>
              <Link href="/signin" className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#17896a] transition-colors">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sponsor-entity" className={labelClass}>Entity Name</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                    <input id="sponsor-entity" type="text" placeholder="Enter legally registered name"
                      value={entityName} onChange={(e) => setEntityName(e.target.value)}
                      className={`${inputClass} pl-10`} required />
                  </div>
                </div>
                <div>
                  <label htmlFor="sponsor-sector" className={labelClass}>Industry Sector</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                    <select id="sponsor-sector" value={sector} onChange={(e) => setSector(e.target.value)}
                      className={`${inputClass} pl-10 appearance-none cursor-pointer`} required>
                      <option value="" disabled className="bg-[#0c1a14]">Select primary sector</option>
                      {INDUSTRY_SECTORS.map(s => (
                        <option key={s} value={s} className="bg-[#0c1a14]">{s}</option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sponsor-taxid" className={labelClass}>Tax ID / Entity Num</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <rect x="2" y="4" width="20" height="16" rx="2" /><line x1="6" y1="12" x2="18" y2="12" />
                      </svg>
                    </div>
                    <input id="sponsor-taxid" type="text" placeholder="XX-XXXXXXX"
                      value={taxId} onChange={(e) => setTaxId(e.target.value)}
                      className={`${inputClass} pl-10`} />
                  </div>
                </div>
                <div>
                  <label htmlFor="sponsor-website" className={labelClass}>Corporate Website</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" />
                      </svg>
                    </div>
                    <input id="sponsor-website" type="url" placeholder="https://www.example.com"
                      value={website} onChange={(e) => setWebsite(e.target.value)}
                      className={`${inputClass} pl-10`} />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="sponsor-email" className={labelClass}>Contact Email</label>
                <input id="sponsor-email" type="email" placeholder="sustainability@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className={inputClass} required />
              </div>

              <div>
                <label htmlFor="sponsor-goals" className={labelClass}>Sustainability Goals Summary</label>
                <textarea id="sponsor-goals" rows={4}
                  placeholder="Briefly describe your organization's environmental impact targets and commitment to carbon reduction..."
                  value={goals} onChange={(e) => setGoals(e.target.value)}
                  className={`${inputClass} resize-none`} />
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                  {error}
                </div>
              )}

              <button type="submit" id="sponsor-submit" disabled={loading}
                className="w-full py-4 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#17896a] active:scale-[0.98] disabled:opacity-60 transition-all duration-200 shadow-[0_4px_20px_rgba(29,158,117,0.3)]">
                {loading ? "Submitting…" : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Request Partnership
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer badges */}
        <div className="mt-5 flex items-center justify-center gap-6 opacity-35">
          <div className="flex items-center gap-1.5 text-white/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-[#1D9E75]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-widest">AES-256 Encrypted</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-1.5 text-white/50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-[#1D9E75]">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-widest">Node v4.2 Verified</span>
          </div>
        </div>
      </div>
    </main>
  );
}
