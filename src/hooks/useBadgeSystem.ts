import { useEffect } from 'react';
import { getCurrentUser, updateUser } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { triggerSuccessConfetti } from '../lib/confetti';

export const BADGE_DEFS = [
  { id: 'first_step', name: 'First Step', xp: 100, desc: 'Complete Chapter 1' },
  { id: 'knowledge_seeker', name: 'Knowledge Seeker', xp: 250, desc: 'Complete Chapter 5' },
  { id: 'diplomat', name: 'Bitcoin Diplomat', xp: 1000, desc: 'Complete all 10 chapters' },
  { id: 'quiz_master', name: 'Quiz Master', xp: 300, desc: 'Pass 5 quizzes on first attempt' },
  { id: 'consistent', name: 'Consistent', xp: 200, desc: 'Achieve a 7-day streak' },
  { id: 'african_pioneer', name: 'African Pioneer', xp: 50, desc: 'Sign up from an African country' },
  { id: 'sats_stacker', name: 'Sats Stacker', xp: 150, desc: 'Earn 1000 sats' },
  { id: 'fast_learner', name: 'Fast Learner', xp: 200, desc: 'Complete 3 chapters in one week' }
];

export function useBadgeSystem() {
  const { toast } = useToast();

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const user = getCurrentUser();
      if (!user || user.role === 'admin') return;

      const earnedBadges = new Set(user.badges || []);
      const newlyEarned: string[] = [];
      let newXpAdded = 0;
      
      const prog = user.progress || {};
      
      // 1. First Step
      if (!earnedBadges.has('first_step') && prog['1']?.status === 'completed') {
        newlyEarned.push('first_step');
        newXpAdded += 100;
      }
      
      // 2. Knowledge Seeker
      if (!earnedBadges.has('knowledge_seeker') && prog['5']?.status === 'completed') {
        newlyEarned.push('knowledge_seeker');
        newXpAdded += 250;
      }
      
      // 3. Diplomat
      if (!earnedBadges.has('diplomat')) {
        const chaptersCompleted = Object.values(prog).filter((p: any) => p.status === 'completed').length;
        if (chaptersCompleted >= 10) {
          newlyEarned.push('diplomat');
          newXpAdded += 1000;
        }
      }
      
      // 4. Quiz Master
      if (!earnedBadges.has('quiz_master')) {
        const firstAttemptPasses = Object.values(prog).filter((p: any) => {
          if (!p.quizPassed) return false;
          if (!p.quizAttempts) return false;
          return p.quizAttempts.length === 1;
        }).length;
        if (firstAttemptPasses >= 5) {
          newlyEarned.push('quiz_master');
          newXpAdded += 300;
        }
      }
      
      // 5. Consistent
      if (!earnedBadges.has('consistent') && (user.streak === undefined || user.streak >= 7)) {
        // Assume default streak of 0 unless updated, so check user.streak
        if (user.streak >= 7) {
            newlyEarned.push('consistent');
            newXpAdded += 200;
        }
      }
      
      // 6. Sats Stacker
      if (!earnedBadges.has('sats_stacker') && user.totalSats >= 1000) {
        newlyEarned.push('sats_stacker');
        newXpAdded += 150;
      }
      
      // 7. African Pioneer
      if (!earnedBadges.has('african_pioneer')) {
        const africanCountries = ['Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Uganda', 'Tanzania', 'Rwanda', 'Zimbabwe', 'Zambia', 'Egypt', 'Morocco', 'Algeria', 'Senegal', 'Mali'];
        if (user.country && africanCountries.some(country => user.country.toLowerCase().includes(country.toLowerCase()))) {
          newlyEarned.push('african_pioneer');
          newXpAdded += 50;
        }
      }
      
      // 8. Fast Learner
      if (!earnedBadges.has('fast_learner')) {
        // Fast learner: Check if there are 3 chapters completed. Hard to check exact "one week" without start date tracking for chapters,
        // so for prototype, if completedChapters >= 3 and joinedDate is within last 7 days.
        const chaptersCompleted = Object.values(prog).filter((p: any) => p.status === 'completed').length;
        if (chaptersCompleted >= 3 && user.joinedDate) {
           const joined = new Date(user.joinedDate);
           const now = new Date();
           const daysSinceJoin = (now.getTime() - joined.getTime()) / (1000 * 3600 * 24);
           if (daysSinceJoin <= 7) {
             newlyEarned.push('fast_learner');
             newXpAdded += 200;
           }
        }
      }
      
      if (newlyEarned.length > 0) {
        newlyEarned.forEach(bId => earnedBadges.add(bId));
        
        // Notify
        newlyEarned.forEach(bId => {
          const def = BADGE_DEFS.find(b => b.id === bId);
          if (def) {
             toast(`🏆 Badge Unlocked: ${def.name}! (+${def.xp} XP)`, 'success');
          }
        });

        triggerSuccessConfetti();
        
        updateUser(user.email, {
          badges: Array.from(earnedBadges),
          xp: (user.xp || 0) + newXpAdded
        });
        // We do not reload or change state here aggressively to avoid rendering loops
      }

    }, 3000); // Check periodically

    return () => clearInterval(checkInterval);
  }, [toast]);
}
