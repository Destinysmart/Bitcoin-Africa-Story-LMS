import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
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
import { triggerSuccessConfetti, triggerMilestoneConfetti } from '../lib/confetti';

// Define structures for TypeScript
interface SyllabusItem {
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
}

const ALL_COURSES: Course[] = [
  {
    id: 'course-lightning',
    title: 'Lightning Node Operator',
    description: 'Learn how to set up, secure, and manage your own Lightning node. Route payments and earn routing fees.',
    longDescription: 'Operating a Lightning Node is the pinnacle of supporting the Bitcoin network\'s scaling layer. This specialty program teaches students the theory and practice of liquidity optimization, security, channel backup, and routing policies to maximize efficiency and earn routing fees.',
    icon: Server,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    tags: ['Advanced', 'Infrastructure'],
    duration: '4 Weeks',
    tag: 'Advanced',
    estimatedMinutes: 240,
    outcomes: [
      "Assemble and configure dedicated node hardware or virtual private servers (VPS).",
      "Manage channel liquidity (inbound, outbound, routing metrics) using advanced tools.",
      "Set up dynamic fee schedules and routing algorithms to optimize node profitability.",
      "Configure automated backups and static channel backups (SCB) for bulletproof recovery."
    ],
    syllabus: [
      { title: "Node Setup & Hardware Choices", duration: "60 mins", desc: "Raspberry Pi setups vs virtual private servers, operating system choice, and chain synchronization." },
      { title: "Lightning Softwares & Configurations", duration: "60 mins", desc: "Comparing node software client configurations and terminal shell setups." },
      { title: "Liquidity Management", duration: "60 mins", desc: "Inbound and outbound liquidity, managing channel exhaustion, peer balancing, and loop mechanics." },
      { title: "Routing Policies & Earnings", duration: "60 mins", desc: "Setting node routing fees, evaluating peer connectivity, and analyzing payment trails." },
      { title: "Backups and Security Protocols", duration: "60 mins", desc: "Static Channel Backups (SCB), watchtower client creation, and emergency protocols." }
    ]
  },
  {
    id: 'course-markets',
    title: 'Bitcoin in Emerging Markets',
    description: 'Deep dive into how Bitcoin is being adopted for cross-border payments and inflation hedging across the global south.',
    longDescription: 'Emerging economies face the highest hurdles in banking access, hyperinflation, and remittance friction. This course analyzes how grass-roots communities across Africa, Latin America, and Southeast Asia utilize Bitcoin daily to protect capital and bypass archaic banking walls.',
    icon: Globe2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    tags: ['Economics', 'Intermediate'],
    duration: '3 Weeks',
    tag: 'Intermediate',
    estimatedMinutes: 180,
    outcomes: [
      "Analyze fiat currency failures, capital controls, and hyperinflation history in developing countries.",
      "Design low-friction, circular-economy Bitcoin adoption protocols for local merchants and circular communities.",
      "Understand cross-border trade mechanics, liquidity pathways, and mobile money integration.",
      "Identify legal and regulatory landscapes affecting community groups and P2P desks."
    ],
    syllabus: [
      { title: "Hyperinflation & Currency Collapse", duration: "45 mins", desc: "Monetary failure history and how residents safeguard local purchasing power using hard digital assets." },
      { title: "Remittance Corridors & Fees", duration: "45 mins", desc: "Bypassing high-fee remittance agency networks using automated Lightning rails." },
      { title: "Micro-payments & Circular Economies", duration: "45 mins", desc: "Community-driven circular economies (like Bitcoin Ekasi) and local merchant onboarding." },
      { title: "Financial Inclusion & Mobile Partnerships", duration: "45 mins", desc: "Interacting with local ecosystems and linking Bitcoin to mobile money systems (M-Pesa, Wave)." }
    ]
  },
  {
    id: 'course-script',
    title: 'Mastering Bitcoin Script',
    description: 'Explore the technical foundations of Bitcoin. Learn about UTXOs, sighashes, and basic smart contracts.',
    longDescription: 'Unlock the code driving the Bitcoin protocol. This course explores the stack-based language Bitcoin Script, covering everything from simple single-key transactions to multi-signature contracts, relative time-locks, and advanced Taproot smart contracts.',
    icon: BookOpen,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    tags: ['Developer', 'Advanced'],
    duration: '6 Weeks',
    tag: 'Advanced',
    estimatedMinutes: 300,
    outcomes: [
      "Read and write raw Bitcoin Script opcodes, interpreting how they execute on the virtual stack.",
      "Construct custom multi-signature locks to enforce organizational custody rules.",
      "Implement absolute and relative time-locks to delay and sequence outputs.",
      "Leverage Schnorr signatures, MAST, and Taproot trees to optimize performance and privacy."
    ],
    syllabus: [
      { title: "OpCodes and Stack Fundamentals", duration: "75 mins", desc: "Forth-like stack mechanics, arithmetic opcodes, and cryptography check verbs." },
      { title: "Multi-Signature Contracts & P2SH", duration: "75 mins", desc: "Implementing multi-key authorization, redeem scripts, and the pay-to-script-hash standard." },
      { title: "Time-Locks and Payment Channels", duration: "75 mins", desc: "Absolute time-locks, relative time-locks, and hashed timelock contracts (HTLC)." },
      { title: "Taproot & Masters of Script", duration: "75 mins", desc: "Schnorr signatures, MAST, Pay-to-Taproot (P2TR), and contract privacy." }
    ]
  }
];

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
  
  const [user, setUser] = useState(() => getCurrentUser() || {});
  const { chapters: rawChapters } = getContent();
  const chapters = Object.values(rawChapters || {}) as any[];
  
  const completedCount = chapters.filter((c: any) => user.progress?.[c.id]?.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (chapters.length || 1)) * 100);

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  // Dynamically load the Bitcoin Diploma Program's chapters to build its syllabus
  const diplomaSyllabus = useMemo(() => {
    return chapters.map((ch: any) => ({
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
    const completedList = user.recommendedProgress?.[course.id]?.completedUnits || [];
    return Math.round((completedList.length / (course.syllabus.length || 1)) * 100);
  };

  const isUnitCompleted = (courseId: string, unitTitle: string) => {
    if (courseId === 'course-diploma') return false; // Managed by database chapters progress
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
      <div>
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-gray-400">Manage your learning journey, preview advanced materials, and explore specialty pathways.</p>
      </div>

      {/* Active Enrollments Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <PlayCircle className="text-brand-gold" /> Active Enrollments
        </h2>
        
        {/* Primary Curriculum - The Bitcoin Diploma Program */}
        <GlassCard className="bg-brand-dark-2 relative overflow-hidden border-brand-gold/30 gold-glow">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Trophy size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Primary Curriculum
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Star size={14} className="text-brand-gold" /> 4.9/5
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-2">The Bitcoin Diploma Program</h3>
              <p className="text-gray-400 mb-6 max-w-xl text-sm">
                A comprehensive 10-chapter journey designed to take you from a complete beginner to a confident Bitcoin advocate and self-custody master.
              </p>
              
              <div className="space-y-2 mb-6 max-w-md">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Overall Progress</span>
                  <span className="font-bold text-brand-gold">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-brand-gold transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{completedCount} of {chapters.length} chapters completed</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => navigate('/dashboard')}>
                  Continue Learning →
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewCourse(diplomaCourse)}
                  className="border-white/10 text-gray-300 hover:text-white"
                >
                  View Syllabus Overview
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-64 flex flex-col gap-3">
               <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                 <span className="text-gray-400 text-xs">Total Modules</span>
                 <span className="font-bold text-lg">{chapters.length} chapters</span>
               </div>
               <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                 <span className="text-gray-400 text-xs">Total Duration</span>
                 <span className="font-bold text-lg flex items-center gap-2"><Clock size={16} /> ~10 Hours</span>
               </div>
               <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                 <span className="text-gray-400 text-xs">Diploma Verification</span>
                 <span className="font-bold text-lg text-brand-gold flex items-center gap-1.5">
                   <Award size={18} /> Verified NFT
                 </span>
               </div>
            </div>
          </div>
        </GlassCard>

        {/* Elective Enrollments Sub-grid */}
        {activeElectives.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-gray-300 flex items-center gap-2">
              <GraduationCap className="text-brand-gold" size={18} /> Enrolled Elective Specializations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {activeElectives.map(course => {
                const progressVal = getCourseProgressPercent(course);
                return (
                  <GlassCard key={course.id} className="bg-brand-dark-2 border border-brand-gold/10 relative overflow-hidden flex flex-col justify-between group">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${course.bg} ${course.color}`}>
                          <course.icon size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-white/5 border border-white/10 px-2.5 py-1 rounded-md text-gray-400">
                          {course.tag}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-1.5">{course.title}</h4>
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2">{course.description}</p>
                      
                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Learning Progress</span>
                          <span className="font-bold text-brand-gold">{progressVal}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-brand-gold transition-all duration-300"
                            style={{ width: `${progressVal}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-white/5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 justify-center text-xs border-white/10 hover:bg-white/5 text-gray-300"
                        onClick={() => setPreviewCourse(course)}
                      >
                        Syllabus Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 justify-center text-xs bg-brand-gold hover:bg-brand-gold/80 text-brand-black"
                        onClick={() => {
                          setPreviewCourse(course);
                          toast("Interactive syllabus dashboard loaded! Track units here.", "info");
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
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="text-gray-400" /> Advanced Electives & Recommended Pathways
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 pb-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag 
                  ? 'bg-brand-gold text-brand-black font-semibold shadow-md' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {filteredUpcomingCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredUpcomingCourses.map((course) => (
              <GlassCard key={course.id} className="bg-black/40 border border-white/5 flex flex-col group relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="flex-1 relative z-10 pb-4">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${course.bg} ${course.color}`}>
                     <course.icon size={24} />
                   </div>
                   <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{course.title}</h3>
                   <p className="text-sm text-gray-400 mb-6">{course.description}</p>
                   
                   <div className="flex flex-wrap gap-2 mb-6">
                     {course.tags.map(tag => (
                       <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 text-gray-400 rounded-md border border-white/5">
                         {tag}
                       </span>
                     ))}
                     <span className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 text-brand-gold rounded-md border border-white/5 flex items-center gap-1">
                       <Clock size={10} /> {course.duration}
                     </span>
                   </div>
                 </div>
                 
                 <div className="relative z-10 pt-4 border-t border-white/5 flex gap-2">
                   <Button 
                     variant="outline" 
                     className="flex-1 justify-center gap-1.5 text-xs text-brand-gold border-brand-gold/20 hover:bg-brand-gold/5" 
                     onClick={() => setPreviewCourse(course)}
                   >
                     Preview & Syllabus
                   </Button>
                   <Button 
                     className="flex-1 justify-center gap-1 text-xs bg-white/5 hover:bg-white/10 text-white" 
                     onClick={() => handleEnroll(course.id)}
                   >
                     Enroll Now
                   </Button>
                 </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-white/5 rounded-2xl border border-white/5">
            <BookOpen size={48} className="text-gray-500 mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-gray-300">No courses found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              We couldn't find any elective courses matching the "{selectedTag}" category.
            </p>
            <Button variant="outline" className="mt-6 border-white/10" onClick={() => setSelectedTag('All')}>
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
              className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative scrollbar-thin"
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setPreviewCourse(null)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Course Banner Header */}
              <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-r from-brand-dark to-brand-dark-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <previewCourse.icon size={160} />
                </div>
                <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${previewCourse.bg} ${previewCourse.color}`}>
                    <previewCourse.icon size={32} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {previewCourse.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-white/5 border border-white/5 text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-brand-gold/15 border border-brand-gold/20 text-brand-gold rounded">
                        {previewCourse.duration}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                      {previewCourse.title}
                    </h2>
                    <p className="text-gray-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
                      {previewCourse.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Detail Body */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <div>
                    <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-brand-gold" />
                      About the Course
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {previewCourse.longDescription}
                    </p>
                  </div>

                  {/* Learning Outcomes */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5">
                    <h3 className="text-base font-bold text-white mb-3">Key Learning Outcomes</h3>
                    <ul className="grid grid-cols-1 gap-2.5">
                      {previewCourse.outcomes.map((outcome: string, idx: number) => (
                        <li key={idx} className="flex gap-3 text-sm text-gray-300">
                          <Check size={16} className="text-brand-gold shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Syllabus / Modules section */}
                  <div>
                    <h3 className="text-base font-bold text-white mb-3 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={16} className="text-brand-gold" />
                        Syllabus & Core Modules
                      </span>
                      <span className="text-xs text-gray-500 font-normal">{previewCourse.syllabus.length} standard units</span>
                    </h3>
                    
                    {/* Interactive tip for enrolled electives */}
                    {activeCourseIds.includes(previewCourse.id) && previewCourse.id !== 'course-diploma' && (
                      <div className="mb-4 bg-brand-gold/10 border border-brand-gold/20 rounded-xl p-3.5 flex gap-3 text-xs text-brand-gold">
                        <Sparkles size={16} className="shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <span className="font-bold">Interact with Your Syllabus:</span> Toggle the check circles below to mark units as read and simulate completing your advanced specialty training!
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      {previewCourse.syllabus.map((lesson: any, idx: number) => {
                        const isLessonCompleted = isUnitCompleted(previewCourse.id, lesson.title);
                        const isModuleActive = activeCourseIds.includes(previewCourse.id);
                        return (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl border transition-all ${
                              isLessonCompleted 
                                ? 'bg-brand-gold/5 border-brand-gold/20' 
                                : 'bg-white/[0.01] border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex gap-3">
                                {/* Interactive Check circles if course is active */}
                                {isModuleActive && previewCourse.id !== 'course-diploma' ? (
                                  <button 
                                    onClick={() => toggleUnitCompletion(previewCourse.id, lesson.title)}
                                    type="button"
                                    className="shrink-0 mt-0.5 transition-transform active:scale-90"
                                    title={isLessonCompleted ? "Mark incomplete" : "Mark complete"}
                                  >
                                    <CheckCircle 
                                      size={18} 
                                      className={isLessonCompleted ? "text-brand-gold fill-brand-gold/20" : "text-gray-600 hover:text-brand-gold"} 
                                    />
                                  </button>
                                ) : (
                                  <span className="font-mono text-xs text-gray-500 mt-1">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                )}

                                <div>
                                  <h4 className={`text-sm font-bold ${isLessonCompleted ? 'text-brand-gold line-through' : 'text-gray-200'}`}>
                                    {lesson.title}
                                  </h4>
                                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{lesson.desc}</p>
                                </div>
                              </div>
                              
                              <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
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
                <div className="space-y-6">
                  <GlassCard className="p-6 bg-white/[0.01] border-white/5 sticky top-6">
                    <h3 className="font-bold text-white text-base mb-4">Course Details</h3>
                    
                    <div className="space-y-4 text-sm mb-6">
                      <div className="flex justify-between pb-2 border-b border-white/5">
                        <span className="text-gray-400">Time estimate</span>
                        <span className="font-semibold text-white">{previewCourse.duration}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-white/5">
                        <span className="text-gray-400">Classroom skill</span>
                        <span className="font-semibold text-white">{previewCourse.tag || 'Intermediate'}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-white/5">
                        <span className="text-gray-400">Units included</span>
                        <span className="font-semibold text-white">{previewCourse.syllabus.length} Lessons</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-white/5">
                        <span className="text-gray-400">Reward potential</span>
                        <span className="font-semibold text-brand-gold font-mono">+{previewCourse.syllabus.length * 15} Sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Method</span>
                        <span className="font-semibold text-green-400">Self-paced</span>
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
                              className="w-full justify-center bg-white/5 hover:bg-white/10 text-white border border-white/5"
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
