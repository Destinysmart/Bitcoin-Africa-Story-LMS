import { useEffect, useRef } from 'react';
import { getCurrentUser, getContent, addNotification } from '../lib/storage';

export function useStudyReminder() {
  const reminderChecks = useRef<{ [timeStr: string]: boolean }>({});

  useEffect(() => {
    // Check every 30 seconds
    const interval = setInterval(() => {
      const user = getCurrentUser();
      
      if (!user || user.studyReminderEnabled !== true || !user.studyReminderTime) return;

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
        const left = weeklyGoal - completedChapters;
        
        if (completedChapters < weeklyGoal) {
          // Trigger in-app real-time notification in platform
          addNotification(
            user.email,
            'Study Reminder! ⚡',
            `You have completed ${completedChapters}/${weeklyGoal} chapters this week. You still have ${left} more to reach your goal! Let's build your Bitcoin knowledge.`,
            'alert',
            '/courses'
          );

          if (Notification.permission === 'granted') {
            const notification = new Notification('Time to Study Bitcoin! ⚡', {
              body: `You still have ${left} chapters to reach your weekly goal! Let's hit the books.`,
              icon: '/vite.svg',
              requireInteraction: true
            });
            notification.onclick = function() {
              window.focus();
              this.close();
            };
          }
        } else {
          // Trigger positive reinforcement in platform
          addNotification(
            user.email,
            'Weekly Goal Met! 🏆',
            `Fantastic! You have completed ${completedChapters} chapters against your goal of ${weeklyGoal}. You are a true Bitcoin Stacker!`,
            'success',
            '/dashboard'
          );

          if (Notification.permission === 'granted') {
            const notification = new Notification('Great Job! 🏆', {
                body: `You've already met your weekly study goal. Keep the streak alive!`,
                icon: '/vite.svg'
            });
            notification.onclick = function() {
                window.focus();
                this.close();
            };
          }
        }
      } else {
        // Reset check once time has advanced
        reminderChecks.current = {};
      }
    }, 1000 * 30);

    return () => clearInterval(interval);
  }, []);
}

