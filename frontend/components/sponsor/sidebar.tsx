"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/sponsor/dashboard", icon: "grid_view" },
  { label: "Analytics", href: "/sponsor/analytics", icon: "analytics" },
  { label: "Leaderboard", href: "/sponsor/leaderboard", icon: "leaderboard" },
  { label: "Wallet", href: "/sponsor/wallet", icon: "account_balance_wallet" },
  { label: "Settings", href: "/sponsor/settings", icon: "settings" },
];

export function SponsorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col bg-[#111C18] border-r border-[rgba(255,255,255,0.08)] h-screen sticky top-0 py-6 px-4">
      <div className="flex items-center gap-3 px-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1D9E75] to-[#0F6E56] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-[18px]">eco</span>
        </div>
        <div>
          <h1 className="text-white font-bold tracking-widest text-sm">CARBONTRACE</h1>
          <p className="text-[#87948c] text-xs">Sponsor Portal</p>
        </div>
      </div>

      <button className="w-full bg-[#1D9E75] hover:bg-[#26a37a] text-white rounded-[12px] py-3 px-4 flex items-center justify-center gap-2 font-medium text-sm transition-colors mb-8">
        <span className="material-symbols-outlined text-[18px]">add_circle</span>
        Deposit Credits
      </button>

      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all text-sm font-medium",
                isActive
                  ? "bg-[rgba(29,158,117,0.1)] text-[#A8F0D8] border border-[rgba(29,158,117,0.2)]"
                  : "text-[#87948c] hover:bg-[#111C18] hover:text-[#bccac1]"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 py-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
        <span className="text-[#10B981] text-xs font-medium">Chain Synced</span>
      </div>
    </aside>
  );
}
