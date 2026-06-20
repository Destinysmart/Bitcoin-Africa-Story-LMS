import { getCurrentUser, getContent } from './storage';

export interface AssistantContext {
  currentPage: {
    path: string;
    name: string;
    description: string;
    chapterDetails?: {
      id: string;
      title: string;
      description: string;
      satsPossible: number;
      estimatedMinutes: number;
      quizQuestions: string[];
      resourceTitles: string[];
    };
  };
  courseProgress: {
    totalChapters: number;
    completedChapters: number;
    pendingChapters: string[];
    totalSats: number;
    xp: number;
    level: string;
    weeklyStudyGoal: number;
    weeklyCompletionsThisWeek: number;
  };
  quizHistory: {
    totalAttempts: number;
    completedQuizzes: Array<{ chapterId: string; chapterTitle: string; attempts: number; bestScore: number }>;
    stuckQuizzes: Array<{ chapterId: string; chapterTitle: string; attemptsCount: number; lastScore: number }>;
  };
}

export function getAssistantContext(): AssistantContext | null {
  const user = getCurrentUser();
  if (!user) return null;

  const content = getContent();
  const path = window.location.pathname;
  
  // 1. Identify current page and pull matching content
  let pageName = "Unknown Page";
  let pageDescription = "Viewing some part of the Bitcoin Africa Story platform.";
  let chapterDetails: any = undefined;

  if (path === '/dashboard') {
    pageName = "Dashboard Hub";
    pageDescription = "The main hub of student study, summarizing completed weekly tasks, XP metrics, SAT balances, goals, and latest announcements.";
  } else if (path === '/leaderboard') {
    pageName = "Global Leaderboard";
    pageDescription = "Displays active students ranked by XP points or accumulated SATS. Note: Rank columns are optimized to hide dynamically on mobile for seamless screen space.";
  } else if (path === '/profile') {
    pageName = "User Profile & Weekly Study Goal Settings";
    pageDescription = "Where students customized metadata: Display name, choice of country icon, custom secure avatars, or set their weekly completion index goal (e.g. 3 chapters per week).";
  } else if (path === '/certificate') {
    pageName = "Satoshi Diploma Certification Chamber";
    pageDescription = "Only unlocks after earning 100% on all 10 core module quizzes. Grants downloadable personalized digital Bitcoin Diploma certificate PDFs.";
  } else if (path === '/admin' || path === '/instructor') {
    pageName = "Administrative Faculty Panel";
    pageDescription = "A master console for Course Instructors to log analytics, edit custom quizzes, run Gemini handbook generator engines, and track overall passage stats.";
  } else if (path === '/courses') {
    pageName = "My Course Catalog";
    pageDescription = "Lists available electives and specializations such as the Lightning Node Operator course.";
  } else if (path.startsWith('/chapter/')) {
    const chapterId = path.split('/chapter/')[1];
    pageName = `Chapter Lesson Sanctuary: ${chapterId}`;
    pageDescription = "Deep dive learning environment showcasing video lectures, interactive text syllabus layouts, hand-picked supplemental reading material links, and the critical end-of-module interactive quiz.";
    
    // Attempt load
    const coreChapter = content.chapters?.[chapterId];
    if (coreChapter) {
      chapterDetails = {
        id: chapterId,
        title: coreChapter.title || "",
        description: coreChapter.description || "",
        satsPossible: coreChapter.satsPossible || 0,
        estimatedMinutes: coreChapter.estimatedMinutes || 0,
        quizQuestions: coreChapter.quiz ? coreChapter.quiz.map((q: any) => q.question) : [],
        resourceTitles: coreChapter.resources ? coreChapter.resources.map((r: any) => r.title) : []
      };
    } else {
      // Look up inside elective courses
      let foundElective: any = null;
      if (content.courses) {
        for (const course of content.courses) {
          if (course.syllabus) {
            const parts = chapterId.split('_');
            const lessonIndex = parseInt(parts[parts.length - 1], 10);
            if (course.syllabus[lessonIndex]) {
              foundElective = course.syllabus[lessonIndex];
              foundElective.courseTitle = course.title;
              break;
            }
          }
        }
      }
      if (foundElective) {
        chapterDetails = {
          id: chapterId,
          title: foundElective.title || "",
          description: foundElective.desc || "",
          satsPossible: 2,
          estimatedMinutes: 30,
          quizQuestions: foundElective.quiz ? foundElective.quiz.map((q: any) => q.question) : [],
          resourceTitles: foundElective.resourceLink ? ["Syllabus Video and Handout Reading Link"] : []
        };
      }
    }
  }

  // 2. Build Course Progress stats
  const coreChapters = Object.values(content.chapters || {}) as any[];
  const totalChapters = coreChapters.length || 10;
  
  const progressObj = user.progress || {};
  let completedChapters = 0;
  const pendingChapters: string[] = [];

  coreChapters.forEach((ch: any) => {
    const isCompleted = progressObj[ch.id]?.status === 'completed';
    if (isCompleted) {
      completedChapters++;
    } else {
      pendingChapters.push(ch.title);
    }
  });

  // Calculate weekly goals & completions
  const weeklyStudyGoal = user.weeklyGoal || 2; 
  let weeklyCompletionsThisWeek = 0;
  Object.keys(progressObj).forEach(key => {
    const prog = progressObj[key];
    if (prog.status === 'completed' && prog.completedDate) {
      const compDate = new Date(prog.completedDate);
      const diffMs = Date.now() - compDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        weeklyCompletionsThisWeek++;
      }
    }
  });

  // 3. Quiz history details and roadblocks
  let totalAttempts = 0;
  const completedQuizzes: any[] = [];
  const stuckQuizzes: any[] = [];

  Object.keys(progressObj).forEach(cid => {
    const prog = progressObj[cid];
    const attempts = prog.quizAttempts || [];
    totalAttempts += attempts.length;
    
    // Find chapter title
    let title = `Chapter ${cid}`;
    if (content.chapters?.[cid]) {
      title = content.chapters[cid].title;
    } else {
      if (content.courses) {
        for (const course of content.courses) {
          const parts = cid.split('_');
          const lessonIndex = parseInt(parts[parts.length - 1], 10);
          if (course.syllabus?.[lessonIndex]) {
            title = `${course.title} - ${course.syllabus[lessonIndex].title}`;
            break;
          }
        }
      }
    }

    if (prog.status === 'completed' || prog.quizPassed) {
      const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a: any) => a.score)) : 100;
      completedQuizzes.push({
        chapterId: cid,
        chapterTitle: title,
        attempts: attempts.length,
        bestScore
      });
    } else if (attempts.length > 0) {
      const attemptsCount = attempts.length;
      const lastScore = attempts[attempts.length - 1]?.score || 0;
      stuckQuizzes.push({
        chapterId: cid,
        chapterTitle: title,
        attemptsCount,
        lastScore
      });
    }
  });

  return {
    currentPage: {
      path,
      name: pageName,
      description: pageDescription,
      chapterDetails
    },
    courseProgress: {
      totalChapters,
      completedChapters,
      pendingChapters,
      totalSats: user.totalSats || 0,
      xp: user.xp || 0,
      level: user.level || "Seedling",
      weeklyStudyGoal,
      weeklyCompletionsThisWeek
    },
    quizHistory: {
      totalAttempts,
      completedQuizzes,
      stuckQuizzes
    }
  };
}
