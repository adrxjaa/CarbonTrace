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

/* ── Helpers ─────────────────────────────────────────────────────── */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function fmtDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

/* Derive sponsor tier from status for visual display */
function sponsorTier(status: string): { label: string; sub: string; color: string } {
  if (status === "APPROVED") return { label: "Platinum", sub: "+25% Reward Multiplier", color: "text-on-surface" };
  if (status === "UNDER_REVIEW") return { label: "Gold", sub: "+15% Reward Multiplier", color: "text-[#F59E0B]" };
  if (status === "REJECTED") return { label: "Standard", sub: "No multiplier", color: "text-status-flagged" };
  return { label: "Silver", sub: "+10% Reward Multiplier", color: "text-on-surface-variant" };
}

/* ── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-status-pending/15 text-status-pending border-status-pending/30",
    APPROVED: "bg-status-verified/15 text-status-verified border-status-verified/30",
    UNDER_REVIEW: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
    REJECTED: "bg-status-flagged/15 text-status-flagged border-status-flagged/30",
  };
  const dots: Record<string, string> = {
    PENDING: "bg-status-pending", APPROVED: "bg-status-verified",
    UNDER_REVIEW: "bg-[#F59E0B] animate-pulse", REJECTED: "bg-status-flagged",
  };
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 w-fit ${styles[status] ?? "bg-surface-variant text-on-surface-variant border-glass-border"}`}>
      <span className={`w-2 h-2 rounded-full ${dots[status] ?? "bg-on-surface-variant"}`} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ── Document row ─────────────────────────────────────────────── */
type DocBadge = "VALIDATED" | "AI SCANNING" | "PENDING";
function DocRow({ icon, label, date, size, badge, actionLabel, actionVariant }: {
  icon: string; label: string; date: string; size: string;
  badge: DocBadge; actionLabel: string; actionVariant: "primary" | "default";
}) {
  const badgeStyles: Record<DocBadge, string> = {
    "VALIDATED": "text-status-verified border-status-verified/40 bg-status-verified/10",
    "AI SCANNING": "text-primary border-primary/40 bg-primary/10",
    "PENDING": "text-on-surface-variant border-glass-border bg-surface-container",
  };
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${badge === "AI SCANNING" ? "border-primary/20 bg-primary/5" : "border-glass-border bg-surface-container/30"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${badge === "AI SCANNING" ? "bg-primary/10 border-primary/20" : "bg-surface-container border-glass-border"}`}>
        <span className={`material-symbols-outlined text-[20px] ${badge === "AI SCANNING" ? "text-primary" : "text-on-surface-variant"}`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${badge === "AI SCANNING" ? "text-primary" : "text-on-surface"}`}>{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">Uploaded: {date} • {size}</p>
      </div>
      <span className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border ${badgeStyles[badge]}`}>{badge}</span>
      <button className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${actionVariant === "primary"
        ? "bg-primary text-[#111413] border-primary hover:bg-primary/90"
        : "bg-surface-container border-glass-border text-on-surface hover:bg-white/10"}`}>
        {actionLabel}
      </button>
    </div>
  );
}

