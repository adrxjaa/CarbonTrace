"use client";

import { useEffect, useState } from "react";
import { apiGet, apiFetch, API_BASE } from "@/lib/api";

type Stats = {
  active_users: number;
  active_users_delta: string;
  pending_submissions: number;
  flagged_submissions: number;
  flagged_today: number;
  blockchain_sync_status: string;
};

type ProviderApp = {
  id: string;
  org_name: string;
  provider_type: string;
  status: string;
  applied_on: string;
};

type FlaggedSubmission = {
  id: string;
  activity_type: string;
  user_id: string;
  confidence: number | null;
  flag_reason: string | null;
  image_url: string | null;
};

type DashboardData = {
  stats: Stats;
  sponsor_queue: ProviderApp[];
  provider_queue: ProviderApp[];
  flagged_submissions: FlaggedSubmission[];
};

/* ── Flagged Submission Drawer ────────────────────────── */
function InspectDrawer({ sub, onClose, onStatusChange }: {
  sub: FlaggedSubmission;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const update = async (status: string) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#111413] border border-glass-border rounded-3xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-glass-border">
          <div>
            <h3 className="font-header-section text-on-surface capitalize">{sub.activity_type.replace(/_/g, " ")}</h3>
            <span className="font-data-mono text-xs text-status-flagged">{sub.id.slice(0, 16)}…</span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="p-6 space-y-4">
          {sub.image_url && (
            <img src={`${API_BASE}${sub.image_url}`} alt="Evidence" className="w-full h-40 object-cover rounded-xl border border-glass-border" />
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["User ID", sub.user_id.slice(0, 16) + "…"],
              ["AI Confidence", sub.confidence != null ? `${sub.confidence}%` : "—"],
              ["Flag Reason", sub.flag_reason ?? "—"],
            ].map(([label, val]) => (
              <div key={label} className="bg-surface-container/40 rounded-xl p-3 border border-glass-border col-span-1">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1">{label}</span>
                <span className="text-sm text-on-surface">{val}</span>
              </div>
            ))}
          </div>
          <div>
            <label className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider block mb-2">Admin Note</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-2 text-sm text-on-surface placeholder-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              placeholder="Reason for action..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button disabled={busy} onClick={() => update("VERIFIED")}
              className="flex-1 bg-status-verified/10 text-status-verified hover:bg-status-verified/20 border border-status-verified/30 py-2.5 rounded-xl font-chip-label text-chip-label transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">check_circle</span> Approve
            </button>
            <button disabled={busy} onClick={() => update("REJECTED")}
              className="flex-1 bg-status-flagged/10 text-status-flagged hover:bg-status-flagged/20 border border-status-flagged/30 py-2.5 rounded-xl font-chip-label text-chip-label transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">cancel</span> Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspecting, setInspecting] = useState<FlaggedSubmission | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiGet<DashboardData>("/dashboard/admin");
        setData(res);
      } catch (err) {
        console.error("Failed to load admin dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = (id: string, status: string) => {
    setData(prev => prev ? {
      ...prev,
      flagged_submissions: prev.flagged_submissions.filter(s => s.id !== id),
      stats: { ...prev.stats, flagged_submissions: Math.max(0, prev.stats.flagged_submissions - 1) },
    } : prev);
  };

  if (loading || !data) {
    return (
      <div className="p-container-padding flex-grow pt-8 space-y-section-gap flex justify-center items-center h-full">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <>
    {inspecting && (
      <InspectDrawer
        sub={inspecting}
        onClose={() => setInspecting(null)}
        onStatusChange={handleStatusChange}
      />
    )}
    <div className="p-container-padding flex-grow pt-8 space-y-section-gap pb-32 lg:pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-header-section text-header-section text-on-surface mb-1">Admin Overview</h2>
          <p className="text-on-surface-variant font-data-mono text-data-mono">Internal Operations Dashboard</p>
        </div>
        <div className="hidden sm:flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors font-chip-label text-chip-label flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* 1. Summary Bar */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
        {/* Stat Tile: Active Users */}
        <div className="bg-surface-container/50 backdrop-blur-xl border border-glass-border rounded-xl p-card-inner flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-container/20 rounded-lg text-tertiary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="font-data-mono text-data-mono text-tertiary">{data.stats.active_users_delta}</span>
          </div>
          <div className="mt-auto">
            <p className="text-on-surface-variant text-sm mb-1">Active Users</p>
            <p className="font-stat-value text-stat-value text-on-surface">{data.stats.active_users.toLocaleString()}</p>
          </div>
        </div>

        {/* Stat Tile: Pending Submissions */}
        <div className="bg-surface-container/50 backdrop-blur-xl border border-glass-border rounded-xl p-card-inner flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-status-pending/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-status-pending/20 rounded-lg text-status-pending">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="font-data-mono text-data-mono text-status-pending">48h SLA</span>
          </div>
          <div className="mt-auto relative z-10">
            <p className="text-on-surface-variant text-sm mb-1">Pending Submissions</p>
            <p className="font-stat-value text-stat-value text-on-surface">{data.stats.pending_submissions.toLocaleString()}</p>
          </div>
        </div>

        {/* Stat Tile: Flagged Submissions */}
        <div className="bg-surface-container/50 backdrop-blur-xl border border-glass-border rounded-xl p-card-inner flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-status-flagged/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-status-flagged/20 rounded-lg text-status-flagged">
              <span className="material-symbols-outlined">flag</span>
            </div>
            <span className="font-data-mono text-data-mono text-status-flagged">+{data.stats.flagged_today} today</span>
          </div>
          <div className="mt-auto relative z-10">
            <p className="text-on-surface-variant text-sm mb-1">Flagged Submissions</p>
            <p className="font-stat-value text-stat-value text-on-surface">{data.stats.flagged_submissions.toLocaleString()}</p>
          </div>
        </div>

        {/* Stat Tile: Blockchain Sync */}
        <div className="bg-surface-container/50 backdrop-blur-xl border border-glass-border rounded-xl p-card-inner flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-status-verified/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-status-verified/20 rounded-lg text-status-verified">
              <span className="material-symbols-outlined">lan</span>
            </div>
            <div className="flex items-center gap-1.5 bg-status-verified/10 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-status-verified rounded-full animate-pulse"></div>
              <span className="font-data-mono text-[10px] text-status-verified tracking-wider uppercase">Live</span>
            </div>
          </div>
          <div className="mt-auto relative z-10">
            <p className="text-on-surface-variant text-sm mb-1">Blockchain Sync Status</p>
            <p className="font-stat-value text-[24px] font-bold text-on-surface tracking-tight mt-1 truncate">{data.stats.blockchain_sync_status}</p>
          </div>
        </div>
      </section>

      {/* Layout Split: Tables & System Health */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-grid-gutter">
        <div className="xl:col-span-2 space-y-grid-gutter">
          {/* Sponsor Application Queue */}
          <section className="bg-surface-container/30 backdrop-blur-xl border border-glass-border rounded-[24px] p-card-inner">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-header-section text-xl text-on-surface">Sponsor Application Queue</h3>
              <button className="text-primary hover:text-primary-fixed transition-colors text-sm font-medium flex items-center gap-1">
                View All <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-glass-border text-on-surface-variant text-sm">
                    <th className="pb-3 font-medium px-4">Organization</th>
                    <th className="pb-3 font-medium px-4">Type</th>
                    <th className="pb-3 font-medium px-4">Applied On</th>
                    <th className="pb-3 font-medium px-4">Status</th>
                    <th className="pb-3 font-medium px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.sponsor_queue.map(app => (
                    <tr key={app.id} className="border-b border-glass-border/50 hover:bg-surface-variant/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-on-surface">{app.org_name}</div>
                        <div className="text-on-surface-variant text-xs font-data-mono mt-0.5">ID: {app.id.slice(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant capitalize">{app.provider_type.replace('_', ' ')}</td>
                      <td className="py-4 px-4 font-data-mono text-on-surface-variant">{new Date(app.applied_on).toISOString().split('T')[0]}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-chip-label text-chip-label border 
                          ${app.status === 'PENDING' ? 'bg-status-pending/10 text-status-pending border-status-pending/20' : 
                            app.status === 'APPROVED' ? 'bg-status-verified/10 text-status-verified border-status-verified/20' : 
                            'bg-status-processing/10 text-status-processing border-status-processing/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'PENDING' ? 'bg-status-pending' : app.status === 'APPROVED' ? 'bg-status-verified' : 'bg-status-processing'}`}></span> 
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium text-xs">Review</button>
                      </td>
                    </tr>
                  ))}
                  {data.sponsor_queue.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant">No sponsor applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Provider Application Queue */}
          <section className="bg-surface-container/30 backdrop-blur-xl border border-glass-border rounded-[24px] p-card-inner">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-header-section text-xl text-on-surface">Provider Application Queue</h3>
              <button className="text-primary hover:text-primary-fixed transition-colors text-sm font-medium flex items-center gap-1">
                View All <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-glass-border text-on-surface-variant text-sm">
                    <th className="pb-3 font-medium px-4">Organization</th>
                    <th className="pb-3 font-medium px-4">Type</th>
                    <th className="pb-3 font-medium px-4">Applied On</th>
                    <th className="pb-3 font-medium px-4">Status</th>
                    <th className="pb-3 font-medium px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.provider_queue.map(app => (
                    <tr key={app.id} className="border-b border-glass-border/50 hover:bg-surface-variant/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-on-surface">{app.org_name}</div>
                        <div className="text-on-surface-variant text-xs font-data-mono mt-0.5">ID: {app.id.slice(0, 8).toUpperCase()}</div>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant capitalize">{app.provider_type.replace('_', ' ')}</td>
                      <td className="py-4 px-4 font-data-mono text-on-surface-variant">{new Date(app.applied_on).toISOString().split('T')[0]}</td>
                      <td className="py-4 px-4">
                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-chip-label text-chip-label border 
                          ${app.status === 'PENDING' ? 'bg-status-pending/10 text-status-pending border-status-pending/20' : 
                            app.status === 'APPROVED' ? 'bg-status-verified/10 text-status-verified border-status-verified/20' : 
                            'bg-status-processing/10 text-status-processing border-status-processing/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'PENDING' ? 'bg-status-pending' : app.status === 'APPROVED' ? 'bg-status-verified' : 'bg-status-processing'}`}></span> 
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors font-medium text-xs">Review</button>
                      </td>
                    </tr>
                  ))}
                  {data.provider_queue.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant">No provider applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 4. System Health */}
        <section className="bg-surface-container/30 backdrop-blur-xl border border-glass-border rounded-[24px] p-card-inner flex flex-col">
          <h3 className="font-header-section text-xl text-on-surface mb-6">System Health</h3>
          <div className="space-y-6 flex-grow">
            {/* Queue Depth */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-on-surface-variant">AI Verification Queue</span>
                <span className="font-data-mono text-sm text-status-pending">Elevated</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-status-pending rounded-full" style={{ width: `${Math.min(100, (data.stats.pending_submissions / 100) * 100)}%` }}></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-on-surface-variant font-data-mono">
                <span>0</span>
                <span>~{data.stats.pending_submissions} items</span>
                <span>100</span>
              </div>
            </div>

            {/* Node Status */}
            <div className="p-4 bg-surface-dark rounded-xl border border-glass-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-status-verified">dns</span>
                <span className="font-medium text-on-surface">Blockchain Nodes</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs">Primary Node</span>
                  <span className="font-data-mono text-status-verified flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-status-verified rounded-full"></span> Synced
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-on-surface-variant text-xs">Fallback Node</span>
                  <span className="font-data-mono text-status-verified flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-status-verified rounded-full"></span> Synced
                  </span>
                </div>
                <div className="flex flex-col mt-2 col-span-2 border-t border-glass-border pt-2">
                  <span className="text-on-surface-variant text-xs">Network Latency</span>
                  <span className="font-data-mono text-on-surface">24ms avg</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Flagged Submissions (Bento Grid Style) */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-header-section text-xl text-on-surface">Flagged Submissions</h3>
            <p className="text-sm text-on-surface-variant mt-1">Requires manual admin review</p>
          </div>
          <button className="px-4 py-2 bg-surface-container border border-glass-border rounded-lg text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors">
            Review All ({data.stats.flagged_submissions})
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-gutter">
          
          {data.flagged_submissions.map(sub => (
            <div key={sub.id} className="bg-surface-container/40 border border-status-flagged/30 rounded-xl overflow-hidden flex flex-col group cursor-pointer hover:border-status-flagged transition-colors">
              <div className="h-32 w-full relative bg-surface-dark flex items-center justify-center border-b border-glass-border">
                {sub.image_url ? (
                  <img src={sub.image_url} alt="Evidence" className="w-full h-full object-cover mix-blend-overlay" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">description</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-surface-dark to-surface-variant opacity-80 mix-blend-overlay"></div>
                <div className="absolute top-2 right-2 bg-surface-dark/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-data-mono text-status-flagged border border-status-flagged/50">
                  {sub.confidence ? `CF: ${sub.confidence}%` : 'NO_CF'}
                </div>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-center gap-1.5 text-status-flagged mb-2">
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>warning</span>
                  <span className="font-chip-label text-chip-label truncate max-w-[200px]" title={sub.flag_reason || "Requires review"}>
                    {sub.flag_reason || "Requires review"}
                  </span>
                </div>
                <p className="text-sm font-medium text-on-surface mb-1 truncate capitalize">{sub.activity_type.replace('_', ' ')}</p>
                <p className="text-xs font-data-mono text-on-surface-variant mb-4">User: USR-{sub.user_id.slice(0,4)}</p>
                <button onClick={() => setInspecting(sub)} className="mt-auto w-full py-1.5 rounded border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-variant transition-colors">
                  Inspect
                </button>
              </div>
            </div>
          ))}

          {/* Empty State Placeholder for Grid Balance */}
          {data.flagged_submissions.length > 0 && (
            <div className="hidden lg:flex bg-surface-container/10 border border-dashed border-glass-border rounded-xl items-center justify-center p-4 flex-col text-on-surface-variant/50">
              <span className="material-symbols-outlined text-3xl mb-2">more_horiz</span>
              <span className="text-sm font-medium">more items</span>
            </div>
          )}
          
          {data.flagged_submissions.length === 0 && (
             <div className="col-span-full py-12 flex items-center justify-center text-on-surface-variant">
               No flagged submissions at this time.
             </div>
          )}
        </div>
      </section>
    </div>
    </>
  );
}

