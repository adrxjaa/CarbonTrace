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

const PROVIDER_TYPES = [
  { value: "transit", label: "Public Transit" },
  { value: "ev", label: "EV Charging Network" },
  { value: "tree_nursery", label: "Tree Nursery" },
  { value: "recycling", label: "Recycling Facility" },
  { value: "other", label: "Other" },
];

export default function ProviderRegisterPage() {
  const [step, setStep] = useState(2); // Start at step 2 (Details) to match screenshot

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2 fields
  const [orgName, setOrgName] = useState("");
  const [providerType, setProviderType] = useState("");
  const [region, setRegion] = useState("");
  const [website, setWebsite] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docDragging, setDocDragging] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDocDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setDocFile(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!orgName.trim()) { setError("Organization name is required."); return; }
    if (!providerType) { setError("Select a provider type."); return; }
    if (!region.trim()) { setError("Operating region is required."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/providers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          org_name: orgName,
          provider_type: providerType,
          operating_region: region,
          website: website || null,
          contact_name: name || "Contact Person",
          contact_email: email || "contact@example.com",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Application failed. Please try again.");
      } else {
        setSubmitted(true);
        setStep(3);
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
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.25)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.6" className="w-7 h-7">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sustainable Provider Registration</h1>
          <p className="text-white/40 text-sm">Join the verified impact network.</p>
        </div>

        {/* Card */}
        <div
          className="rounded-[24px] overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,23,18,0.9)" }}
        >
          {/* Step indicator */}
          <div className="px-8 py-6 border-b border-white/8">
            <StepIndicator steps={STEPS} currentStep={step} />
          </div>

          {/* Form body */}
          <div className="p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#1D9E75]/20 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Application Submitted!</h2>
                <p className="text-white/50 text-sm max-w-md mx-auto">
                  Your application is under review. Our team will contact you within 3–5 business days.
                </p>
                <Link href="/signin" className="inline-block mt-6 px-6 py-3 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#17896a] transition-colors">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="prov-org-name" className={labelClass}>Organization Name</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
                      </svg>
                    </div>
                    <input id="prov-org-name" type="text" placeholder="e.g. EcoTransit Corp"
                      value={orgName} onChange={(e) => setOrgName(e.target.value)}
                      className={`${inputClass} pl-10`} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prov-type" className={labelClass}>Provider Type</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                        </svg>
                      </div>
                      <select id="prov-type" value={providerType} onChange={(e) => setProviderType(e.target.value)}
                        className={`${inputClass} pl-10 appearance-none cursor-pointer`} required>
                        <option value="" disabled className="bg-[#0c1a14]">Select Type...</option>
                        {PROVIDER_TYPES.map(t => (
                          <option key={t.value} value={t.value} className="bg-[#0c1a14]">{t.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="prov-region" className={labelClass}>Operating Region</label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                          <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                        </svg>
                      </div>
                      <input id="prov-region" type="text" placeholder="e.g. North America"
                        value={region} onChange={(e) => setRegion(e.target.value)}
                        className={`${inputClass} pl-10`} required />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="prov-website" className={labelClass}>Official Website</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                        <circle cx="12" cy="12" r="10" /><path d="M2 12h20" />
                      </svg>
                    </div>
                    <input id="prov-website" type="url" placeholder="https://www.example.com"
                      value={website} onChange={(e) => setWebsite(e.target.value)}
                      className={`${inputClass} pl-10`} />
                  </div>
                </div>

                {/* Document upload */}
                <div>
                  <label className={labelClass}>Business Registration Document</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDocDragging(true); }}
                    onDragLeave={() => setDocDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => document.getElementById("prov-doc-input")?.click()}
                    className={`rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                      docDragging ? "border-[#1D9E75] bg-[#1D9E75]/10" : "border-white/15 hover:border-white/30"
                    }`}
                    style={{ border: `2px dashed ${docDragging ? "#1D9E75" : "rgba(255,255,255,0.15)"}` }}
                  >
                    <input id="prov-doc-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                    {docFile ? (
                      <div className="flex items-center justify-center gap-3 text-[#1D9E75]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="text-sm font-medium">{docFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="w-10 h-10 mx-auto mb-3 text-white/20">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        <p className="text-sm text-white/40">
                          <span className="text-[#1D9E75] font-medium hover:underline">Upload a file</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-white/25 mt-1">PDF, JPG, PNG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20">
                    {error}
                  </div>
                )}

                <button type="submit" id="provider-submit" disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#17896a] active:scale-[0.98] disabled:opacity-60 transition-all duration-200 shadow-[0_4px_20px_rgba(29,158,117,0.3)]">
                  {loading ? "Submitting…" : (
                    <>
                      Continue to Verification
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-[#1D9E75]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-widest">AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 text-[#1D9E75]">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-widest">Node v4.2 Verified</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