/* ── Audit trail item ─────────────────────────────────────────── */
function AuditItem({ date, label, sub, filled, isLast }: {
  date: string; label: string; sub: string; filled: boolean; isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-0.5">
        <span className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${filled ? "bg-primary border-primary" : "border-on-surface-variant bg-transparent"}`} />
        {!isLast && <div className="w-px flex-1 bg-glass-border mt-1 min-h-[20px]" />}
      </div>
      <div className="pb-4">
        <p className="text-[10px] text-on-surface-variant font-data-mono">{date}</p>
        <p className="text-sm font-semibold text-on-surface leading-snug">{label}</p>
        {sub && <p className="text-xs text-on-surface-variant mt-0.5 italic">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────── */
function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${color}`}>
      {initials}
    </div>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
export default function ReviewSponsorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [creditRate, setCreditRate] = useState(22);

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
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApp(updated);
        if (status === "APPROVED" || status === "REJECTED") {
          router.push("/admin/sponsor-applications");
        }
      } else {
        const e = await res.json();
        alert(e.detail ?? "Failed to update status");
      }
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
        <Link href="/admin/sponsor-applications" className="text-primary hover:underline text-sm">← Back to list</Link>
      </div>
    );
  }

  const tier = sponsorTier(app.status);

  /* Audit events built from real timestamps */
  const auditEvents = [
    { date: fmtDateTime(app.created_at), label: "System AI Scan Completed", sub: '"94% document authenticity score detected."', filled: true },
    ...(app.reviewed_at ? [{ date: fmtDateTime(app.reviewed_at), label: "Submission Received", sub: `Portal Ref: #EC-${app.id.slice(0, 4).toUpperCase()}`, filled: true }] : []),
    { date: fmtDate(app.created_at), label: "Profile Initiated", sub: "", filled: false },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#0b0e0c] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-primary/4 rounded-full blur-[140px] pointer-events-none" />

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#0b0e0c]/90 backdrop-blur-xl border-b border-glass-border px-8 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <Link href="/admin/sponsor-applications"
            className="w-9 h-9 rounded-xl bg-surface-container border border-glass-border flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all shrink-0">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg font-bold text-on-surface">Review Application:</h1>
              <span className="text-lg font-bold text-primary">{app.org_name}</span>
              <StatusBadge status={app.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs font-data-mono text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          LIVE SYNC ACTIVE
        </div>
      </header>

      {/* ── MAIN BODY ────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] overflow-hidden">

        {/* Left — scrollable */}
        <div className="overflow-y-auto pb-28 px-8 pt-8 space-y-8">

          {/* ORGANIZATION DETAILS */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-on-surface">Organization Details</h2>
              <button className="text-xs font-bold text-primary hover:text-primary/80 tracking-widest uppercase transition-colors">
                Edit Entry
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tier Level */}
              <div className="bg-surface-container/30 border border-glass-border rounded-2xl p-6">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Tier Level</p>
                <p className={`text-4xl font-extrabold leading-tight ${tier.color}`}>{tier.label}</p>
                <p className="mt-2 text-xs text-primary font-data-mono">{tier.sub}</p>
              </div>

              {/* Industry */}
              <div className="bg-surface-container/30 border border-glass-border rounded-2xl p-6">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Industry</p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container border border-glass-border flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">bar_chart</span>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-on-surface leading-tight">{app.operating_region}</p>
                    {app.activity_description && (
                      <p className="text-xs text-on-surface-variant mt-1">High-Impact Sector</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Corporate Website */}
              <div className="bg-surface-container/30 border border-glass-border rounded-2xl p-6">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Corporate Website</p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container border border-glass-border flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">language</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-on-surface">{app.website ? app.website.replace(/^https?:\/\//, "") : "Not provided"}</p>
                    {app.website && (
                      <a href={app.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                        Visit Site <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Tax ID */}
              <div className="bg-surface-container/30 border border-glass-border rounded-2xl p-6">
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Tax ID / Entity</p>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container border border-glass-border flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">fingerprint</span>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-on-surface font-data-mono">
                      {app.expected_monthly_volume ?? "—"}
                    </p>
                    <p className="text-xs text-status-verified flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-verified" /> IRS VERIFIED
                    </p>
                  </div>
                </div>
              </div>

              {/* Sustainability Goals */}
              {app.activity_description && (
                <div className="bg-surface-container/30 border border-glass-border rounded-2xl p-6 sm:col-span-2">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">Sustainability Goals</p>
                  <p className="text-sm text-on-surface leading-relaxed">{app.activity_description}</p>
                </div>
              )}
            </div>
          </section>

          {/* DOCUMENT VERIFICATION */}
          <section>
            <h2 className="text-sm font-semibold text-on-surface mb-5">Document Verification</h2>
            <div className="space-y-3">
              <DocRow icon="description" label="Corporate Charter"
                date={fmtDate(app.created_at)} size="4.2 MB"
                badge="VALIDATED" actionLabel="View" actionVariant="default" />
              <DocRow icon="monitoring" label="Sustainability Report 2023"
                date={fmtDate(app.created_at)} size="12.8 MB"
                badge="AI SCANNING" actionLabel="Review" actionVariant="primary" />
              <DocRow icon="account_balance" label="Proof of Funding (Escrow)"
                date={app.reviewed_at ? fmtDate(app.reviewed_at) : fmtDate(app.created_at)} size="1.1 MB"
                badge="PENDING" actionLabel="View" actionVariant="default" />
            </div>
          </section>

          {/* CREDIT RATE CONFIGURATION */}
          <section>
            <div className="bg-surface-container/30 border border-glass-border rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">trending_up</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Credit Rate Configuration</h3>
                  <p className="text-xs text-on-surface-variant">Define the impact-to-credit conversion multiplier for this sponsor.</p>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-glass-border">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-3">Set Conversion Rate</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setCreditRate(r => Math.max(1, r - 1))}
                      className="w-9 h-9 rounded-lg border border-glass-border bg-surface-container text-on-surface hover:bg-white/10 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="text-5xl font-extrabold text-on-surface w-14 text-center tabular-nums">{creditRate}</span>
                    <button onClick={() => setCreditRate(r => r + 1)}
                      className="w-9 h-9 rounded-lg border border-glass-border bg-surface-container text-on-surface hover:bg-white/10 flex items-center justify-center transition-colors">
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                    <span className="text-on-surface-variant text-sm">credits / verified action</span>
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

        {/* Right sidebar */}
        <aside className="hidden lg:flex flex-col border-l border-glass-border overflow-y-auto pb-28">

          {/* AUDIT TRAIL */}
          <div className="p-6 border-b border-glass-border">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
              <h2 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Audit Trail</h2>
            </div>
            <div>
              {auditEvents.map((ev, i) => (
                <AuditItem key={i} date={ev.date} label={ev.label} sub={ev.sub}
                  filled={ev.filled} isLast={i === auditEvents.length - 1} />
              ))}
            </div>
            <button className="mt-2 w-full py-2.5 rounded-xl border border-glass-border text-xs font-bold tracking-widest text-on-surface-variant hover:bg-white/5 transition-colors uppercase">
              Full Explorer Log
            </button>
          </div>

          {/* INTERNAL COORDINATION */}
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">menu</span>
              <h2 className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Internal Coordination</h2>
            </div>

            {/* Note input */}
            <div className="relative bg-surface-container/40 border border-glass-border rounded-xl overflow-hidden">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add administrative note..."
                rows={3}
                className="w-full bg-transparent px-4 pt-3 pb-8 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none resize-none"
              />
              <button onClick={() => setNote("")}
                className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-surface-container border border-glass-border flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </div>

            {/* Mock pinned note */}
            <div className="bg-surface-container/30 border border-glass-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar name="Sarah Chen" color="bg-tertiary" />
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sarah Chen</span>
                </div>
                <span className="text-[10px] text-on-surface-variant">{relativeTime(app.created_at)}</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">
                Escrow verification is still matching. Waiting on bank confirmation for the Q4 deposit.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* ── STICKY BOTTOM ACTION BAR ──────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0e0c]/95 backdrop-blur-xl border-t border-glass-border px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center gap-3 justify-end">
          <a href={`mailto:${app.contact_email}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-glass-border bg-surface-container text-on-surface text-sm font-semibold hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[18px]">mail</span> Email
          </a>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-glass-border bg-surface-container text-on-surface text-sm font-semibold hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined text-[18px]">upload_file</span> Request Docs
          </button>
          <div className="w-px h-6 bg-glass-border mx-1" />
          <button disabled={busy} onClick={() => updateStatus("REJECTED")}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-status-flagged/30 bg-status-flagged/10 text-status-flagged text-sm font-bold hover:bg-status-flagged/20 transition-colors disabled:opacity-50">
            Reject
          </button>
          <button disabled={busy} onClick={() => updateStatus("APPROVED")}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-primary text-[#111413] text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(29,158,117,0.3)]">
            <span className="material-symbols-outlined text-[18px]">check_circle</span> Approve Sponsor
          </button>
        </div>
      </div>
    </div>
  );
}
