import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { getUsers, getCurrentUser } from '../lib/storage';
import { Trophy, Zap, CheckCircle2 } from 'lucide-react';
import leaderboardBanner from '../assets/images/leaderboard_banner_1781653328086.jpg';
import SEO from '../components/ui/SEO';

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<'xp' | 'sats' | 'completion'>('xp');
  const user = getCurrentUser();
  const usersObj = getUsers();
  
  // Exclude admins from leaderboard
  const allUsers = Object.values(usersObj).filter((u: any) => u.email !== "admin@bitcoinafricastory.com" && u.email !== "smartdestinyonyekachi@gmail.com") as any[];

  // Sort logic based on tab
  const getSortedUsers = () => {
    let sorted = [...allUsers];
    if (activeTab === 'xp') {
      sorted.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    } else if (activeTab === 'sats') {
      sorted.sort((a, b) => (b.totalSats || 0) - (a.totalSats || 0));
    } else {
      // By completition
      const getCompCount = (u: any) => Object.values(u.progress || {}).filter((p: any) => p.status === 'completed').length;
      sorted.sort((a, b) => getCompCount(b) - getCompCount(a));
    }
    return sorted.slice(0, 10);
  };

  const sortedUsers = getSortedUsers();
  
  // Find current user rank
  const getCurrentUserRank = () => {
    let sorted = [...allUsers];
    if (activeTab === 'xp') sorted.sort((a, b) => (b.xp || 0) - (a.xp || 0));
    else if (activeTab === 'sats') sorted.sort((a, b) => (b.totalSats || 0) - (a.totalSats || 0));
    else {
      const getCompCount = (u: any) => Object.values(u.progress || {}).filter((p: any) => p.status === 'completed').length;
      sorted.sort((a, b) => getCompCount(b) - getCompCount(a));
    }
    const idx = sorted.findIndex(u => u.email === user?.email);
    return idx === -1 ? null : idx + 1;
  };
  
  const currentUserRank = getCurrentUserRank();
  const isCurrentUserInTop10 = currentUserRank !== null && currentUserRank <= 10;

  const renderMedal = (index: number) => {
    if (index === 0) return <Trophy size={18} className="sm:w-6 sm:h-6 text-brand-gold drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" />;
    if (index === 1) return <Trophy size={18} className="sm:w-6 sm:h-6 text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.8)]" />;
    if (index === 2) return <Trophy size={18} className="sm:w-6 sm:h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]" />;
    return <span className="text-sm sm:text-lg font-bold text-gray-500 w-6 sm:w-8 text-center">{index + 1}</span>;
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8 flex flex-col gap-4 sm:gap-6">
      <SEO 
        title="Leaderboard & Hall of Fame"
        description="Review student rankings on our Bitcoin Education Platform. Earn experience points (XP) and Satoshis as you complete the interactive hands-on Bitcoin Diploma chapters."
        keywords="Bitcoin Leaderboard, Student Rankings, Bitcoin Diploma Hall of Fame, Africa Bitcoin Cohort, Satoshi Rewards Leaderboard"
      />
      
      {/* Hero */}
      <GlassCard className="relative overflow-hidden bg-brand-dark-2 p-4 sm:p-6 md:p-8">
        <div className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-brand-gold/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="hidden md:flex w-14 h-14 bg-brand-gold/20 rounded-full items-center justify-center mb-4">
              <Trophy size={28} className="text-brand-gold" />
            </div>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 flex items-center justify-center md:justify-start gap-2">
              <Trophy size={20} className="text-brand-gold md:hidden shrink-0" />
              Hall of Fame
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md">See how you rank globally across the Bitcoin Africa Story cohort.</p>
          </div>
          
          <div className="w-full md:w-2/5 shrink-0 h-20 sm:h-32 md:h-28 lg:h-36 overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl relative group">
            <img 
              src={leaderboardBanner} 
              alt="Leaderboard Hall of Fame Illustration" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </GlassCard>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 p-1 bg-brand-dark-2 border border-white/5 rounded-xl sm:rounded-2xl w-full mx-auto justify-center md:justify-start">
        <button 
          onClick={() => setActiveTab('xp')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${activeTab === 'xp' ? 'bg-brand-gold text-[#000000] shadow-[0_0_15px_rgba(253,184,19,0.3)]' : 'text-gray-400 hover:text-white'}`}
        >
          <Trophy size={14} className="sm:w-4 sm:h-4" /> XP
        </button>
        <button 
          onClick={() => setActiveTab('sats')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${activeTab === 'sats' ? 'bg-brand-gold text-[#000000] shadow-[0_0_15px_rgba(253,184,19,0.3)]' : 'text-gray-400 hover:text-white'}`}
        >
          <Zap size={14} className="sm:w-4 sm:h-4" /> Sats
        </button>
        <button 
          onClick={() => setActiveTab('completion')}
          className={`flex-1 md:flex-none hidden sm:flex items-center justify-center gap-1 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm transition-all ${activeTab === 'completion' ? 'bg-brand-gold text-[#000000] shadow-[0_0_15px_rgba(253,184,19,0.3)]' : 'text-gray-400 hover:text-white'}`}
        >
          <CheckCircle2 size={14} className="sm:w-4 sm:h-4" /> Progress
        </button>
      </div>

      {/* Leaderboard Table */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="w-full overflow-x-hidden">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="hidden sm:table-cell p-2 pl-3 sm:p-4 sm:pl-6 w-12 sm:w-20 text-center">Rank</th>
                <th className="p-2 pl-4 sm:p-4">Student</th>
                <th className="p-2 sm:p-4 text-center">Country</th>
                <th className="p-2 pr-4 sm:p-4 sm:pr-6 text-right">
                  {activeTab === 'xp' ? 'Score' : activeTab === 'sats' ? 'Sats' : 'Progress'}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="sm:hidden p-8 text-center text-gray-400 text-xs">
                    No active students found.
                  </td>
                  <td colSpan={4} className="hidden sm:table-cell p-12 text-center text-gray-400 text-sm">
                    No active students found.
                  </td>
                </tr>
              )}
              {sortedUsers.map((u: any, i) => {
                const isMe = u.email === user?.email;
                const score = activeTab === 'xp' ? (u.xp || 0) : activeTab === 'sats' ? (u.totalSats || 0) : Object.values(u.progress || {}).filter((p: any) => p.status === 'completed').length;
                
                return (
                  <tr key={u.email} className={`border-b border-white/5 transition-colors ${isMe ? 'bg-brand-gold/10' : 'hover:bg-white/5'}`}>
                    <td className="hidden sm:table-cell p-2 pl-3 sm:p-4 sm:pl-6 text-center">
                      <div className="flex items-center justify-center">
                        {renderMedal(i)}
                      </div>
                    </td>
                    <td className="p-2 pl-4 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden font-bold shadow-md shrink-0 ${isMe ? 'bg-brand-gold text-[#000000]' : 'bg-brand-dark-1 border border-white/10 text-white'}`}>
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xs sm:text-base">{u.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`font-bold text-xs sm:text-sm truncate ${isMe ? 'text-brand-gold' : 'text-white'}`}>
                            {u.name} {isMe && '(You)'}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-0.5 truncate">
                            <span className="text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.8)]">⚲</span> {u.level || 'Seedling'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center">
                      <span className="text-xs sm:text-sm text-gray-300 block truncate max-w-[80px] sm:max-w-none">{u.country || 'N/A'}</span>
                    </td>
                    <td className="p-2 pr-4 sm:p-4 sm:pr-6 text-right">
                      <span className={`font-bold text-xs sm:text-base flex items-center justify-end gap-0.5 sm:gap-1 ${activeTab === 'sats' ? 'text-brand-gold' : 'text-white'}`}>
                        {activeTab === 'xp' && score.toLocaleString()}
                        {activeTab === 'sats' && <><Zap size={12} className="fill-brand-gold sm:w-4 sm:h-4 text-brand-gold" /> {score.toLocaleString()}</>}
                        {activeTab === 'completion' && `${score}/10`}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Append current user if they aren't in the top 10 */}
              {user && !isCurrentUserInTop10 && currentUserRank !== null && (
                <>
                  <tr className="bg-black/60 border-t border-b border-white/10">
                    <td colSpan={3} className="sm:hidden py-1.5 text-center text-[10px] sm:text-gray-500 font-bold uppercase tracking-widest font-sans">
                      Your Position
                    </td>
                    <td colSpan={4} className="hidden sm:table-cell py-1.5 sm:py-2 text-center text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest">
                      Your Position
                    </td>
                  </tr>
                  <tr className="bg-brand-gold/5 border-b border-white/5">
                    <td className="hidden sm:table-cell p-2 pl-3 sm:p-4 sm:pl-6 text-center text-gray-400 font-bold text-xs sm:text-sm">
                      {currentUserRank}
                    </td>
                    <td className="p-2 pl-4 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden font-bold bg-brand-gold text-[#000000] shadow-[0_0_10px_rgba(253,184,19,0.3)] shrink-0">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xs sm:text-base">{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs sm:text-sm text-brand-gold truncate">{user.name} (You)</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 text-center text-xs sm:text-sm text-gray-300">
                      <span className="block truncate max-w-[80px] sm:max-w-none">{user.country || 'N/A'}</span>
                    </td>
                    <td className="p-2 pr-4 sm:p-4 sm:pr-6 text-right font-bold text-xs sm:text-base text-brand-gold">
                      {activeTab === 'xp' ? (user.xp || 0).toLocaleString() : activeTab === 'sats' ? <div className="flex items-center justify-end gap-0.5 sm:gap-1"><Zap size={12} className="fill-brand-gold sm:w-4 sm:h-4 text-brand-gold"/>{(user.totalSats || 0).toLocaleString()}</div> : `${Object.values(user.progress || {}).filter((p: any) => p.status === 'completed').length}/10`}
                    </td>
                  </tr>
                </>
              )}

            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
