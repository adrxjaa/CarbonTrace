"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type Sub = {
  id: string; activity_type: string; status: string;
  activity_timestamp: string; location: string | null;
  evidence_url: string | null; flag_reason: string | null;
  verification_confidence: number | null; created_at: string;
};
type ListRes = { items: Sub[]; total: number; page: number; total_pages: number };

const LABELS: Record<string, string> = {
  transit: "Public Transit Commute", ev_charge: "EV Charging Session",
  tree_planting: "Tree Planting Donation", recycling: "Recycling Drop-off", other: "Eco Activity",
};
const CREDITS: Record<string, number> = { transit: 18, ev_charge: 55, tree_planting: 30, recycling: 22, other: 15 };

const STATUS_COLORS: Record<string, { pill: string; dot: string; text: string; border?: string }> = {
  VERIFIED: { pill: "bg-[#10B981]/10 border-[#10B981]/20", dot: "bg-[#10B981]", text: "text-[#10B981]" },
  PENDING:  { pill: "bg-[#F59E0B]/10 border-[#F59E0B]/20", dot: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
  FLAGGED:  { pill: "bg-[#EF4444]/10 border-[#EF4444]/20", dot: "bg-[#EF4444]", text: "text-[#EF4444]", border: "border-[#EF4444]/20" },
  REJECTED: { pill: "bg-white/5 border-white/10", dot: "bg-white/40", text: "text-white/40" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.PENDING;
  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border ${c.pill}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-xs font-semibold tracking-wide uppercase ${c.text}`}>{status}</span>
    </div>
  );
}

function ActivityCircle({ type, flagged }: { type: string; flagged?: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    transit: <path d="M8 6v6M16 6v6M2 12h20M4 18v2m16-2v2M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />,
    ev_charge: <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="7" x2="12" y2="13" /><polyline points="9 11 12 13 15 11" /></>,
    tree_planting: <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />,
    recycling: <><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-2.163l2.9-12.99A2 2 0 0 1 8.09 2h7.82a2 2 0 0 1 1.96 1.847l2.9 12.99A1.83 1.83 0 0 1 19.185 19H17" /><path d="M12 12v10" /><path d="m9 19 3 3 3-3" /></>,
    other: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  };
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
      flagged ? "bg-[#ffb4ab]/10 text-[#ffb4ab]" : "bg-[#589d88]/20 text-[#8dd4bd]"
    }`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        {icons[type] ?? icons.other}
      </svg>
    </div>
  );
}

const STATUSES = ["", "VERIFIED", "PENDING", "FLAGGED", "REJECTED"] as const;
const TYPES = [
  { key: "", label: "All Types" },
  { key: "transit", label: "Public" },
  { key: "ev_charge", label: "EV" },
  { key: "tree_planting", label: "Tree" },
  { key: "recycling", label: "Recycling" },
] as const;

// Inner component — useSearchParams must be inside Suspense
function ActivitiesContent() {
  const params = useSearchParams();
  const [data, setData] = useState<ListRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams({ page_size: "20", page: String(page) });
    if (status) q.set("status", status);
    if (type) q.set("activity_type", type);
    apiGet<ListRes>(`/submissions?${q}`)
      .then(setData).catch(console.error).finally(() => setLoading(false));
  }, [status, type, page]);

  return (
    <div className="flex flex-col lg:flex-row gap-16 w-full pt-12 pb-12">
      {/* ── Left Panel (65%) ─────────────────────────────────── */}
      <div className="w-full lg:w-[65%] flex flex-col gap-6">
        <div className="flex flex-col gap-2 border-b border-[rgba(255,255,255,0.08)] pb-6">
          <div className="text-[#1D9E75] text-xs font-semibold tracking-widest uppercase">Verification Pipeline</div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-[#e1e3e0]">Activity History</h2>
            <button className="bg-[#1D9E75]/10 hover:bg-[#1D9E75]/20 text-[#1D9E75] border border-[#1D9E75]/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 self-start sm:self-auto">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === s ? "bg-[#1D9E75] text-[#111C18]" : "bg-[#1d201f] border border-[rgba(255,255,255,0.08)] text-[#e1e3e0] hover:bg-[#272b29]"
              }`}>
              {s || "All Statuses"}
            </button>
          ))}
          <div className="h-6 w-px bg-[rgba(255,255,255,0.08)] mx-1" />
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => { setType(t.key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t.key ? "bg-[#272b29] text-[#e1e3e0] border border-[rgba(255,255,255,0.08)]" : "bg-[#1d201f] border border-[rgba(255,255,255,0.08)] text-[#bccac1] hover:bg-[#272b29]"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Activity List */}
        <div className="flex flex-col gap-3">
          {loading && [...Array(4)].map((_, i) => (
            <div key={i} className="h-[72px] rounded-xl animate-pulse bg-white/[0.03]" />
          ))}
          {!loading && data?.items.map((sub) => {
            const isFlagged = sub.status === "FLAGGED";
            const isVerified = sub.status === "VERIFIED";
            return (
              <div key={sub.id}
                className={`bg-[#1d201f]/50 backdrop-blur-md border rounded-xl p-4 flex items-center justify-between hover:bg-[#1d201f] transition-colors group ${
                  isFlagged ? "border-[#ffb4ab]/20" : "border-[rgba(255,255,255,0.08)]"
                }`}>
                <div className="flex items-center gap-4">
                  <ActivityCircle type={sub.activity_type} flagged={isFlagged} />
                  <div>
                    <h3 className="font-medium text-[#e1e3e0]">{LABELS[sub.activity_type] ?? sub.activity_type}</h3>
                    <p className="text-[#bccac1] text-sm mt-0.5">
                      {new Date(sub.activity_timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {sub.location ? ` • ${sub.location}` : ""}
                      {sub.flag_reason ? ` • ${sub.flag_reason.slice(0, 40)}…` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <StatusPill status={sub.status} />
                  <div className="text-right">
                    {isVerified ? (
                      <div className="font-mono text-sm tracking-wider font-medium text-[#1D9E75]">+{CREDITS[sub.activity_type] ?? "?"}</div>
                    ) : isFlagged ? (
                      <div className="font-mono text-sm tracking-wider font-medium text-[#bccac1] line-through">+{CREDITS[sub.activity_type] ?? "?"}</div>
                    ) : sub.status === "PENDING" ? (
                      <div className="font-mono text-sm tracking-wider font-medium text-[#1D9E75]/70">+{CREDITS[sub.activity_type] ?? "?"}</div>
                    ) : (
                      <div className="font-mono text-sm tracking-wider font-medium text-[#bccac1]">--</div>
                    )}
                    <div className="text-[10px] text-[#bccac1] uppercase tracking-widest mt-1">Cr</div>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && data?.items.length === 0 && (
            <div className="py-16 text-center text-[#bccac1]">
              No submissions found.{" "}
              <Link href="/submit" className="text-[#1D9E75] underline">Submit your first activity →</Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg text-sm text-[#bccac1] bg-[#1d201f] border border-[rgba(255,255,255,0.08)] disabled:opacity-30 hover:bg-[#272b29] transition-colors">
              ← Prev
            </button>
            <span className="text-[#bccac1] text-sm">{page} / {data.total_pages}</span>
            <button disabled={page >= data.total_pages} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg text-sm text-[#bccac1] bg-[#1d201f] border border-[rgba(255,255,255,0.08)] disabled:opacity-30 hover:bg-[#272b29] transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Right Panel (35%) ────────────────────────────────── */}
      <div className="w-full lg:w-[35%] flex flex-col gap-6">
        <div className="flex flex-col gap-2 border-b border-[rgba(255,255,255,0.08)] pb-6">
          <div className="text-[#bccac1] text-xs font-semibold tracking-widest uppercase">Advisory</div>
          <h2 className="text-2xl font-bold text-[#e1e3e0]">What to improve next</h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-[#1D9E75]/5 border-l-4 border-[#1D9E75] rounded-r-xl p-5 flex gap-4 items-start">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-6 h-6 shrink-0 mt-0.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <p className="text-[#e1e3e0] text-sm leading-relaxed">Upload evidence within 4 hours for better verification speed.</p>
          </div>
          <div className="bg-[#1D9E75]/5 border-l-4 border-[#1D9E75] rounded-r-xl p-5 flex gap-4 items-start">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-6 h-6 shrink-0 mt-0.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <p className="text-[#e1e3e0] text-sm leading-relaxed">Bundle recurring transit rides into a weekly claim.</p>
          </div>
          <div className="bg-[#ffb4ab]/5 border-l-4 border-[#ffb4ab] rounded-r-xl p-5 flex gap-4 items-start">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffb4ab" strokeWidth="1.8" className="w-6 h-6 shrink-0 mt-0.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-[#e1e3e0] text-sm leading-relaxed">Resolve flagged activities before month close.</p>
              <Link href="/activities?status=FLAGGED"
                className="mt-3 text-xs font-semibold text-[#ffb4ab] hover:text-[#ffb4ab]/70 transition-colors uppercase tracking-wider block">
                Review Flags
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Outer page — wraps the content in Suspense to satisfy Next.js SSG rules
export default function ActivitiesPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center pt-24">
        <div className="w-8 h-8 rounded-full border-2 border-[#1D9E75] border-t-transparent animate-spin" />
      </div>
    }>
      <ActivitiesContent />
    </Suspense>
  );
}
