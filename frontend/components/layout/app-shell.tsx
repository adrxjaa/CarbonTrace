"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

const AUTH_PREFIXES = [
  "/login", "/register",
  "/signin", "/signup", "/splash",
  "/provider-register", "/sponsor-register",
  "/dashboard", "/activities", "/submit", "/leaderboard", "/wallet",
  "/profile", "/verification",
  "/admin", "/sponsor",
];

function isAuthRoute(pathname: string) {
  return AUTH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showShell = !isAuthRoute(pathname);

  if (!showShell) {
    // Auth pages manage their own full-page layout — render children bare
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen pb-8">
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1720px] flex-1 px-3 pt-4 sm:px-5 sm:pt-5 lg:px-6">
        {children}
      </main>
    </div>
  );
}
