import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser } from '../../lib/storage';
import { Logo } from '../ui/GlassCard';
import { Home, BookOpen, User, Trophy, Settings, ShieldCheck, LogOut, Search, Bell, Moon, Sun, Menu, X } from 'lucide-react';
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
    navItems.push({ label: 'Instructor', icon: User, path: '/instructor' });
  }
  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', icon: ShieldCheck, path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-brand-black text-white flex flex-col lg:flex-row">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] pointer-events-none rounded-full" />
      
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

              <div className="mt-auto pt-6 border-t border-white/5 space-y-2">
                <button 
                  onClick={() => {
                    toggleTheme();
                    setIsDrawerOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-gray-400 hover:text-white hover:bg-white/5"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  Toggle {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
                
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

        <div className="p-4 mt-auto">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium text-gray-400 hover:text-white hover:bg-white/5 mb-2"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            Toggle {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          
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
            className="hidden md:block p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors border border-white/5"
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
          <button className="text-gray-400 hover:text-white p-1.5 rounded-lg"><Bell size={20} /></button>
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
            <button className="text-gray-400 hover:text-brand-gold transition-colors relative">
              <Bell size={20} />
              <div className="absolute top-0 right-0 w-2 h-2 bg-brand-gold rounded-full" />
            </button>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center border border-brand-gold/30 text-brand-gold font-bold group-hover:bg-brand-gold/30 transition-colors">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
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
