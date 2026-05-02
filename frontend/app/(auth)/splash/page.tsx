import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join CarbonTrace — Select Your Role",
  description:
    "Select your role to begin contributing to a verified sustainable future on CarbonTrace.",
};

const roles = [
  {
    id: "citizen",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    title: "Citizen",
    description:
      "Track your personal environmental impact, participate in green initiatives, and earn verified impact credits for your daily actions.",
    badge: "Personal Tracking",
    badgeIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    href: "/signup",
    cta: "Select Citizen",
  },
  {
    id: "provider",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
        <path d="M12 20.94c1.5.6 4.5 1.06 5 1.06 2.21 0 4-1.79 4-4v-1c0-1.1-.9-2-2-2h-1" />
        <path d="M12 20.94c-1.5.6-4.5 1.06-5 1.06C4.79 22 3 20.21 3 18v-1c0-1.1.9-2 2-2h1" />
        <path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" />
        <path d="M10 10a2 2 0 1 1 4 0" />
      </svg>
    ),
    title: "Sustainable Provider",
    description:
      "Issue activity tokens to your customers, integrate via our robust API, and showcase your business's verified ecological contributions.",
    badge: "Full API Access",
    badgeIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
        <circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3m-4.2-7.8-2.1 2.1M8.3 15.7l-2.1 2.1m0-11.6 2.1 2.1m7.4 7.4 2.1 2.1" />
      </svg>
    ),
    href: "/provider-register",
    cta: "Select Provider",
  },
  {
    id: "sponsor",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Corporate Sponsor",
    description:
      "Monitor large-scale program impact, distribute ESG incentives, and manage comprehensive sustainability portfolios with real-time analytics.",
    badge: "Enterprise Dashboard",
    badgeIcon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    href: "/sponsor-register",
    cta: "Select Sponsor",
  },
];

export default function SplashPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1D9E75]/20 border border-[#1D9E75]/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.8" className="w-4 h-4">
              <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight">CarbonTrace</span>
        </div>
        <div className="flex items-center gap-3">
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <span>Verify</span><span>Marketplace</span><span>Network</span>
          </nav>
          <Link
            href="/signin"
            className="px-4 py-2 rounded-xl border border-[#1D9E75] text-[#1D9E75] text-sm font-semibold hover:bg-[#1D9E75]/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Join the CarbonTrace<br />Network
        </h1>
        <p className="text-white/50 text-base md:text-lg max-w-lg mb-16">
          Select your role to begin contributing to a verified sustainable future.
          Each account type is powered by immutable blockchain verification.
        </p>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex flex-col rounded-[28px] p-7 text-left group transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center text-[#1D9E75]"
                style={{ background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.2)" }}>
                {role.icon}
              </div>

              <h2 className="text-white font-bold text-xl mb-3">{role.title}</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-5 flex-1">{role.description}</p>

              {/* Badge */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-5 w-fit"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span className="text-[#1D9E75]">{role.badgeIcon}</span>
                <span className="text-white/60 text-xs font-medium">{role.badge}</span>
              </div>

              {/* CTA */}
              <Link
                href={role.href}
                id={`select-${role.id}`}
                className="w-full py-3.5 rounded-xl bg-[#1D9E75] text-white font-semibold text-sm text-center hover:bg-[#17896a] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_rgba(29,158,117,0.3)] hover:shadow-[0_4px_28px_rgba(29,158,117,0.5)]"
              >
                {role.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Network badge */}
        <div className="mt-12 px-8 py-4 rounded-2xl flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-2 h-2 rounded-full bg-[#1D9E75] shadow-[0_0_8px_rgba(29,158,117,0.8)]" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Network Secured by Proof-of-Impact
          </span>
        </div>
      </div>
    </main>
  );
}
