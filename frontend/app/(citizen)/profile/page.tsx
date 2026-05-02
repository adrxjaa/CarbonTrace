"use client";

import { useEffect, useState } from "react";
import { getStoredUser, storeUser, apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

type GamificationStats = {
  xp: number;
  rank: string;
  streak_days: number;
};


type UserProfile = {
  id: string;
  name: string;
  email: string;
  location: string | null;
  wallet_address: string | null;
  notify_verified: boolean;
  notify_flagged: boolean;
  show_on_leaderboard: boolean;
  anonymize_leaderboard: boolean;
  stats: GamificationStats;
};

export default function ProfilePage() {
  const { pushToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<UserProfile>("/users/me")
      .then((data) => {
        setProfile(data);
        setFormData(data);
      })
      .catch((err) => {
        console.error(err);
        pushToast({ title: "Failed to load profile", tone: "error" });
      })
      .finally(() => setLoading(false));
  }, [pushToast]);

  const handleDiscard = () => {
    if (profile) setFormData(profile);
    setHasChanges(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        location: formData.location,
        wallet_address: formData.wallet_address,
        notify_verified: formData.notify_verified,
        notify_flagged: formData.notify_flagged,
        show_on_leaderboard: formData.show_on_leaderboard,
        anonymize_leaderboard: formData.anonymize_leaderboard,
      };
      
      const updated = await apiPut<UserProfile>("/users/me", payload);
      setProfile(updated);
      setFormData(updated);
      setHasChanges(false);
      
      // Update local storage so sidebar name updates
      const stored = getStoredUser();
      if (stored) {
        storeUser({ ...stored, name: updated.name });
      }
      
      pushToast({ title: "Profile updated successfully", tone: "success" });
    } catch (err: any) {
      pushToast({ title: err.message || "Failed to save profile", tone: "error" });
    }
  };

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const disconnectWallet = () => {
    handleChange("wallet_address", null);
  };

  if (loading) {
    return (
      <div className="pt-12 space-y-6 animate-pulse max-w-6xl mx-auto">
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-[32px] bg-white/[0.04]" />)}
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto pt-12 pb-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="mb-16 flex justify-between items-end border-b border-[rgba(255,255,255,0.08)] pb-6">
        <div>
          <h2 className="text-[48px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#e1e3e0]">
            Profile & Settings
          </h2>
          <p className="text-base text-[#bccac1] mt-2">
            Manage your verification identity and platform preferences.
          </p>
        </div>
        {hasChanges && (
          <div className="flex gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={handleDiscard}
              className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] px-6 py-2 rounded-lg text-xs font-semibold text-[#e1e3e0] hover:bg-[#1d201f] transition-colors">
              Discard
            </button>
            <button 
              onClick={handleSave}
              className="bg-[#26a37a] text-[#003121] px-6 py-2 rounded-lg text-xs font-semibold hover:bg-[#1D9E75] transition-colors">
              Save Changes
            </button>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left Column: Profile & Gamification (8 cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">

          {/* Profile Header Card */}
          <section className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative group cursor-pointer shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[rgba(255,255,255,0.08)] bg-[#1d201f] flex items-center justify-center text-2xl font-bold text-[#1D9E75]">
                  {(formData.name || profile.name).split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="absolute inset-0 bg-[#111C18]/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-6 h-6">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              {/* Info */}
              <div className="flex-grow space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-[#e1e3e0]">{profile.name}</h3>
                    <span className="bg-[#026951]/30 text-[#a0f3d4] border border-[#026951] px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3">
                        <path d="M12 20v-6M12 14c-3.8 0-7-2.2-7-5.2C5 6 7.7 4 11 4c3.7 0 6 2.5 6 5.4 1.4-.8 3.2-.5 4 1 1.3 2.6-1.1 5.6-5 5.6H12Z" />
                      </svg>
                      {profile.stats.rank} Rank
                    </span>
                  </div>
                  <p className="font-mono text-sm tracking-wider text-[#bccac1] mt-1">{profile.email}</p>
                </div>
                {/* Editable fields */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                  <div>
                    <label className="block text-xs font-semibold text-[#bccac1] mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="w-full bg-[#272b29] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-base text-[#e1e3e0] focus:border-[#26a37a] focus:ring-1 focus:ring-[#26a37a] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#bccac1] mb-2">Location</label>
                    <input 
                      type="text" 
                      value={formData.location || ""}
                      onChange={(e) => handleChange("location", e.target.value)}
                      className="w-full bg-[#272b29] border border-[rgba(255,255,255,0.08)] rounded-lg px-4 py-2 text-base text-[#e1e3e0] focus:border-[#26a37a] focus:ring-1 focus:ring-[#26a37a] focus:outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Impact Journey */}
          <section className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#e1e3e0] mb-6 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#26a37a" strokeWidth="1.8" className="w-5 h-5">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              Impact Journey
            </h3>

            {/* Rank progress card */}
            <div className="bg-[#272b29] rounded-xl p-6 mb-8 border border-[rgba(255,255,255,0.08)]">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs font-semibold text-[#bccac1] uppercase tracking-wider mb-1">Current Rank</p>
                  <p className="text-xl font-bold text-[#1D9E75]">{profile.stats.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-[#bccac1] uppercase tracking-wider mb-1">Next: {profile.stats.rank === "Seedling" ? "Sapling" : profile.stats.rank === "Sapling" ? "Tree" : profile.stats.rank === "Tree" ? "Forest" : "Max Rank"}</p>
                  <p className="font-mono text-sm text-[#e1e3e0]">{profile.stats.xp.toLocaleString()} XP</p>
                </div>
              </div>
              <div className="h-3 bg-[#0c0f0e] rounded-full overflow-hidden border border-[rgba(255,255,255,0.08)]">
                <div className="h-full bg-[#26a37a] rounded-full relative" style={{ width: `${Math.min((profile.stats.xp % 1000) / 10, 100)}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.08)] pt-4">
                <span className="text-base text-[#bccac1]">Active Streak</span>
                <div className="flex items-center gap-2 bg-[#111C18] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
                  <span className="text-[#F59E0B]">🔥</span>
                  <span className="font-mono text-sm font-bold text-[#e1e3e0]">{profile.stats.streak_days} Days</span>
                </div>
              </div>
            </div>

            {/* Badge shelf */}
            <div>
              <h4 className="text-xs font-semibold text-[#bccac1] uppercase tracking-wider mb-4">Badge Shelf</h4>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { icon: "👣", label: "First Step", earned: profile.stats.xp > 0, color: "#26a37a" },
                  { icon: "🚲", label: "Active", earned: profile.stats.streak_days >= 3, color: "#589d88" },
                  { icon: "🔌", label: "Dedicated", earned: profile.stats.streak_days >= 7, color: "#026951" },
                  { icon: "🌳", label: "Forest Maker", earned: profile.stats.xp >= 5000, color: "" },
                ].map((b) => (
                  <div key={b.label} className={`rounded-xl p-4 flex flex-col items-center text-center gap-2 group cursor-pointer transition-colors ${
                    b.earned
                      ? "bg-[#272b29] border border-white/10 hover:bg-[#1d201f]"
                      : "bg-[#0c0f0e] border border-[rgba(255,255,255,0.08)] opacity-50 grayscale"
                  }`}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                      style={{ background: b.earned ? `${b.color}33` : "#323534" }}>
                      {b.icon}
                    </div>
                    <span className="text-[11px] font-semibold text-[#e1e3e0]">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── Right Column: Settings & Security (4 cols) ─── */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Web3 Identity */}
          <section className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
            <h3 className="text-base font-bold text-[#e1e3e0] mb-4 flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#8dd4bd" strokeWidth="1.8" className="w-5 h-5">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Web3 Identity
            </h3>
            <div className="bg-[#272b29] border border-[rgba(255,255,255,0.08)] rounded-xl p-4">
              <p className="text-[10px] text-[#bccac1] uppercase tracking-wider mb-2">Connected Wallet (ETH)</p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-[#86f8c9]">
                  {formData.wallet_address ? `${formData.wallet_address.slice(0, 6)}...${formData.wallet_address.slice(-4)}` : "None"}
                </span>
                {formData.wallet_address && (
                  <button className="text-[#bccac1] hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[18px] h-[18px]">
                      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {formData.wallet_address && (
              <button onClick={disconnectWallet} className="w-full mt-4 border border-[#3d4943] text-[#e1e3e0] hover:bg-[#1d201f] py-2 rounded-lg text-xs font-semibold transition-colors">
                Disconnect Wallet
              </button>
            )}
            {!formData.wallet_address && (
              <button onClick={() => handleChange("wallet_address", "0x71C9A23E3F45A4D8B841A87042C9C2E1F8C99A23")} className="w-full mt-4 border border-[#26a37a]/50 text-[#26a37a] hover:bg-[#26a37a]/10 py-2 rounded-lg text-xs font-semibold transition-colors">
                Connect Wallet
              </button>
            )}
          </section>

          {/* Preferences */}
          <section className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 flex-grow">
            <h3 className="text-base font-bold text-[#e1e3e0] mb-6">Preferences</h3>
            <div className="space-y-6">
              {/* Toggle: Verification Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#e1e3e0]">Verification Alerts</h4>
                  <p className="text-xs text-[#bccac1]">Push notifications when data syncs.</p>
                </div>
                <ToggleSwitch checked={!!formData.notify_verified} onChange={(val) => handleChange("notify_verified", val)} />
              </div>
              {/* Toggle: Flagged Audits */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#e1e3e0]">Flagged Audits</h4>
                  <p className="text-xs text-[#bccac1]">Alerts for submission issues.</p>
                </div>
                <ToggleSwitch checked={!!formData.notify_flagged} onChange={(val) => handleChange("notify_flagged", val)} />
              </div>
              {/* Privacy section */}
              <div className="border-t border-[rgba(255,255,255,0.08)] pt-6">
                <h4 className="text-[10px] text-[#bccac1] uppercase tracking-wider mb-4">Privacy</h4>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#e1e3e0]">Show on Leaderboard</span>
                  <ToggleSwitch checked={!!formData.show_on_leaderboard} onChange={(val) => handleChange("show_on_leaderboard", val)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#e1e3e0]">Anonymize Name</span>
                  <ToggleSwitch checked={!!formData.anonymize_leaderboard} onChange={(val) => handleChange("anonymize_leaderboard", val)} />
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-[#191c1b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
            <h3 className="text-base font-bold text-[#ffb4ab] mb-2">Danger Zone</h3>
            <p className="text-xs text-[#bccac1] mb-4">Permanent actions regarding your account data.</p>
            <button className="w-full border border-[#93000a] text-[#ffb4ab] hover:bg-[#93000a]/20 py-2 rounded-lg text-xs font-semibold transition-colors">
              Delete Account
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Toggle Switch Component ────────────────────────────────────── */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)} 
      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: checked ? "#26a37a" : "#272b29" }}>
      <div className="absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

