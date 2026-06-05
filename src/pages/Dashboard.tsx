import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getContent, getAnnouncements, updateUser } from '../lib/storage';
import { CircularProgress } from '../components/dashboard/ProgressRing';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Flame, Zap, BookOpen, Trophy, PlayCircle, Lock, CheckCircle2, TrendingUp, Target } from 'lucide-react';
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
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <h1 className="text-9xl font-black text-brand-gold tracking-tighter">₿</h1>
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start justify-between">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.name.split(' ')[0]} <span className="text-brand-gold">₿</span>
              </h1>
              <p className="text-gray-400 mb-6 max-w-md">Continue your Bitcoin journey. You're doing great, keep stacking those sats!</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                <div className="flex items-center gap-2 bg-brand-dark-2 px-4 py-2 rounded-lg border border-white/5">
                  <Flame className="text-status-warning" size={18} />
                  <span className="font-semibold text-white">{user.streak || 0} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 bg-brand-gold/10 px-4 py-2 rounded-lg border border-brand-gold/20 gold-glow">
                  <Zap className="text-brand-gold" size={18} />
                  <span className="font-semibold text-brand-gold">{user.totalSats || 0} Sats Earned</span>
                </div>
              </div>
            </div>
            
            {/* Circular Progress & Resume CTA */}
            <div className="flex flex-col items-center gap-4 bg-black/40 p-5 rounded-2xl border border-white/5 backdrop-blur-md">
              <CircularProgress progress={overallProgress} size={100} strokeWidth={8} />
              <Button size="sm" onClick={() => navigate(`/chapter/${resumeChapter?.id}`)} className="w-full">
                Resume Ch. {resumeChapter?.id} <PlayCircle size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid Widget */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4">
          <div className="bg-brand-dark-2 rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center text-center">
            <BookOpen className="text-gray-400 mb-2" size={24} />
            <span className="text-2xl font-bold">{completedChapters}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Chapters</span>
          </div>
          <div className="bg-brand-dark-2 rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="text-status-success mb-2" size={24} />
            <span className="text-2xl font-bold">{quizzesPassed}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Quizzes OK</span>
          </div>
          <div className="bg-brand-dark-2 rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center text-center">
            <Trophy className="text-brand-gold mb-2" size={24} />
            <span className="text-2xl font-bold">{user.xp || 0}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Total XP</span>
          </div>
          <div className="bg-brand-dark-2 rounded-xl p-5 border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-gold/5 group-hover:bg-brand-gold/10 transition-colors" />
            <Zap className="text-brand-gold mb-2" size={24} />
            <span className="text-2xl font-bold text-brand-gold">{user.totalSats || 0}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium relative z-10">Pending Payout</span>
          </div>
        </div>
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

        {/* Weekly Study Goal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="h-full"
        >
          <GlassCard className="bg-brand-dark-2 relative overflow-hidden border border-white/5 h-full flex flex-col">
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
            
            <div className="flex-1 flex flex-col justify-center">
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
            
            // Allow clicking if in_progress or completed, or if it's the very first locked chapter
            // For prototype simplicity, assuming sequential unlock: previous chapter completed unlocks next.
            const prevCompleted = chapter.id === 1 || user.progress?.[chapter.id - 1]?.status === 'completed';
            const isClickable = status === 'completed' || status === 'in_progress' || prevCompleted || user.studyPath?.unlockMode === 'all';
            
            return (
              <motion.div
                key={chapter.id}
                whileHover={isClickable ? { y: -4, scale: 1.01 } : {}}
                onClick={() => isClickable && navigate(`/chapter/${chapter.id}`)}
                className={`
                  p-5 rounded-xl border relative overflow-hidden transition-all duration-300 flex flex-col
                  ${isClickable ? 'cursor-pointer hover:shadow-[0_4px_24px_rgba(253,184,19,0.15)] hover:border-brand-gold/40' : 'opacity-60 cursor-not-allowed'}
                  ${status === 'completed' ? 'bg-status-success/5 border-status-success/20' : 
                    status === 'in_progress' ? 'bg-brand-gold/5 border-brand-gold/30 gold-glow' : 
                    'bg-brand-dark-2 border-white/5'}
                `}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded">
                    Chapter {chapter.id < 10 ? `0${chapter.id}` : chapter.id}
                  </span>
                  
                  {status === 'completed' && <CheckCircle2 size={18} className="text-status-success" />}
                  {(status === 'locked' && !isClickable) && <Lock size={16} className="text-gray-500" />}
                  {(status === 'in_progress' || (status === 'locked' && isClickable)) && <PlayCircle size={18} className="text-brand-gold" />}
                </div>

                <h3 className="font-bold text-lg mb-4 flex-1 line-clamp-2 pr-2">{chapter.title}</h3>
                
                {/* Meta Footer */}
                <div className="flex items-center justify-between text-xs font-medium mt-auto pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    ⏱ <span>{chapter.estimatedMinutes}m</span>
                  </div>
                  <div className="flex items-center gap-1 text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-full border border-brand-gold/20">
                    <Zap size={10} className="fill-brand-gold" />
                    <span>{chapter.satsPossible || 165}</span>
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
