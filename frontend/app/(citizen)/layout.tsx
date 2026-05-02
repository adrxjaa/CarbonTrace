"use client";

import { useEffect, ReactNode } from "react";
import { Sidebar } from "@/components/citizen/sidebar";

export default function CitizenLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) window.location.href = "/signin";
  }, []);

  return (
    <div className="flex min-h-screen bg-[#111C18]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
