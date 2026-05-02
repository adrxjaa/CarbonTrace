"use client";

/**
 * Side illustration panel — used by sign-in and sign-up pages (right side, lg+).
 * Matches the design screenshots: dark rounded card with "Securing the future
 * of carbon markets" headline and system status badge.
 */
export function AuthSidePanel() {
  return (
    <div className="hidden lg:flex fixed right-0 top-0 bottom-0 w-[38%] p-10 pointer-events-none">
      <div
        className="w-full h-full rounded-[40px] overflow-hidden relative flex flex-col justify-end p-10"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          background: "linear-gradient(160deg, #0f2319 0%, #071510 100%)",
        }}
      >
        {/* Abstract carbon-fiber grid pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(29,158,117,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(29,158,117,0.07) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow orb inside panel */}
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 w-2/3 h-2/3 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(29,158,117,0.25), transparent 60%)",
          }}
        />

        {/* Bottom content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-12 bg-[#1D9E75]" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#1D9E75]">
              System Status: Operational
            </span>
          </div>
          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Securing the future<br />of carbon markets.
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Leverage AI-verified evidence and immutable ledger technology to
            transform sustainability into a tangible asset.
          </p>

          {/* Footer badges */}
          <div className="mt-8 flex items-center gap-5 opacity-50">
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-widest">AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
              </svg>
              <span className="font-mono text-[10px] uppercase tracking-widest">Web3 Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
