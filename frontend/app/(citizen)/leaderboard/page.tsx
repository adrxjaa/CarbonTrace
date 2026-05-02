"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type LeaderEntry = {
  user_id: string; name: string; rank: number;
  total_co2_kg: number; total_credits: number; activity_count: number;
  is_current_user: boolean;
};
type LeaderRes = {
  period: string; total_participants: number;
  rankings: LeaderEntry[]; current_user: LeaderEntry | null;
  current_user_percentile: number;
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"global" | "city" | "friends">("global");

  useEffect(() => {
    apiGet<LeaderRes>("/leaderboard")
      .then(res => setData(res.rankings ?? [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const currentUser = data.find(e => e.is_current_user);

  // Reorder for podium display: [rank2, rank1, rank3]
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  const RANK_STYLES: Record<number, { color: string; border: string; barColor: string }> = {
    1: { color: "text-[#1D9E75]", border: "border-[#1D9E75]/50", barColor: "bg-[#1D9E75]" },
    2: { color: "text-slate-300", border: "border-slate-400/30", barColor: "bg-slate-400/50" },
    3: { color: "text-[#CD7F32]", border: "border-[#CD7F32]/30", barColor: "bg-[#CD7F32]/50" },
  };

  function getInitials(name: string) {
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  }

  if (loading) return (
    <div className="pt-12 space-y-6 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-[24px] bg-white/[0.04]" />)}
    </div>
  );

  return (
    <div className="flex flex-col gap-16 relative pt-12 pb-12">

      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1D9E75]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#589d88]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-[48px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#e1e3e0] mb-2">
            Global Impact
          </h2>
          <p className="text-[#bccac1] text-base max-w-xl">
            Live verification pipeline ranking the top contributors across the network.
            All data is immutably stored and synchronized on-chain.
          </p>
        </div>
        {/* Scope filter */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-xl p-1 inline-flex self-start">
          {(["global", "city", "friends"] as const).map(s => (
            <button key={s} onClick={() => setScope(s)}
              className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                scope === s
                  ? "bg-white/10 text-[#e1e3e0] shadow-sm"
                  : "text-[#bccac1] hover:text-[#e1e3e0] hover:bg-white/5"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </header>

      {/* ── Podium Section ──────────────────────────────────── */}
      {top3.length >= 3 && (
        <section className="grid grid-cols-3 gap-6 items-end mt-8 relative z-10">
          {podiumOrder.map((entry) => {
            const r = RANK_STYLES[entry.rank] ?? RANK_STYLES[1];
            const isFirst = entry.rank === 1;
            return (
              <div key={entry.user_id}
                className={`bg-white/[0.03] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:bg-white/[0.05] transition-colors duration-500 ${
                  !isFirst ? (entry.rank === 2 ? "translate-y-8" : "translate-y-12") : "shadow-2xl shadow-[#1D9E75]/10"
                }`}>
                {/* Top bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${r.barColor}`} />
                {/* Gradient overlay for #1 */}
                {isFirst && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#1D9E75]/10 to-transparent pointer-events-none" />
                )}
                {/* Trophy for #1 */}
                {isFirst && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.6" className="w-8 h-8 mb-4 z-10">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                )}
                {/* Avatar */}
                <div className={`${isFirst ? "w-28 h-28" : "w-20 h-20"} rounded-2xl overflow-hidden mb-4 border-2 ${r.border} relative z-10 ${
                  isFirst ? "shadow-[0_0_30px_rgba(104,219,174,0.2)]" : ""
                }`}>
                  <div className={`w-full h-full flex items-center justify-center text-xl font-bold ${
                    isFirst ? "bg-[#1D9E75]/20 text-[#1D9E75]" : entry.rank === 2 ? "bg-slate-500/20 text-slate-300" : "bg-[#CD7F32]/20 text-[#CD7F32]"
                  }`}>
                    {getInitials(entry.name)}
                  </div>
                  <div className={`absolute bottom-0 right-0 px-2 py-0.5 rounded-tl-lg font-mono text-[10px] font-bold ${
                    isFirst ? "bg-[#1D9E75] text-[#003827]" : "bg-[#111C18] border-t border-l " + r.border + " " + r.color
                  }`}>
                    #{entry.rank}
                  </div>
                </div>
                {/* Name */}
                <h3 className={`text-lg font-bold mb-1 ${isFirst ? "text-[#1D9E75]" : "text-[#e1e3e0]"}`}>
                  {entry.name}
                </h3>
                <p className="text-[#bccac1] text-sm mb-4">{entry.is_current_user ? "You" : "Contributor"}</p>
                {/* Stats */}
                <div className={`rounded-xl py-2 px-4 w-full border ${
                  isFirst
                    ? "bg-[#111C18]/80 border-[#1D9E75]/20 flex items-center justify-center gap-3"
                    : "bg-[#111C18]/50 border-white/5"
                }`}>
                  {isFirst && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-4 h-4 shrink-0">
                      <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
                    </svg>
                  )}
                  <div className={isFirst ? "text-left" : ""}>
                    <p className={`font-mono text-sm font-bold tracking-wide ${
                      isFirst ? "text-[#1D9E75] text-lg" : r.color
                    }`}>
                      {entry.total_co2_kg.toLocaleString()} kg
                    </p>
                    <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${isFirst ? "text-[#1D9E75]/70" : "text-[#bccac1]"}`}>
                      CO2 Offset
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* ── Live Rankings Table ─────────────────────────────── */}
      <section className="bg-white/[0.03] backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl overflow-hidden relative z-10 flex flex-col mt-8">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-xl font-bold text-[#e1e3e0]">Live Rankings</h3>
          <span className="flex items-center gap-2 text-xs font-mono text-[#1D9E75] bg-[#1D9E75]/10 px-3 py-1.5 rounded-full border border-[#1D9E75]/20">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
            Chain Synced
          </span>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#111C18]/50 text-xs font-semibold text-[#bccac1] uppercase tracking-wider">
                <th className="p-4 font-normal">Rank</th>
                <th className="p-4 font-normal">Participant</th>
                <th className="p-4 font-normal text-center">Activities</th>
                <th className="p-4 font-normal text-right">Total Offset</th>
                <th className="p-4 font-normal text-right">Credits Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {rest.map((entry) => (
                <tr key={entry.user_id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="p-4 font-mono text-[#bccac1]">
                    {String(entry.rank).padStart(2, "0")}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#589d88]/20 border border-[#589d88]/30 flex items-center justify-center text-[#589d88] font-mono text-xs font-bold">
                      {getInitials(entry.name)}
                    </div>
                    <span className={`font-semibold ${entry.is_current_user ? "text-[#1D9E75]" : "text-[#e1e3e0]"}`}>
                      {entry.is_current_user ? "You" : entry.name}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center bg-[#111C18] border border-white/10 rounded-md w-8 h-8 text-[#e1e3e0] font-mono text-xs">
                      {entry.activity_count}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono text-[#84d6b9]">
                    {entry.total_co2_kg.toLocaleString()} kg
                  </td>
                  <td className="p-4 text-right font-mono text-[#e1e3e0]">
                    {entry.total_credits.toLocaleString()} CCT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Current User Sticky Row */}
        {currentUser && (
          <div className="p-4 border-t border-[#1D9E75]/20 bg-[#26a37a]/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#1D9E75] text-[#003827] font-mono text-sm font-bold px-3 py-1 rounded-md">
                {currentUser.rank}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border-2 border-[#1D9E75] bg-[#1D9E75]/20 flex items-center justify-center text-[#1D9E75] font-bold text-sm">
                  {getInitials(currentUser.name)}
                </div>
                <div>
                  <span className="font-bold text-[#1D9E75] block">You</span>
                  <span className="text-xs text-[#bccac1] font-mono">
                    Top {Math.max(1, Math.round((currentUser.rank / Math.max(data.length, 1)) * 100))}% Globally
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-8 text-right">
              <div>
                <p className="text-[10px] text-[#bccac1] uppercase tracking-wider mb-1">Total Offset</p>
                <p className="font-mono text-[#1D9E75] font-bold">{currentUser.total_co2_kg.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-[10px] text-[#bccac1] uppercase tracking-wider mb-1">Credits</p>
                <p className="font-mono text-[#e1e3e0] font-bold">{currentUser.total_credits.toLocaleString()} CCT</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
