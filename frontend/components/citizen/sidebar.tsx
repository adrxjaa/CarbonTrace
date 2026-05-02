"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearAuth } from "@/lib/api";

const NAV = [
  {
    href: "/dashboard", label: "Dashboard",
    icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
  {
    href: "/activities", label: "Activities",
    icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  },
  {
    href: "/leaderboard", label: "Leaderboard",
    icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  },
  {
    href: "/wallet", label: "Wallet",
    icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></>,
  },
  {
    href: "/activities?status=FLAGGED", label: "Verification",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  },
];

const BOTTOM = [
  { href: "/profile", label: "Profile", icon: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></> },
  { href: "/profile", label: "Settings", icon: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.2-7.8-1.4 1.4M6.6 17.4l-1.4 1.4m0-11.6 1.4 1.4m8.8 8.8 1.4 1.4" /></> },
  { href: "#", label: "Support", icon: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" /></> },
];

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0">
      {children}
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    const base = href.split("?")[0];
    return pathname === base || (base !== "/dashboard" && pathname.startsWith(base));
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 bg-[#111C18] border-r border-white/5 px-4 pt-8 pb-8">

      {/* Logo */}
      <div className="mb-8 px-4">
        <h2 className="text-[#1D9E75] font-bold text-lg">CarbonTrace</h2>
        <p className="text-white text-xs">Verified Impact</p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm tracking-wide transition-colors duration-150 ${
                active
                  ? "bg-[#1D9E75]/10 text-[#1D9E75] border-l-2 border-[#1D9E75] rounded-r-lg font-medium"
                  : "text-[#bccac1] hover:bg-white/5 hover:text-[#e1e3e0] rounded-lg"
              }`}>
              <NavIcon>{item.icon}</NavIcon>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-2 pt-8">
        {BOTTOM.map((item) => (
          <Link key={item.label} href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm tracking-wide text-[#bccac1] hover:bg-white/5 hover:text-[#e1e3e0] transition-colors duration-150">
            <NavIcon>{item.icon}</NavIcon>
            {item.label}
          </Link>
        ))}

        {/* Submit Activity CTA */}
        <Link href="/submit" id="sidebar-submit-activity"
          className="flex items-center justify-center w-full mt-4 py-3 px-4 rounded-lg bg-[#1D9E75] text-[#111C18] font-bold hover:bg-[#1D9E75]/90 transition-all">
          Submit Activity
        </Link>
      </div>
    </aside>
  );
}
