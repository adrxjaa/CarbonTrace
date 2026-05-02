import type { ReactNode } from "react";

/**
 * (auth) route group layout — full-page dark mode, no AppShell.
 * All auth routes (splash, signin, signup, provider-register, sponsor-register)
 * use this layout instead of the main AppShell.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0D1712] text-white">
      {/* Ambient glow orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-[-10%] top-[-10%] h-[60vh] w-[60vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-[-5%] left-[-5%] h-[50vh] w-[50vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(104,219,174,0.08) 0%, transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
