"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet, apiFetch } from "@/lib/api";

type Application = {
  id: string;
  org_name: string;
  provider_type: string;
  operating_region: string;
  website: string | null;
  contact_name: string;
  contact_email: string;
  contact_designation: string | null;
  activity_description: string | null;
  expected_monthly_volume: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
};

const TYPE_ICONS: Record<string, string> = {
  transit: "directions_bus", ev: "ev_station", ev_charging: "ev_station",
  tree_nursery: "forest", recycling: "recycling", renewable_energy: "solar_power",
  other: "corporate_fare",
};
const TYPE_LABELS: Record<string, string> = {
  transit: "Public Transit", ev: "EV Charging", ev_charging: "EV Charging",
  tree_nursery: "Tree Nursery", recycling: "Recycling", renewable_energy: "Renewable Energy",
  other: "Other",
};

/* ── Status badge ─────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-status-pending/10 text-status-pending border-status-pending/20",
    APPROVED: "bg-status-verified/10 text-status-verified border-status-verified/20",
    UNDER_REVIEW: "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20",
    REJECTED: "bg-status-flagged/10 text-status-flagged border-status-flagged/20",
  };
  const dots: Record<string, string> = {
    PENDING: "bg-status-pending", APPROVED: "bg-status-verified",
    UNDER_REVIEW: "bg-[#F59E0B] animate-pulse", REJECTED: "bg-status-flagged",
  };
  return (
    <span className={`px-3 py-1.5 rounded-full font-chip-label text-chip-label border flex items-center gap-2 w-fit text-xs ${styles[status] ?? "bg-surface-variant text-on-surface-variant border-glass-border"}`}>
      <span className={`w-2 h-2 rounded-full ${dots[status] ?? "bg-on-surface-variant"}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ── Document card ────────────────────────────────────────────────── */
function DocCard({
  label, fileType, size, badge, badgeColor, url,
}: {
  label: string; fileType: string; size: string;
  badge: string; badgeColor: "green" | "amber" | "gray";
  url?: string | null;
}) {
  const colors = {
    green: "text-status-verified border-status-verified/30 bg-status-verified/10",
    amber: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10",
    gray:  "text-on-surface-variant border-glass-border bg-surface-container",
  };
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-4 ${badgeColor === "amber" ? "border-[#F59E0B]/30 bg-[#F59E0B]/5" : "border-glass-border bg-surface-container/40"}`}>
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center border border-glass-border">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">description</span>
        </div>
        <span className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full border ${colors[badgeColor]}`}>{badge}</span>
      </div>
      <div>
        <p className="font-semibold text-on-surface text-sm">{label}</p>
        <p className="text-on-surface-variant text-xs mt-0.5">{fileType} • {size}</p>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 py-2 rounded-xl border font-chip-label text-chip-label text-sm transition-all ${badgeColor === "amber" ? "bg-[#F59E0B] text-black border-[#F59E0B] hover:bg-[#F59E0B]/90" : "bg-surface-container border-glass-border text-on-surface hover:bg-white/10"}`}>
          <span className="material-symbols-outlined text-[16px]">visibility</span> View File
        </a>
      ) : (
        <button className="flex items-center justify-center gap-2 py-2 rounded-xl border border-glass-border bg-surface-container text-on-surface-variant font-chip-label text-chip-label text-sm cursor-not-allowed opacity-60">
          <span className="material-symbols-outlined text-[16px]">visibility</span> No File
        </button>
      )}
    </div>
  );
}

/* ── Audit trail item ─────────────────────────────────────────────── */
function AuditItem({ label, sub, isLast, filled }: { label: string; sub: string; isLast?: boolean; filled?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 mt-0.5 shrink-0 ${filled ? "bg-primary border-primary" : "border-on-surface-variant bg-transparent"}`} />
        {!isLast && <div className="w-px flex-1 bg-glass-border mt-1" />}
      </div>
      <div className="pb-4">
        <p className="text-sm font-semibold text-on-surface leading-tight">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ── Relative time helper ─────────────────────────────────────────── */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/* ── Initials avatar ─────────────────────────────────────────────── */
