import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUser } from '../lib/storage';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trophy, Zap, Share2, Send, CheckCircle2, GraduationCap } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { triggerMilestoneConfetti } from '../lib/confetti';

export default function Certificate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    country: user?.country || '',
    btcAddress: user?.btcAddress || '',
  });

  useEffect(() => {
    if (step === 1) {
      triggerMilestoneConfetti();
    }
  }, [step]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Theoretically we check if they finished 10 chapters. 
    // Here we'll just allow it for prototype testing if they arrive here.
    if (user.certificateStatus === 'applied') {
      setStep(3); // Already applied
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (user) {
        updateUser(user.email, {
          certificateStatus: 'applied',
          certificateAppliedDate: new Date().toISOString(),
          payoutStatus: 'pending',
          payoutRequestDate: new Date().toISOString(),
          btcAddress: formData.btcAddress,
          whatsapp: formData.whatsapp,
          name: formData.name
        });
      }
      setLoading(false);
      setStep(3);
      toast('Application submitted successfully!', 'success');
    }, 1200);
  };

  const shareText = `I just completed the Bitcoin Diploma Program by @BitcoinAfricaStory!\nLearned about Bitcoin, earned ${user?.totalSats || 0} sats while studying, and got certified.\nJoin the next cohort: bitcoinafricastory.com #Bitcoin #Africa`;

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24 md:pb-8 flex flex-col items-center justify-center min-h-[80vh]">
      
      <AnimatePresence mode="wait">
        
        {/* Celebration Step */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full text-center flex flex-col items-center">
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold/20 via-brand-black to-brand-black pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center w-full">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-32 h-32 mb-8 rounded-full bg-brand-gold/20 flex flex-col items-center justify-center border-2 border-brand-gold gold-glow relative"
              >
                <Trophy size={50} className="text-brand-gold" />
                <div className="absolute -bottom-3 bg-brand-black border border-brand-gold text-brand-gold text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  100% COMPLETE
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight flex items-center justify-center gap-4">
                <GraduationCap size={48} className="text-brand-gold drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" />
                Congratulations, {user?.name.split(' ')[0]}!
              </h1>
              <p className="text-xl text-gray-400 mb-10 max-w-lg">You've successfully completed the entire Bitcoin Diploma Program.</p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-10">
                <div className="bg-brand-dark-2 p-4 rounded-xl border border-brand-gold/30 gold-glow flex flex-col items-center justify-center">
                  <Zap size={24} className="text-brand-gold fill-brand-gold mb-2" />
                  <span className="text-3xl font-bold text-brand-gold">{user?.totalSats || 0}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Sats Earned</span>
                </div>
                <div className="bg-brand-dark-2 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                  <CheckCircle2 size={24} className="text-status-success mb-2" />
                  <span className="text-3xl font-bold">{Object.keys(user?.progress || {}).length}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Quizzes Passed</span>
                </div>
              </div>
              
              <Button size="lg" className="w-full max-w-md text-lg h-14" onClick={() => setStep(2)}>
                Claim Certificate & Sats →
              </Button>
            </div>
          </motion.div>
        )}

        {/* Form Step */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white transition-colors">← Back</button>
              <h2 className="text-2xl font-bold">Certificate & Payout Details</h2>
            </div>
            
            <GlassCard>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="bg-brand-gold/5 border border-brand-gold/20 p-4 rounded-xl flex items-start gap-4 mb-4">
                  <div className="bg-brand-gold/20 p-2 rounded-full mt-1 shrink-0"><Zap size={20} className="text-brand-gold fill-brand-gold" /></div>
                  <div>
                    <h4 className="font-bold text-brand-gold">You are claiming {user?.totalSats || 0} Sats!</h4>
                    <p className="text-sm text-gray-400 mt-1">Please provide a valid Lightning Network address (e.g. name@wallet.com) to receive your reward.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Legal Name (For Certificate)" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  <Input label="Email Address" value={formData.email} readOnly disabled className="opacity-50" />
                  <Input label="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} required />
                  <Input label="Country" value={formData.country} readOnly disabled className="opacity-50" />
                </div>
                
                <div className="pt-2">
                  <Input 
                    label="Bitcoin Lightning Address" 
                    placeholder="e.g. satoshi@getalby.com"
                    value={formData.btcAddress}
                    onChange={e => setFormData({ ...formData, btcAddress: e.target.value })}
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end border-t border-white/5">
                  <Button size="lg" type="submit" disabled={loading} className="w-full md:w-auto min-w-[200px]">
                    {loading ? 'Submitting...' : 'Submit Application'} <Send size={18} className="ml-2" />
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {/* Confirmation Step */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center flex flex-col items-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-status-success/20 flex items-center justify-center text-status-success shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              Application Received! 
              <Zap size={32} className="text-brand-gold drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" />
            </h2>
            
            <GlassCard className="max-w-md w-full bg-brand-dark-2/80 mb-8 border border-status-success/30">
              <p className="text-gray-300 text-sm mb-4">
                Your Bitcoin Diploma certificate will be delivered within <strong>2 weeks</strong> via email and WhatsApp.
              </p>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center gap-4 text-left">
                <Zap className="text-brand-gold fill-brand-gold shrink-0" size={24} />
                <p className="text-sm">
                  Your <strong>{(user?.totalSats || 0).toLocaleString()} sats</strong> will be sent to <span className="text-brand-gold font-medium break-all">{user?.btcAddress || formData.btcAddress}</span> at the same time.
                </p>
              </div>
            </GlassCard>

            <div className="w-full max-w-md">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4">Share Your Achievement</p>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="primary" 
                  className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-none gold-glow-hover flex items-center justify-center gap-2"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                >
                  <Share2 size={18} /> Share on X
                </Button>
                <Button 
                  variant="secondary"
                  className="w-full bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 flex items-center justify-center gap-2"
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
                >
                  <Share2 size={18} /> Share on WhatsApp
                </Button>
                <Button 
                  variant="ghost" 
                  className="mt-4"
                  onClick={() => navigate('/dashboard')}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
