"use client";

import Image from "next/image";

export default function AuditLogPage() {
  return (
    <div className="flex-1 p-container-padding bg-surface-dark min-h-screen">
      {/* Page Header */}
      <header className="flex justify-between items-end mb-section-gap">
        <div>
          <h2 className="font-display-hero text-display-hero text-on-surface mb-2">System Audit Log</h2>
          <p className="font-body-main text-body-main text-on-surface-variant max-w-2xl">Chronological record of all administrative and automated actions on the CarbonTrace platform. Immutable and cryptographically verified.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-lg border border-glass-border">
            <span className="material-symbols-outlined text-primary text-sm">sync</span>
            <span className="font-data-mono text-data-mono text-primary">Live Sync</span>
          </div>
          <button className="px-4 py-2 border border-primary/50 text-primary rounded-lg font-chip-label text-chip-label hover:bg-primary/10 transition-colors">
            Export CSV
          </button>
        </div>
      </header>

      {/* Filters & Controls */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="w-full pl-10 pr-4 py-3 bg-surface-container border border-glass-border rounded-xl font-body-main text-body-main text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Search by ID, User, or Action..." type="text"/>
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-3 bg-surface-container border border-glass-border rounded-xl font-body-main text-body-main text-on-surface focus:outline-none focus:border-primary appearance-none pr-10 relative">
            <option>All Actions</option>
            <option>Approvals</option>
            <option>Modifications</option>
            <option>System Events</option>
          </select>
          <select className="px-4 py-3 bg-surface-container border border-glass-border rounded-xl font-body-main text-body-main text-on-surface focus:outline-none focus:border-primary appearance-none pr-10">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table (Bento Style/Glassmorphism) */}
      <div className="bg-surface-container/50 backdrop-blur-xl border border-glass-border rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_auto] gap-4 p-6 border-b border-glass-border bg-surface-container/30">
          <div className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Timestamp (UTC)</div>
          <div className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Admin / Actor</div>
          <div className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Action Event</div>
          <div className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">Target ID</div>
          <div className="font-chip-label text-chip-label text-on-surface-variant uppercase tracking-wider">IP Address</div>
          <div className="w-8"></div>
        </div>

        {/* Log Entries */}
        <div className="divide-y divide-glass-border">
          <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_auto] gap-4 p-6 items-center hover:bg-surface-container/40 transition-colors">
            <div className="font-data-mono text-data-mono text-on-surface">2023-10-27 14:32:01</div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary font-chip-label text-[10px]">SA</div>
              <span className="font-body-main text-body-main text-on-surface">sys_admin_01</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-verified"></span>
              <span className="font-body-main text-body-main text-status-verified">Approved Provider</span>
            </div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">PRV-8829-XJ</div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">192.168.1.42</div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>

          <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_auto] gap-4 p-6 items-center hover:bg-surface-container/40 transition-colors bg-surface-container-low/20">
            <div className="font-data-mono text-data-mono text-on-surface">2023-10-27 13:15:44</div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-status-processing/20 flex items-center justify-center text-status-processing font-chip-label text-[10px]">SY</div>
              <span className="font-body-main text-body-main text-on-surface">system_auto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-processing"></span>
              <span className="font-body-main text-body-main text-on-surface">Chain Sync Completed</span>
            </div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">BLK-1049221</div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">10.0.0.1</div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>

          <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_auto] gap-4 p-6 items-center hover:bg-surface-container/40 transition-colors">
            <div className="font-data-mono text-data-mono text-on-surface">2023-10-27 11:05:12</div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-status-flagged/20 flex items-center justify-center text-status-flagged font-chip-label text-[10px]">JD</div>
              <span className="font-body-main text-body-main text-on-surface">j.doe_audit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-flagged"></span>
              <span className="font-body-main text-body-main text-status-flagged">Flagged Submission</span>
            </div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">SUB-2023-991A</div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">203.0.113.85</div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>

          <div className="grid grid-cols-[1.5fr_1.5fr_2fr_1.5fr_1fr_auto] gap-4 p-6 items-center hover:bg-surface-container/40 transition-colors bg-surface-container-low/20">
            <div className="font-data-mono text-data-mono text-on-surface">2023-10-27 09:45:00</div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-status-pending/20 flex items-center justify-center text-status-pending font-chip-label text-[10px]">MK</div>
              <span className="font-body-main text-body-main text-on-surface">m.khan_ops</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-status-pending"></span>
              <span className="font-body-main text-body-main text-status-pending">Modified Credit Rate</span>
            </div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">CFG-RATE-04</div>
            <div className="font-data-mono text-data-mono text-on-surface-variant">198.51.100.14</div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-glass-border flex justify-between items-center bg-surface-container/30">
          <span className="font-body-main text-body-main text-on-surface-variant">Showing 1-4 of 1,024 entries</span>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-lg border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-data-mono text-sm">
              1
            </button>
            <button className="w-10 h-10 rounded-lg border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors font-data-mono text-sm">
              2
            </button>
            <button className="w-10 h-10 rounded-lg border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors font-data-mono text-sm">
              3
            </button>
            <span className="flex items-center justify-center px-2 text-on-surface-variant">...</span>
            <button className="w-10 h-10 rounded-lg border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
