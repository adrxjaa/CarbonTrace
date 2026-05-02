"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";

type Trend = { date: string; co2_kg: number; credits: number; submission_count: number };
type Stats = { total: number; pending: number; verified: number; flagged: number; rejected: number };
type Dashboard = {
  monthly_co2_kg: number; total_credits: number; credits_today: number;
  submission_stats: Stats; verify_rate: number; verify_rate_delta: number;
  activity_trend: Trend[];
};
type Submission = { id: string; activity_type: string; status: string; created_at: string; metadata_json: Record<string, unknown> };

const ACTIVITY_LABELS: Record<string, string> = {
  transit: "Public Transit Commute", ev_charge: "EV Charging Session",
  tree_planting: "Tree Planting", recycling: "Recycling Drop-off", other: "Eco Activity",
};
const CREDIT_MAP: Record<string, number> = { transit: 18, ev_charge: 55, tree_planting: 30, recycling: 22, other: 15 };

/* ── Color tokens from reference ──────────────────────────────────── */
const T = {
  surface50: "bg-[#111413]/50",
  glass: "border-[rgba(255,255,255,0.08)]",
  onSurface: "text-[#e1e3e0]",
  onSurfaceVariant: "text-[#bccac1]",
  primary: "#1D9E75",
  surfaceContainerHigh: "#272b29",
  statusVerified: "#10B981",
  statusPending: "#F59E0B",
  statusFlagged: "#EF4444",
};

