import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getCurrentUser, updateUser, getContent } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { Camera, Edit2, Zap, Flame, Trophy, CheckCircle2, Circle, User, BookOpen, GraduationCap, Brain, Globe, Rocket, Sprout } from 'lucide-react';

const PRESET_AVATARS = [
  { name: "Pioneer", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Bitcoin", url: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Neon", url: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Cyber", url: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Savannah", url: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?auto=format&fit=crop&q=80&w=150&h=150" },
  { name: "Gold", url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=150&h=150" }
];

const BADGES = [
  { id: 'first_step', name: 'First Step', xp: 100, desc: 'Complete Chapter 1', icon: <Zap size={24} className="text-brand-gold drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" /> },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', xp: 250, desc: 'Complete Chapter 5', icon: <BookOpen size={24} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" /> },
  { id: 'diplomat', name: 'Bitcoin Diploma', xp: 1000, desc: 'Complete all 10 chapters', icon: <GraduationCap size={24} className="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" /> },
  { id: 'quiz_master', name: 'Quiz Master', xp: 300, desc: 'Pass 5 quizzes on first attempt', icon: <Brain size={24} className="text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" /> },
  { id: 'consistent', name: 'Consistent', xp: 200, desc: 'Achieve a 7-day streak', icon: <Flame size={24} className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" /> },
  { id: 'african_pioneer', name: 'African Pioneer', xp: 50, desc: 'Sign up from an African country', icon: <Globe size={24} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" /> },
  { id: 'sats_stacker', name: 'Sats Stacker', xp: 150, desc: 'Earn 1000 sats', icon: <Zap size={24} className="text-brand-gold drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" /> },
  { id: 'fast_learner', name: 'Fast Learner', xp: 200, desc: 'Complete 3 chapters in one week', icon: <Rocket size={24} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" /> },
];

export default function Profile() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const content = getContent();
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const location = useLocation();
  const initialTab = location.pathname === '/settings' ? 'settings' : 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'settings'>(initialTab);
  
  useEffect(() => {
    if (location.pathname === '/settings') {
      setActiveTab('settings');
    } else if (location.pathname === '/profile') {
      setActiveTab('overview');
    }
  }, [location.pathname]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    whatsapp: user?.whatsapp || '',
    country: user?.country || '',
    bio: user?.bio || '',
    btcAddress: user?.btcAddress || '',
  });

  if (!user) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.2 * 1024 * 1024) {
      toast('Please upload an image smaller than 1.2MB for custom avatar storage.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateUser(user.email, { avatar: base64 });
        toast('Profile picture uploaded successfully!', 'success');
        setTimeout(() => window.location.reload(), 600);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    updateUser(user.email, { avatar: url });
    toast('Profile avatar updated!', 'success');
    setTimeout(() => window.location.reload(), 400);
  };

  const chapters = Object.values(content.chapters || {}) as any[];
  const completedChapters = chapters.filter(c => user.progress?.[c.id]?.status === 'completed').length;
  const quizzesPassed = chapters.filter(c => user.progress?.[c.id]?.quizPassed).length;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateUser(user.email, formData);
      toast('Profile settings updated successfully!', 'success');
    } catch (err: any) {
      toast('Failed to update settings', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8 flex flex-col gap-6">
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header Profile Card */}
      <GlassCard className="relative overflow-hidden bg-brand-dark-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 blur-[80px] pointer-events-none rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          
          {/* Avatar */}
          <div 
            className="relative group cursor-pointer shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload custom profile picture"
          >
            <div className="w-24 h-24 rounded-full bg-brand-gold text-[#000000] flex items-center justify-center overflow-hidden text-4xl font-bold shadow-[0_0_20px_rgba(253,184,19,0.3)]">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white animate-pulse" />
            </div>
          </div>
          
          {/* Info */}
          <div className="flex-1 mt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <span className="bg-white/10 px-3 py-1 text-xs font-semibold rounded-full border border-white/5 whitespace-nowrap flex items-center gap-1">
                <span className="text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.8)]">⚲</span> {user.level || 'Seedling'} • {user.xp || 0} XP
              </span>
            </div>
            <p className="text-gray-400 mb-1">{user.country} • Joined {new Date(user.joinedDate).toLocaleDateString()}</p>
            {user.bio && <p className="text-gray-300 text-sm max-w-xl">{user.bio}</p>}
          </div>

          {/* Quick Action */}
          <Button variant="outline" className="shrink-0" onClick={() => setActiveTab('settings')}>
            Edit Profile
          </Button>
        </div>
      </GlassCard>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-brand-dark-2 p-4 rounded-xl border border-white/5 select-none hover:border-brand-gold/30 transition-colors">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Chapters</p>
          <p className="text-2xl font-bold">{completedChapters}/10</p>
        </div>
        <div className="bg-brand-dark-2 p-4 rounded-xl border border-white/5 select-none hover:border-brand-gold/30 transition-colors">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Quizzes Passed</p>
          <p className="text-2xl font-bold">{quizzesPassed}</p>
        </div>
        <div className="bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/20 select-none gold-glow">
          <div className="flex items-center gap-1 text-brand-gold mb-1">
            <Zap size={14} className="fill-brand-gold" />
            <p className="text-xs font-bold uppercase tracking-wider">Total Sats Earned</p>
          </div>
          <p className="text-2xl font-bold text-brand-gold">{user.totalSats || 0}</p>
        </div>
        <div className="bg-brand-dark-2 p-4 rounded-xl border border-white/5 select-none hover:border-brand-gold/30 transition-colors">
          <div className="flex items-center gap-1 text-status-warning mb-1">
            <Flame size={14} className="fill-status-warning" />
            <p className="text-xs font-bold uppercase tracking-wider">Study Streak</p>
          </div>
          <p className="text-2xl font-bold">{user.streak || 0} Days</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 overflow-x-auto hide-scrollbar pt-2">
        {(['overview', 'badges', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab ? 'border-brand-gold text-brand-gold' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-wider text-gray-400">
                      <th className="p-4 font-medium">Chapter</th>
                      <th className="p-4 font-medium text-center">Status</th>
                      <th className="p-4 font-medium text-center">Quiz Score</th>
                      <th className="p-4 font-medium text-right">Sats Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters.map((chap) => {
                      const prog = user.progress?.[chap.id];
                      const isComplete = prog?.status === 'completed';
                      const bestScore = prog?.quizAttempts?.reduce((max: number, a: any) => Math.max(max, a.score), 0) || 0;
                      
                      return (
                        <tr key={chap.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <span className="font-semibold">{chap.title}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center">
                              {isComplete 
                                ? <span className="bg-status-success/10 text-status-success text-xs font-bold px-2 py-1 rounded">COMPLETED</span>
                                : prog?.status === 'in_progress' 
                                  ? <span className="bg-brand-gold/10 text-brand-gold text-xs font-bold px-2 py-1 rounded">IN PROGRESS</span>
                                  : <span className="bg-white/5 text-gray-500 text-xs font-bold px-2 py-1 rounded">LOCKED</span>
                              }
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {prog?.quizPassed ? (
                              <span className="text-status-success font-medium">{bestScore}%</span>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {prog?.satsEarned > 0 ? (
                              <span className="text-brand-gold font-medium flex items-center justify-end gap-1">
                                <Zap size={14} className="fill-brand-gold" /> {prog.satsEarned}
                              </span>
                            ) : <span className="text-gray-500">0</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            
            <GlassCard>
              <h3 className="font-bold text-lg mb-4">Activity Heatmap</h3>
              {/* Fake heatmap for prototype styling */}
              <div className="flex flex-wrap gap-1 md:gap-1.5 opacity-60">
                {Array.from({ length: 90 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${Math.random() > 0.7 ? 'bg-brand-gold' : 'bg-white/10'}`}
                    style={{ opacity: Math.random() > 0.7 ? Math.random() * 0.8 + 0.2 : 1 }}
                  />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* BADGES */}
        {activeTab === 'badges' && (
          <motion.div key="badges" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BADGES.map(badge => {
              const isEarned = user.badges?.includes(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`p-6 rounded-xl border flex flex-col items-center text-center transition-all ${
                    isEarned ? 'bg-brand-dark-2 border-brand-gold/30 gold-glow hover:-translate-y-1' : 'bg-brand-dark-2/50 border-white/5 opacity-50 grayscale'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 bg-black/40 border border-white/10">
                    {badge.icon}
                  </div>
                  <h4 className="font-bold mb-1 leading-tight">{badge.name}</h4>
                  <p className="text-xs text-gray-400 mb-3">{badge.desc}</p>
                  <p className="text-xs font-bold text-brand-gold mt-auto uppercase tracking-wider">{badge.xp} XP</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-6">
              <GlassCard>
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2"><User size={20} /> Personal Information</h3>
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Email (Read-only)" value={user.email} readOnly disabled className="opacity-50" />
                    <Input label="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} required />
                    <Input label="Country" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} required />
                  </div>
                  
                  <div className="flex flex-col gap-1.5 w-full pt-2">
                    <label className="text-sm font-medium text-gray-300">Bio (Optional)</label>
                    <textarea 
                      className="flex w-full rounded-xl border border-white/10 bg-brand-dark-2 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-gold focus-visible:border-brand-gold min-h-[100px] resize-none"
                      maxLength={160}
                      placeholder="Tell us a bit about yourself..."
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 text-right">{formData.bio.length}/160</p>
                  </div>

                  <Button type="submit" className="mt-4">Save Changes</Button>
                </form>
              </GlassCard>

              <GlassCard>
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2"><Camera size={20} className="text-brand-gold" /> Profile Picture & Avatar</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Upload an image from your device or select one of our premium educational presets to show off your rank on the leaderboards.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                  {/* Current Preview */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-full bg-brand-gold text-[#000000] flex items-center justify-center overflow-hidden text-3xl font-bold shadow-lg border border-white/10">
                      {user.avatar ? (
                        <img src={user.avatar} alt="Current profile preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Preview</span>
                  </div>

                  {/* Actions & Presets */}
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera size={14} /> Upload Custom Photo
                      </Button>
                      
                      {user.avatar && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            updateUser(user.email, { avatar: '' });
                            toast('Avatar reset to default!', 'success');
                            setTimeout(() => window.location.reload(), 400);
                          }}
                          className="hover:border-red-500 hover:text-red-400"
                        >
                          Reset to Initials
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-secondary-text mb-2 text-center sm:text-left font-semibold uppercase tracking-wider">Fast Presets</div>
                    <div className="grid grid-cols-6 gap-2 max-w-xs mx-auto sm:mx-0">
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = user.avatar === preset.url;
                        return (
                          <button
                            key={preset.name}
                            onClick={() => handleSelectPreset(preset.url)}
                            className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all p-0.5 hover:scale-105 ${isSelected ? 'border-brand-gold scale-105 shadow-[0_0_8px_rgba(253,184,19,0.5)]' : 'border-transparent hover:border-white/20'}`}
                            title={`Choose ${preset.name} preset`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="border-brand-gold/30 gold-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 blur-[50px] pointer-events-none" />
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Zap size={20} className="text-brand-gold fill-brand-gold" /> Payout Settings</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-lg">
                  Set your Lightning address to receive sats directly when you finish the course.
                </p>
                <div className="space-y-4">
                  <Input 
                    label="Bitcoin Lightning Address" 
                    placeholder="satoshi@wallet.com or lnurl..."
                    value={formData.btcAddress}
                    onChange={e => setFormData({ ...formData, btcAddress: e.target.value })}
                  />
                  <Button onClick={handleSaveSettings}>Save Address</Button>
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard>
                <h3 className="font-bold text-lg mb-4">Preferences</h3>
                <div className="space-y-4">
                  <label className="flex flex-col gap-1 cursor-pointer group">
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Show on Leaderboard</span>
                    <select className="bg-brand-dark-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold">
                      <option value="yes">Yes, show my name</option>
                      <option value="no">No, stay anonymous</option>
                    </select>
                  </label>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-sm text-gray-300">Email Notifications</span>
                    <div className="w-10 h-6 bg-brand-gold rounded-full relative cursor-pointer flex items-center px-1">
                      <div className="w-4 h-4 bg-black rounded-full ml-auto shadow-md" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-300">WhatsApp Updates</span>
                    <div className="w-10 h-6 bg-brand-gold rounded-full relative cursor-pointer flex items-center px-1">
                      <div className="w-4 h-4 bg-black rounded-full ml-auto shadow-md" />
                    </div>
                  </div>
                  
                  {/* Study Reminder */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Browser Study Reminder</span>
                      <div 
                        className={`w-10 h-6 rounded-full relative cursor-pointer flex items-center px-1 transition-colors ${
                           user.studyReminderEnabled ? 'bg-brand-gold' : 'bg-white/20'
                        }`}
                        onClick={() => {
                          const newStatus = !user.studyReminderEnabled;
                          if (newStatus && Notification.permission !== 'granted') {
                            Notification.requestPermission().then(perm => {
                              if (perm === 'granted') {
                                updateUser(user.email, { studyReminderEnabled: true, studyReminderTime: user.studyReminderTime || '18:00' });
                                toast('Notifications enabled!', 'success');
                                window.location.reload();
                              } else {
                                toast('Notification permission denied.', 'error');
                              }
                            });
                          } else {
                            updateUser(user.email, { studyReminderEnabled: newStatus });
                            window.location.reload();
                          }
                        }}
                      >
                        <div className={`w-4 h-4 bg-black rounded-full shadow-md transition-transform ${user.studyReminderEnabled ? 'ml-auto' : ''}`} />
                      </div>
                    </div>
                    {user.studyReminderEnabled && (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-gray-400">Reminder Time</span>
                        <input
                          type="time"
                          value={user.studyReminderTime || '18:00'}
                          onChange={e => {
                            updateUser(user.email, { studyReminderTime: e.target.value });
                            window.location.reload(); // Quick refresh to reflect state
                          }}
                          className="bg-brand-dark-2 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold w-32"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
              
              <GlassCard className="border-status-error/30 bg-status-error/5">
                <h3 className="font-bold text-lg text-status-error mb-2">Danger Zone</h3>
                <p className="text-gray-400 text-xs mb-4">Irreversibly delete your account and all associated data, including unwithdrawn sats.</p>
                <Button variant="outline" className="w-full border-status-error text-status-error hover:bg-status-error/10 hover:text-white">
                  Delete Account
                </Button>
              </GlassCard>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
