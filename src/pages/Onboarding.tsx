import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/Button';
import { GlassCard, Logo } from '../components/ui/GlassCard';
import { getCurrentUser, updateUser } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { Sprout, BookOpen, Zap, Clock, Rocket, Lightbulb, Briefcase, Building2, Globe } from 'lucide-react';

type ExperienceLevel = 'complete_beginner' | 'know_basics' | 'fairly_experienced';
type StudyTime = '1-2' | '3-5' | '5+';
type Goal = 'personal' | 'career' | 'business' | 'community';

interface StudyPath {
  level: string;
  hoursPerWeek: number;
  goal: string;
  chaptersPerWeek: number;
  estimatedMonths: number;
  unlockMode: 'sequential' | 'alternating' | 'all';
}

function calculateStudyPath(exp: ExperienceLevel, time: StudyTime, goalStr: Goal): StudyPath {
  let unlockMode: 'sequential' | 'alternating' | 'all' = 'sequential';
  let months = 6;
  let chapsPerWeek = 0.5;

  if (exp === 'fairly_experienced') unlockMode = 'all';
  else if (exp === 'know_basics') unlockMode = 'alternating';

  if (time === '5+') {
    months = 1;
    chapsPerWeek = 2.5;
    if (exp !== 'fairly_experienced') unlockMode = 'all'; // Accelerated
  } else if (time === '3-5') {
    months = 4;
    chapsPerWeek = 0.6;
  } else {
    months = 6;
    chapsPerWeek = 0.4;
  }

  // Adjust for simplicity
  return {
    level: exp,
    hoursPerWeek: time === '1-2' ? 2 : time === '3-5' ? 4 : 6,
    goal: goalStr,
    chaptersPerWeek: chapsPerWeek,
    estimatedMonths: months,
    unlockMode
  };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  
  const [exp, setExp] = useState<ExperienceLevel | null>(null);
  const [time, setTime] = useState<StudyTime | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);

  const user = getCurrentUser();

  const handleSkip = () => {
    if (!user) return;
    try {
      const estDate = new Date();
      estDate.setMonth(estDate.getMonth() + 4);
      updateUser(user.email, {
        onboardingComplete: true,
        weeklyGoalHours: 3,
        studyPath: {
          level: 'know_basics',
          hoursPerWeek: 3,
          goal: 'personal',
          chaptersPerWeek: 0.6,
          unlockMode: 'all',
          estimatedCompletion: estDate.toISOString()
        }
      });
      toast('Welcome! You have skipped onboarding and can start learning.', 'info');
      navigate('/dashboard');
    } catch (e: any) {
      toast(e.message || 'Error saving onboarding', 'error');
    }
  };

  const handleNext = () => {
    if (step === 1 && exp) setStep(2);
    if (step === 2 && time) setStep(3);
    if (step === 3 && goal) {
      const path = calculateStudyPath(exp!, time!, goal!);
      setStudyPath(path);
      setStep(4);
    }
  };

  const handleFinish = () => {
    if (!user) return;
    try {
      const estDate = new Date();
      estDate.setMonth(estDate.getMonth() + (studyPath?.estimatedMonths || 6));
      
      updateUser(user.email, {
        onboardingComplete: true,
        weeklyGoalHours: studyPath?.hoursPerWeek || 2,
        studyPath: {
          level: studyPath?.level,
          hoursPerWeek: studyPath?.hoursPerWeek,
          goal: studyPath?.goal,
          chaptersPerWeek: studyPath?.chaptersPerWeek,
          unlockMode: studyPath?.unlockMode,
          estimatedCompletion: estDate.toISOString()
        }
      });
      toast('Onboarding complete! Welcome to the course.', 'success');
      navigate('/dashboard');
    } catch (e: any) {
      toast(e.message || 'Error saving onboarding', 'error');
    }
  };

  const OptionCard = ({ icon, label, selected, onClick }: { icon: React.ReactNode, label: string, selected: boolean, onClick: () => void }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 md:p-6 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${
        selected ? 'bg-brand-gold/20 border-brand-gold gold-glow' : 'bg-brand-dark-2 border-white/10 hover:border-brand-gold/30'
      }`}
    >
      <div className={`flex items-center justify-center p-2 rounded-lg ${selected ? 'text-brand-gold drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className="font-medium text-[lg]">{label}</span>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-gold/5 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-2xl z-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <GlassCard className="overflow-hidden relative min-h-[400px] flex flex-col">
          
          {/* Progress Dots */}
          {step < 4 && (
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-1" /> {/* Spacer */}
              <div className="flex justify-center gap-2 flex-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-10 h-1.5 rounded-full ${i === step ? 'bg-brand-gold' : i < step ? 'bg-brand-gold/50' : 'bg-white/10'}`} />
                ))}
              </div>
              <button 
                onClick={handleSkip} 
                className="text-xs font-semibold text-brand-gold/80 hover:text-brand-gold hover:underline transition-all cursor-pointer px-3 py-1 rounded bg-white/5 border border-white/5 hover:border-white/10"
              >
                Skip ✕
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How familiar are you with Bitcoin?</h2>
                <div className="flex flex-col gap-4 flex-1">
                  <OptionCard icon={<Sprout size={28} />} label="Complete Beginner" selected={exp === 'complete_beginner'} onClick={() => setExp('complete_beginner')} />
                  <OptionCard icon={<BookOpen size={28} />} label="I know the basics" selected={exp === 'know_basics'} onClick={() => setExp('know_basics')} />
                  <OptionCard icon={<Zap size={28} />} label="Fairly experienced" selected={exp === 'fairly_experienced'} onClick={() => setExp('fairly_experienced')} />
                </div>
                <Button className="w-full mt-8" disabled={!exp} onClick={handleNext}>Next Step →</Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">How many hours per week can you dedicate?</h2>
                <div className="flex flex-col gap-4 flex-1">
                  <OptionCard icon={<Clock size={28} />} label="1–2 hours" selected={time === '1-2'} onClick={() => setTime('1-2')} />
                  <OptionCard icon={<Clock size={28} />} label="3–5 hours" selected={time === '3-5'} onClick={() => setTime('3-5')} />
                  <OptionCard icon={<Rocket size={28} />} label="5+ hours" selected={time === '5+'} onClick={() => setTime('5+')} />
                </div>
                <div className="flex gap-4 mt-8">
                  <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                  <Button className="flex-1" disabled={!time} onClick={handleNext}>Next Step →</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">What's your main goal?</h2>
                <div className="flex flex-col gap-3 flex-1">
                  <OptionCard icon={<Lightbulb size={28} />} label="Personal education" selected={goal === 'personal'} onClick={() => setGoal('personal')} />
                  <OptionCard icon={<Briefcase size={28} />} label="Career development" selected={goal === 'career'} onClick={() => setGoal('career')} />
                  <OptionCard icon={<Building2 size={28} />} label="Business application" selected={goal === 'business'} onClick={() => setGoal('business')} />
                  <OptionCard icon={<Globe size={28} />} label="Community impact" selected={goal === 'community'} onClick={() => setGoal('community')} />
                </div>
                <div className="flex gap-4 mt-8">
                  <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                  <Button className="flex-1" disabled={!goal} onClick={handleNext}>Create My Plan →</Button>
                </div>
              </motion.div>
            )}

            {step === 4 && studyPath && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col flex-1 items-center justify-center text-center py-6"
              >
                <div className="w-20 h-20 bg-brand-gold/20 rounded-full flex items-center justify-center mb-6">
                  <Zap size={40} className="text-brand-gold drop-shadow-[0_0_8px_rgba(253,184,19,0.8)]" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Your personalized plan is ready</h2>
                <p className="text-gray-400 mb-8 max-w-md">We've built a custom study path based on your experience and availability.</p>
                
                <div className="w-full bg-brand-dark-2 rounded-2xl border border-white/5 p-6 mb-8 text-left grid gap-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-gray-400">Estimated completion:</span>
                    <span className="font-semibold text-white">~{studyPath.estimatedMonths} Months</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <span className="text-gray-400">Recommended pace:</span>
                    <span className="font-semibold text-white">{studyPath.chaptersPerWeek} chapters/week</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Weekly study goal:</span>
                    <span className="font-semibold text-brand-gold">{studyPath.hoursPerWeek} hours/week</span>
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={handleFinish}>
                  Begin Learning →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </GlassCard>
      </div>
    </div>
  );
}
