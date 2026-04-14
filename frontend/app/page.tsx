"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

type ActivityIcon = "transit" | "charge" | "tree";

const stats = [
  { label: "Credits earned", value: "1,842", note: "+128 today" },
  { label: "Submissions", value: "34", note: "3 pending" },
  { label: "Verify rate", value: "91%", note: "+2% vs last month" },
  { label: "Flagged", value: "2", note: "Needs review" },
];

const activity = [
  { icon: "transit" as ActivityIcon, title: "Public transit", time: "Today 09:14", credits: "+18", tone: "warning" as const, status: "Pending" },
  { icon: "charge" as ActivityIcon, title: "EV charge · 42 kWh", time: "Yesterday 18:30", credits: "+55", tone: "positive" as const, status: "Verified" },
  { icon: "tree" as ActivityIcon, title: "Tree planting · 3 saplings", time: "Apr 12", credits: "+30", tone: "positive" as const, status: "Verified" },
  { icon: "transit" as ActivityIcon, title: "Public transit · Silk Board", time: "Apr 11", credits: "+18", tone: "danger" as const, status: "Flagged" },
];

const chartBars = [40, 58, 49, 67, 61, 79, 64, 86, 60, 70, 75, 66, 83, 92];

function ActivityGlyph({ icon }: { icon: ActivityIcon }) {
  if (icon === "transit") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
        <rect x="5" y="4.5" width="14" height="11" rx="3" />
        <path d="M8 15.5v2M16 15.5v2M5 10h14M8.5 19h7" />
        <circle cx="8.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (icon === "charge") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M13 2 6.5 13h4l-1 9L17.5 11h-4L13 2Z" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-5 w-5">
      <path d="M12 20v-6" />
      <path d="M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
    </svg>
  );
}

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { pushToast } = useToast();

  return (
    <section className="flex w-full flex-col gap-5 pb-6">
      <div className="dark-dashboard dashboard-grid relative min-h-[calc(100vh-8.5rem)] overflow-hidden rounded-[34px] border border-white/10 px-4 py-5 text-white shadow-[0_24px_80px_rgba(7,22,18,0.22)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(29,158,117,0.18),transparent_28%)]" />
        <div className="relative z-10">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.34em] text-[#7ee0bf]">ecotrace / overview</p>
              <div className="mt-6 flex items-end gap-3">
                <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl xl:text-7xl">247.3</h1>
                <span className="pb-2 text-lg text-white/60 sm:text-xl">kg CO2</span>
              </div>
              <p className="mt-4 max-w-3xl text-sm uppercase tracking-[0.22em] text-white/48 sm:text-base">
                Total carbon offset this month across verified individual actions
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <span className="h-2.5 w-2.5 rounded-full bg-[#41dfaa] shadow-[0_0_18px_rgba(65,223,170,0.8)]" />
              Chain synced
            </div>
          </div>

          <div className="mt-6 grid gap-px overflow-hidden rounded-[26px] border border-white/8 bg-white/8 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="bg-[#10251f]/90 px-5 py-5 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.18em] text-white/48">{item.label}</p>
                <p className="mt-3 text-4xl font-semibold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-[#6fe2b7]">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 2xl:grid-cols-[1.45fr_0.85fr]">
            <div className="rounded-[28px] border border-white/8 bg-[#0f221d]/82 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/45">Offset activity · last 14 days</p>
                  <p className="mt-2 text-sm text-white/62">Momentum is strongest on verified commute and charging days.</p>
                </div>
                <Badge tone="positive">+17% trend</Badge>
              </div>

              <div className="mt-8 flex h-56 items-end gap-2 sm:gap-3 xl:h-64">
                {chartBars.map((height, index) => (
                  <div key={index} className="flex flex-1 flex-col justify-end">
                    <div
                      className="rounded-t-md border border-[#3ac596]/30 bg-gradient-to-t from-[#184d3d] to-[#1faa80]"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-white/8 bg-[#0f221d]/82 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/45">Credit balance</p>
                  <p className="mt-2 text-4xl font-semibold">1,842</p>
                </div>
                <div className="rounded-2xl bg-white/6 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/42">Available this cycle</p>
                  <p className="mt-1 text-lg font-medium text-[#82e8c2]">+128 credits</p>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#1d9e75]/20 bg-[#133128] p-4 text-sm text-white/72">
                Most credits are coming from EV charging proofs and recurring transit logs. Review two flagged items before final settlement.
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setIsModalOpen(true)}
              >
                Submit evidence
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {activity.map((item) => (
              <div
                key={`${item.title}-${item.time}`}
                className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#10251f]/88 px-4 py-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#2fb488]/25 bg-[#15382f] text-[#82e8c2]">
                  <ActivityGlyph icon={item.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-white/45">{item.time}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={item.tone}>{item.status}</Badge>
                  <span className="text-xl font-semibold text-[#6fe2b7]">{item.credits}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-forest">Verification pipeline</p>
              <h2 className="mt-3 text-2xl font-semibold text-body">Activity history</h2>
            </div>
            <Button variant="secondary">Export</Button>
          </div>

          <div className="mt-6 space-y-4">
            {activity.map((item) => (
              <div key={`history-${item.title}-${item.time}`} className="flex items-start gap-4 rounded-[24px] bg-white/70 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-deep">
                  <ActivityGlyph icon={item.icon} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-body">{item.title}</p>
                      <p className="text-sm text-body/60">{item.time}</p>
                    </div>
                    <span className="text-sm font-semibold text-deep">{item.credits}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.32em] text-forest">Advisory</p>
          <h2 className="mt-3 text-2xl font-semibold text-body">What to improve next</h2>
          <div className="mt-6 space-y-4">
            {[
              "Upload evidence within 4 hours for better verification speed.",
              "Bundle recurring transit rides into a weekly claim.",
              "Resolve the two flagged activities before month close.",
            ].map((tip) => (
              <div key={tip} className="rounded-[24px] bg-mint p-4 text-sm text-body">
                {tip}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={isModalOpen}
        title="Submit new evidence"
        description="This modal is UI-only for now. It previews the upload flow without a backend connection."
        onClose={() => setIsModalOpen(false)}
      >
        <div className="rounded-[24px] border border-white/8 bg-white/4 p-4 text-sm text-white/70">
          Accepted proof types: charging bills, commute receipts, geo-tagged photos, and community verification notes.
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => {
              setIsModalOpen(false);
              pushToast({
                tone: "info",
                title: "Mock upload started",
                description: "Connect the backend API to make this flow persist activity evidence.",
              });
            }}
          >
            Continue
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </section>
  );
}
