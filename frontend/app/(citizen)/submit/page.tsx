"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiUpload } from "@/lib/api";

/* ── Activity Types ──────────────────────────────────────────────── */
const TYPES = [
  { id: "transit",       label: "Public Transit",    desc: "Bus, Train, Subway",       credits: "5 - 15 CT",  icon: <path d="M8 6v6M16 6v6M2 12h20M4 18v2m16-2v2M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" /> },
  { id: "ev_charge",     label: "EV Charging",       desc: "Electric Vehicle Charge",  credits: "20 - 50 CT", icon: <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="7" x2="12" y2="13" /><polyline points="9 11 12 13 15 11" /></> },
  { id: "tree_planting", label: "Tree Planting",     desc: "Verified sapling planted", credits: "100+ CT",    icon: <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" /> },
  { id: "recycling",     label: "Recycling",         desc: "Sorted waste drop-off",    credits: "2 - 10 CT",  icon: <><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-2.163l2.9-12.99A2 2 0 0 1 8.09 2h7.82a2 2 0 0 1 1.96 1.847l2.9 12.99A1.83 1.83 0 0 1 19.185 19H17" /><path d="M12 12v10" /><path d="m9 19 3 3 3-3" /></> },
  { id: "other",         label: "Solar Generation",  desc: "Grid contribution",        credits: "10 - 40 CT", icon: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" /></> },
];

const STEP_LABELS = ["Type", "Evidence", "Details", "Review"];

export default function SubmitPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [actType, setActType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [actDate, setActDate] = useState(new Date().toISOString().slice(0, 16));
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!actType) return;
    setSubmitting(true);
    try {
      const sub = await apiPost<{ id: string }>("/submissions", {
        activity_type: actType,
        activity_timestamp: new Date(actDate).toISOString(),
        metadata_json: {},
        location: location || null,
      });
      if (file) {
        await apiUpload(`/submissions/${sub.id}/upload`, file);
      }
      router.push("/activities");
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-4xl mx-auto pt-12 pb-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="mb-10">
        <h2 className="text-[48px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#e1e3e0] mb-2">
          Submit Activity
        </h2>
        <p className="text-[#bccac1] text-base">
          Log your environmental impact for blockchain verification.
        </p>
      </header>

      {/* ── Multi-step Indicator ────────────────────────────── */}
      <div className="mb-12 relative">
        {/* Track */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-[#1d201f] -translate-y-1/2 rounded-full" />
        {/* Progress fill */}
        <div className="absolute top-1/2 left-0 h-1 bg-[#1D9E75] -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }} />
        {/* Step circles */}
        <div className="relative flex justify-between items-center z-10">
          {STEP_LABELS.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  done
                    ? "bg-[#1D9E75] text-[#003827] shadow-[0_0_15px_rgba(104,219,174,0.4)]"
                    : active
                      ? "bg-[#1D9E75] text-[#003827] shadow-[0_0_15px_rgba(104,219,174,0.4)]"
                      : "bg-[#1d201f] border border-[rgba(255,255,255,0.08)] text-[#bccac1]"
                }`}>
                  {done ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-xs font-semibold ${done || active ? "text-[#1D9E75]" : "text-[#bccac1]"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step 0: Select Activity Type ────────────────────── */}
      {step === 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#e1e3e0]">Select Activity Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TYPES.map((t) => {
              const selected = actType === t.id;
              return (
                <button key={t.id} onClick={() => setActType(t.id)}
                  className={`relative overflow-hidden text-left rounded-2xl p-6 flex flex-col gap-4 transition-all group ${
                    selected
                      ? "bg-[#1d201f]/50 backdrop-blur-xl border border-[#1D9E75]/30 shadow-[0_4px_20px_rgba(104,219,174,0.05)]"
                      : "bg-[#1d201f]/50 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] hover:bg-[#1d201f] hover:border-[#1D9E75]/50"
                  }`}>
                  {/* Decorative corner blob for selected */}
                  {selected && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#1D9E75]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                  )}
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 z-10 transition-colors ${
                    selected ? "bg-[#1D9E75]/20 text-[#1D9E75]" : "bg-[#323534] text-[#bccac1] group-hover:bg-[#1D9E75]/20 group-hover:text-[#1D9E75]"
                  }`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      {t.icon}
                    </svg>
                  </div>
                  {/* Text */}
                  <div className="z-10">
                    <h4 className="font-bold text-lg text-[#e1e3e0] mb-1">{t.label}</h4>
                    <p className="text-[#bccac1] text-sm mb-4">{t.desc}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border transition-colors ${
                      selected
                        ? "bg-[#026951]/30 text-[#84d6b9] border-[#84d6b9]/20"
                        : "bg-[#323534] text-[#bccac1] border-[rgba(255,255,255,0.08)] group-hover:border-[#84d6b9]/20 group-hover:text-[#84d6b9] group-hover:bg-[#026951]/30"
                    }`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                        <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
                      </svg>
                      <span className="font-mono text-sm tracking-wider font-medium">{t.credits}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end">
            <button onClick={() => actType && setStep(1)} disabled={!actType}
              className="bg-[#1D9E75] text-[#003827] px-8 py-3 rounded-xl font-bold hover:bg-[#68dbae] transition-all shadow-[0_0_15px_rgba(104,219,174,0.3)] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              Continue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 1: Upload Evidence ─────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#e1e3e0]">Upload Evidence</h3>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
            className="border-2 border-dashed border-[rgba(255,255,255,0.08)] hover:border-[#1D9E75]/40 rounded-2xl p-12 text-center transition-colors bg-[#1d201f]/30"
          >
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-10 h-10">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p className="text-[#e1e3e0] font-semibold">{file.name}</p>
                <button onClick={() => setFile(null)} className="text-sm text-[#ffb4ab] hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="#bccac1" strokeWidth="1.6" className="w-10 h-10">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-[#bccac1]">Drag & drop image or PDF, or click to browse</p>
                <p className="text-[#bccac1]/60 text-xs">JPG, PNG, WebP, PDF — max 10 MB</p>
              </div>
            )}
            <input type="file" accept="image/*,.pdf" className="hidden" id="evidence-upload"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {!file && (
              <label htmlFor="evidence-upload"
                className="mt-4 inline-block px-6 py-2 rounded-lg bg-[#1d201f] border border-[rgba(255,255,255,0.08)] text-[#bccac1] text-sm cursor-pointer hover:bg-[#272b29] transition-colors">
                Browse Files
              </label>
            )}
          </div>
          <p className="text-xs text-[#bccac1]/60">Upload within 4 hours for faster verification.</p>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(0)} className="text-[#bccac1] hover:text-[#e1e3e0] transition-colors px-6 py-3 rounded-xl font-medium">← Back</button>
            <button onClick={() => setStep(2)}
              className="bg-[#1D9E75] text-[#003827] px-8 py-3 rounded-xl font-bold hover:bg-[#68dbae] transition-all shadow-[0_0_15px_rgba(104,219,174,0.3)] flex items-center gap-2">
              Continue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Add Details ─────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#e1e3e0]">Add Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-[#bccac1] uppercase tracking-wider mb-2">Date & Time</label>
              <input type="datetime-local" value={actDate} onChange={(e) => setActDate(e.target.value)}
                className="w-full bg-[#1d201f] border border-[rgba(255,255,255,0.08)] text-[#e1e3e0] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1D9E75]/50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#bccac1] uppercase tracking-wider mb-2">Location</label>
              <input type="text" placeholder="City, Country" value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#1d201f] border border-[rgba(255,255,255,0.08)] text-[#e1e3e0] rounded-lg px-4 py-3 text-sm placeholder-[#bccac1]/40 focus:outline-none focus:border-[#1D9E75]/50" />
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="text-[#bccac1] hover:text-[#e1e3e0] transition-colors px-6 py-3 rounded-xl font-medium">← Back</button>
            <button onClick={() => setStep(3)}
              className="bg-[#1D9E75] text-[#003827] px-8 py-3 rounded-xl font-bold hover:bg-[#68dbae] transition-all shadow-[0_0_15px_rgba(104,219,174,0.3)] flex items-center gap-2">
              Continue
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Review & Submit ─────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-[#e1e3e0]">Review & Submit</h3>
          <div className="bg-[#1d201f]/50 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 space-y-4 max-w-lg">
            {[
              ["Activity Type", TYPES.find(t => t.id === actType)?.label ?? actType],
              ["Date & Time", new Date(actDate).toLocaleString()],
              ["Location", location || "Not specified"],
              ["Evidence", file?.name ?? "No file uploaded"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center border-b border-[rgba(255,255,255,0.04)] pb-3 last:border-0 last:pb-0">
                <span className="text-[#bccac1] text-sm">{k}</span>
                <span className="text-[#e1e3e0] text-sm font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#bccac1]/60">
            Fraudulent submissions may result in account suspension.
          </p>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(2)} className="text-[#bccac1] hover:text-[#e1e3e0] transition-colors px-6 py-3 rounded-xl font-medium">← Back</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-[#1D9E75] text-[#003827] px-8 py-3 rounded-xl font-bold hover:bg-[#68dbae] transition-all shadow-[0_0_15px_rgba(104,219,174,0.3)] flex items-center gap-2 disabled:opacity-50">
              {submitting ? "Submitting…" : "Submit for Verification"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
