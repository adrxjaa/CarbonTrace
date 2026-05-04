import { ReactNode } from "react";
import { SponsorSidebar } from "@/components/sponsor/sidebar";

export default function SponsorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0C1411] text-white">
      <SponsorSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
