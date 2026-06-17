import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser, getNotifications, markNotificationAsRead, clearAllNotifications, AppNotification } from '../../lib/storage';
import { Logo } from '../ui/GlassCard';
import { Home, BookOpen, User, Trophy, Settings, ShieldCheck, LogOut, Search, Bell, Moon, Sun, Menu, X, Check, Trash2, ShieldAlert, BadgeInfo, Users } from 'lucide-react';

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
          <button onClick={toggleTheme} className="text-gray-400 hover:text-white p-1.5 rounded-lg">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
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

      <main className="flex-1 flex flex-col min-h-0 z-10 w-full overflow-y-auto">
        {/* Desktop Header Top Bar (Displayed on screens >= 1024px) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-white/5 bg-transparent">
          <div className="flex items-center gap-4 text-gray-400 bg-brand-dark-2 px-4 py-2 rounded-full border border-white/5 w-64 focus-within:border-brand-gold/50 focus-within:text-white transition-colors">
            <Search size={16} />
            <input type="text" placeholder="Search course..." className="bg-transparent border-none outline-none w-full text-sm" />
          </div>
          <div className="flex items-center gap-6">
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
    </div>
  );
}
