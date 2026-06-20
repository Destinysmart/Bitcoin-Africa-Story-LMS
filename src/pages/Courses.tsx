import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import SEO from '../components/ui/SEO';
import { 
  BookOpen, 
  PlayCircle, 
  Lock, 
  Trophy, 
  Star, 
  Server, 
  Globe2, 
  Clock, 
  ChevronRight, 
  Check, 
  CheckCircle, 
  X, 
  Sparkles, 
  GraduationCap, 
  Award 
} from 'lucide-react';
import { getCurrentUser, getContent, updateUser } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { triggerSuccessConfetti, triggerMilestoneConfetti } from '../lib/confetti';

// Static image asset imports for high compatibility production URL compilation
import diplomaPosterColor from '../assets/images/bitcoin_diploma_poster_1781855009002.jpg';
import nodePosterColor from '../assets/images/lightning_node_poster_1781855024195.jpg';
import marketsPosterColor from '../assets/images/emerging_markets_poster_1781855059422.jpg';
import scriptPosterColor from '../assets/images/bitcoin_script_poster_1781855074950.jpg';

const resolvePosterImage = (url?: string) => {
  if (!url) return null;
  const s = String(url);
  if (s.includes('bitcoin_diploma_poster_1781855009002')) return diplomaPosterColor;
  if (s.includes('lightning_node_poster_1781855024195')) return nodePosterColor;
  if (s.includes('emerging_markets_poster_1781855059422')) return marketsPosterColor;
  if (s.includes('bitcoin_script_poster_1781855074950')) return scriptPosterColor;
  return url;
};

// Define structures for TypeScript
interface SyllabusItem {
  id?: string | number;
  title: string;
  duration: string;
  desc: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  tags: string[];
  duration: string;
  tag: string;
  estimatedMinutes: number;
  outcomes: string[];
  syllabus: SyllabusItem[];
  imageUrl?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Server,
  Globe2,
  BookOpen,
  Trophy,
  Star,
  Award,
  GraduationCap
};

const DIPLOMA_COURSE_STATIC = {
  id: 'course-diploma',
  title: 'The Bitcoin Diploma Program',
  description: 'A comprehensive 10-chapter journey designed to take you from a complete beginner to a confident Bitcoin advocate and self-custody master.',
  longDescription: 'This program represents the standard pathway for entering the Bitcoin ecosystem. It covers everything from the history of money, technological trade-offs, public/private cryptography, to operating the Lightning Network and driving economic development across emerging markets, specifically tailored for the African context.',
  icon: BookOpen,
  color: 'text-brand-gold',
  bg: 'bg-brand-gold/10',
  tags: ['Beginner', 'Primary Curriculum'],
  duration: '10 Hours',
  tag: 'Beginner',
  estimatedMinutes: 450,
  imageUrl: '/src/assets/images/bitcoin_diploma_poster_1781855009002.jpg',
  outcomes: [
    "Explain the historical evolution of money (barter, commodity, fiat) and why Bitcoin represents a superior asset.",
    "Understand the foundational mathematics and network architecture (nodes, blocks, hash power) of Bitcoin.",
    "Perform secure and private transactions using different wallet configurations.",
    "Implement secure self-custody strategies and avoid custodial pitfalls.",
    "Leverage the Lightning Network for near-instant, zero-cost micropayments and cross-border remittances."
  ]
};

