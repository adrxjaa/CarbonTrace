"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      router.push("/signin");
    } else if (storedUser.role !== "admin") {
      router.push("/dashboard");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  return (
    <div className="bg-surface-dark text-on-surface font-body-main text-body-main antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex">
      {/* SideNavBar */}
      <nav className="hidden lg:flex flex-col h-screen sticky top-0 py-8 px-4 bg-[#111C18] w-64 border-r border-white/5 text-[#1D9E75] font-sans text-sm tracking-wide transition-colors duration-150 ease-in-out shrink-0">
        <div className="mb-10 px-4">
          <h1 className="text-emerald-500 font-mono font-bold text-xl tracking-tight text-white mb-1">CarbonTrace</h1>
          <p className="text-on-surface-variant text-xs">Verified Impact</p>
        </div>
        <div className="flex flex-col gap-2 flex-grow">
          {/* Active Tab */}
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === "/admin/dashboard" ? "bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500" : "text-emerald-100/50 hover:bg-emerald-500/5 hover:text-emerald-200"}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/sponsor-applications" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === "/admin/sponsor-applications" ? "bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500" : "text-emerald-100/50 hover:bg-emerald-500/5 hover:text-emerald-200"}`}>
            <span className="material-symbols-outlined">corporate_fare</span>
            <span>Sponsor Applications</span>
          </Link>
          <Link href="/admin/provider-applications" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === "/admin/provider-applications" ? "bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500" : "text-emerald-100/50 hover:bg-emerald-500/5 hover:text-emerald-200"}`}>
            <span className="material-symbols-outlined">storefront</span>
            <span>Provider Applications</span>
          </Link>
          <Link href="/admin/submissions" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === "/admin/submissions" ? "bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500" : "text-emerald-100/50 hover:bg-emerald-500/5 hover:text-emerald-200"}`}>
            <span className="material-symbols-outlined">assignment</span>
            <span>Submissions</span>
          </Link>
          <Link href="/admin/audit-log" className={`flex items-center gap-3 px-4 py-3 rounded-lg ${pathname === "/admin/audit-log" ? "bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-500" : "text-emerald-100/50 hover:bg-emerald-500/5 hover:text-emerald-200"}`}>
            <span className="material-symbols-outlined">history</span>
            <span>Audit Log</span>
          </Link>
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#026951]/20 border border-[#026951]/50 text-[#26a37a] hover:bg-[#026951]/40 transition-colors font-medium">
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
          
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-[#111C18] border border-[#3d4943] flex items-center justify-center font-bold text-[#e1e3e0] text-sm overflow-hidden shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
              {user ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "AM"}
            </div>
            <div className="flex flex-col">
              <span className="text-[#e1e3e0] text-sm font-bold tracking-tight">{user ? user.name : "Alex Mercer"}</span>
              <span className="text-[#87948c] text-[10px] font-mono tracking-widest uppercase mt-0.5">System Admin</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col min-w-0">
        {children}
      </main>

      {/* BottomNavBar (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 pb-safe px-4 bg-emerald-950/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-3xl text-[10px] font-medium uppercase tracking-tighter tap-highlight-transparent active:bg-emerald-500/10">
        <Link href="/admin/dashboard" className={`flex flex-col items-center justify-center ${pathname === "/admin/dashboard" ? "text-emerald-400 scale-110" : "text-emerald-100/40"}`}>
          <span className="material-symbols-outlined mb-1">home</span>
          <span>Home</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-emerald-100/40">
          <span className="material-symbols-outlined mb-1">corporate_fare</span>
          <span>Sponsors</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-emerald-100/40">
          <span className="material-symbols-outlined mb-1">storefront</span>
          <span>Providers</span>
        </Link>
        <Link href="#" className="flex flex-col items-center justify-center text-emerald-100/40">
          <span className="material-symbols-outlined mb-1">menu</span>
          <span>Menu</span>
        </Link>
      </nav>
    </div>
  );
}
