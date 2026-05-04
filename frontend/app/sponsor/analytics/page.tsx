export default function AnalyticsOverview() {
  return (
    <div className="w-full flex flex-col min-h-full">
      <div className="flex-1 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-sans tracking-tight text-white mb-2">Analytics Overview</h1>
            <div className="flex items-center gap-2 text-[#87948c] text-sm">
              <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
              Live Sync • Epoch 4291
            </div>
          </div>
          <div className="flex bg-[#F4F6F3] rounded-[12px] p-1 border border-[rgba(255,255,255,0.08)]">
            <button className="px-4 py-2 text-xs font-medium bg-[#1D9E75] text-white rounded-md">30D</button>
            <button className="px-4 py-2 text-xs font-medium text-[#87948c] hover:text-white rounded-md">90D</button>
            <button className="px-4 py-2 text-xs font-medium text-[#87948c] hover:text-white rounded-md">YTD</button>
            <button className="px-4 py-2 text-xs font-medium text-[#87948c] hover:text-white flex items-center gap-2 border-l border-[rgba(255,255,255,0.08)] ml-1 pl-5">
              <span className="material-symbols-outlined text-[14px]">calendar_month</span> Custom
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon="co2" 
            change="+18.4%" 
            value="42,891" 
            unit="tCO2e"
            label="Total CO2 Offset"
            isPositive={true}
          />
          <StatCard 
            icon="toll" 
            change="+5.2%" 
            value="1.84M" 
            unit="CRD"
            label="Credits Distributed" 
            isPositive={true}
          />
          <StatCard 
            icon="bolt" 
            change="- 0.0%" 
            value="94.2" 
            unit="%"
            label="Program Efficiency Yield" 
            isPositive={false}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Breakdown Bar Chart */}
          <div className="lg:col-span-2 bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold font-sans text-white">Activity Breakdown</h2>
              <button className="text-[#A8F0D8] text-xs font-medium flex items-center gap-1 hover:underline">
                Export Data <span className="material-symbols-outlined text-[14px]">download</span>
              </button>
            </div>
            
            <div className="relative h-[250px] w-full flex items-end justify-between px-4 pb-8">
              {/* Y Axis */}
              <div className="absolute left-0 top-0 bottom-8 w-full flex flex-col justify-between text-[10px] text-[#4d5c55]">
                <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">40k</div>
                <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">30k</div>
                <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">20k</div>
                <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-1">10k</div>
              </div>

              {/* Bars */}
              <div className="relative z-10 w-full h-full flex items-end justify-around pl-8">
                <Bar height={35} label="Mon" active={false} />
                <Bar height={45} label="Tue" active={false} />
                <Bar height={70} label="Wed" active={true} />
                <Bar height={60} label="Thu" active={false} />
                <Bar height={50} label="Fri" active={false} />
                <Bar height={85} label="Sat" active={true} />
                <Bar height={55} label="Sun" active={false} />
              </div>
            </div>
          </div>

          {/* Network Growth Donut Chart */}
          <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 flex flex-col">
            <h2 className="text-xl font-bold font-sans text-white mb-6">Network Growth</h2>
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* SVG Donut Chart */}
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#111C18" strokeWidth="12" />
                  {/* Segment 1: Independent Nodes (35%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#439f7a" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="0" />
                  {/* Segment 2: Enterprise Verified (65%) */}
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#A8F0D8" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="87.92" />
                </svg>
                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">+842</span>
                  <span className="text-[10px] text-[#87948c]">New Nodes</span>
                </div>
              </div>
            </div>
            {/* Legend */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#A8F0D8] rounded-sm"></div>
                  <span className="text-white">Enterprise Verified</span>
                </div>
                <span className="text-[#87948c]">65%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#439f7a] rounded-sm"></div>
                  <span className="text-white">Independent Nodes</span>
                </div>
                <span className="text-[#87948c]">35%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-sm">
        <p className="text-[#4d5c55]">© 2024 CarbonTrace Protocol. All systems nominal.</p>
        <div className="flex items-center gap-6 text-[#87948c]">
          <a href="#" className="hover:text-white transition-colors">Profile</a>
          <a href="#" className="hover:text-white transition-colors">Settings</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="#" className="text-[#A8F0D8] hover:text-[#86f8c9] transition-colors font-medium">Deposit Credits</a>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, change, value, unit, label, isPositive }: { icon: string, change: string, value: string, unit: string, label: string, isPositive: boolean }) {
  return (
    <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-[12px] bg-[#111C18] flex items-center justify-center border border-[rgba(255,255,255,0.08)]">
          <span className="material-symbols-outlined text-[#A8F0D8] text-[20px]">{icon}</span>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${isPositive ? 'bg-[rgba(29,158,117,0.1)] text-[#A8F0D8]' : 'bg-[#111C18] text-[#87948c]'}`}>
          {isPositive && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
          {change}
        </div>
      </div>
      <p className="text-[#87948c] text-sm mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold font-mono text-white">{value}</span>
        {unit && <span className="text-[#A8F0D8] text-sm font-medium">{unit}</span>}
      </div>
    </div>
  );
}

function Bar({ height, label, active }: { height: number, label: string, active: boolean }) {
  return (
    <div className="flex flex-col items-center justify-end h-full group">
      <div className={`w-12 rounded-t-md transition-all ${active ? 'bg-[#439f7a] shadow-[0_0_15px_rgba(67,159,122,0.3)]' : 'bg-[#111C18] group-hover:bg-[#273831]'}`} style={{ height: `${height}%` }}></div>
      <span className="text-[10px] text-[#4d5c55] mt-4 absolute -bottom-6">{label}</span>
    </div>
  );
}
