"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/api";

type Application = {
  id: string;
  org_name: string;
  provider_type: string;
  operating_region: string;
  website: string | null;
  contact_name: string;
  contact_email: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

type Response = {
  items: Application[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  status_counts: Record<string, number>;
};

// Maps provider_type to a Material Symbols icon name
function typeIcon(type: string): string {
  const map: Record<string, string> = {
    transit: "directions_bus",
    ev_charging: "ev_station",
    renewable_energy: "solar_power",
    recycling: "recycling",
    tree_nursery: "forest",
    other: "corporate_fare",
  };
  return map[type] ?? "corporate_fare";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-status-pending/10 text-status-pending border-status-pending/20",
    APPROVED: "bg-status-verified/10 text-status-verified border-status-verified/20",
    UNDER_REVIEW: "bg-status-processing/10 text-status-processing border-status-processing/20",
    REJECTED: "bg-status-flagged/10 text-status-flagged border-status-flagged/20",
  };
  const dotMap: Record<string, string> = {
    PENDING: "bg-status-pending",
    APPROVED: "bg-status-verified",
    UNDER_REVIEW: "bg-status-processing animate-pulse",
    REJECTED: "bg-status-flagged",
  };
  return (
    <div className={`px-3 py-1 rounded-full font-chip-label text-chip-label border flex items-center gap-2 w-fit ${map[status] ?? "bg-surface-variant text-on-surface-variant border-glass-border"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status] ?? "bg-on-surface-variant"}`}></span>
      {status.replace("_", " ")}
    </div>
  );
}

export default function ProviderApplicationsPage() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await apiGet<Response>(`/providers/admin/provider-applications?page=${p}&page_size=10`);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const filtered = data?.items.filter(a =>
    !search || a.org_name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex-1 p-container-padding flex flex-col gap-section-gap min-h-screen relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <p className="font-data-mono text-data-mono text-primary mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-verified animate-pulse"></span>
            LIVE SYNC ACTIVE
          </p>
          <h2 className="font-header-section text-header-section text-on-surface">Provider Applications</h2>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>search</span>
            <input
              className="bg-surface-container-high border-glass-border text-on-surface font-body-main text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-primary focus:border-primary w-64 backdrop-blur-md placeholder:text-on-surface-variant/50 border"
              placeholder="Search applications..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-grid-gutter">
        {[
          { label: "Pending Review", icon: "pending_actions", color: "bg-status-pending/10 border-status-pending/20 text-status-pending", value: data?.status_counts["PENDING"] ?? "…" },
          { label: "Approved Providers", icon: "check_circle", color: "bg-status-verified/10 border-status-verified/20 text-status-verified", value: data?.status_counts["APPROVED"] ?? "…" },
          { label: "Under Review", icon: "gavel", color: "bg-status-flagged/10 border-status-flagged/20 text-status-flagged", value: data?.status_counts["UNDER_REVIEW"] ?? "…" },
          { label: "Total Applications", icon: "hub", color: "bg-primary/10 border-primary/20 text-primary", value: data?.total ?? "…" },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container/40 backdrop-blur-[12px] border border-glass-border rounded-[24px] p-card-inner flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
            </div>
            <div>
              <p className="font-stat-value text-stat-value text-on-surface mb-1">{stat.value}</p>
              <p className="font-body-main text-body-main text-on-surface-variant text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Applications Table */}
      <div className="bg-surface-container/40 backdrop-blur-[12px] border border-glass-border rounded-[24px] overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border bg-surface-container-highest/30">
                  <th className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant text-xs uppercase tracking-wider">Organization Name</th>
                  <th className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant text-xs uppercase tracking-wider">Provider Type</th>
                  <th className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant text-xs uppercase tracking-wider">Region</th>
                  <th className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant text-xs uppercase tracking-wider">Applied Date</th>
                  <th className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant text-xs uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-glass-border flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-on-surface text-[16px]">{typeIcon(app.provider_type)}</span>
                        </div>
                        <span className="font-body-main text-body-main text-on-surface font-medium">{app.org_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high border border-glass-border font-chip-label text-chip-label text-on-surface-variant flex items-center gap-1.5 w-fit capitalize">
                        <span className="material-symbols-outlined text-[14px]">{typeIcon(app.provider_type)}</span>
                        {app.provider_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-body-main text-body-main text-on-surface-variant text-sm">{app.operating_region}</td>
                    <td className="py-4 px-6 font-data-mono text-data-mono text-on-surface-variant text-sm">
                      {new Date(app.created_at).toISOString().split("T")[0]}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 rounded-lg bg-transparent hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors border border-transparent hover:border-glass-border">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">No provider applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <div className="mt-auto border-t border-glass-border p-4 flex items-center justify-between bg-surface-container-highest/10">
            <p className="font-body-main text-body-main text-on-surface-variant text-sm">
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.total)} of {data.total} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-glass-border bg-surface-container-high text-on-surface-variant font-chip-label text-chip-label hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >Previous</button>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
                className="px-3 py-1.5 rounded-lg border border-glass-border bg-surface-container-high text-on-surface-variant font-chip-label text-chip-label hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
