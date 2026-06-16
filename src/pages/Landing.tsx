import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/GlassCard';
import { getCurrentUser } from '../lib/storage';

export default function Landing() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'admin' || user.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background aesthetic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/10 opacity-30 blur-[100px] pointer-events-none" />
      
      <header className="w-full max-w-7xl mx-auto p-6 flex items-center justify-between z-10">
        <Logo />
        <div className="flex gap-4">
          <Link to="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary">Start Learning</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10 max-w-3xl mx-auto mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
            </span>
            Learn Bitcoin, Earn Sats
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Master Bitcoin.<br className="hidden md:block"/> Form the Future.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A premium, self-paced 10-chapter diploma program designed for African students. Learn the foundations of Bitcoin, self-custody, and the lightning network while earning actual sats.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Resume Course
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
