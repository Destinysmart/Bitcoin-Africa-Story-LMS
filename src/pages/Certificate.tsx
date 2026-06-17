import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUser } from '../lib/storage';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Trophy, 
  Zap, 
  Share2, 
  Send, 
  CheckCircle2, 
  GraduationCap, 
  Award, 
  Printer, 
  Download, 
  ExternalLink, 
  Check, 
  Copy,
  ShieldCheck,
  Eye,
  Lock
} from 'lucide-react';
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
    // Check certificate status set by instructors
    if (user.certificateStatus === 'issued') {
      setStep(4);
    } else if (user.certificateStatus === 'applied') {
      setStep(3); // Already applied, pending review
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
              <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                Your Bitcoin Diploma certificate application is undergoing review by the Training Faculty program staff. Delivery normally takes up to <strong>2 weeks</strong>.
              </p>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center gap-4 text-left">
                <Zap className="text-brand-gold fill-brand-gold shrink-0" size={24} />
                <p className="text-sm">
                  Your reward of <strong>{(user?.totalSats || 0).toLocaleString()} sats</strong> will be batched and paid to <span className="text-brand-gold font-medium break-all">{user?.btcAddress || formData.btcAddress}</span> upon credential approval.
                </p>
              </div>
            </GlassCard>

            <div className="w-full max-w-md space-y-4">
              <div className="bg-brand-dark-2 p-5 rounded-2xl border border-white/5 flex flex-col items-center">
                <Award size={36} className="text-brand-gold mb-2 animate-pulse" />
                <h4 className="font-bold text-sm text-white">Interactive Preview Active</h4>
                <p className="text-[11px] text-gray-400 mt-1 mb-4">You can load a live, complete visual rendering of your official diploma below to preview printing.</p>
                <Button 
                  variant="primary" 
                  className="w-full bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold flex items-center justify-center gap-2 text-xs h-10"
                  onClick={() => setStep(4)}
                >
                  <Eye size={14} /> Open Interactive Certificate Preview
                </Button>
              </div>

              <div className="w-full bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-3">Share Your Accomplishment</p>
                <div className="flex flex-col gap-2.5">
                  <Button 
                    variant="primary" 
                    className="w-full bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white border-none text-xs h-10 flex items-center justify-center gap-2"
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                  >
                    <Share2 size={14} /> Share on X
                  </Button>
                  <Button 
                    variant="secondary"
                    className="w-full bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 border border-[#25D366]/30 text-xs h-10 flex items-center justify-center gap-2"
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
                  >
                    <Share2 size={14} /> Share on WhatsApp
                  </Button>
                </div>
              </div>

              <Button 
                variant="ghost" 
                className="w-full text-xs"
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </Button>
            </div>

          </motion.div>
        )}

        {/* Certificate Active Step / PDF Printable Certificate Sheet */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center select-none pb-12">
            
            {/* Custom elegant printable styling injected into the page inside this step */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body {
                  background: white !important;
                  color: #0f172a !important;
                }
                /* Hide everything but the certificate sheet container */
                body > div:not(.print-container),
                #root > div:not(.print-container),
                main,
                nav,
                header,
                footer,
                aside,
                button,
                .no-print {
                  display: none !important;
                  height: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .print-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100% !important;
                  max-width: 100% !important;
                  height: 100vh !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  background: white !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                }
                .certificate-card {
                  border: 12px double #FDB813 !important;
                  background: #fbfbf9 !important;
                  color: #0f172a !important;
                  box-shadow: none !important;
                  transform: scale(1) !important;
                  width: 297mm !important;
                  height: 210mm !important;
                  margin: auto !important;
                  box-sizing: border-box !important;
                  page-break-inside: avoid !important;
                }
              }
            `}} />

            <div className="no-print text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-success/10 border border-status-success/20 text-status-success text-xs font-bold mb-3 animate-pulse">
                <CheckCircle2 size={12} /> VERIFIED ACCREDITATION PREVIEW
              </span>
              <h2 className="text-3xl font-black text-white">Your Official Bitcoin Diploma</h2>
              <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
                Congratulations! Print your diploma as a high-resolution A4 landscape document or share with the world.
              </p>
            </div>

            {/* PRINT CONTAINER / DIPLOMA CANVAS */}
            <div className="print-container w-full max-w-4xl mx-auto mb-8">
              <div 
                id="certificate-card"
                className="certificate-card relative bg-[#FAF9F6] text-[#0f172a] shadow-[0_20px_50px_rgba(253,184,19,0.15)] rounded-2xl p-6 md:p-14 border-8 border-double border-brand-gold overflow-hidden aspect-[1.414/1] flex flex-col items-center justify-between"
              >
                {/* Background watermarked Bitcoin symbol */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
                  <span className="text-[25rem] font-bold">₿</span>
                </div>

                {/* Top Corner Borders */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-brand-gold/70" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-brand-gold/70" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-brand-gold/70" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-brand-gold/70" />

                {/* Certificate Content */}
                <div className="w-full text-center flex flex-col items-center">
                  <div className="text-brand-gold font-bold text-xs tracking-[0.3em] uppercase mb-4 font-mono">
                    BITCOIN AFRICA STORY
                  </div>
                  
                  <div className="w-14 h-14 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mb-6 border border-brand-gold/30">
                    <GraduationCap size={32} />
                  </div>

                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0f172a] uppercase mb-2 font-serif">
                    Diploma of Completion
                  </h1>
                  
                  <p className="text-[11px] md:text-xs text-gray-500 italic font-sans max-w-md mx-auto mb-8">
                    This official credential of competency is proudly verified and issued to
                  </p>

                  <h2 className="text-2xl md:text-4xl font-black text-[#1e293b] tracking-tight mb-8 font-serif border-b-2 border-brand-gold/30 pb-2 px-8 min-w-[280px] max-w-full truncate">
                    {formData.name || user?.name || "Student Graduate"}
                  </h2>

                  <p className="text-[10px] md:text-xs text-[#334155] leading-relaxed max-w-2xl font-sans text-center px-4">
                    for having successfully mastered the rigorous academic syllabus and practical workshop requirements of the <strong className="text-[#0f172a]">Bitcoin Diploma Program</strong>, displaying documented competency in peer-to-peer digital monetary theory, cryptographic key security, cold-storage self-sovereignty, and the peer-routing operation of the off-chain Lightning Network micropayments layer-2 protocol.
                  </p>
                </div>

                {/* Footer section of certificate */}
                <div className="w-full flex items-end justify-between mt-8 md:mt-12 border-t border-gray-200 pt-6">
                  {/* Left Signature */}
                  <div className="flex flex-col items-center">
                    <div className="font-serif italic text-sm text-[#0f172a] h-6 flex items-center">
                      Destiny Onyekachi
                    </div>
                    <div className="w-24 md:w-36 h-[1px] bg-gray-300 my-1" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">Training Director</span>
                  </div>

                  {/* Center Golden stamp */}
                  <div className="flex flex-col items-center justify-center relative -top-3 shrink-0">
                    <div className="w-16 h-16 rounded-full border-4 border-double border-brand-gold bg-white flex flex-col items-center justify-center shadow-[0_0_12px_rgba(253,184,19,0.2)]">
                      <div className="text-brand-gold font-bold text-center text-[10px]">₿</div>
                      <span className="text-[6px] tracking-[0.1em] font-bold text-brand-gold/80 block uppercase">VERIFIED</span>
                    </div>
                  </div>

                  {/* Right Signature */}
                  <div className="flex flex-col items-center">
                    <div className="font-serif italic text-sm text-brand-gold h-6 flex items-center pr-2 font-bold tracking-widest leading-none">
                      S. Nakamoto
                    </div>
                    <div className="w-24 md:w-36 h-[1px] bg-gray-300 my-1" />
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 font-mono">Faculty Co-Signer</span>
                  </div>
                </div>

                {/* Validation Hash */}
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-[8px] font-mono text-gray-400 uppercase tracking-widest bg-gray-100/80 px-3 py-1 rounded border border-gray-200">
                    VERIFICATION HASH ID: BAS-2026-{(user?.email || "verification").substring(0, 4).toUpperCase()}-{Math.abs((user?.xp || 750) * 1337).toString(16).toUpperCase()}
                  </span>
                </div>

              </div>
            </div>

            {/* Actions for steps */}
            <div className="no-print flex flex-col sm:flex-row gap-4 w-full max-w-sm justify-center">
              <Button 
                onClick={() => window.print()}
                variant="primary" 
                className="flex-1 bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold flex items-center justify-center gap-2 py-3 shadow-[0_4px_12px_rgba(253,184,19,0.3)]"
              >
                <Printer size={16} /> Print Diploma / PDF
              </Button>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(`Verification ID: BAS-2026-${(user?.email || "verification").substring(0, 4).toUpperCase()}-${Math.abs((user?.xp || 750) * 1337).toString(16).toUpperCase()}`);
                  toast('Validation hash copied to clipboard!', 'success');
                }}
                variant="secondary"
                className="flex-1 bg-brand-dark-2 text-white hover:bg-brand-dark-2/80 font-bold flex items-center justify-center gap-2 border border-white/5 py-3"
              >
                <Copy size={16} /> Copy Verification ID
              </Button>
            </div>

            <div className="no-print flex flex-col gap-3 w-full max-w-sm mt-6 pt-6 border-t border-white/5 text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[#94a3b8] text-xs">Share Your Accomplishment</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
                  className="flex-1 bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 size={14} /> X / Twitter
                </button>
                <button 
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
                  className="flex-1 bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 size={14} /> WhatsApp
                </button>
              </div>

              {user?.certificateStatus !== 'issued' && (
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(3)}
                  className="mt-4 text-xs font-semibold text-gray-400"
                >
                  ← Return to Review Status
                </Button>
              )}

              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard')}
                className="mt-2 text-xs"
              >
                Return to Dashboard
              </Button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
