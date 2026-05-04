export default function SponsorDashboard() {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-sans tracking-tight text-[#111C18] mb-2">Sponsor Overview</h1>
          <p className="text-[#87948c] text-sm">Monitor program performance and collective impact.</p>
        </div>
        <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-[12px] text-sm text-[#87948c]">
          Current Cycle: <span className="text-[#A8F0D8] font-medium ml-1">Q3 2024</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon="payments" 
          change="+12.4%" 
          value="145,200" 
          unit="CTK"
          label="Total Credits Distributed" 
        />
        <StatCard 
          icon="group" 
          change="+8.2%" 
          value="4,892" 
          unit=""
          label="Active Participants" 
        />
        <StatCard 
          icon="energy_savings_leaf" 
          change="+24.1%" 
          value="1,204" 
          unit="tCO2e"
          label="Collective CO2 Offset" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Breakdown Chart */}
        <div className="lg:col-span-2 bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-sans text-white">Activity Breakdown</h2>
            <div className="flex bg-[#F4F6F3] rounded-[12px] p-1 border border-[rgba(255,255,255,0.08)]">
              <button className="px-4 py-1 text-xs font-medium text-[#87948c] hover:text-white rounded-md">Week</button>
              <button className="px-4 py-1 text-xs font-medium bg-[#1D9E75] text-white rounded-md">Month</button>
              <button className="px-4 py-1 text-xs font-medium text-[#87948c] hover:text-white rounded-md">Year</button>
            </div>
          </div>
          
          <div className="relative h-[300px] w-full flex items-end justify-between px-4 pb-10">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 bottom-10 w-full flex flex-col justify-between text-[10px] text-[#4d5c55]">
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">100k</div>
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">75k</div>
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">50k</div>
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">25k</div>
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">0</div>
            </div>

            {/* Bars */}
            <div className="relative z-10 w-full h-full flex items-end justify-around pl-8">
              <BarGroup p1={40} p2={20} p3={10} />
              <BarGroup p1={60} p2={30} p3={15} />
              <BarGroup p1={55} p2={45} p3={25} />
              <BarGroup p1={80} p2={50} p3={30} />
              <BarGroup p1={90} p2={60} p3={40} />
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <LegendItem color="#A8F0D8" label="Public Transit" />
            <LegendItem color="#439f7a" label="EV Charging" />
            <LegendItem color="#3d4c46" label="Tree Planting" />
          </div>
        </div>

        {/* Recent Sponsor Actions */}
        <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 flex flex-col h-full">
          <h2 className="text-xl font-bold font-sans text-white mb-6">Recent Sponsor Actions</h2>
          <div className="flex flex-col gap-4 flex-1">
            <ActionCard 
              icon="account_balance"
              title="Credit Deposit"
              time="2h ago"
              description="Deposited 50,000 CTK into pool."
              hash="0x7f...8a9b"
            />
            <ActionCard 
              icon="tune"
              title="Parameter Update"
              time="1d ago"
              description="Adjusted EV reward multiplier to 1.5x."
              hash="0x3a...4f2c"
            />
            <ActionCard 
              icon="account_balance"
              title="Credit Deposit"
              time="3d ago"
              description="Deposited 25,000 CTK into pool."
              hash="0x9d...1e4f"
            />
          </div>
          <button className="w-full py-3 mt-6 border border-[rgba(255,255,255,0.08)] rounded-[12px] text-sm font-medium text-[#A8F0D8] hover:bg-[rgba(104,219,174,0.05)] transition-colors flex items-center justify-center gap-2">
            View All History <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, change, value, unit, label }: { icon: string, change: string, value: string, unit: string, label: string }) {
  return (
    <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-full bg-[#111C18] flex items-center justify-center">
          <span className="material-symbols-outlined text-[#A8F0D8] text-[20px]">{icon}</span>
        </div>
        <div className="bg-[rgba(29,158,117,0.1)] text-[#A8F0D8] px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">trending_up</span> {change}
        </div>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold font-mono text-white">{value}</span>
        {unit && <span className="text-[#87948c] text-sm font-medium">{unit}</span>}
      </div>
      <p className="text-[#87948c] text-sm">{label}</p>
    </div>
  );
}

function BarGroup({ p1, p2, p3 }: { p1: number, p2: number, p3: number }) {
  return (
    <div className="flex items-end gap-1 h-full w-full max-w-[40px]">
      <div className="w-1/3 bg-[#A8F0D8] rounded-t-sm" style={{ height: `${p1}%` }}></div>
      <div className="w-1/3 bg-[#439f7a] rounded-t-sm" style={{ height: `${p2}%` }}></div>
      <div className="w-1/3 bg-[#3d4c46] rounded-t-sm" style={{ height: `${p3}%` }}></div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-xs text-[#87948c]">{label}</span>
    </div>
  );
}

function ActionCard({ icon, title, time, description, hash }: { icon: string, title: string, time: string, description: string, hash: string }) {
  return (
    <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-4 flex gap-4">
      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-[#111C18] flex items-center justify-center">
        <span className="material-symbols-outlined text-[#A8F0D8] text-[20px]">{icon}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-white font-medium text-sm">{title}</h3>
          <span className="text-[#4d5c55] text-xs">{time}</span>
        </div>
        <p className="text-[#87948c] text-xs mb-2 leading-relaxed">{description}</p>
        <div className="flex items-center gap-1 text-[#A8F0D8] text-xs font-medium">
          <span className="material-symbols-outlined text-[14px]">link</span> {hash}
        </div>
      </div>
    </div>
  );
}
