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
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-chip-label text-chip-label border ${map[status] ?? "bg-surface-variant text-on-surface-variant border-glass-border"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status] ?? "bg-on-surface-variant"}`}></span>
      {status.replace("_", " ")}
    </span>
  );
}

export default function SponsorApplicationsPage() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await apiGet<Response>(`/providers/admin/sponsor-applications?page=${p}&page_size=10`);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [page, load]);

  const filtered = data?.items.filter(a =>
    !search || a.org_name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex-1 px-section-gap py-12 h-screen overflow-y-auto z-10 relative">
      {/* Ambient Glow */}
      <div className="fixed top-[10%] right-[10%] w-[60vw] h-[60vw] bg-[radial-gradient(circle,_rgba(38,163,122,0.05)_0%,_rgba(17,20,19,0)_70%)] pointer-events-none -z-10"></div>

      {/* Page Header */}
      <header className="flex flex-row justify-between items-end mb-10 w-full max-w-7xl mx-auto">
        <div>
          <h1 className="font-header-section text-header-section text-on-surface mb-2">Sponsor Applications</h1>
          <p className="font-body-main text-body-main text-on-surface-variant max-w-2xl">
            Review and verify incoming corporate sponsorship requests before writing their status to the ledger.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-dark/50 backdrop-blur-md border border-glass-border rounded-lg flex items-center px-4 py-2">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">search</span>
            <input
              className="bg-transparent border-none text-on-surface font-data-mono text-data-mono placeholder-on-surface-variant focus:outline-none focus:ring-0 w-64"
              placeholder="Search organization or ID..."
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Status Stats */}
      {data && (
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: data.total, color: "text-on-surface" },
            { label: "Pending", value: data.status_counts["PENDING"] ?? 0, color: "text-status-pending" },
            { label: "Under Review", value: data.status_counts["UNDER_REVIEW"] ?? 0, color: "text-status-processing" },
            { label: "Approved", value: data.status_counts["APPROVED"] ?? 0, color: "text-status-verified" },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-dark/40 border border-glass-border rounded-xl p-4">
              <p className="text-on-surface-variant text-xs font-chip-label uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`font-stat-value text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Data Table Card */}
      <div className="max-w-7xl mx-auto bg-surface-dark/40 backdrop-blur-xl border border-glass-border rounded-[2rem] p-6 shadow-2xl">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border">
                  <th className="py-4 px-6 font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Organization &amp; ID</th>
                  <th className="py-4 px-6 font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Applied Date</th>
                  <th className="py-4 px-6 font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-glass-border shrink-0">
                          <span className="material-symbols-outlined text-primary text-[20px]">eco</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-on-surface">{app.org_name}</span>
                          <span className="font-data-mono text-data-mono text-primary/70 text-xs">{app.id.slice(0, 12).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-sm text-on-surface-variant">{app.contact_name}</span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="font-data-mono text-data-mono text-on-surface-variant">
                        {new Date(app.created_at).toISOString().replace("T", " ").slice(0, 16)} UTC
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_forward_ios</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-on-surface-variant">No sponsor applications found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && (
          <div className="mt-6 flex items-center justify-between border-t border-glass-border pt-4">
            <span className="font-data-mono text-data-mono text-on-surface-variant">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.total)} of {data.total} Applications
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-glass-border bg-surface text-on-surface-variant hover:bg-surface-bright transition-colors font-chip-label text-chip-label disabled:opacity-50 disabled:cursor-not-allowed"
              >Previous</button>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page >= data.total_pages}
                className="px-3 py-1.5 rounded-lg border border-glass-border bg-surface text-on-surface hover:bg-surface-bright transition-colors font-chip-label text-chip-label disabled:opacity-50 disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
