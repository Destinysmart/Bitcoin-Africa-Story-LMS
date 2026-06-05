import { useEffect, useRef } from 'react';
import { getCurrentUser, getContent } from '../lib/storage';

export function useStudyReminder() {
  const reminderChecks = useRef<{ [timeStr: string]: boolean }>({});

  useEffect(() => {
    // Check every 30 seconds
    const interval = setInterval(() => {
      const user = getCurrentUser();
      
      if (!user || user.studyReminderEnabled !== true || !user.studyReminderTime) return;

      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hours}:${minutes}`;

      if (currentTimeStr === user.studyReminderTime) {
        // Only trigger once per minute exactly
        if (reminderChecks.current[currentTimeStr]) return;
        reminderChecks.current[currentTimeStr] = true;

        // Check if weekly goal is not met
        const content = getContent();
        const chapters = Object.values(content.chapters || {}) as any[];
        const completedChapters = chapters.filter(c => user.progress?.[c.id]?.status === 'completed').length;
        const weeklyGoal = user.weeklyGoal || 3; // Default 3 chapters
        
        // Very basic simple check: if we haven't hit the goal this week...
        // For prototype, we just measure completed chapters vs weekly goal
        if (completedChapters < weeklyGoal) {
          const notification = new Notification('Time to Study Bitcoin! ⚡', {
            body: `You still have ${weeklyGoal - completedChapters} chapters to reach your weekly goal! Let's hit the books.`,
            icon: '/vite.svg',
            requireInteraction: true
          });
          
          notification.onclick = function() {
            window.focus();
            this.close();
          };
        } else {
            // Already met or exceeded goals, maybe a passive positive message instead?
            const notification = new Notification('Great Job! 🏆', {
                body: `You've already met your weekly study goal. Keep the streak alive!`,
                icon: '/vite.svg'
            });
            notification.onclick = function() {
                window.focus();
                this.close();
            };
        }
      } else {
        // Reset check once time has advanced
        reminderChecks.current = {};
      }
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, []);
}
