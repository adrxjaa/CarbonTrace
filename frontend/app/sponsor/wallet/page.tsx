export default function SponsorWallet() {
  return (
    <div className="w-full flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="max-w-[600px]">
          <h1 className="text-4xl font-bold font-sans tracking-tight text-white mb-2">Sponsor Wallet</h1>
          <p className="text-[#4d5c55] text-sm leading-relaxed">
            Manage your credit pool balances, execute blockchain deposits, and review your immutable funding transaction history.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
            <span className="text-xs text-[#87948c]">Network: <span className="text-white">Ethereum Mainnet</span></span>
          </div>
          <div className="w-[1px] h-4 bg-[#1E2E29]"></div>
          <div className="flex items-center gap-2 text-xs text-[#87948c]">
            <span className="material-symbols-outlined text-[#A8F0D8] text-[16px]">sync</span>
            Block: <span className="text-white">18,432,901</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-[#111C18] to-[#0f1713] border border-[rgba(255,255,255,0.08)] rounded-[34px] p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#1D9E75] opacity-5 blur-[100px] rounded-full"></div>
            
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-[#87948c] text-sm font-medium mb-2 tracking-wide uppercase">Available Credit Pool</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-bold font-mono text-white">24,500.00</h2>
                  <span className="text-[#A8F0D8] text-xl font-medium">CC</span>
                </div>
                <p className="text-[#4d5c55] text-sm mt-2">≈ $245,000.00 USD</p>
              </div>
              <div className="w-12 h-12 rounded-[12px] bg-[#111C18] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#A8F0D8]">account_balance_wallet</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
              <div>
                <p className="text-[#87948c] text-sm mb-1">Total Funded (YTD)</p>
                <p className="text-white font-medium text-lg">150,000 CC</p>
              </div>
              <div>
                <p className="text-[#87948c] text-sm mb-1">Active Sponsorships</p>
                <p className="text-white font-medium text-lg">12 Projects</p>
              </div>
            </div>
          </div>

          {/* Token Balances */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111C18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#A8F0D8]">currency_exchange</span>
              </div>
              <div>
                <p className="text-[#87948c] text-xs mb-1">ETH Balance</p>
                <p className="text-white font-medium">14.205 <span className="text-[#4d5c55]">ETH</span></p>
              </div>
            </div>
            <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#111C18] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#A8F0D8]">toll</span>
              </div>
              <div>
                <p className="text-[#87948c] text-xs mb-1">USDC Balance</p>
                <p className="text-white font-medium">50,000.00 <span className="text-[#4d5c55]">USDC</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Deposit Form */}
        <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[34px] p-6">
          <h2 className="text-xl font-bold font-sans text-white mb-6">Deposit Funds</h2>
          
          <div className="mb-6">
            <p className="text-[#87948c] text-sm mb-3">Select Asset</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[rgba(29,158,117,0.1)] border border-[#1D9E75] rounded-[12px] py-3 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[#A8F0D8] text-[18px]">toll</span>
                <span className="text-white font-medium text-sm">USDC</span>
              </button>
              <button className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[12px] py-3 flex items-center justify-center gap-2 hover:bg-[#111C18] transition-colors">
                <span className="material-symbols-outlined text-[#87948c] text-[18px]">currency_exchange</span>
                <span className="text-[#87948c] font-medium text-sm">ETH</span>
              </button>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-end mb-3">
              <p className="text-[#87948c] text-sm">Amount</p>
              <p className="text-[#4d5c55] text-xs">Max: 50,000.00 USDC</p>
            </div>
            <div className="relative">
              <input 
                type="text" 
                placeholder="0.00" 
                className="w-full bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[12px] px-4 py-4 text-white text-lg focus:outline-none focus:border-[#1D9E75] transition-colors"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8F0D8] text-xs font-bold bg-[rgba(104,219,174,0.1)] px-2 py-1 rounded">
                MAX
              </button>
            </div>
          </div>

          <div className="bg-[#111C18] rounded-[12px] p-4 mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#87948c] text-sm">Conversion Rate</span>
              <span className="text-white text-sm">1 USDC = 1 CC</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#87948c] text-sm">Network Fee (Est)</span>
              <span className="text-white text-sm">~ $4.20</span>
            </div>
            <div className="h-[1px] w-full bg-[#1E2E29] my-4"></div>
            <div className="flex justify-between items-center">
              <span className="text-[#A8F0D8] text-sm font-medium">You will receive</span>
              <span className="text-[#A8F0D8] text-lg font-bold">0.00 CC</span>
            </div>
          </div>

          <button className="w-full bg-[#1D9E75] hover:bg-[#26a37a] text-white rounded-[12px] py-4 font-medium flex items-center justify-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">lock</span>
            APPROVE DEPOSIT
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#87948c]">history</span>
            Transaction History
          </h2>
          <a href="#" className="text-sm font-medium text-[#87948c] hover:text-white transition-colors flex items-center gap-1">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
        
        <div className="bg-[#111C18] border border-[rgba(255,255,255,0.08)] rounded-[24px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#111C18]">
                <th className="py-4 px-6 text-[11px] font-medium text-[#87948c] tracking-wider uppercase">Type</th>
                <th className="py-4 px-6 text-[11px] font-medium text-[#87948c] tracking-wider uppercase">Amount</th>
                <th className="py-4 px-6 text-[11px] font-medium text-[#87948c] tracking-wider uppercase">Date/Time</th>
                <th className="py-4 px-6 text-[11px] font-medium text-[#87948c] tracking-wider uppercase">Status</th>
                <th className="py-4 px-6 text-[11px] font-medium text-[#87948c] tracking-wider uppercase text-right">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[rgba(255,255,255,0.08)] hover:bg-[#111C18] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[rgba(104,219,174,0.1)] text-[#A8F0D8] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">south_east</span>
                    </div>
                    <span className="text-white text-sm font-medium">Deposit (USDC)</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-[#A8F0D8] text-sm font-medium">+50,000.00 CC</td>
                <td className="py-4 px-6 text-[#87948c] text-sm">2023-10-27 14:32 UTC</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[rgba(16,185,129,0.1)] w-max">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                    <span className="text-[#10B981] text-[10px] font-medium uppercase tracking-wider">VERIFIED</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <a href="#" className="text-[#A8F0D8] text-sm hover:underline  font-mono">0x8f2a...9c3b</a>
                </td>
              </tr>
              <tr className="border-b border-[rgba(255,255,255,0.08)] hover:bg-[#111C18] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[rgba(239,68,68,0.1)] text-[#EF4444] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">north_west</span>
                    </div>
                    <span className="text-white text-sm font-medium">Funding (Project A)</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-white text-sm font-medium">-15,000.00 CC</td>
                <td className="py-4 px-6 text-[#87948c] text-sm">2023-10-25 09:15 UTC</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[rgba(16,185,129,0.1)] w-max">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                    <span className="text-[#10B981] text-[10px] font-medium uppercase tracking-wider">CHAIN SYNCED</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <a href="#" className="text-[#A8F0D8] text-sm hover:underline  font-mono">0x3e1d...7a4f</a>
                </td>
              </tr>
              <tr className="hover:bg-[#111C18] transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[rgba(245,158,11,0.1)] text-[#F59E0B] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">south_east</span>
                    </div>
                    <span className="text-white text-sm font-medium">Deposit (ETH)</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-[#F59E0B] text-sm font-medium">+10,000.00 CC</td>
                <td className="py-4 px-6 text-[#87948c] text-sm">2023-10-28 16:45 UTC</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[rgba(245,158,11,0.1)] w-max">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>
                    <span className="text-[#F59E0B] text-[10px] font-medium uppercase tracking-wider">PENDING</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <a href="#" className="text-[#A8F0D8] text-sm hover:underline  font-mono">0x1a9b...2f8e</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
