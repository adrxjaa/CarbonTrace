"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

const authRoutes = new Set(["/login", "/register"]);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showNav = !authRoutes.has(pathname);

  return (
    <div className="min-h-screen pb-8">
      {showNav ? <Navbar /> : null}
      <main className="mx-auto flex w-full max-w-[1720px] flex-1 px-3 pt-4 sm:px-5 sm:pt-5 lg:px-6">
        {children}
      </main>
    </div>
  );
}