function ActivityIcon({ type, flagged }: { type: string; flagged?: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    transit: <path d="M8 6v6M16 6v6M2 12h20M4 18v2m16-2v2M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />,
    ev_charge: <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="7" x2="12" y2="13" /><polyline points="9 11 12 13 15 11" /></>,
    tree_planting: <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />,
    recycling: <><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-2.163l2.9-12.99A2 2 0 0 1 8.09 2h7.82a2 2 0 0 1 1.96 1.847l2.9 12.99A1.83 1.83 0 0 1 19.185 19H17" /><path d="M12 12v10" /><path d="m9 19 3 3 3-3" /></>,
    other: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
  };
  return (
    <div className="p-3 rounded-2xl shrink-0"
      style={{ background: flagged ? "rgba(147,0,10,0.2)" : T.surfaceContainerHigh }}>
      <svg viewBox="0 0 24 24" fill="none"
        stroke={flagged ? T.statusFlagged : T.primary}
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        {icons[type] ?? icons.other}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [recent, setRecent] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<Dashboard>("/dashboard"),
      apiGet<{ items: Submission[] }>("/submissions?page_size=4"),
    ]).then(([d, s]) => {
      setDash(d);
      setRecent(s.items);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="pt-12 space-y-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-[24px] bg-white/[0.04]" />
      ))}
    </div>
  );

  if (!dash) return null;

  const trend = dash.activity_trend;
  const maxCredits = Math.max(...trend.map(t => t.credits), 1);

  const stats = [
    { label: "Credits Earned", value: dash.total_credits.toLocaleString(), delta: "+12%", icon: "monetization_on" },
    { label: "Submissions", value: dash.submission_stats.total.toString(), icon: "upload_file" },
    { label: "Verify Rate", value: `${dash.verify_rate}%`, delta: `+${dash.verify_rate_delta}%`, icon: "check_circle" },
    { label: "Flagged", value: dash.submission_stats.flagged.toString(), alert: dash.submission_stats.flagged > 0, icon: "flag" },
  ];

  return (
    <div className="space-y-12 pt-12 pb-12">

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="inline-flex items-center gap-2 bg-[#272b29]/50 border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-full w-max">
          <span className="text-[#1D9E75] text-[10px]">●</span>
          <span className="font-mono text-sm text-[#e1e3e0] tracking-wide">Chain Synced</span>
        </div>
        <h1 className="text-[48px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#e1e3e0]">
          {dash.monthly_co2_kg.toFixed(1)}{" "}
          <span className="text-[#1D9E75]">kg CO2</span>
        </h1>
        <p className="text-base text-[#bccac1]">Total Verified Offset</p>
      </section>

      {/* ── Stats Strip ────────────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#111413]/50 border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 flex flex-col gap-8">
            <div className="flex justify-between items-start">
              <div className="p-2 rounded-xl"
                style={{
                  background: T.surfaceContainerHigh,
                  color: s.alert ? T.statusFlagged : "#bccac1",
                }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  {s.icon === "monetization_on" && <circle cx="12" cy="12" r="10" />}
                  {s.icon === "upload_file" && <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="9" y1="7" x2="15" y2="7" /><line x1="9" y1="11" x2="15" y2="11" /></>}
                  {s.icon === "check_circle" && <polyline points="20 6 9 17 4 12" />}
                  {s.icon === "flag" && <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>}
                </svg>
              </div>
              {s.delta && <span className="font-mono text-xs text-[#1D9E75]">{s.delta}</span>}
            </div>
            <div>
              <div className={`text-[32px] font-bold leading-none ${s.alert ? "text-[#e1e3e0]" : "text-[#e1e3e0]"}`}>
                {s.value}
              </div>
              <div className="text-sm text-[#bccac1] mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Middle Section: Chart + Balance ─────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Area (8 cols) */}
        <div className="lg:col-span-8 bg-[#111413]/50 border border-[rgba(255,255,255,0.08)] rounded-[24px] p-8 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[#e1e3e0]">Offset Activity</h2>
            <span className="font-mono text-sm text-[#bccac1] px-3 py-1.5 rounded-lg"
              style={{ background: T.surfaceContainerHigh }}>14 Days</span>
          </div>
          <div className="flex-1 w-full flex items-end justify-between gap-3 relative">
            {trend.map((t) => {
              const h = maxCredits > 0 ? Math.max((t.credits / maxCredits) * 100, t.credits > 0 ? 8 : 0) : 0;
              return (
                <div key={t.date} className="w-full group relative flex flex-col items-center">
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1D9E75] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {t.credits > 0 ? `${t.credits} CR` : "—"}
                  </div>
                  <div
                    className="w-full rounded-t-sm transition-colors cursor-pointer"
                    style={{
                      height: `${h}%`,
                      background: t.credits > 0
                        ? `rgba(29, 158, 117, ${0.2 + (h / 100) * 0.8})`
                        : "rgba(255,255,255,0.05)",
                      minHeight: "4px",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Credit Balance Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#111413]/50 border border-[rgba(255,255,255,0.08)] rounded-[24px] p-8 flex flex-col justify-between h-[400px]">
          <div>
            <h2 className="text-2xl font-bold text-[#e1e3e0] mb-2">Credit Balance</h2>
            <p className="text-sm text-[#bccac1] mb-8">Available for market transfer.</p>
            <div className="text-[56px] font-bold text-[#1D9E75] leading-none mb-3">{dash.total_credits.toLocaleString()}</div>
            <div className="font-mono text-sm text-[#e1e3e0] flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-[18px] h-[18px] animate-spin" style={{ animationDuration: "3s" }}>
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              Live
            </div>
          </div>
          <div className="space-y-4">
            <Link href="/submit"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-[#1D9E75] text-[#111C18] font-bold hover:bg-[#1D9E75]/90 transition-all">
              Submit evidence
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button className="w-full py-4 px-6 rounded-xl text-[#1D9E75] font-bold border border-[rgba(255,255,255,0.08)] hover:bg-white/5 transition-all">
              View on Explorer
            </button>
          </div>
        </div>
      </section>

      {/* ── Recent Activity ────────────────────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-[#e1e3e0] mb-6">Recent Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recent.map((sub) => {
            const isFlagged = sub.status === "FLAGGED";
            const isVerified = sub.status === "VERIFIED";
            const statusColor = isVerified ? T.statusVerified : isFlagged ? T.statusFlagged : T.statusPending;
            return (
              <div key={sub.id}
                className="bg-[#111413]/50 border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 flex items-center justify-between hover:bg-[#272b29]/50 transition-colors">
                <div className="flex items-center gap-4">
                  <ActivityIcon type={sub.activity_type} flagged={isFlagged} />
                  <div>
                    <div className="font-semibold text-[#e1e3e0]">
                      {ACTIVITY_LABELS[sub.activity_type]}
                    </div>
                    <div className="inline-flex items-center gap-1.5 mt-1">
                      <span className="text-[8px]" style={{ color: statusColor }}>●</span>
                      <span className="text-xs text-[#bccac1] uppercase tracking-wider font-semibold">
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="font-mono text-sm text-right">
                  {isVerified ? (
                    <span className="text-[#1D9E75]">+{CREDIT_MAP[sub.activity_type] ?? 15}</span>
                  ) : isFlagged ? (
                    <span className="text-xs text-[#EF4444]">Review</span>
                  ) : (
                    <span className="text-[#bccac1]">--</span>
                  )}
                  <div className="text-[10px] text-[#bccac1] mt-1 font-sans">
                    {isFlagged ? "Required" : "Credits"}
                  </div>
                </div>
              </div>
            );
          })}
          {recent.length === 0 && (
            <div className="col-span-2 text-center py-10 text-[#bccac1]">
              No recent activity. <Link href="/submit" className="text-[#1D9E75] underline">Submit your first activity →</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
