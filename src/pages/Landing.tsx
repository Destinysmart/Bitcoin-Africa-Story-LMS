import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/GlassCard';
import { getCurrentUser } from '../lib/storage';
import SEO from '../components/ui/SEO';

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
      <SEO 
        title="Master Bitcoin & Sound Money"
        description="An interactive self-paced educational platform based on the Bitcoin Diploma curriculum. Learn cryptography, decentralized proof-of-work protocols, and master self-custody while tracking your course progress."
        keywords="Bitcoin Diploma, Sound Money, Cryptography, Self-Custody, Financial Literacy, African Bitcoin Story, Learn Blockchain, Sats Rewards"
      />
      
      {/* Background aesthetic */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/10 opacity-30 blur-[100px] pointer-events-none" />
      
      <header className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-between z-10">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/login">
            <Button variant="ghost" className="px-2.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wide">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" className="px-3.5 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap">
              Start Learning
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6 z-10 max-w-3xl mx-auto mb-12 sm:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs sm:text-sm font-semibold mb-6 sm:mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
            </span>
            Learn Bitcoin, Earn Sats
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 sm:mb-6 leading-tight">
            Master Bitcoin.<br className="hidden sm:block"/> Form the Future.
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-sans px-2">
            An easy-to-follow, self-paced learning program designed specifically for absolute beginners. Discover how money works, master Bitcoin, and learn self-custody step-by-step while earning real satoshis!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-xs sm:max-w-none mx-auto w-full px-4 sm:px-0">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button className="w-full px-6 py-3 text-sm sm:text-base md:text-lg font-bold">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full px-6 py-3 text-sm sm:text-base md:text-lg font-bold">
                Resume Course
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
