import { ReactNode } from "react";
import { SponsorSidebar } from "@/components/sponsor/sidebar";

export default function SponsorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F4F6F3] text-[#111C18]">
      <SponsorSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
