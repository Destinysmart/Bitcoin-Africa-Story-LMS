import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser, getNotifications, markNotificationAsRead, clearAllNotifications, AppNotification, getContent } from '../../lib/storage';
import { Logo } from '../ui/GlassCard';
import { Home, BookOpen, User, Trophy, Settings, ShieldCheck, LogOut, Search, Bell, Moon, Sun, Menu, X, Check, Trash2, ShieldAlert, BadgeInfo, Users, Mic, MicOff, Volume2 } from 'lucide-react';

import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { useStudyReminder } from '../../hooks/useStudyReminder';
import { useBadgeSystem } from '../../hooks/useBadgeSystem';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Voice Interaction States
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState('Say "Go to Dashboard" or "Go to Chapter 3"...');
  const [showVoiceAssist, setShowVoiceAssist] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  // Text-To-Speech audio feedback trigger
  const speakConf = (text: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop any legacy speech
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis rejected:", err);
      }
    }
  };

  const handleSpeechCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    setVoiceFeedback(`Checking: "${rawText}"`);

    const wordToNumber = (str: string): number | null => {
      if (str.includes('1') || str.includes('one')) return 1;
      if (str.includes('2') || str.includes('two')) return 2;
      if (str.includes('3') || str.includes('three')) return 3;
      if (str.includes('4') || str.includes('four')) return 4;
      if (str.includes('5') || str.includes('five')) return 5;
      if (str.includes('6') || str.includes('six')) return 6;
      if (str.includes('7') || str.includes('seven')) return 7;
      if (str.includes('8') || str.includes('eight')) return 8;
      if (str.includes('9') || str.includes('nine')) return 9;
      if (str.includes('10') || str.includes('ten')) return 10;
      return null;
    };

    if (text.includes('dashboard') || text.includes('home') || text.includes('main screen')) {
      const msg = 'Navigating to Dashboard';
      setVoiceFeedback('🎯 ' + msg);
      speakConf(msg);
      setTimeout(() => {
        navigate('/');
        setShowVoiceAssist(false);
      }, 1000);
      return;
    }

    if (text.includes('leaderboard') || text.includes('ranking') || text.includes('rankings') || text.includes('trophy') || text.includes('top student')) {
      const msg = 'Navigating to Leaderboard';
      setVoiceFeedback('🏆 ' + msg);
      speakConf(msg);
      setTimeout(() => {
        navigate('/leaderboard');
        setShowVoiceAssist(false);
      }, 1000);
      return;
    }

    if (text.includes('course') || text.includes('elective') || text.includes('electives') || text.includes('classes')) {
      const msg = 'Navigating to Specialty Courses';
      setVoiceFeedback('📚 ' + msg);
      speakConf(msg);
      setTimeout(() => {
        navigate('/courses');
        setShowVoiceAssist(false);
      }, 1000);
      return;
    }

    if (text.includes('profile') || text.includes('settings') || text.includes('my stats')) {
      const msg = 'Navigating to Profile';
      setVoiceFeedback('👤 ' + msg);
      speakConf(msg);
      setTimeout(() => {
        navigate('/profile');
        setShowVoiceAssist(false);
      }, 1000);
      return;
    }

    if (text.includes('admin') || text.includes('system admin') || text.includes('admin panel')) {
      const msg = 'Navigating to Admin Panel';
      setVoiceFeedback('⚙️ ' + msg);
      speakConf(msg);
      setTimeout(() => {
        navigate('/admin');
        setShowVoiceAssist(false);
      }, 1000);
      return;
    }

    if (text.includes('instructor') || text.includes('teacher') || text.includes('instructor dashboard')) {
      const msg = 'Navigating to Instructor Dashboard';
      setVoiceFeedback('👨‍🏫 ' + msg);
      speakConf(msg);
      setTimeout(() => {
        navigate('/instructor');
        setShowVoiceAssist(false);
      }, 1000);
      return;
    }

    if (text.includes('chapter') || text.includes('module') || text.includes('lesson')) {
      const chapNum = wordToNumber(text);
      if (chapNum) {
        const msg = `Navigating to Chapter ${chapNum}`;
        setVoiceFeedback(`📖 ${msg}`);
        speakConf(msg);
        setTimeout(() => {
          navigate(`/chapter/${chapNum}`);
          setShowVoiceAssist(false);
        }, 1000);
        return;
      }
    }

    if (text.startsWith('search') || text.startsWith('find') || text.startsWith('lookup')) {
      const queryMatch = rawText.match(/(?:search|find|lookup)\s+(.+)/i);
      if (queryMatch && queryMatch[1]) {
        const queryTerm = queryMatch[1].trim();
        const msg = `Searching for ${queryTerm}`;
        setVoiceFeedback(`🔍 ${msg}`);
        speakConf(msg);
        setSearchQuery(queryTerm);
        setShowMobileSearch(true);
        setTimeout(() => {
          setShowVoiceAssist(false);
        }, 1500);
        return;
      }
    }

    setVoiceFeedback(`Unrecognized command. Doing fuzzy match: "${rawText}"`);
    setSearchQuery(rawText);
    setShowMobileSearch(true);
    speakConf(`Fuzzy searching indices for ${rawText}`);
    setTimeout(() => {
      setShowVoiceAssist(false);
    }, 2000);
  };

  const toggleVoiceControl = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      toast("Voice control not supported on this browser. Try Chrome/Edge.", "error");
      return;
    }

    if (isVoiceListening) {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (e) {}
      }
      setIsVoiceListening(false);
      setShowVoiceAssist(false);
      return;
    }

    setVoiceTranscript('');
    setVoiceFeedback('Awaiting command...');
    setShowVoiceAssist(true);
    setIsVoiceListening(true);

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsVoiceListening(true);
      setVoiceFeedback('Listening... Say "Go to Chapter 3" or "Search wallet"');
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setVoiceTranscript(resultText);
      handleSpeechCommand(resultText);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event);
      if (event.error === 'not-allowed') {
        setVoiceFeedback('Microphone permission blocked. Please allow access.');
      } else {
        setVoiceFeedback(`Recognition error: ${event.error}`);
      }
      setIsVoiceListening(false);
      setTimeout(() => setShowVoiceAssist(false), 3000);
    };

    rec.onend = () => {
      setIsVoiceListening(false);
    };

    try {
      rec.start();
    } catch (e) {
      console.warn("Starting recognition failed:", e);
    }
    setRecognitionInstance(rec);
  };

  useEffect(() => {
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch(e) {}
      }
    };
  }, [recognitionInstance]);

  // Dynamic contents for search lookup
  const searchResultsList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const content = getContent();
    const allChapters = Object.values(content.chapters || {}) as any[];
    const allCourses = content.courses || [];
    const matches: any[] = [];

    // Search Course Chapters
    allChapters.forEach((ch) => {
      if (
        ch.title?.toLowerCase().includes(query) ||
        ch.description?.toLowerCase().includes(query)
      ) {
        matches.push({
          id: ch.id,
          title: ch.title,
          description: ch.description,
          type: 'chapter',
          category: 'Diploma Chapter',
          path: `/chapter/${ch.id}`
        });
      }
    });

    // Search Specialty Courses
    allCourses.forEach((c: any) => {
      if (
        c.title?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      ) {
        matches.push({
          id: c.id,
          title: c.title,
          description: c.description,
          type: 'course',
          category: 'Elective Course',
          path: `/courses`
        });
      }
    });

    return matches;
  }, [searchQuery]);

  const refreshNotifications = useCallback(() => {
    if (user?.email) {
      setNotifications(getNotifications(user.email));
    }
  }, [user?.email]);

  useEffect(() => {
    refreshNotifications();

    const handleAdded = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.email === user?.email) {
        refreshNotifications();
      }
    };

    const handleUpdated = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.email === user?.email) {
        refreshNotifications();
      }
    };

    window.addEventListener('bas_notification_added', handleAdded);
    window.addEventListener('bas_notifications_updated', handleUpdated);

    return () => {
      window.removeEventListener('bas_notification_added', handleAdded);
      window.removeEventListener('bas_notifications_updated', handleUpdated);
    };
  }, [user?.email, refreshNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (item: AppNotification) => {
    if (user?.email) {
      markNotificationAsRead(user.email, item.id);
    }
    setIsOpenNotifications(false);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    if (user?.email) {
      notifications.forEach(n => {
        if (!n.read) markNotificationAsRead(user.email, n.id);
      });
      toast('All notifications marked as read', 'success');
    }
  };

  const handleClearAll = () => {
    if (user?.email) {
      clearAllNotifications(user.email);
      toast('Notifications cleared', 'success');
    }
  };

  const renderNotificationsDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      className="absolute right-0 mt-3 w-80 md:w-96 bg-brand-dark-1 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-white gold-glow"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-brand-dark-2">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-brand-gold" />
          <span className="font-bold text-sm">Learning Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead} 
              className="text-gray-400 hover:text-white p-1 rounded transition-colors" 
              title="Mark all as read"
            >
              <Check size={14} />
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll} 
              className="text-gray-400 hover:text-status-error p-1 rounded transition-colors" 
              title="Clear all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
        {notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-500">
              <Bell size={20} />
            </div>
            <p className="text-xs text-gray-400 font-medium">All caught up!</p>
            <p className="text-[10px] text-gray-500">No new learning events at the moment.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleNotificationClick(item)}
              className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-white/[0.02] ${!item.read ? 'bg-brand-gold/[0.02]' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                item.type === 'success' ? 'bg-status-success/15 border-status-success/30 text-status-success' :
                item.type === 'alert' ? 'bg-brand-gold/15 border-brand-gold/30 text-brand-gold' :
                'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {item.type === 'success' ? <Trophy size={14} className="text-status-success" /> :
                 item.type === 'alert' ? <ShieldAlert size={14} className="text-brand-gold" /> :
                 <BadgeInfo size={14} className="text-gray-400" />}
              </div>
              
              <div className="flex-1 space-y-1 text-left">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-xs font-bold leading-snug ${!item.read ? 'text-white' : 'text-gray-300'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[9px] text-gray-500 shrink-0 select-none">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">
                  {item.message}
                </p>
                {!item.read && (
                  <span className="inline-block w-1.5 h-1.5 bg-brand-gold rounded-full" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
  
  useStudyReminder();
  useBadgeSystem();

  const handleLogout = () => {
    setCurrentUser(null);
    toast('Logged out successfully', 'info');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'My Courses', icon: BookOpen, path: '/courses' },
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  if (user?.role === 'admin' || user?.role === 'instructor') {
    navItems.push({ label: 'Instructor', icon: Users, path: '/instructor' });
  }
  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col lg:flex-row">
      
      {/* Side Slide-Over Drawer for Mobile & Tablet Nav */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Dark blur-overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Drawer Container */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 h-screen w-72 bg-brand-dark-1 border-r border-white/5 z-50 lg:hidden flex flex-col p-6 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                >
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 flex flex-col gap-2">
                {navItems.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                      ${isActive 
                        ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20 shadow-[0_0_15px_rgba(253,184,19,0.15)]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between px-4 py-2 border border-white/5 bg-brand-dark-2/40 rounded-xl">
                  <span className="text-sm font-medium text-gray-400">Appearance</span>
                  <button
                    onClick={() => toggleTheme()}
                    className="relative flex items-center justify-between gap-1 p-1 bg-brand-black border border-white/5 rounded-lg text-gray-400 transition-all cursor-pointer"
                  >
                    <div className={`p-1 rounded-md transition-all ${theme === 'light' ? 'bg-brand-gold text-brand-black' : 'hover:text-white'}`}>
                      <Sun size={16} />
                    </div>
                    <div className={`p-1 rounded-md transition-all ${theme === 'dark' ? 'bg-brand-gold text-brand-black' : 'hover:text-white'}`}>
                      <Moon size={16} />
                    </div>
                  </button>
                </div>
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsDrawerOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-gray-400 hover:text-status-error hover:bg-status-error/10"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar Desktop (Only displayed at screens >= 1024px) */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/5 bg-brand-dark-1/50 backdrop-blur-xl h-screen sticky top-0 z-20">
        <div className="p-6">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                ${isActive 
                  ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/20 shadow-[0_0_15px_rgba(253,184,19,0.15)]' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          <div className="flex items-center justify-between px-4 py-2 border border-white/5 bg-brand-dark-2/40 rounded-xl">
            <span className="text-sm font-medium text-gray-400">Appearance</span>
            <button
              onClick={toggleTheme}
              className="relative flex items-center justify-between gap-1 p-1 bg-brand-black border border-white/5 rounded-lg text-gray-400 transition-all cursor-pointer"
            >
              <div className={`p-1 rounded-md transition-all ${theme === 'light' ? 'bg-brand-gold text-brand-black' : 'hover:text-white'}`}>
                <Sun size={16} />
              </div>
              <div className={`p-1 rounded-md transition-all ${theme === 'dark' ? 'bg-brand-gold text-brand-black' : 'hover:text-white'}`}>
                <Moon size={16} />
              </div>
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-gray-400 hover:text-status-error hover:bg-status-error/10"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Header (Displayed on screens < 1024px) */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-brand-dark-1 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
            title="Open Menu"
          >
            <Menu size={22} />
          </button>
          <Logo className="scale-90 origin-left" />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)} 
            className={`p-1.5 rounded-lg transition-colors ${showMobileSearch ? 'text-brand-gold bg-white/5' : 'text-gray-400 hover:text-white'}`}
            title="Search"
          >
            <Search size={20} />
          </button>

          <button 
            onClick={toggleVoiceControl} 
            className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${isVoiceListening ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            title="Voice Commands Navigation"
          >
            <Mic size={20} className={isVoiceListening ? 'text-red-500 animate-bounce' : ''} />
          </button>
          

          <div className="relative">
            <button 
              onClick={() => setIsOpenNotifications(!isOpenNotifications)}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg relative hover:bg-white/5 transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-brand-gold rounded-full border border-brand-dark-1 shadow-[0_0_6px_rgba(253,184,19,0.5)] animate-pulse" />
              )}
            </button>
            <AnimatePresence>
              {isOpenNotifications && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/0" onClick={() => setIsOpenNotifications(false)} />
                  <div className="relative z-50">
                    {renderNotificationsDropdown()}
                  </div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet expandable inline search bar */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-brand-dark-2 border-b border-white/5 px-4 py-2 relative z-15"
          >
            <div className="flex items-center gap-3 text-gray-400 bg-brand-black px-3.5 py-1.5 rounded-xl border border-white/5 w-full focus-within:border-brand-gold/50 focus-within:text-white transition-colors relative">
              <Search size={15} />
              <input 
                type="text" 
                placeholder="Search course or chapter..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-xs" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Mobile results render dropdown */}
            {searchQuery && (
              <div 
                className="mt-2 bg-brand-dark-1 border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/5 text-left mb-2"
              >
                {searchResultsList.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-500 font-medium">
                    No matching chapters or courses found.
                  </div>
                ) : (
                  searchResultsList.map((res) => (
                    <button
                      key={'mob-' + res.type + '-' + res.id}
                      onClick={() => {
                        navigate(res.path);
                        setSearchQuery('');
                        setShowMobileSearch(false);
                      }}
                      className="w-full p-3 text-left text-xs transition-colors hover:bg-white/[0.02] block"
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                          res.type === 'chapter' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-status-success/15 text-status-success'
                        }`}>
                          {res.category}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-[11px] mb-0.5 leading-snug">{res.title}</h4>
                      <p className="text-gray-400 text-[10px] line-clamp-1 leading-normal">{res.description}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-h-0 z-10 w-full overflow-y-auto">
        {/* Desktop Header Top Bar (Displayed on screens >= 1024px) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-white/5 bg-transparent">
          <div className="relative">
            <div className="flex items-center gap-4 text-gray-400 bg-brand-dark-2 px-4 py-2 rounded-full border border-white/5 w-64 focus-within:border-brand-gold/50 focus-within:text-white transition-colors">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search chapters & electives..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none w-full text-sm" 
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-white" title="Clear">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Absolute Dropdown holding interactive results */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-full mt-2 w-80 bg-brand-dark-1 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-white max-h-80 overflow-y-auto divide-y divide-white/5 gold-glow text-left"
                >
                  {searchResultsList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500 font-medium">
                      No matching chapters or courses found.
                    </div>
                  ) : (
                    searchResultsList.map((res) => (
                      <button
                        key={res.type + '-' + res.id}
                        onClick={() => {
                          navigate(res.path);
                          setSearchQuery('');
                        }}
                        className="w-full p-3.5 text-left text-xs transition-colors hover:bg-white/[0.03] block group"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                            res.type === 'chapter' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-status-success/15 text-status-success'
                          }`}>
                            {res.category}
                          </span>
                          <span className="text-[10px] text-gray-500 group-hover:text-brand-gold transition-colors font-semibold">Jump to →</span>
                        </div>
                        <h4 className="font-bold text-white mb-0.5 leading-snug">{res.title}</h4>
                        <p className="text-gray-400 text-[10px] line-clamp-2 leading-relaxed">{res.description}</p>
                      </button>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleVoiceControl} 
              className={`p-1.5 rounded-xl transition-colors flex items-center justify-center ${
                isVoiceListening ? 'text-red-500 bg-red-500/10 animate-pulse border border-red-500/25' : 'text-gray-400 hover:text-white hover:bg-white/5 animate-none'
              }`}
              title="Voice Navigation (Say 'Go to Chapter 3' or 'Search UTXO')"
            >
              <Mic size={20} className={isVoiceListening ? 'text-red-500 animate-bounce' : ''} />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsOpenNotifications(!isOpenNotifications)}
                className="text-gray-400 hover:text-brand-gold transition-colors relative p-1.5 rounded-xl hover:bg-white/5"
                title="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-gold rounded-full border border-brand-dark-1 shadow-[0_0_6px_rgba(253,184,19,0.5)] animate-pulse" />
                )}
              </button>
              
              <AnimatePresence>
                {isOpenNotifications && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/0" onClick={() => setIsOpenNotifications(false)} />
                    <div className="relative z-50">
                      {renderNotificationsDropdown()}
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/profile')}>
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center overflow-hidden border border-brand-gold/30 text-brand-gold font-bold group-hover:bg-brand-gold/30 transition-colors">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <span className="text-xs text-gray-400">Level {user?.level?.split(' ')[1] || '1'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Child Routes inject here */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile (Only visible under 768px for extra quick access) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-brand-dark-1/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around py-3 pb-safe z-30">
        {navItems.slice(0, 4).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 min-w-[64px]
              ${isActive ? 'text-brand-gold' : 'text-gray-400'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} className={item.path === '/dashboard' && isActive ? 'fill-brand-gold/20' : ''} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Dynamic Floating Voice Control Companion */}
      <AnimatePresence>
        {showVoiceAssist && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-brand-dark-2/95 border border-white/15 p-4 rounded-2xl shadow-2xl backdrop-blur-xl w-[320px] md:w-[420px] flex flex-col gap-3 text-white gold-glow text-left"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${isVoiceListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-gray-500/20 text-gray-400'}`}>
                  <Mic size={15} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-gold">Voice Navigation Companion</span>
              </div>
              <button 
                onClick={() => {
                  if (recognitionInstance) {
                    try {
                      recognitionInstance.stop();
                    } catch(e) {}
                  }
                  setIsVoiceListening(false);
                  setShowVoiceAssist(false);
                }} 
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-1 text-center py-1">
              <p className="text-[10px] text-gray-400 font-mono tracking-wide mb-1 transition-all">{voiceFeedback}</p>
              {voiceTranscript && (
                <p className="text-sm font-semibold text-brand-gold italic mt-1 bg-black/40 p-2.5 rounded-xl border border-white/5 shadow-inner">
                  "{voiceTranscript}"
                </p>
              )}
            </div>

            <div className="border-t border-white/5 pt-2 flex flex-col gap-1.5">
              <span className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Useful commands to try:</span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-400">
                <div className="flex items-center gap-1 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                  <span className="text-brand-gold font-bold">🎯</span> "Go to Dashboard"
                </div>
                <div className="flex items-center gap-1 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                  <span className="text-brand-gold font-bold">📖</span> "Go to Chapter 3"
                </div>
                <div className="flex items-center gap-1 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                  <span className="text-brand-gold font-bold">🏆</span> "Go to Leaderboard"
                </div>
                <div className="flex items-center gap-1 bg-white/[0.01] p-1.5 rounded-lg border border-white/5">
                  <span className="text-brand-gold font-bold">🔍</span> "Search Lightning"
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
