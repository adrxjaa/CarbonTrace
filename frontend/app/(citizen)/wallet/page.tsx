"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

type Credit = {
  id: string; submission_id: string | null; credit_amount: number; co2_kg: number;
  status: string; tx_hash: string | null; cycle: string; created_at: string; confirmed_at: string | null;
};
type Wallet = {
  total_credits: number; available_credits: number; pending_credits: number;
  redeemed_credits: number; total_co2_kg: number; credit_history: Credit[];
};

const TIER_MAX = 2000;
const OFFERS = [
  { icon: "directions_bus", title: "₹200 Transit Voucher", desc: "Valid for all Metro and BRTS services city-wide.", cost: 500, action: "Redeem" },
  { icon: "ev_station",     title: "EV Charging Discount", desc: "50% off your next charge at participating networks.", cost: 300, action: "Redeem" },
  { icon: "park",           title: "Sponsor a Tree",       desc: "Donate credits to local urban forestry initiatives.", cost: 100, action: "Donate" },
];

const STATUS_PILL: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  confirmed: { bg: "bg-[#10B981]/10 border-[#10B981]/20", dot: "bg-[#10B981]", text: "text-[#10B981]", label: "Verified" },
  pending:   { bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20", dot: "bg-[#F59E0B]", text: "text-[#F59E0B]", label: "Pending" },
  redeemed:  { bg: "bg-[#323534] border-[rgba(255,255,255,0.08)]", dot: "bg-[#bccac1]", text: "text-[#bccac1]", label: "Redeemed" },
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Wallet>("/credits/wallet")
      .then(setWallet).catch(console.error).finally(() => setLoading(false));
  }, []);

  const tierPct = wallet ? Math.min((wallet.total_credits / TIER_MAX) * 100, 100) : 0;

  if (loading) return (
    <div className="pt-12 space-y-6 animate-pulse">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-[32px] bg-white/[0.04]" />)}
    </div>
  );

  if (!wallet) return null;

  return (
    <div className="space-y-16 pt-12 pb-12">

      {/* ── Section: Balance Overview ─────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Main Balance Card (8 cols) */}
        <div className="lg:col-span-8 bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-[32px] p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#26a37a] rounded-full mix-blend-screen blur-[80px] opacity-20 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <h1 className="text-[48px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#e1e3e0] mb-2">
                {wallet.total_credits.toLocaleString()}
              </h1>
              <p className="text-base text-[#bccac1] flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-5 h-5">
                  <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
                </svg>
                Total Verified Credits
              </p>
            </div>
            {/* Mini stat boxes */}
            <div className="flex gap-4">
              <div className="bg-[#323534] rounded-xl p-4 min-w-[120px] border border-[rgba(255,255,255,0.08)]">
                <p className="text-xs font-semibold text-[#bccac1] uppercase tracking-wider mb-1">Available</p>
                <p className="text-2xl font-bold text-[#1D9E75]">{wallet.available_credits.toLocaleString()}</p>
              </div>
              <div className="bg-[#323534] rounded-xl p-4 min-w-[120px] border border-[rgba(255,255,255,0.08)]">
                <p className="text-xs font-semibold text-[#bccac1] uppercase tracking-wider mb-1">Locked</p>
                <p className="text-2xl font-bold text-[#F59E0B]">{wallet.pending_credits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-10 relative z-10">
            <div className="flex justify-between items-end mb-3">
              <p className="text-sm text-[#bccac1]">Next Reward Tier: Elite Planter</p>
              <p className="font-mono text-sm tracking-wider font-medium text-[#e1e3e0]">
                {wallet.total_credits.toLocaleString()} / {TIER_MAX.toLocaleString()} CC
              </p>
            </div>
            <div className="w-full h-3 bg-[#323534] rounded-full overflow-hidden">
              <div className="h-full bg-[#1D9E75] rounded-full shadow-[0_0_15px_rgba(29,158,117,0.5)] transition-all duration-700"
                style={{ width: `${tierPct}%` }} />
            </div>
          </div>
        </div>

        {/* Chain State Card (4 cols) */}
        <div className="lg:col-span-4 bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-[32px] p-6 flex flex-col justify-between border-t-4 border-t-[#1D9E75]">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2 bg-[#1D9E75]/10 rounded-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-5 h-5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </span>
            <h3 className="text-xl font-bold text-[#e1e3e0]">Chain State</h3>
          </div>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-3">
              <span className="text-sm text-[#bccac1]">Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-mono text-xs text-[#10B981]">Synced</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-b border-[rgba(255,255,255,0.08)] pb-3">
              <span className="text-sm text-[#bccac1]">Last Block</span>
              <span className="font-mono text-xs text-[#e1e3e0]">#14,892,001</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#bccac1]">Network</span>
              <span className="text-xs font-semibold bg-[#323534] px-2 py-1 rounded text-[#e1e3e0]">Polygon</span>
            </div>
          </div>
          <button className="w-full border border-[#1D9E75]/50 text-[#1D9E75] bg-transparent hover:bg-[#1D9E75]/10 py-3 rounded-xl text-xs font-semibold transition-colors flex justify-center items-center gap-2">
            View on Explorer
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Section: Redeem Credits ───────────────────────── */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-[#e1e3e0]">Redeem Credits</h2>
          <a className="text-sm text-[#1D9E75] hover:underline" href="#">View All Offers</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFERS.map((o) => (
            <div key={o.title} className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 flex flex-col group hover:border-[#1D9E75]/30 transition-colors">
              {/* Image area */}
              <div className="h-32 rounded-xl bg-[#323534] mb-4 overflow-hidden relative flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
                <div className="w-full h-full bg-gradient-to-br from-[#026951] to-[#191c1b] opacity-80 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" className="w-12 h-12 opacity-40">
                    {o.icon === "directions_bus" && <path d="M8 6v6M16 6v6M2 12h20M4 18v2m16-2v2M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />}
                    {o.icon === "ev_station" && <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="7" x2="12" y2="13" /><polyline points="9 11 12 13 15 11" /></>}
                    {o.icon === "park" && <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />}
                  </svg>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1 text-[#e1e3e0] line-clamp-1">{o.title}</h3>
              <p className="text-sm text-[#bccac1] mb-4 line-clamp-2">{o.desc}</p>
              <div className="mt-auto flex justify-between items-center pt-4 border-t border-[rgba(255,255,255,0.08)]">
                <span className="font-mono text-sm tracking-wider font-medium text-[#1D9E75]">{o.cost} CC</span>
                <button className="bg-[#323534] hover:bg-[#373a38] text-[#e1e3e0] px-4 py-2 rounded-lg text-xs font-semibold transition-colors">
                  {o.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: Transaction Ledger ───────────────────── */}
      <section>
        <h2 className="text-2xl font-bold text-[#e1e3e0] mb-6">Recent Transactions</h2>
        <div className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#191c1b]/50">
                  <th className="py-4 px-6 text-xs font-semibold text-[#bccac1] uppercase tracking-wider font-normal">Date</th>
                  <th className="py-4 px-6 text-xs font-semibold text-[#bccac1] uppercase tracking-wider font-normal">Activity</th>
                  <th className="py-4 px-6 text-xs font-semibold text-[#bccac1] uppercase tracking-wider font-normal">Credits</th>
                  <th className="py-4 px-6 text-xs font-semibold text-[#bccac1] uppercase tracking-wider font-normal">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-[#bccac1] uppercase tracking-wider font-normal hidden sm:table-cell">Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
                {wallet.credit_history.slice(0, 8).map((c) => {
                  const s = STATUS_PILL[c.status] ?? STATUS_PILL.pending;
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-sm text-[#e1e3e0]">
                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="py-4 px-6 text-sm text-[#e1e3e0] flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke={c.status === "redeemed" ? "#bccac1" : "#1D9E75"} strokeWidth="1.6" className="w-4 h-4 shrink-0">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        {c.status === "redeemed" ? "Voucher Redemption" : `Carbon Credit — ${c.cycle}`}
                      </td>
                      <td className="py-4 px-6 font-mono text-sm tracking-wider font-medium">
                        <span className={c.status === "redeemed" ? "text-[#bccac1]" : "text-[#1D9E75]"}>
                          {c.status === "redeemed" ? `-${c.credit_amount}` : `+${c.credit_amount}`}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${s.bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          <span className={`text-[10px] font-semibold uppercase tracking-widest ${s.text}`}>{s.label}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-[#bccac1] hidden sm:table-cell">
                        {c.tx_hash ? `${c.tx_hash.slice(0, 6)}…${c.tx_hash.slice(-4)}` : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {wallet.credit_history.length === 0 && (
            <div className="py-12 text-center text-[#bccac1] text-sm">No transactions yet.</div>
          )}
          {wallet.credit_history.length > 8 && (
            <div className="px-6 py-4 border-t border-[rgba(255,255,255,0.08)] text-center bg-[#0c0f0e]/30">
              <button className="text-sm text-[#bccac1] hover:text-[#e1e3e0] transition-colors">Load More History</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