function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-[#111413] ${color}`}>
      {initials}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function ReviewApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState(false);
  const [creditRate, setCreditRate] = useState(18);

  const load = useCallback(async () => {
    try {
      const res = await apiGet<Application>(`/providers/admin/${id}`);
      setApp(res);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (status: string) => {
    if (!app) return;
    setBusy(true);
    try {
      const res = await apiFetch(`/providers/admin/${app.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, notes: notes || undefined }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApp(updated);
        if (status === "APPROVED" || status === "REJECTED") {
          router.push("/admin/provider-applications");
        }
      } else {
        const e = await res.json();
        alert(e.detail ?? "Failed to update status");
      }
    } catch { alert("Network error"); } finally { setBusy(false); }
  };

  const saveNotes = async () => {
    if (!app) return;
    setBusy(true);
    try {
      await apiFetch(`/providers/admin/${app.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: app.status, notes }),
      });
      setSavedNotes(true);
      setTimeout(() => setSavedNotes(false), 2500);
    } catch { alert("Network error"); } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined text-5xl opacity-40">error</span>
        <p className="font-medium">Application not found.</p>
        <Link href="/admin/provider-applications" className="text-primary hover:underline text-sm">← Back to list</Link>
      </div>
    );
  }

  /* Build audit trail from timestamps */
  const auditEvents = [
    { label: "Application Opened", sub: `by ${app.contact_name} • ${relativeTime(app.created_at)}`, filled: true },
    ...(app.reviewed_at ? [
      { label: "Initial Review Complete", sub: `System-Auto • ${relativeTime(app.reviewed_at)}`, filled: true },
    ] : []),
    ...(app.status === "APPROVED" || app.status === "UNDER_REVIEW" ? [
      { label: "Identity Verified", sub: "On-chain Sync • pending", filled: app.status === "APPROVED" },
    ] : []),
    { label: "Application Submitted", sub: `External • ${relativeTime(app.created_at)}`, filled: false },
  ];

  /* Trust score — mocked based on status */
  const trustScore = app.status === "APPROVED" ? 98.4
    : app.status === "UNDER_REVIEW" ? 82.1
    : app.status === "REJECTED" ? 31.5 : 65.0;

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0a0d0b] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-primary/4 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-tertiary/4 rounded-full blur-[120px] pointer-events-none" />

      {/* ── TOP HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0a0d0b]/90 backdrop-blur-xl border-b border-glass-border px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/admin/provider-applications"
            className="w-9 h-9 rounded-xl bg-surface-container border border-glass-border flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all shrink-0">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-on-surface truncate">Review Application: {app.org_name}</h1>
              <StatusBadge status={app.status} />
            </div>
            <p className="text-xs text-on-surface-variant font-data-mono mt-0.5">
              APP-REF-{app.id.slice(0, 8).toUpperCase()} • SUBMITTED {relativeTime(app.created_at).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          {/* Trust Score */}
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Trust Score</p>
            <p className={`text-2xl font-extrabold ${trustScore >= 80 ? "text-status-verified" : trustScore >= 50 ? "text-[#F59E0B]" : "text-status-flagged"}`}>
              {trustScore}%
            </p>
          </div>
          {/* Reviewer avatars */}
          <div className="flex -space-x-2">
            <Avatar name="James D" color="bg-primary" />
            <Avatar name="Maria L" color="bg-tertiary" />
          </div>
        </div>
      </header>

      {/* ── MAIN BODY ─────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-0 overflow-hidden">

        {/* Left — scrollable content */}
        <div className="overflow-y-auto pb-28 px-8 pt-8 space-y-8">

          {/* ORGANIZATION DETAILS */}
          <section>
            <h2 className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-5">Organization Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Provider Type */}
              <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Provider Type</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {TYPE_ICONS[app.provider_type] ?? "corporate_fare"}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-on-surface">
                    {TYPE_LABELS[app.provider_type] ?? app.provider_type}
                  </p>
                </div>
              </div>

              {/* Operating Region */}
              <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Operating Region</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                  </div>
                  <p className="text-xl font-bold text-on-surface">{app.operating_region}</p>
                </div>
              </div>

              {/* Website */}
              <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Verified Website</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center border border-glass-border">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
                  </div>
                  {app.website ? (
                    <a href={app.website} target="_blank" rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline truncate max-w-[200px]">
                      {app.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="text-on-surface-variant">Not provided</span>
                  )}
                </div>
              </div>

              {/* Contact Email */}
              <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-5">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Contact Email</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center border border-glass-border">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                  </div>
                  <p className="text-on-surface font-semibold truncate">{app.contact_email}</p>
                </div>
              </div>

              {/* Contact Name / Designation */}
              {(app.contact_name || app.contact_designation) && (
                <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-5">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Contact Person</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{app.contact_name}</p>
                      {app.contact_designation && <p className="text-xs text-on-surface-variant">{app.contact_designation}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Description */}
              {app.activity_description && (
                <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-5 sm:col-span-2">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Description of Activities</p>
                  <p className="text-on-surface text-sm leading-relaxed">{app.activity_description}</p>
                </div>
              )}

              {/* Expected Volume */}
              {app.expected_monthly_volume && (
                <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-5">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Expected Monthly Volume</p>
                  <p className="text-xl font-bold text-on-surface">{app.expected_monthly_volume}</p>
                </div>
              )}
            </div>
          </section>

          {/* DOCUMENT VERIFICATION */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase">Document Verification</h2>
              <span className="text-[10px] text-on-surface-variant font-data-mono">3 DOCUMENTS ATTACHED</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DocCard label="Business Registration" fileType="PDF" size="2.4 MB" badge="VALIDATED" badgeColor="green" url={null} />
              <DocCard label="Operator License" fileType="JPG" size="1.1 MB" badge="NEEDS CLARIFICATION" badgeColor="amber" url={null} />
              <DocCard label="Regional ID Proof" fileType="PDF" size="4.8 MB" badge="UNCHECKED" badgeColor="gray" url={null} />
            </div>
          </section>

          {/* CREDIT RATE CONFIGURATION */}
          <section>
            <div className="bg-surface-container/40 border border-glass-border rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Credit Rate Configuration</h3>
                  <p className="text-sm text-on-surface-variant">Define the impact-to-credit conversion multiplier for this provider.</p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-glass-border">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">Set Conversion Rate</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCreditRate(r => Math.max(1, r - 1))}
                      className="w-9 h-9 rounded-lg border border-glass-border bg-surface-container text-on-surface hover:bg-white/10 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="text-5xl font-extrabold text-on-surface w-16 text-center tabular-nums">{creditRate}</span>
                    <button onClick={() => setCreditRate(r => r + 1)}
                      className="w-9 h-9 rounded-lg border border-glass-border bg-surface-container text-on-surface hover:bg-white/10 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                    <span className="text-on-surface-variant text-sm">credits / verified trip</span>
                  </div>
                </div>
                <div className="ml-auto">
                  <button className="px-6 py-2.5 rounded-xl bg-primary text-[#111413] font-bold text-sm hover:bg-primary/90 transition-colors">
                    UPDATE RATE
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right — fixed sidebar */}
        <aside className="hidden lg:flex flex-col border-l border-glass-border overflow-y-auto pb-28">

          {/* AUDIT TRAIL */}
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Audit Trail</h2>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
            </div>
            <div className="space-y-0">
              {auditEvents.map((ev, i) => (
                <AuditItem key={i} label={ev.label} sub={ev.sub} isLast={i === auditEvents.length - 1} filled={ev.filled} />
              ))}
            </div>
          </div>

          {/* INTERNAL NOTES */}
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Internal Notes</h2>
              <button onClick={saveNotes} disabled={busy}
                className="text-[10px] text-primary hover:text-primary/80 font-bold tracking-widest uppercase transition-colors disabled:opacity-50">
                {savedNotes ? "✓ SAVED" : "• SAVE"}
              </button>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add confidential notes for other administrators..."
              rows={4}
              className="w-full bg-surface-container border border-glass-border rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:ring-1 focus:ring-primary focus:outline-none resize-none transition-shadow"
            />
            <div className="mt-4 p-4 bg-surface-container/40 border border-glass-border rounded-xl">
              <div className="flex items-start gap-3">
                <Avatar name="Marcus S" color="bg-tertiary" />
                <div>
                  <p className="text-sm text-on-surface italic leading-snug">
                    "License document looks slightly pixelated, might need a rescan."
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">— Marcus, Senior Lead</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── STICKY BOTTOM ACTION BAR ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d0b]/95 backdrop-blur-xl border-t border-glass-border px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3 justify-end">
          <a href={`mailto:${app.contact_email}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-glass-border bg-surface-container text-on-surface font-chip-label text-sm hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[18px]">mail</span> Email Provider
          </a>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-glass-border bg-surface-container text-on-surface font-chip-label text-sm hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[18px]">upload_file</span> Request Docs
          </button>
          <div className="w-px h-6 bg-glass-border mx-1" />
          <button disabled={busy} onClick={() => updateStatus("REJECTED")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-status-flagged/30 bg-status-flagged/10 text-status-flagged font-bold text-sm hover:bg-status-flagged/20 transition-colors disabled:opacity-50">
            <span className="material-symbols-outlined text-[18px]">cancel</span> Reject Application
          </button>
          <button disabled={busy} onClick={() => updateStatus("APPROVED")}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-[#111413] font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(29,158,117,0.3)]">
            <span className="material-symbols-outlined text-[18px]">check_circle</span> Approve Provider
          </button>
        </div>
      </div>
    </div>
  );
}
