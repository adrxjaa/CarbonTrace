"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4 lg:px-6">
      <div className="glass-panel mx-auto flex w-full max-w-[1720px] items-center justify-between rounded-[24px] px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-deep text-sm font-bold text-white">
            CT
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-forest">CarbonTrace</p>
            <p className="text-sm text-body/70">Climate actions, tracked clearly</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active ? "bg-deep text-white" : "text-body/75 hover:bg-white/70",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Button size="sm" className="ml-2">Submit Activity</Button>
        </nav>

        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setOpen((current) => !current)}
        >
          Menu
        </Button>
      </div>

      {open ? (
        <div className="glass-panel mx-auto mt-3 flex w-full max-w-[1720px] flex-col gap-2 rounded-[24px] p-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-medium",
                pathname === link.href ? "bg-deep text-white" : "bg-white/40 text-body",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button className="mt-1 w-full">Submit Activity</Button>
        </div>
      ) : null}
    </header>
  );
}