export default function Courses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const [user, setUser] = useState(() => getCurrentUser() || {});
  const { chapters: rawChapters, courses: fetchedCourses = [] } = getContent();
  const chapters = Object.values(rawChapters || {}) as any[];

  // Dynamically map dynamic database courses
  const ALL_COURSES = useMemo(() => {
    return fetchedCourses.map((c: any) => ({
      ...c,
      icon: typeof c.icon === 'string' ? (ICON_MAP[c.icon] || BookOpen) : (c.icon || BookOpen)
    })) as Course[];
  }, [fetchedCourses]);
  
  
  const completedCount = chapters.filter((c: any) => user.progress?.[c.id]?.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (chapters.length || 1)) * 100);

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  // Dynamically load the Bitcoin Diploma Program's chapters to build its syllabus
  const diplomaSyllabus = useMemo(() => {
    return chapters.map((ch: any) => ({
      id: ch.id,
      title: ch.title,
      duration: `${ch.estimatedMinutes || 45} mins`,
      desc: ch.description || "In-depth overview of the chapter's core concepts, practical setups, and real-world considerations."
    }));
  }, [chapters]);

  // Combine static header with dynamic chapter syllabus to keep items fully reactive to Admin changes
  const diplomaCourse = useMemo(() => {
    return {
      ...DIPLOMA_COURSE_STATIC,
      syllabus: diplomaSyllabus.length > 0 ? diplomaSyllabus : [
        { title: "Introduction to Money & Bitcoin", duration: "45 mins", desc: "Understanding the barter system, hard money, and the roots of contemporary monetary expansion." }
      ]
    } as Course;
  }, [diplomaSyllabus]);

  // Combined master course list
  const coursesList = useMemo(() => [diplomaCourse, ...ALL_COURSES], [diplomaCourse]);

  // Active enrolled courses IDs (default to always showing diploma course)
  const activeCourseIds = useMemo(() => {
    return ['course-diploma', ...(user.enrolledCourses || [])];
  }, [user]);

  // Separate active electives for rendering
  const activeElectives = useMemo(() => {
    return ALL_COURSES.filter(c => activeCourseIds.includes(c.id));
  }, [activeCourseIds]);

  // Display only courses NOT yet enrolled in the recommendations/upcoming list
  const upcomingAndRecommended = useMemo(() => {
    return ALL_COURSES.filter(c => !activeCourseIds.includes(c.id));
  }, [activeCourseIds]);

  // Compute all tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    ['Beginner', 'Development', 'Intermediate', 'Advanced', 'Economics', 'Infrastructure'].forEach(t => tags.add(t));
    upcomingAndRecommended.forEach(c => c.tags.forEach(t => tags.add(t)));
    return ['All', ...Array.from(tags).sort()];
  }, [upcomingAndRecommended]);

  // Filter recommendations/upcoming list
  const filteredUpcomingCourses = useMemo(() => {
    if (selectedTag === 'All') return upcomingAndRecommended;
    return upcomingAndRecommended.filter(c => c.tags.includes(selectedTag));
  }, [selectedTag, upcomingAndRecommended]);

  // Progress metrics for specialty elective courses
  const getCourseProgressPercent = (course: Course) => {
    if (course.id === 'course-diploma') {
      return progressPercent;
    }
    const totalSyllabus = course.syllabus || [];
    if (totalSyllabus.length === 0) return 0;
    let completedCount = 0;
    totalSyllabus.forEach((lesson: any, idx: number) => {
      const lessonProgKey = `${course.id}_${idx}`;
      const prog = user.progress?.[lessonProgKey];
      if (prog && (prog.status === 'completed' || prog.quizPassed)) {
        completedCount++;
      }
    });
    return Math.round((completedCount / totalSyllabus.length) * 100);
  };

  const isUnitCompleted = (courseId: string, unitTitle: string, index?: number) => {
    if (courseId === 'course-diploma') return false; // Managed by database chapters progress
    if (typeof index === 'number') {
      const lessonProgKey = `${courseId}_${index}`;
      const prog = user.progress?.[lessonProgKey];
      return !!(prog && (prog.status === 'completed' || prog.quizPassed));
    }
    const completedList = user.recommendedProgress?.[courseId]?.completedUnits || [];
    return completedList.includes(unitTitle);
  };

  // Enroll in Recommended Courses
  const handleEnroll = (courseId: string) => {
    if (!user.email) {
      toast("Please log in to enroll in courses.", "error");
      return;
    }
    const currentEnrolled = user.enrolledCourses || [];
    if (currentEnrolled.includes(courseId)) {
      toast("You are already enrolled in this course!", "info");
      return;
    }

    const updatedEnrolled = [...currentEnrolled, courseId];
    try {
      const updatedUser = updateUser(user.email, { enrolledCourses: updatedEnrolled });
      setUser(updatedUser);
      toast(`Successfully enrolled in ${coursesList.find(c => c.id === courseId)?.title}! ⚡`, 'success');
    } catch (err: any) {
      toast("Failed to enroll in the course.", "error");
    }
  };

  // Toggle unit completion inside specialty course syllabi to simulate real learning progress
  const toggleUnitCompletion = (courseId: string, unitTitle: string) => {
    if (!user.email) return;
    if (courseId === 'course-diploma') return;

    const progressObj = user.recommendedProgress || {};
    const courseProgress = progressObj[courseId] || { completedUnits: [] };
    const currentCompleted = courseProgress.completedUnits || [];

    let updatedCompleted;
    let isNowCompleted = false;
    if (currentCompleted.includes(unitTitle)) {
      updatedCompleted = currentCompleted.filter((t: string) => t !== unitTitle);
    } else {
      updatedCompleted = [...currentCompleted, unitTitle];
      isNowCompleted = true;
    }

    const updatedProgress = {
      ...progressObj,
      [courseId]: {
        ...courseProgress,
        completedUnits: updatedCompleted
      }
    };

    try {
      const updatedUser = updateUser(user.email, { recommendedProgress: updatedProgress });
      setUser(updatedUser);
      if (isNowCompleted) {
        const targetCourse = coursesList.find(c => c.id === courseId);
        const totalUnits = targetCourse?.syllabus.length || 0;
        const isCourseFinished = updatedCompleted.length === totalUnits;

        if (isCourseFinished) {
          triggerMilestoneConfetti();
          toast(`🎓 Congratulations! You have fully mastered the ${targetCourse?.title || 'specialty'} course track! ⚡`, 'success');
        } else {
          triggerSuccessConfetti();
          toast(`Marked unit "${unitTitle}" as complete! +15 XP ⚡`, 'success');
        }
      } else {
        toast(`Marked unit "${unitTitle}" as incomplete.`, 'info');
      }
    } catch (err) {
      console.error(err);
      toast("Failed to update learning progress.", "error");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <SEO 
        title="My Courses & Learning Dashboard"
        description="Explore the complete Bitcoin Diploma curriculum, master sound money, digital scarcity, standard proof-of-work mining systems, and self-custory procedures."
        keywords="Bitcoin Courses, Learning Bitcoin, Sound Money Curriculum, Bitcoin Diploma Chapters, Blockchain Mechanics, Multisig Custody"
      />
      <div>
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Manage your learning journey, preview advanced materials, and explore specialty pathways.</p>
      </div>

      {/* Active Enrollments Section */}
      <div className="space-y-6">
        <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          <PlayCircle className="text-brand-gold" /> Active Enrollments
        </h2>
        
        {/* Primary Curriculum - The Bitcoin Diploma Program */}
        <GlassCard className={`relative overflow-hidden border p-4 md:p-6 transition-colors ${theme === 'light' ? 'bg-[#ffffff] border-brand-gold/40 shadow-md text-gray-800' : 'bg-brand-dark-2 border-brand-gold/30 gold-glow'}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Trophy size={100} className="md:w-[120px] md:h-[120px]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-stretch">
            {/* Poster Image */}
            <div className={`w-full md:w-64 lg:w-72 shrink-0 aspect-[4/3] rounded-xl overflow-hidden border relative bg-black/30 group ${theme === 'light' ? 'border-gray-200' : 'border-white/15'}`}>
              {resolvePosterImage(diplomaCourse.imageUrl) ? (
                <img 
                  src={resolvePosterImage(diplomaCourse.imageUrl) || ''} 
                  alt={diplomaCourse.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-gold/5 text-brand-gold">
                  <BookOpen size={48} />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between self-stretch">
              <div>
                <div className="flex items-center gap-3 mb-3 md:mb-4">
                  <span className="bg-brand-gold/20 text-brand-gold px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                    Primary Curriculum
                  </span>
                  <span className={`flex items-center gap-1 text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Star size={13} className="text-brand-gold fill-brand-gold/20" /> 4.9/5
                  </span>
                </div>
                <h3 className={`text-xl md:text-2xl font-black mb-1.5 leading-snug ${theme === 'light' ? 'text-gray-950' : 'text-white'}`}>The Bitcoin Diploma Program</h3>
                <p className={`mb-4 md:mb-6 max-w-xl text-xs md:text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                  A comprehensive 10-chapter journey designed to take you from a complete beginner to a confident Bitcoin advocate and self-custody master.
                </p>
                
                <div className="space-y-1.5 mb-5 md:mb-6 max-w-md">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className={`font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Overall Progress</span>
                    <span className="font-extrabold text-brand-gold">{progressPercent}%</span>
                  </div>
                  <div className={`h-1.5 md:h-2 w-full rounded-full overflow-hidden border ${theme === 'light' ? 'bg-gray-100 border-gray-200/50' : 'bg-black/40 border-white/5'}`}>
                    <div 
                      className="h-full bg-brand-gold transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className={`text-[10px] md:text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{completedCount} of {chapters.length} chapters completed</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                <Button size="sm" className="h-9 md:h-10 text-xs md:text-sm px-4 font-bold" onClick={() => navigate('/dashboard')}>
                  Continue Learning →
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPreviewCourse(diplomaCourse)}
                  className={`h-9 md:h-10 text-xs md:text-sm font-bold ${theme === 'light' ? 'border-gray-200 text-gray-700 hover:text-gray-950 hover:bg-gray-50/50' : 'border-white/10 text-gray-300 hover:text-white'}`}
                >
                  Syllabus Overview
                </Button>
              </div>
            </div>
            
            {/* Custom High Density Metrics Panel - compact grid on mobile, row list on desktop */}
            <div className={`w-full md:w-64 grid grid-cols-3 md:flex md:flex-col gap-2 md:gap-3 border-t md:border-t-0 pt-4 md:pt-0 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
               <div className={`p-2.5 md:p-4 rounded-xl border flex flex-col gap-0.5 text-center md:text-left ${theme === 'light' ? 'bg-gray-50 border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]' : 'bg-black/25 border-white/5'}`}>
                 <span className={`text-[9px] md:text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Modules</span>
                 <span className={`font-extrabold text-xs md:text-lg ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{chapters.length} chapters</span>
               </div>
               <div className={`p-2.5 md:p-4 rounded-xl border flex flex-col gap-0.5 text-center md:text-left ${theme === 'light' ? 'bg-gray-50 border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]' : 'bg-black/25 border-white/5'}`}>
                 <span className={`text-[9px] md:text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Duration</span>
                 <span className={`font-extrabold text-xs md:text-lg flex items-center justify-center md:justify-start gap-1 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                   <Clock size={11} className="shrink-0 md:w-4 md:h-4 text-brand-gold" /> ~10 Hours
                 </span>
               </div>
               <div className={`p-2.5 md:p-4 rounded-xl border flex flex-col gap-0.5 text-center md:text-left ${theme === 'light' ? 'bg-gray-50 border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.01)]' : 'bg-black/25 border-white/5'}`}>
                 <span className={`text-[9px] md:text-xs font-bold uppercase tracking-wider ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Diploma</span>
                 <span className="font-extrabold text-xs md:text-lg text-brand-gold flex items-center justify-center md:justify-start gap-1 truncate">
                   <Award size={11} className="shrink-0 md:w-4 md:h-4" /> NFT Cert
                 </span>
               </div>
            </div>
          </div>
        </GlassCard>

        {/* Elective Enrollments Sub-grid */}
        {activeElectives.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>
              <GraduationCap className="text-brand-gold" size={18} /> Enrolled Elective Specializations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {activeElectives.map(course => {
                const progressVal = getCourseProgressPercent(course);
                return (
                  <GlassCard key={course.id} className={`relative overflow-hidden flex flex-col justify-between group p-6 border transition-all ${theme === 'light' ? 'bg-[#ffffff] border-gray-200 shadow-sm text-gray-800' : 'bg-brand-dark-2 border-[#fdb813]/10'}`}>
                    <div>
                      {/* Course Image Header */}
                      <div className="w-full aspect-[16/10] overflow-hidden rounded-xl relative mb-4 border border-white/10 bg-black/30">
                        {resolvePosterImage(course.imageUrl) ? (
                          <img 
                            src={resolvePosterImage(course.imageUrl) || ''} 
                            alt={course.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-gold/5 text-brand-gold">
                            <course.icon size={28} />
                          </div>
                        )}
                        {/* Floating level tag */}
                        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wide text-gray-300">
                          {course.tag}
                        </div>
                        {/* Floating category icon */}
                        <div className={`absolute bottom-2.5 left-2.5 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md bg-black/70 border border-white/15 ${course.color}`}>
                          <course.icon size={15} />
                        </div>
                      </div>

                      <h4 className={`text-lg font-bold mb-1.5 ${theme === 'light' ? 'text-gray-950 font-black' : 'text-white'}`}>{course.title}</h4>
                      <p className={`text-xs mb-4 line-clamp-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{course.description}</p>
                      
                      <div className="space-y-1.5 mb-4 font-sans">
                        <div className="flex justify-between text-xs">
                          <span className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>Learning Progress</span>
                          <span className="font-bold text-brand-gold">{progressVal}%</span>
                        </div>
                        <div className={`h-1.5 w-full rounded-full overflow-hidden border ${theme === 'light' ? 'bg-gray-100 border-gray-200/50' : 'bg-black/40 border-white/5'}`}>
                          <div 
                            className="h-full bg-brand-gold transition-all duration-300"
                            style={{ width: `${progressVal}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={`flex gap-2 pt-3 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className={`flex-1 justify-center text-xs font-bold ${theme === 'light' ? 'border-gray-200 hover:bg-gray-50 text-gray-700' : 'border-white/10 hover:bg-white/5 text-gray-300'}`}
                        onClick={() => setPreviewCourse(course)}
                      >
                        Syllabus Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 justify-center text-xs bg-brand-gold hover:bg-brand-gold/80 text-brand-black col-span-1 font-bold"
                        onClick={() => {
                          navigate(`/chapter/${course.id}_0`);
                          toast("Entering Course Classroom! ⚡", "success");
                        }}
                      >
                        Open Classroom
                      </Button>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recommended & Specialty Previews Section */}
      <div className={`space-y-6 pt-6 border-t ${theme === 'light' ? 'border-gray-200' : 'border-white/5'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            <Lock className={theme === 'light' ? 'text-gray-400' : 'text-gray-400'} /> Advanced Electives & Recommended Pathways
          </h2>
        </div>
        
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 max-w-full custom-scrollbar-horizontal scrollbar-thin whitespace-nowrap select-none no-scrollbar">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors shrink-0 ${
                selectedTag === tag 
                  ? 'bg-brand-gold text-brand-black font-semibold shadow-md' 
                  : (theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white')
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {filteredUpcomingCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredUpcomingCourses.map((course) => (
              <GlassCard key={course.id} className={`flex flex-col group relative overflow-hidden p-4 border transition-colors ${theme === 'light' ? 'bg-[#ffffff] border-gray-200 shadow-sm text-gray-800' : 'bg-brand-dark-2 border-white/5'}`}>
                 <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 
                 {/* Course Image Header */}
                 <div className="w-full aspect-[16/10] overflow-hidden rounded-xl relative mb-4 border border-white/10 bg-black/30 shrink-0">
                   {resolvePosterImage(course.imageUrl) ? (
                     <img 
                       src={resolvePosterImage(course.imageUrl) || ''} 
                       alt={course.title} 
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                       referrerPolicy="no-referrer"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-brand-gold/5 text-brand-gold">
                       <course.icon size={28} />
                     </div>
                   )}
                   {/* Floating level tag */}
                   <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wide text-gray-300">
                     {course.tag}
                   </div>
                   {/* Floating category icon */}
                   <div className={`absolute bottom-2.5 left-2.5 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md bg-black/70 border border-white/15 ${course.color}`}>
                     <course.icon size={15} />
                   </div>
                 </div>

                 <div className="flex-1 relative z-10 pb-4 flex flex-col justify-between">
                   <div>
                     <h3 className={`text-lg font-bold mb-2 transition-colors leading-tight ${theme === 'light' ? 'text-gray-950 group-hover:text-brand-gold' : 'text-white'}`}>{course.title}</h3>
                     <p className={`text-xs mb-4 line-clamp-3 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{course.description}</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-2">
                     {course.tags.map(tag => (
                       <span key={tag} className={`text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme === 'light' ? 'bg-gray-100 text-gray-650 border-gray-200' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                         {tag}
                       </span>
                     ))}
                     <span className={`text-[9.5px] uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 font-mono ${theme === 'light' ? 'bg-brand-gold/10 text-brand-gold border-brand-gold/20' : 'bg-white/5 text-brand-gold border-white/5'}`}>
                       <Clock size={9} /> {course.duration}
                     </span>
                   </div>
                 </div>
                 
                 <div className={`relative z-10 pt-4 border-t flex gap-2 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                   <Button 
                     variant="outline" 
                     className="flex-1 justify-center gap-1.5 text-xs text-brand-gold border-brand-gold/20 hover:bg-brand-gold/5 font-bold" 
                     onClick={() => setPreviewCourse(course)}
                   >
                     Preview & Syllabus
                   </Button>
                   <Button 
                     className={`flex-1 justify-center gap-1 text-xs font-bold ${theme === 'light' ? 'bg-gray-150 hover:bg-gray-200 text-gray-800' : 'bg-white/5 hover:bg-white/10 text-white'}`} 
                     onClick={() => handleEnroll(course.id)}
                   >
                     Enroll Now
                   </Button>
                 </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className={`py-12 flex flex-col items-center justify-center text-center rounded-2xl border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/5'}`}>
            <BookOpen size={48} className="text-gray-500 mb-4 opacity-50" />
            <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>No courses found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              We couldn't find any elective courses matching the "{selectedTag}" category.
            </p>
            <Button variant="outline" className={`mt-6 ${theme === 'light' ? 'border-gray-200 text-gray-700' : 'border-white/10'}`} onClick={() => setSelectedTag('All')}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

       {/* Syllabus Preview & Interactive Classroom Modal */}
      <AnimatePresence>
        {previewCourse && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ ease: "easeOut", duration: 0.25 }}
              className={`rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-thin border transition-all ${theme === 'light' ? 'bg-[#ffffff] border-gray-200' : 'bg-[#121214] border-white/10'}`}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setPreviewCourse(null)}
                  className={`p-2 rounded-full transition-colors focus:outline-none ${theme === 'light' ? 'text-gray-500 hover:text-gray-950 bg-gray-100 hover:bg-gray-200' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Course Banner Header with Poster Image Background */}
              <div className={`relative border-b overflow-hidden min-h-[220px] md:min-h-[260px] flex items-end ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                {resolvePosterImage(previewCourse.imageUrl) ? (
                  <>
                    <img 
                      src={resolvePosterImage(previewCourse.imageUrl) || ''} 
                      alt={previewCourse.title} 
                      className="absolute inset-0 w-full h-full object-cover select-none"
                      referrerPolicy="no-referrer"
                    />
                    <div className={`absolute inset-0 z-10 bg-gradient-to-t ${theme === 'light' ? 'from-[#ffffff] via-[#ffffff]/85 to-[#ffffff]/30' : 'from-[#121214] via-[#121214]/85 to-[#121214]/50'}`} />
                  </>
                ) : (
                  <div className={`absolute inset-0 opacity-95 z-0 bg-gradient-to-r ${theme === 'light' ? 'from-brand-gold/10 to-brand-gold/5' : 'from-brand-dark to-brand-dark-2'}`} />
                )}
                
                <div className="p-6 md:p-8 w-full relative z-20 flex flex-col md:flex-row gap-5 items-start md:items-end">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-md bg-black/60 border border-white/10 shrink-0 ${previewCourse.bg} ${previewCourse.color}`}>
                    <previewCourse.icon size={30} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {previewCourse.tags.map((tag: string) => (
                        <span key={tag} className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${theme === 'light' ? 'bg-gray-100 border-gray-250/20 text-gray-600' : 'bg-white/5 border-white/5 text-gray-300'}`}>
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-brand-gold/15 border border-brand-gold/20 text-brand-gold rounded">
                        {previewCourse.duration}
                      </span>
                    </div>
                    <h2 className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-950 font-black' : 'text-white'}`}>
                      {previewCourse.title}
                    </h2>
                    <p className={`mt-2 max-w-2xl text-sm md:text-base leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-400'}`}>
                      {previewCourse.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Detail Body - with responsive ordering using CSS grid orders */}
              <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {/* About & Syllabus (Pane details) */}
                <div className="order-2 md:order-1 md:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <div>
                    <h3 className={`text-base font-bold mb-2 flex items-center gap-1.5 ${theme === 'light' ? 'text-gray-950' : 'text-white'}`}>
                      <Sparkles size={16} className="text-brand-gold" />
                      About the Course
                    </h3>
                    <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-gray-650' : 'text-gray-400'}`}>
                      {previewCourse.longDescription}
                    </p>
                  </div>

                  {/* Learning Outcomes */}
                  <div className={`border rounded-xl p-5 ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.01] border-white/5'}`}>
                    <h3 className={`text-base font-bold mb-3 ${theme === 'light' ? 'text-gray-950' : 'text-white'}`}>Key Learning Outcomes</h3>
                    <ul className="grid grid-cols-1 gap-2.5">
                      {previewCourse.outcomes.map((outcome: string, idx: number) => (
                        <li key={idx} className={`flex gap-3 text-sm ${theme === 'light' ? 'text-gray-750' : 'text-gray-300'}`}>
                          <Check size={16} className="text-brand-gold shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Syllabus / Modules section */}
                  <div>
                    <h3 className={`text-base font-bold mb-3 flex items-center justify-between ${theme === 'light' ? 'text-gray-950' : 'text-white'}`}>
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={16} className="text-brand-gold" />
                        Syllabus & Core Modules
                      </span>
                      <span className="text-xs text-gray-500 font-normal">{previewCourse.syllabus.length} standard units</span>
                    </h3>
                    
                    {/* Interactive tip for enrolled electives */}
                    {previewCourse.id === 'course-diploma' ? (
                      <div className="mb-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-3.5 flex gap-3 text-xs text-brand-gold">
                        <Sparkles size={16} className="shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <span className="font-bold">Fully Functional Syllabus:</span> Every chapter below is active! Click any chapter card to jump straight into the classroom, watch videos, read wiki logs, or answer quizzes to stack real sats!
                        </div>
                      </div>
                    ) : (
                      activeCourseIds.includes(previewCourse.id) && (
                        <div className="mb-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-3.5 flex gap-3 text-xs text-brand-gold">
                          <Sparkles size={16} className="shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <span className="font-bold">Academic Assessment Active:</span> To master each lesson and advance, you must join the classroom, review the material, and pass the final exam with 100% (all correct answers).
                          </div>
                        </div>
                      )
                    )}

                    <div className="space-y-3">
                      {previewCourse.syllabus.map((lesson: any, idx: number) => {
                        const isDiploma = previewCourse.id === 'course-diploma';
                        const isLessonCompleted = isDiploma 
                          ? user.progress?.[lesson.id]?.status === 'completed'
                          : isUnitCompleted(previewCourse.id, lesson.title, idx);
                        const isModuleActive = activeCourseIds.includes(previewCourse.id);
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              let isLocked = false;
                              let previousTitle = "";
                              if (isDiploma && lesson.id) {
                                if (idx > 0) {
                                  const prevLesson = previewCourse.syllabus[idx - 1];
                                  const prevCompleted = user.progress?.[prevLesson.id]?.status === 'completed';
                                  if (!prevCompleted) {
                                    isLocked = true;
                                    previousTitle = prevLesson.title;
                                  }
                                }
                              } else if (!isDiploma && isModuleActive) {
                                if (idx > 0) {
                                  const prevLessonKey = `${previewCourse.id}_${idx - 1}`;
                                  const prevCompleted = user.progress?.[prevLessonKey]?.status === 'completed';
                                  if (!prevCompleted) {
                                    isLocked = true;
                                    previousTitle = previewCourse.syllabus[idx - 1].title;
                                  }
                                }
                              }

                              if (isLocked) {
                                toast(`Unit Locked! Complete "${previousTitle}" first and score 100% on its quiz to unlock this lesson. ⚡`, "info");
                                return;
                              }

                              if (isDiploma && lesson.id) {
                                setPreviewCourse(null);
                                navigate(`/chapter/${lesson.id}`);
                              } else if (!isDiploma && isModuleActive) {
                                setPreviewCourse(null);
                                navigate(`/chapter/${previewCourse.id}_${idx}`);
                              }
                            }}
                            className={`p-4 rounded-xl border transition-all relative overflow-hidden group/row ${
                              (isDiploma || isModuleActive) 
                                ? 'cursor-pointer hover:bg-brand-gold/10 hover:border-brand-gold/30' 
                                : ''
                            } ${
                              isLessonCompleted 
                                ? 'bg-brand-gold/5 border-brand-gold/20' 
                                : (theme === 'light' ? 'bg-gray-50/50 border-gray-200 hover:border-gray-300' : 'bg-white/[0.01] border-white/5 hover:border-white/10')
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3 relative z-10">
                              <div className="flex gap-3">
                                {/* Static Check circles based on real quiz progress */}
                                {isDiploma ? (
                                  <span className="shrink-0 mt-0.5" title={isLessonCompleted ? "Completed" : "In Progress"}>
                                    <CheckCircle 
                                      size={18} 
                                      className={isLessonCompleted ? "text-brand-gold fill-brand-gold/20" : "text-gray-650"} 
                                    />
                                  </span>
                                ) : isModuleActive ? (
                                  <span className="shrink-0 mt-0.5" title={isLessonCompleted ? "Completed" : "In Progress"}>
                                    <CheckCircle 
                                      size={18} 
                                      className={isLessonCompleted ? "text-brand-gold fill-brand-gold/20" : "text-gray-650"} 
                                    />
                                  </span>
                                ) : (
                                  <span className="font-mono text-xs text-gray-500 mt-1">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                )}

                                <div>
                                  <h4 className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${
                                    isDiploma ? 'group-hover/row:text-brand-gold' : ''
                                  } ${isLessonCompleted ? 'text-brand-gold line-through' : (theme === 'light' ? 'text-gray-950 font-extrabold' : 'text-gray-205')}`}>
                                    {lesson.title}
                                    {isDiploma && (
                                      <span className="opacity-0 group-hover/row:opacity-100 text-[10px] text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded font-normal transition-opacity duration-200">
                                        Enter Class →
                                      </span>
                                    )}
                                  </h4>
                                  <p className={`text-xs mt-1 leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{lesson.desc}</p>
                                </div>
                              </div>
                              
                              <span className={`text-[10px] font-mono rounded shrink-0 border px-2 py-0.5 ${theme === 'light' ? 'bg-gray-100 text-gray-600 border-gray-200/50' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                {lesson.duration}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Info pane / Enrollment Action */}
                <div className="order-1 md:order-2 space-y-6">
                  <GlassCard className={`p-6 sticky top-6 border transition-all ${theme === 'light' ? 'bg-[#ffffff] border-gray-250 shadow-md text-gray-800' : 'bg-brand-dark-2 border-white/5'}`}>
                    <h3 className={`font-bold text-base mb-4 ${theme === 'light' ? 'text-gray-950 border-b pb-2 border-gray-100' : 'text-white'}`}>Course Details</h3>
                    
                    <div className="space-y-4 text-sm mb-6">
                      <div className={`flex justify-between pb-2 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Time estimate</span>
                        <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{previewCourse.duration}</span>
                      </div>
                      <div className={`flex justify-between pb-2 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Classroom skill</span>
                        <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{previewCourse.tag || 'Intermediate'}</span>
                      </div>
                      <div className={`flex justify-between pb-2 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Units included</span>
                        <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{previewCourse.syllabus.length} Lessons</span>
                      </div>
                      <div className={`flex justify-between pb-2 border-b ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Reward potential</span>
                        <span className="font-semibold text-brand-gold font-mono">+{previewCourse.syllabus.length * 15} Sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>Method</span>
                        <span className="font-semibold text-green-500">Self-paced</span>
                      </div>
                    </div>

                    {/* Enrollment Status and Action Button */}
                    {activeCourseIds.includes(previewCourse.id) ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-green-500/10 border border-green-500/15 text-green-400 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
                          <Check size={14} className="stroke-[3]" /> You are Enrolled
                        </div>
                        {previewCourse.id === 'course-diploma' ? (
                          <Button 
                            onClick={() => { setPreviewCourse(null); navigate('/dashboard'); }} 
                            className="w-full justify-center bg-brand-gold text-brand-black hover:bg-brand-gold/80"
                          >
                            Go to Class Overview
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-center text-xs font-mono text-brand-gold flex items-center justify-center gap-1 mb-1">
                              <Sparkles size={12} />
                              Progress: {getCourseProgressPercent(previewCourse)}%
                            </div>
                            <Button 
                              onClick={() => setPreviewCourse(null)} 
                              className={`w-full justify-center ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}
                            >
                              Close and Complete Units
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          onClick={() => {
                            handleEnroll(previewCourse.id);
                          }} 
                          className="w-full justify-center bg-brand-gold hover:bg-brand-gold/90 text-brand-black font-bold h-11"
                        >
                          Enroll in Specialty
                        </Button>
                        <p className="text-[10px] text-gray-500 text-center leading-normal">
                          By enrolling, this course specialization will be added to your workspace active tracking area immediately.
                        </p>
                      </div>
                    )}
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
