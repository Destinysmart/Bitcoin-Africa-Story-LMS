import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getContent, getAnnouncements, updateUser } from '../lib/storage';
import { CircularProgress } from '../components/dashboard/ProgressRing';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { AIInstructorBot } from '../components/dashboard/AIInstructorBot';
import { ChapterVector } from '../components/dashboard/ChapterVectors';
import { Flame, Zap, BookOpen, Trophy, PlayCircle, Lock, CheckCircle2, TrendingUp, Target, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const content = getContent();
  const announcements = getAnnouncements();

  if (!user) return null;

  const chapters = Object.values(content.chapters || {}) as any[];
  
  // Calculate stats
  const completedChapters = chapters.filter(c => user.progress?.[c.id]?.status === 'completed').length;
  const quizzesPassed = chapters.filter(c => user.progress?.[c.id]?.quizPassed).length;
  const overallProgress = (completedChapters / (chapters.length || 10)) * 100;
  
  // Resume chapter logic (first in_progress, or next locked)
  const resumeChapter = chapters.find(c => user.progress?.[c.id]?.status === 'in_progress') || 
                        chapters.find(c => !user.progress?.[c.id]?.status || user.progress?.[c.id]?.status === 'locked') || 
                        chapters[0];

  const [weeklyGoal, setWeeklyGoal] = useState(user.weeklyGoal || 3);
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  const handleSaveGoal = () => {
    updateUser(user.email, { weeklyGoal });
    setIsEditingGoal(false);
  };

  const chartData = useMemo(() => {
    let cumulativeXP = 0;
    let completedCount = 0;
    return chapters.map((c, index) => {
      const isCompleted = user.progress?.[c.id]?.status === 'completed';
      if (isCompleted) {
        cumulativeXP += 100; // Mock 100 XP per chapter
        completedCount++;
      }
      return {
        name: `Ch ${c.id}`,
        title: c.title,
        xp: cumulativeXP,
        percentage: Math.round((completedCount / chapters.length) * 100)
      };
    });
  }, [chapters, user.progress]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      
      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-brand-gold bg-brand-gold/10 p-2 rounded-lg">
              <Zap size={20} className="drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" />
            </div>
            <p className="text-brand-gold text-sm font-medium">{announcements[0].text}</p>
          </div>
        </motion.div>
      )}

      {/* Hero Greeting & Key Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Welcome */}
        <GlassCard className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-brand-dark-2 to-brand-dark-1/80 border-t-brand-gold/30">
          
          {/* Stunning Background Vector Map */}
          <div className="absolute right-40 top-0 bottom-0 w-[240px] opacity-35 md:opacity-[0.45] pointer-events-none select-none hidden sm:flex items-center justify-center mix-blend-screen z-0">
            <svg viewBox="0 0 120 130" className="w-full h-full text-brand-gold" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="africaGradient" x1="50" y1="15" x2="55" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FDB813" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#FDB813" stopOpacity="0.22" />
                </linearGradient>
                <radialGradient id="glow" cx="60" cy="65" r="45" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FDB813" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FDB813" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient Radial Glow */}
              <circle cx="60" cy="65" r="45" fill="url(#glow)" className="animate-pulse" style={{ animationDuration: '4s' }} />

              {/* Polygonal Africa Contour */}
              <path 
                d="M 50,15 L 75,20 L 73,30 L 80,42 L 91,52 L 78,65 L 68,85 L 55,110 L 48,110 L 45,95 L 42,72 L 35,68 L 38,65 L 25,58 L 15,42 L 25,28 L 36,25 Z" 
                fill="url(#africaGradient)"
                stroke="#FDB813" 
                strokeWidth="1.5" 
                strokeOpacity="0.5"
                strokeDasharray="4 2"
              />

              {/* Lightning Network Channels (Connection Lines) */}
              <g stroke="#FDB813" strokeWidth="0.75" strokeOpacity="0.6">
                <line x1="16" y1="42" x2="32" y2="64" />
                <line x1="32" y1="64" x2="38" y2="65" />
                <line x1="70" y1="22" x2="75" y2="63" />
                <line x1="38" y1="65" x2="70" y2="22" />
                <line x1="38" y1="65" x2="75" y2="63" />
                <line x1="38" y1="65" x2="58" y2="98" />
                <line x1="75" y1="63" x2="62" y2="88" />
                <line x1="62" y1="88" x2="58" y2="98" />
                <line x1="75" y1="63" x2="58" y2="98" />
              </g>

              {/* Glowing Nodes / Hubs */}
              <g fill="#FDB813">
                <circle cx="70" cy="22" r="1.5" />
                <circle cx="16" cy="42" r="1.5" />
                <circle cx="32" cy="64" r="1.5" />
                <circle cx="38" cy="65" r="2" fill="#ffffff" />
                <circle cx="75" cy="63" r="2" fill="#ffffff" />
                <circle cx="62" cy="88" r="1.5" />
                <circle cx="58" cy="98" r="2" />
              </g>

              {/* Golden Bitcoin Sun in upper-right corner radiating energy */}
              <g transform="translate(92, 28) scale(0.9)">
                <circle cx="0" cy="0" r="14" fill="#1c1e29" stroke="#FDB813" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="10" fill="#FDB813" />
                <text x="-5" y="4.5" fill="#1c1e29" fontSize="13" fontWeight="bold" fontFamily="system-ui">₿</text>
              </g>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-stretch md:items-start justify-between">
            {/* PHONE-ONLY BEAUTIFIED & HIGHLY COMPACT HERO SECTION */}
            <div className="block md:hidden space-y-4 text-left">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[9px] font-mono font-bold tracking-[0.1em] uppercase bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded border border-brand-gold/20 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-brand-gold animate-pulse"></span>
                      Scholar
                    </span>
                  </div>
                  <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                    {getGreeting()},<br />
                    <span className="text-brand-gold font-extrabold">{user.name.split(' ')[0]} ⚡</span>
                  </h1>
                </div>

                {/* Sleek inline progress ring */}
                <div className="shrink-0 flex flex-col items-center justify-center bg-brand-dark-2/60 border border-white/5 rounded-xl p-2.5 backdrop-blur-md">
                  <CircularProgress progress={overallProgress} size={54} strokeWidth={5} />
                  <span className="text-[8px] font-mono font-bold text-gray-400 mt-1 uppercase tracking-wider">{overallProgress}% Done</span>
                </div>
              </div>

              <p className="text-gray-300 text-xs leading-relaxed font-sans font-medium">
                Your journey to economic sovereignty is active. Complete your customized paths and stack real-world academic incentives.
              </p>

              {/* High-quality 2-column stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex items-center gap-2.5 bg-brand-dark-2/95 px-3 py-2 rounded-xl border border-white/5 shadow-md">
                  <Flame className="text-status-warning fill-status-warning/10 animate-pulse shrink-0" size={16} />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-mono font-bold uppercase leading-none">Streak</span>
                    <span className="font-extrabold text-white text-xs mt-0.5">{user.streak || 0} Days</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5 bg-brand-gold/10 px-3 py-2 rounded-xl border border-brand-gold/20 gold-glow shadow-md">
                  <Zap className="text-brand-gold fill-brand-gold/10 shrink-0" size={16} />
                  <div className="flex flex-col">
                    <span className="text-[9px] text-brand-gold/60 font-mono font-bold uppercase leading-none">Earned</span>
                    <span className="font-extrabold text-brand-gold text-xs mt-0.5">{user.totalSats || 0} Sats</span>
                  </div>
                </div>
              </div>

              {/* Directly visible full-width Call To Action item */}
              <Button 
                onClick={() => navigate(`/chapter/${resumeChapter?.id}`)} 
                className="w-full h-10 bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold shadow-lg text-xs rounded-xl flex items-center justify-center gap-1.5 mt-2 transition-transform active:scale-[0.98]"
              >
                Resume Chapter {resumeChapter?.id} <PlayCircle size={14} className="shrink-0" />
              </Button>
            </div>

            {/* TABLET & DESKTOP ORIGINAL DESIGN */}
            <div className="hidden md:block flex-1 text-left">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-white">
                Welcome back, {user.name.split(' ')[0]} <span className="text-brand-gold">₿</span>
              </h1>
              <p className="text-gray-400 mb-6 text-sm max-w-md">
                Continue your Bitcoin journey. You're doing great, keep stacking those sats!
              </p>
              
              <div className="flex flex-wrap items-center justify-start gap-4 mb-2">
                <div className="flex items-center gap-2 bg-brand-dark-2 px-4 py-2 rounded-lg border border-white/5 shadow-inner">
                  <Flame className="text-status-warning fill-status-warning/10 animate-pulse" size={18} />
                  <span className="font-semibold text-white text-sm">{user.streak || 0} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-lg border border-brand-gold/20 gold-glow">
                  <Zap className="text-brand-gold fill-brand-gold/10" size={18} />
                  <span className="font-semibold text-brand-gold text-sm">{user.totalSats || 0} Sats Earned</span>
                </div>
              </div>
            </div>
            
            {/* Tablet & Desktop Progress Panel */}
            <div className="hidden md:flex flex-col items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
              <CircularProgress progress={overallProgress} size={100} strokeWidth={8} />
              <Button size="sm" onClick={() => navigate(`/chapter/${resumeChapter?.id}`)} className="w-full">
                Resume Ch. {resumeChapter?.id} <PlayCircle size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Certificate Alert Banner */}
        {completedChapters >= chapters.length && chapters.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-brand-gold/15 via-brand-gold/5 to-brand-gold/15 border border-brand-gold/30 rounded-2xl p-5 gold-glow flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 text-center md:text-left flex-col md:flex-row">
              <div className="w-12 h-12 bg-brand-gold text-brand-black rounded-full flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(253,184,19,0.3)]">
                <Trophy size={24} className="animate-bounce" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-tight">You've Completed the Bitcoin Diploma Program!</h3>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Claim your official verified certificate, share your success on social media, and withdraw your {user.totalSats || 0} SATS reward!</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/certificate')}
              className="bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold shrink-0 shadow-lg px-6 py-2 h-10 text-xs"
            >
              Claim Certificate & Sats →
            </Button>
          </motion.div>
        )}

        {/* Stats Grid Widget */}
        <GlassCard className="bg-gradient-to-br from-brand-dark-2/40 to-brand-dark-1/80 border border-white/5 p-6 flex flex-col justify-between h-full relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[50px] pointer-events-none rounded-full" />
          <div className="relative z-10 flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold inline-block animate-pulse" />
              Satoshi Analytics
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <BookOpen size={14} className="text-gray-500 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Chapters</span>
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">{completedChapters}</span>
            </div>
            
            <div className="flex flex-col border-l border-white/5 pl-4 sm:pl-6">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <CheckCircle2 size={14} className="text-status-success shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Quizzes ok</span>
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">{quizzesPassed}</span>
            </div>

            <div className="flex flex-col border-t border-white/5 pt-4">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Trophy size={14} className="text-brand-gold shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Total XP</span>
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">{user.xp || 0}</span>
            </div>

            <div className="flex flex-col border-t border-l border-white/5 pt-4 pl-4 sm:pl-6 relative overflow-hidden group">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Zap size={14} className="text-brand-gold shrink-0 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold/90">Pending Payout</span>
              </div>
              <span className="text-3xl font-bold text-brand-gold tracking-tight">{user.totalSats || 0} <span className="text-xs text-brand-gold/60 font-medium font-sans">sats</span></span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Learning Progress & Weekly Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Progress Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard className="bg-brand-dark-2 relative overflow-hidden border border-white/5 h-full">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-brand-gold" size={24} />
              <h2 className="text-xl font-bold">Learning Progress (XP over Chapters)</h2>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FDB813" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FDB813" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#111] border border-white/20 p-3 rounded-lg shadow-xl outline-none">
                            <p className="text-gray-400 text-xs mb-1 font-medium">{data.title || data.name}</p>
                            <p className="text-brand-gold font-bold">{data.xp} XP</p>
                            <p className="text-white text-sm">{data.percentage}% Completed</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#FDB813" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorXp)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Right column: Weekly Goal */}
        <div className="flex flex-col h-full">
          {/* Weekly Study Goal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full"
          >
            <GlassCard className="bg-brand-dark-2 relative overflow-hidden border border-white/5 flex flex-col p-6 h-full justify-between min-h-[338px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="text-brand-gold" size={24} />
                  <h2 className="text-xl font-bold">Weekly Goal</h2>
                </div>
                {isEditingGoal ? (
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      min="1" max="10"
                      value={weeklyGoal}
                      onChange={(e) => setWeeklyGoal(parseInt(e.target.value) || 1)}
                      className="w-16 bg-black border border-white/10 rounded px-2 text-center text-white outline-none focus:border-brand-gold"
                    />
                    <Button size="sm" onClick={handleSaveGoal} className="px-3 py-1 text-xs">Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingGoal(true)} className="px-3 py-1 text-xs">Edit Goals</Button>
                )}
              </div>
              
              <div className="flex flex-col justify-center flex-1">
                 <div className="flex justify-between text-sm mb-2 text-gray-400">
                   <span>{Math.min(completedChapters, weeklyGoal)} / {weeklyGoal} Chapters Completed</span>
                   <span>{Math.round(Math.min(completedChapters / (weeklyGoal || 1), 1) * 100)}%</span>
                 </div>
                 <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min((completedChapters / (weeklyGoal || 1)) * 100, 100)}%` }}
                     transition={{ duration: 1, delay: 0.5, type: 'spring', stiffness: 50 }}
                     className="h-full bg-brand-gold" 
                   />
                 </div>
                 <p className="text-xs text-gray-500 mt-4 text-center">
                   {completedChapters >= weeklyGoal 
                      ? "You've reached your weekly goal! Great job!" 
                      : "Keep going! You're making good progress towards your goal this week."}
                 </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Dedicated AI Study Assistant Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-3.5 md:space-y-6 pt-2 md:pt-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
          <div>
            <h2 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-brand-gold bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="text-brand-gold fill-brand-gold/70 shrink-0 animate-pulse w-4 h-4 md:w-6 md:h-6" />
              AI Study Assistant
            </h2>
            <p className="text-xs md:text-sm text-[#94a3b8] mt-1 pr-0 md:pr-6">
              Ask Satoshi clarifying questions, clear study doubts instantly, or deep-dive on core concepts within the Bitcoin Diploma.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] md:text-[11px] font-mono font-medium text-[#94a3b8] bg-white/[0.03] px-3 py-1 md:px-3.5 md:py-1.5 rounded-full border border-white/5 flex items-center gap-1.5 self-start sm:self-center">
              <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-status-success rounded-full animate-pulse" />
              Satoshi Engine Online
            </span>
          </div>
        </div>

        <AIInstructorBot />
      </motion.div>

      {/* Chapters Grid Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Curriculum</h2>
          <span className="text-sm text-gray-400">10 Chapters • ~12 Hours</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6">
          {chapters.map((chapter) => {
            const chapProg = user.progress?.[chapter.id];
            const status = chapProg?.status || 'locked';
            
            // For learning flexibility, all chapters are clickable in the curriculum grid.
            const isClickable = true;
            
            return (
              <motion.div
                key={chapter.id}
                whileHover={isClickable ? { y: -6, scale: 1.02 } : {}}
                onClick={() => isClickable && navigate(`/chapter/${chapter.id}`)}
                className={`
                  p-6 rounded-2xl border relative overflow-hidden transition-all duration-300 flex flex-col shadow-lg group
                  ${isClickable ? 'cursor-pointer hover:shadow-[0_8px_32px_rgba(253,184,19,0.06)] hover:border-brand-gold/30' : 'opacity-60 cursor-not-allowed'}
                  bg-brand-dark-2
                  ${status === 'completed' ? 'border-status-success/30' : 
                    status === 'in_progress' ? 'border-brand-gold/40 gold-glow' : 
                    'border-white/5'}
                `}
              >
                {/* Header Row */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded">
                    Chapter {chapter.id < 10 ? `0${chapter.id}` : chapter.id}
                  </span>
                  
                  {status === 'completed' && <CheckCircle2 size={18} className="text-status-success" />}
                  {(status === 'locked' && !isClickable) && <Lock size={16} className="text-gray-500" />}
                  {(status === 'in_progress' || (status === 'locked' && isClickable)) && <PlayCircle size={18} className="text-brand-gold" />}
                </div>

                {/* Thematic Interactive Vector Graphic */}
                <div className="mb-4">
                  <ChapterVector chapterId={chapter.id} />
                </div>

                <h3 className="font-bold text-lg mb-2 line-clamp-2 pr-2 text-white group-hover:text-brand-gold transition-colors duration-200">
                  {chapter.title}
                </h3>

                <p className="text-xs text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                  {chapter.description || "Master decentralized proof-of-work consensus mechanisms, private keys, and peer-to-peer cash systems."}
                </p>
                
                {/* Meta Footer */}
                <div className="flex items-center justify-between text-xs font-medium mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    ⏱ <span>{chapter.estimatedMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-1 text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-full border border-brand-gold/20 font-mono">
                    <Zap size={10} className="fill-brand-gold" />
                    <span>{chapter.satsPossible || 2} sats</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
