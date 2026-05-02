"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiFetch, API_BASE } from "@/lib/api";

type Submission = {
  id: string;
  user_id: string;
  activity_type: string;
  metadata_json: Record<string, unknown>;
  activity_timestamp: string;
  location: string | null;
  evidence_url: string | null;
  evidence_filename: string | null;
  status: string;
  verification_confidence: number | null;
  flag_reason: string | null;
  tx_hash: string | null;
  on_chain: boolean;
  created_at: string;
};

type ListResponse = {
  items: Submission[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  status_counts: Record<string, number>;
};

function activityIcon(type: string) {
  const map: Record<string, string> = {
    ev_charge: "ev_station", transit: "directions_bus", tree_planting: "forest",
    recycling: "recycling", bike_commute: "directions_bike", energy_bill: "bolt", other: "eco",
  };
  return map[type] ?? "eco";
}

function confidenceColor(score: number | null) {
  if (score === null) return "bg-surface-variant";
  if (score >= 80) return "bg-status-verified";
  if (score >= 50) return "bg-status-pending";
  return "bg-status-flagged";
}

function StatusChip({ status, reason }: { status: string; reason: string | null }) {
  const map: Record<string, string> = {
    FLAGGED: "bg-status-flagged/10 text-status-flagged border-status-flagged/20",
    PENDING: "bg-status-pending/10 text-status-pending border-status-pending/20",
    VERIFIED: "bg-status-verified/10 text-status-verified border-status-verified/20",
    REJECTED: "bg-surface-variant text-on-surface-variant border-glass-border",
  };
  const dotMap: Record<string, string> = {
    FLAGGED: "bg-status-flagged", PENDING: "bg-status-pending",
    VERIFIED: "bg-status-verified", REJECTED: "bg-on-surface-variant",
  };
  return (
    <span className={`px-3 py-1 rounded-full font-chip-label text-chip-label border flex items-center gap-1.5 ${map[status] ?? "bg-surface-variant text-on-surface-variant border-glass-border"}`}>
      <span className={`w-2 h-2 rounded-full ${dotMap[status] ?? "bg-on-surface-variant"}`} />
      {reason ?? status}
    </span>
  );
}

const FILTERS = ["All", "FLAGGED", "PENDING", "VERIFIED", "REJECTED"] as const;

/* ── Detail Drawer ─────────────────────────────────────────────────── */
function DetailDrawer({ sub, onClose, onStatusChange }: {
  sub: Submission;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const updateStatus = async (status: string) => {
    setBusy(true);
    try {
      const res = await apiFetch(`/submissions/admin/${sub.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, reason: note || undefined }),
      });
      if (res.ok) { onStatusChange(sub.id, status); onClose(); }
      else { const e = await res.json(); alert(e.detail ?? "Failed"); }
    } catch { alert("Network error"); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#111413] border border-glass-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-glass-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center border border-glass-border">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>{activityIcon(sub.activity_type)}</span>
            </div>
            <div>
              <h3 className="font-header-section text-on-surface capitalize">{sub.activity_type.replace(/_/g, " ")}</h3>
              <span className="font-data-mono text-xs text-on-surface-variant">{sub.id.slice(0, 16)}…</span>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Confidence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container/40 rounded-xl p-4 border border-glass-border">
              <span className="font-chip-label text-chip-label text-on-surface-variant block mb-2 uppercase tracking-wider">Status</span>
              <StatusChip status={sub.status} reason={null} />
            </div>
            <div className="bg-surface-container/40 rounded-xl p-4 border border-glass-border">
              <span className="font-chip-label text-chip-label text-on-surface-variant block mb-2 uppercase tracking-wider">AI Confidence</span>
              <span className="font-data-mono text-on-surface">{sub.verification_confidence != null ? `${sub.verification_confidence}%` : "Not scored"}</span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-surface-container/40 rounded-xl p-4 border border-glass-border space-y-3">
            <span className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider block mb-2">Details</span>
            {[
              ["User ID", sub.user_id],
              ["Activity Timestamp", new Date(sub.activity_timestamp).toLocaleString()],
              ["Location", sub.location ?? "—"],
              ["TX Hash", sub.tx_hash ?? "—"],
              ["On Chain", sub.on_chain ? "Yes" : "No"],
              ["Created At", new Date(sub.created_at).toLocaleString()],
              ["Flag Reason", sub.flag_reason ?? "—"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between items-start gap-2">
                <span className="text-on-surface-variant text-xs font-medium shrink-0">{label}</span>
                <span className="font-data-mono text-xs text-on-surface text-right break-all">{val}</span>
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="bg-surface-container/40 rounded-xl p-4 border border-glass-border">
            <span className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider block mb-2">Metadata</span>
            <div className="flex flex-wrap gap-1">
              {Object.entries(sub.metadata_json).map(([k, v]) => (
                <span key={k} className="font-data-mono text-[11px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          </div>

          {/* Evidence */}
          {sub.evidence_url && (
            <div className="bg-surface-container/40 rounded-xl p-4 border border-glass-border">
              <span className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider block mb-2">Evidence</span>
              <a href={`${API_BASE}${sub.evidence_url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                {sub.evidence_filename ?? "View Evidence"}
              </a>
            </div>
          )}

          {/* Admin Note */}
          <div>
            <label className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider block mb-2">Admin Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a reason or note..."
              rows={2}
              className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-2 text-sm text-on-surface placeholder-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button disabled={busy} onClick={() => updateStatus("VERIFIED")}
              className="flex-1 bg-status-verified/10 text-status-verified hover:bg-status-verified/20 border border-status-verified/30 py-2.5 rounded-xl font-chip-label text-chip-label transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">check_circle</span> Approve
            </button>
            <button disabled={busy} onClick={() => updateStatus("REJECTED")}
              className="flex-1 bg-status-flagged/10 text-status-flagged hover:bg-status-flagged/20 border border-status-flagged/30 py-2.5 rounded-xl font-chip-label text-chip-label transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">cancel</span> Reject
            </button>
            <button disabled={busy} onClick={() => updateStatus("FLAGGED")}
              className="flex-1 bg-surface-container/40 border border-glass-border hover:bg-white/5 text-on-surface py-2.5 rounded-xl font-chip-label text-chip-label transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">flag</span> Flag
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionsReviewPage() {
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);

  const load = useCallback(async (p: number, filter: string) => {
    setLoading(true);
    try {
      const statusParam = filter === "All" ? "" : `&status=${filter}`;
      const res = await apiGet<ListResponse>(`/submissions/admin/all?page=${p}&page_size=10${statusParam}`);
      setData(res);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, activeFilter); }, [page, activeFilter, load]);

  const handleFilter = (f: string) => { setActiveFilter(f); setPage(1); };

  const filtered = data?.items.filter(s =>
    !search || s.user_id.includes(search) || (s.tx_hash && s.tx_hash.includes(search))
  ) ?? [];

  const handleStatusChange = (id: string, newStatus: string) => {
    setData(prev => prev ? {
      ...prev,
      items: prev.items.map(s => s.id === id ? { ...s, status: newStatus } : s),
    } : prev);
  };

  const pending = data?.status_counts["PENDING"] ?? 0;
  const flagged = data?.status_counts["FLAGGED"] ?? 0;

  return (
    <div className="flex-1 p-container-padding h-full overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-dark via-background to-background">
      {selected && (
        <DetailDrawer sub={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
      )}
      <div className="max-w-[1600px] mx-auto space-y-section-gap">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-glass-border pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-status-flagged" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
              <span className="font-chip-label text-chip-label text-status-flagged tracking-wider uppercase">Action Required</span>
            </div>
            <h2 className="font-display-hero text-display-hero text-on-surface">Submissions Review</h2>
            <p className="font-body-main text-body-main text-on-surface-variant mt-2 max-w-2xl">Manual verification required for activities flagged by the automated compliance engine.</p>
          </div>
          <div className="bg-surface-container/40 backdrop-blur-[12px] border border-glass-border rounded-xl p-3 flex items-center gap-4">
            <div className="flex flex-col">
              <span className="font-chip-label text-chip-label text-on-surface-variant">Pending Queue</span>
              <span className="font-stat-value text-stat-value text-primary">{pending.toString().padStart(2, "0")}</span>
            </div>
            <div className="h-10 w-px bg-glass-border" />
            <div className="flex flex-col">
              <span className="font-chip-label text-chip-label text-on-surface-variant">Flagged</span>
              <span className="font-stat-value text-stat-value text-status-flagged">{flagged.toString().padStart(2, "0")}</span>
            </div>
          </div>
        </header>

        {/* Filter & Search */}
        <section className="bg-surface-container/40 backdrop-blur-[12px] border border-glass-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 font-data-mono text-data-mono text-on-surface focus:ring-1 focus:ring-primary placeholder-on-surface-variant/50 transition-shadow"
              placeholder="Search by User ID or TX Hash..." type="text" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {FILTERS.map(f => (
              <button key={f} onClick={() => handleFilter(f)}
                className={`px-4 py-2 rounded-lg font-chip-label text-chip-label whitespace-nowrap flex items-center gap-2 transition-colors border ${activeFilter === f
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-surface-container/40 backdrop-blur-[12px] border-glass-border text-on-surface-variant hover:text-on-surface"}`}>
                {f === "All" && <span className="material-symbols-outlined text-[16px]">filter_list</span>}
                {f}
                {f !== "All" && data?.status_counts[f] != null && (
                  <span className="text-[10px] opacity-70">({data.status_counts[f]})</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-grid-gutter">
            {filtered.map(sub => {
              const borderColor = sub.status === "FLAGGED" ? "border-l-status-flagged" : sub.status === "PENDING" ? "border-l-status-pending" : "border-l-status-verified";
              const confidence = sub.verification_confidence;
              return (
                <article key={sub.id} className={`bg-surface-container/40 backdrop-blur-[12px] border border-glass-border rounded-3xl p-card-inner flex flex-col gap-6 relative overflow-hidden group border-l-4 ${borderColor}`}>
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center border border-glass-border">
                        <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>{activityIcon(sub.activity_type)}</span>
                      </div>
                      <div>
                        <h3 className="font-header-section text-header-section text-on-surface capitalize">{sub.activity_type.replace(/_/g, " ")}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-data-mono text-data-mono text-on-surface-variant text-xs">USER_ID: </span>
                          <span className="font-data-mono text-data-mono text-secondary text-xs bg-secondary/10 px-2 py-0.5 rounded">{sub.user_id.slice(0, 8)}…</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <StatusChip status={sub.status} reason={sub.flag_reason} />
                      <span className="font-data-mono text-data-mono text-on-surface-variant text-[10px] mt-2">{new Date(sub.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-3 gap-4 bg-surface/50 rounded-2xl p-4 border border-glass-border">
                    <div className="col-span-2 space-y-4 pr-4 border-r border-glass-border">
                      <div>
                        <span className="font-chip-label text-chip-label text-on-surface-variant block mb-1 uppercase tracking-wider">Metadata</span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(sub.metadata_json).map(([k, v]) => (
                            <span key={k} className="font-data-mono text-[11px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">{k}: {String(v)}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-chip-label text-chip-label text-on-surface-variant block mb-1 uppercase tracking-wider">AI Confidence Score</span>
                        <div className="w-full bg-surface-container-highest rounded-full h-2 mb-1 overflow-hidden">
                          <div className={`h-2 rounded-full ${confidenceColor(confidence)}`} style={{ width: confidence != null ? `${confidence}%` : "0%" }} />
                        </div>
                        <span className="font-data-mono text-data-mono text-status-pending">
                          {confidence != null ? `${confidence}%` : "Not scored"}{sub.flag_reason ? ` — ${sub.flag_reason}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1 flex flex-col justify-between">
                      <span className="font-chip-label text-chip-label text-on-surface-variant block mb-2 uppercase tracking-wider">Evidence</span>
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-glass-border group-hover:border-primary/50 transition-colors cursor-pointer bg-surface-container flex items-center justify-center">
                        {sub.evidence_url ? (
                          <>
                            <img alt="Evidence" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={`${API_BASE}${sub.evidence_url}`} />
                            <div className="absolute inset-0 bg-surface-dark/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="material-symbols-outlined text-white">zoom_in</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-on-surface-variant text-3xl">description</span>
                            <span className="absolute bottom-2 right-2 text-[10px] font-data-mono text-data-mono bg-surface-dark/80 px-1.5 py-0.5 rounded">
                              {sub.evidence_filename ? sub.evidence_filename.split(".").pop()?.toUpperCase() : "NONE"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    <button onClick={() => setSelected(sub)}
                      className="flex-1 bg-surface-container/40 backdrop-blur-[12px] border border-primary/30 hover:bg-primary/10 text-primary py-2.5 rounded-xl font-chip-label text-chip-label transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">open_in_full</span> Expand & Review
                    </button>
                  </div>
                </article>
              );
            })}

            {filtered.length === 0 && !loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
                <span className="material-symbols-outlined text-5xl opacity-40">inbox</span>
                <p className="font-medium">No submissions found for this filter.</p>
              </div>
            )}
          </section>
        )}

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex justify-center pt-4 pb-8 gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="bg-surface-container/40 backdrop-blur-[12px] text-primary border border-primary/20 hover:border-primary/50 px-8 py-3 rounded-full font-chip-label text-chip-label transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined">chevron_left</span> Previous
            </button>
            <span className="flex items-center font-data-mono text-data-mono text-on-surface-variant text-sm px-4">Page {page} of {data.total_pages}</span>
            <button onClick={() => setPage(p => Math.min(data.total_pages, p + 1))} disabled={page >= data.total_pages}
              className="bg-surface-container/40 backdrop-blur-[12px] text-primary border border-primary/20 hover:border-primary/50 px-8 py-3 rounded-full font-chip-label text-chip-label transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined">autorenew</span> Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
