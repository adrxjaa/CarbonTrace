"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/api";

type AuditEntry = {
  id: string;
  user_id: string;
  activity_type: string;
  status: string;
  flag_reason: string | null;
  verification_confidence: number | null;
  tx_hash: string | null;
  on_chain: boolean;
  created_at: string;
  activity_timestamp: string;
};

type AuditRes = {
  items: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

const STATUS_COLORS: Record<string, { dot: string; text: string }> = {
  VERIFIED: { dot: "bg-status-verified", text: "text-status-verified" },
  PENDING:  { dot: "bg-status-pending",  text: "text-status-pending" },
  FLAGGED:  { dot: "bg-status-flagged",  text: "text-status-flagged" },
  REJECTED: { dot: "bg-on-surface-variant", text: "text-on-surface-variant" },
};

function statusLabel(entry: AuditEntry): string {
  if (entry.status === "VERIFIED") return "Submission Verified";
  if (entry.status === "FLAGGED")  return entry.flag_reason ? `Flagged: ${entry.flag_reason.slice(0, 40)}` : "Submission Flagged";
  if (entry.status === "REJECTED") return "Submission Rejected";
  return "Submission Pending Review";
}

function actionIcon(status: string): string {
  if (status === "VERIFIED") return "check_circle";
  if (status === "FLAGGED")  return "flag";
  if (status === "REJECTED") return "cancel";
  return "pending_actions";
}

const STATUS_FILTERS = ["All", "VERIFIED", "PENDING", "FLAGGED", "REJECTED"] as const;

export default function AuditLogPage() {
  const [data, setData] = useState<AuditRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const load = useCallback(async (p: number, sf: string, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), page_size: "20" });
      if (sf !== "All") params.set("status", sf);
      if (q) params.set("search", q);
      const res = await apiGet<AuditRes>(`/submissions/admin/audit?${params}`);
      setData(res);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, statusFilter, search); }, [page, statusFilter, load]);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };
  const handleFilter = (f: string) => { setStatusFilter(f); setPage(1); };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(1, statusFilter, search), 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  return (
    <div className="flex-1 p-container-padding bg-surface-dark min-h-screen">
      <header className="flex justify-between items-end mb-section-gap">
        <div>
          <h2 className="font-display-hero text-display-hero text-on-surface mb-2">System Audit Log</h2>
          <p className="font-body-main text-body-main text-on-surface-variant max-w-2xl">
            Live record of all submission events — verified, pending, flagged, and rejected — pulled directly from the database.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg border border-glass-border">
          <span className="material-symbols-outlined text-primary text-sm">sync</span>
          <span className="font-data-mono text-data-mono text-primary">Live Sync</span>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input
            className="w-full pl-10 pr-4 py-3 bg-surface-container border border-glass-border rounded-xl font-body-main text-body-main text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="Search by submission ID, user ID, or activity type..."
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => handleFilter(f)}
              className={`px-4 py-2 rounded-lg font-chip-label text-chip-label transition-colors border ${statusFilter === f
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-surface-container border-glass-border text-on-surface-variant hover:text-on-surface"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-surface-container/50 backdrop-blur-xl border border-glass-border rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[1.2fr_1.2fr_2fr_1.2fr_1.2fr_auto] gap-4 p-5 border-b border-glass-border bg-surface-container/30">
          {["Timestamp (UTC)", "User ID", "Action / Event", "Activity", "TX Hash", ""].map(h => (
            <div key={h} className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-glass-border">
            {data?.items.map((entry, i) => {
              const sc = STATUS_COLORS[entry.status] ?? STATUS_COLORS.PENDING;
              return (
                <div key={entry.id}
                  className={`grid grid-cols-1 md:grid-cols-[1.2fr_1.2fr_2fr_1.2fr_1.2fr_auto] gap-4 p-5 items-center hover:bg-surface-container/40 transition-colors ${i % 2 === 1 ? "bg-surface-container-low/10" : ""}`}>

                  {/* Timestamp */}
                  <div className="font-data-mono text-data-mono text-on-surface text-sm">
                    {new Date(entry.created_at).toISOString().replace("T", " ").slice(0, 19)}
                  </div>

                  {/* User ID */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-chip-label text-[10px] shrink-0">
                      {entry.user_id.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-data-mono text-data-mono text-on-surface-variant text-xs truncate">{entry.user_id.slice(0, 12)}…</span>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${sc.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>{actionIcon(entry.status)}</span>
                    <span className={`font-body-main text-body-main text-sm ${sc.text}`}>{statusLabel(entry)}</span>
                  </div>

                  {/* Activity Type */}
                  <div className="font-data-mono text-data-mono text-on-surface-variant text-sm capitalize">
                    {entry.activity_type.replace(/_/g, " ")}
                  </div>

                  {/* TX Hash */}
                  <div className="font-data-mono text-data-mono text-on-surface-variant text-xs">
                    {entry.tx_hash ? `${entry.tx_hash.slice(0, 8)}…${entry.tx_hash.slice(-4)}` : "—"}
                  </div>

                  {/* Confidence badge */}
                  <div>
                    {entry.verification_confidence != null && (
                      <span className={`px-2 py-0.5 rounded text-[11px] font-data-mono border ${
                        entry.verification_confidence >= 80 ? "bg-status-verified/10 text-status-verified border-status-verified/20"
                          : entry.verification_confidence >= 50 ? "bg-status-pending/10 text-status-pending border-status-pending/20"
                          : "bg-status-flagged/10 text-status-flagged border-status-flagged/20"
                      }`}>
                        CF: {entry.verification_confidence}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {data?.items.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-3 text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl opacity-40">manage_search</span>
                <p className="font-medium">No audit entries found.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && (
          <div className="p-5 border-t border-glass-border flex justify-between items-center bg-surface-container/30">
            <span className="font-body-main text-body-main text-on-surface-variant text-sm">
              Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total.toLocaleString()} entries
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-10 h-10 rounded-lg border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(3, data.total_pages) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center font-data-mono text-sm transition-colors ${page === n
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "border-glass-border text-on-surface hover:bg-surface-container"}`}>
                  {n}
                </button>
              ))}
              {data.total_pages > 3 && <span className="flex items-center px-2 text-on-surface-variant">…</span>}
              <button onClick={() => setPage(p => Math.min(data.total_pages, p + 1))} disabled={page >= data.total_pages}
                className="w-10 h-10 rounded-lg border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
