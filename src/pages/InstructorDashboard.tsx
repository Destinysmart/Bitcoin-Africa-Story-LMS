import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  BookOpen, 
  Users, 
  CheckCircle, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  ArrowLeft, 
  Check, 
  HelpCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  PlusCircle, 
  LayoutGrid, 
  GraduationCap, 
  Award, 
  FileText, 
  Video, 
  PlayCircle,
  Sparkles,
  Search,
  Eye
} from 'lucide-react';
import { 
  getUsers, 
  getContent, 
  getCurrentUser, 
  saveCourse, 
  deleteCourse, 
  saveDiplomaChapter, 
  deleteDiplomaChapter,
  updateUser 
} from '../lib/storage';
import { useToast } from '../contexts/ToastContext';

export default function InstructorDashboard() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const navigate = useNavigate();

  // Route guarding
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      toast('Access denied. Executive privileges required.', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);

  // Main UI State
  const [activeTab, setActiveTab] = useState<'analytics' | 'curriculum' | 'credentials'>('analytics');
  
  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [diplomaChapters, setDiplomaChapters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Editing state - Specialty Courses
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  // Editing state - Diploma Chapters
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingChapter, setEditingChapter] = useState<any | null>(null);

  // Search filter
  const [studentSearch, setStudentSearch] = useState('');

  // Load Data
  const loadData = () => {
    const allUsers = Object.values(getUsers());
    setUsers(allUsers.filter((u: any) => !u.role || u.role === 'student'));
    
    const cont = getContent();
    const allChapters = Object.values(cont.chapters || {}) as any[];
    // Sort chapters numerically by ID
    allChapters.sort((a, b) => Number(a.id) - Number(b.id));
    setDiplomaChapters(allChapters);
    
    // Default assigned chapters for Overview stats page
    setChapters(allChapters);
    setCourses(cont.courses || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const chapterStats = useMemo(() => {
    return chapters.map((c) => {
      let started = 0;
      let passes = 0;
      
      users.forEach((u) => {
        const prog = u.progress?.[c.id];
        if (prog) {
          if (prog.status === 'completed' || (prog.videosWatched && prog.videosWatched.length > 0)) {
            started++;
          }
          if (prog.quizPassed) passes++;
        }
      });

      return {
        ...c,
        started,
        passes,
        completionRate: started > 0 ? Math.round((passes / started) * 100) : 0,
      };
    });
  }, [chapters, users]);

  // Aggregate recent student quiz submissions
  const recentSubmissions = useMemo(() => {
    let submissions: any[] = [];
    const assignedIds = diplomaChapters.map(c => Number(c.id));

    users.forEach((u) => {
      if (u.progress) {
        Object.keys(u.progress).forEach((chapterId) => {
          const cid = Number(chapterId);
          if (assignedIds.includes(cid) && u.progress[cid].quizPassed) {
            submissions.push({
              studentName: u.name || 'Anonymous Learner',
              studentEmail: u.email,
              studentAvatar: u.avatar || '',
              chapterTitle: diplomaChapters.find(c => Number(c.id) === cid)?.title || `Chapter ${cid}`,
              chapterId: cid,
              date: u.progress[cid].quizPassedAt || new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)).toISOString()
            });
          }
        });
      }
    });

    submissions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return submissions.slice(0, 15);
  }, [users, diplomaChapters]);

  // Filter students
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return users;
    return users.filter(u => 
      u.name?.toLowerCase().includes(studentSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      u.country?.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [users, studentSearch]);

  // Handle Dynamic Specialty Course Actions
  const handleAddNewCourse = () => {
    const randomizedColor = ['text-blue-400', 'text-emerald-400', 'text-purple-400', 'text-amber-400', 'text-orange-400'][Math.floor(Math.random() * 5)];
    const bgMap: Record<string, string> = {
      'text-blue-400': 'bg-blue-400/10',
      'text-emerald-400': 'bg-emerald-400/10',
      'text-purple-400': 'bg-purple-400/10',
      'text-amber-400': 'bg-amber-400/10',
      'text-orange-400': 'bg-orange-400/10',
    };

    const newId = `course-elective-${Date.now()}`;
    const newCourseObj = {
      id: newId,
      title: "New Advanced Specialty Course",
      description: "A professional custom lecture program created for Bitcoin Africa Story scholars.",
      longDescription: "Provide an expansive deep-dive into this specialized curriculum domain, teaching students exactly how to build, secure, and leverage the Bitcoin sovereign standard.",
      icon: 'BookOpen',
      color: randomizedColor,
      bg: bgMap[randomizedColor] || 'bg-brand-gold/10',
      tags: ['Sovereignty', 'Intermediate'],
      duration: '4 Weeks',
      tag: 'Intermediate',
      estimatedMinutes: 180,
      outcomes: [
        "Explain fundamental concepts within this specialized domain of the Bitcoin network.",
        "Demonstrate practical integration knowledge of sovereign nodes or applications.",
        "Assess risk landscapes and optimize strategies for operational efficiency."
      ],
      syllabus: [
        { title: "Unit 1: Foundational Frameworks", duration: "45 mins", desc: "Introduction to specialized parameters, core network policies, and initial setups." },
        { title: "Unit 2: Tactical Execution", duration: "45 mins", desc: "Setting config profiles, tracking network logs, and building localized circular circular loops." }
      ]
    };

    saveCourse(newCourseObj);
    setEditingCourseId(newId);
    setEditingCourse(newCourseObj);
    loadData();
    toast("Specialty course created! Fill in the syllabus details below.", "success");
  };

  const handleSaveCourse = () => {
    if (!editingCourse) return;
    saveCourse(editingCourse);
    setEditingCourseId(null);
    setEditingCourse(null);
    loadData();
    toast("Specialty course saved successfully! ⚡", "success");
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm("Are you absolutely sure you want to delete this course? This action is irreversible.")) {
      deleteCourse(courseId);
      if (editingCourseId === courseId) {
        setEditingCourseId(null);
        setEditingCourse(null);
      }
      loadData();
      toast("Specialty course deleted.", "info");
    }
  };

  // Handle Diploma Program Chapter Actions
  const handleAddNewDiplomaChapter = () => {
    const nextId = diplomaChapters.length > 0 ? Math.max(...diplomaChapters.map(c => Number(c.id))) + 1 : 1;
    const newChapterObj = {
      id: nextId,
      title: `Chapter ${nextId}: Custom Specialized Theory`,
      description: "An advanced academic study module added dynamically for specialized vocational training.",
      estimatedMinutes: 35,
      satsPossible: 2,
      enabled: true,
      quizMode: 'manual',
      googleFormUrl: "",
      videos: [
        { id: `v${nextId}_1`, title: "Sovereign Framework Overview Lecture", youtubeUrl: "https://www.youtube.com/watch?v=41JCp5tYci0", duration: "12:30" }
      ],
      resources: [
        { id: `r${nextId}_1`, title: "Bitcoin Standard Reading Module", description: "Reference open source materials tailored for regional empowerment.", type: "link", url: "https://bitcoin.org" }
      ],
      quiz: [
        { id: `q${nextId}_1`, question: "What represents the absolute sovereign benefit of peer-to-peer verification?", options: { A: "Trustless currency custody without financial intermediaries", B: "Increased bank clearing desk validation speed", C: "Secure personal email password routing", D: "Central banking digital credit optimization" }, correct: "A" }
      ]
    };

    saveDiplomaChapter(newChapterObj);
    setEditingChapterId(nextId);
    setEditingChapter(newChapterObj);
    loadData();
    toast(`Chapter ${nextId} appended to primary Diploma curriculum! ⚡`, "success");
  };

  const handleSaveDiplomaChapter = () => {
    if (!editingChapter) return;
    saveDiplomaChapter(editingChapter);
    setEditingChapterId(null);
    setEditingChapter(null);
    loadData();
    toast(`Chapter ${editingChapter.id} changes updated successfully!`, "success");
  };

  const handleDeleteDiplomaChapter = (chapterId: number) => {
    if (window.confirm(`Are you absolutely sure you want to delete Chapter ${chapterId} from the Primary Curriculum? This will break progress trackers for students already on this chapter.`)) {
      deleteDiplomaChapter(chapterId);
      if (editingChapterId === chapterId) {
        setEditingChapterId(null);
        setEditingChapter(null);
      }
      loadData();
      toast(`Chapter ${chapterId} deleted successfully.`, "info");
    }
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 text-white">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-brand-gold/15 text-brand-gold px-2.5 py-0.5 rounded-full font-bold select-none uppercase tracking-wider border border-brand-gold/20">
              {user?.role === 'admin' ? '🛡️ Administrator Suite' : '👨‍🏫 Instructor Faculty'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Control Room <Sparkles size={20} className="text-brand-gold" />
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
            Welcome, <span className="font-bold text-white">{user?.name || 'Academic Leader'}</span>. Author curriculum pathways, monitor engagement metrics, and secure academic courses.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-brand-dark-2 p-1 rounded-xl border border-white/5 shadow-lg overflow-x-auto max-w-full hide-scrollbar snap-x shrink-0">
          <button 
            onClick={() => { setActiveTab('analytics'); setEditingCourseId(null); setEditingChapterId(null); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap snap-center shrink-0 ${
              activeTab === 'analytics' 
                ? 'bg-brand-gold text-brand-black shadow-[0_4px_12px_rgba(253,184,19,0.25)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} /> Overview & Analytics
          </button>
          <button 
            onClick={() => { setActiveTab('curriculum'); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap snap-center shrink-0 ${
              activeTab === 'curriculum' 
                ? 'bg-brand-gold text-brand-black shadow-[0_4px_12px_rgba(253,184,19,0.25)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <BookOpen size={13} /> Curriculum Builder
          </button>
          <button 
            onClick={() => { setActiveTab('credentials'); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap snap-center shrink-0 ${
              activeTab === 'credentials' 
                ? 'bg-brand-gold text-brand-black shadow-[0_4px_12px_rgba(253,184,19,0.25)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award size={13} /> Certificates & Payouts
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <GlassCard className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 border border-white/5 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-brand-gold font-mono font-bold text-6xl sm:text-7xl select-none group-hover:scale-110 transition-transform">
                  10
                </div>
                <div className="bg-brand-gold/15 p-3.5 rounded-xl text-brand-gold shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Dynamic Programs</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black mt-0.5">{courses.length + 1} Tracks</div>
                </div>
              </GlassCard>

              <GlassCard className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 border border-white/5 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-blue-400 font-mono font-bold text-6xl sm:text-7xl select-none group-hover:scale-110 transition-transform">
                  CH
                </div>
                <div className="bg-blue-500/15 p-3.5 rounded-xl text-blue-400 shrink-0">
                  <BookOpen size={22} />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Diploma Chapters</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black mt-0.5">{diplomaChapters.length} Modules</div>
                </div>
              </GlassCard>
              
              <GlassCard className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 border border-white/5 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-emerald-400 font-mono font-bold text-6xl sm:text-7xl select-none group-hover:scale-110 transition-transform">
                  ST
                </div>
                <div className="bg-emerald-500/15 p-3.5 rounded-xl text-emerald-400 shrink-0">
                  <Users size={22} />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Africa Scholars</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black mt-0.5">{users.length} Active</div>
                </div>
              </GlassCard>

              <GlassCard className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4 border border-white/5 relative overflow-hidden group">
                <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-status-success font-mono font-bold text-6xl sm:text-7xl select-none group-hover:scale-110 transition-transform">
                  %
                </div>
                <div className="bg-green-500/15 p-3.5 rounded-xl text-green-400 shrink-0">
                  <CheckCircle size={22} />
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider">Syllabus Pass Rate</div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black mt-0.5">
                    {chapterStats.length > 0 ? Math.round(chapterStats.reduce((sum, c) => sum + c.completionRate, 0) / chapterStats.length) : 0}% Avg
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Primary Diploma Chapter Analytics */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Diploma Engagement metrics</h2>
                    <p className="text-xs text-gray-400">Real-time cohort study analytics and progression.</p>
                  </div>
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {chapterStats.map((c) => (
                    <GlassCard key={c.id} className="p-4 sm:p-5 space-y-3.5 hover:border-white/10 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2.5">
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-xs sm:text-sm text-gray-100">{c.title}</h3>
                          <p className="text-[10px] text-gray-400 font-mono">Module #{c.id} • {c.estimatedMinutes} Mins Estimate</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[10px] sm:text-xs font-bold text-brand-gold bg-brand-gold/10 border border-brand-gold/15 px-2.5 py-1 rounded-lg">
                            {c.completionRate}% Pass
                          </span>
                        </div>
                      </div>
                      
                      {/* Completion Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>Progress: {c.passes} of {c.started} passed</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="bg-brand-gold h-full rounded-full transition-all duration-1000"
                            style={{ width: `${c.started > 0 ? (c.passes / c.started) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                  {chapterStats.length === 0 && (
                    <GlassCard className="p-8 text-center text-gray-500">
                      No active diploma chapters found. Populate them in the Curriculum Builder tab.
                    </GlassCard>
                  )}
                </div>
              </div>

              {/* Submissions Sidebar */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Recent Quiz Activities</h2>
                  <p className="text-xs text-gray-400">Submissions verified across cohort modules.</p>
                </div>
                
                <GlassCard className="p-0 overflow-hidden border border-white/5">
                  {recentSubmissions.length > 0 ? (
                    <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto custom-scrollbar">
                      {recentSubmissions.map((sub: any, i: number) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center overflow-hidden font-bold relative shrink-0 border border-brand-gold/20">
                              {sub.studentAvatar ? (
                                <img src={sub.studentAvatar} alt={sub.studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                sub.studentName.charAt(0).toUpperCase()
                              )}
                              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 text-black rounded-full p-0.5 border border-black scale-90">
                                <CheckCircle size={8} />
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-xs text-gray-200">{sub.studentName}</div>
                              <div className="text-[10px] text-brand-gold mt-0.5 font-medium">{sub.chapterTitle}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-gray-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                              <Clock size={10} className="text-brand-gold"/> {new Date(sub.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                      <Clock size={24} className="text-gray-500" />
                      <p className="text-xs text-gray-400 font-medium">No system log submissions found.</p>
                    </div>
                  )}
                </GlassCard>
              </div>
            </div>

            {/* Comprehensive Students Registry */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Active Scholar Directory</h2>
                  <p className="text-xs text-gray-400">Total registered cohort students under your academic oversight.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name, country..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full bg-brand-dark-2 hover:bg-brand-dark-1/60 text-xs text-white border border-white/5 rounded-xl py-2 pl-9 pr-4 outline-none focus:border-brand-gold transition-colors font-sans"
                  />
                </div>
              </div>

              <GlassCard className="p-0 overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-brand-dark-2/80 text-gray-400 font-bold border-b border-white/5">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">WhatsApp Contact</th>
                        <th className="py-3 px-4 text-center">Unlocked Badges</th>
                        <th className="py-3 px-4 text-right">Lightning Balanced Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredStudents.map((s, idx) => {
                        const payoutSum = s.satsReceived || 0;
                        const unlockedBadgeCount = s.badges ? Object.keys(s.badges).length : 0;
                        return (
                          <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0 border border-brand-gold/15">
                                {s.avatar ? (
                                  <img src={s.avatar} alt={s.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                                ) : (
                                  (s.name || s.email || 'N').charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-bold text-gray-100">{s.name || 'Anonymous Learner'}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{s.email}</div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-gray-300">
                              {s.country || 'Not specified'}
                            </td>
                            <td className="py-3.5 px-4 text-gray-300 font-sans">
                              {s.whatsapp || 'No Telegram/WhatsApp'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className="inline-block bg-brand-gold/15 text-brand-gold font-bold px-2 py-0.5 rounded-full text-[9px] border border-brand-gold/10">
                                ⭐ {unlockedBadgeCount} unlocked
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-brand-gold font-black font-mono">
                              +{payoutSum} SATS
                            </td>
                          </tr>
                        );
                      })}
                      {filteredStudents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500 font-medium font-sans">
                            No matching students found in sandbox registry.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CURRICULUM BUILDER */}
        {activeTab === 'curriculum' && (
          <motion.div
            key="curriculum"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* If not editing, display available curricula split lists */}
            {!editingCourseId && !editingChapterId ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* PART A: Specialty Programs */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Specialty Elective Paths</h2>
                      <p className="text-xs text-gray-400">Additional certifications and specialized tracks.</p>
                    </div>
                    <Button onClick={handleAddNewCourse} className="text-xs h-8 px-3.5 bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold flex items-center gap-1.5 shadow-md">
                      <Plus size={14} /> Create Specialty
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {courses.map((course) => (
                      <GlassCard key={course.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-white/10 transition-colors border border-white/5 relative bg-brand-dark-2">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-brand-gold/10 text-brand-gold border border-brand-gold/20 shrink-0`}>
                            <BookOpen size={22} className="text-brand-gold" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-sm text-gray-200">{course.title}</h3>
                              <span className="text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono font-bold">
                                {course.tag}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-md line-clamp-2">
                              {course.description}
                            </p>
                            <span className="inline-block text-[10px] text-gray-400 font-bold mt-1">
                              ⏱️ Timeline: {course.duration} • {course.syllabus?.length || 0} Lessons
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 self-stretch md:self-auto justify-end">
                          <Button 
                            onClick={() => { setEditingCourseId(course.id); setEditingCourse(JSON.parse(JSON.stringify(course))); }}
                            className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold p-2 rounded-xl text-xs flex items-center justify-center gap-1 px-3 border border-brand-gold/15 h-8 font-bold"
                          >
                            <Edit2 size={12} /> Edit Syllabus
                          </Button>
                          <Button 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="bg-status-error/15 hover:bg-status-error/25 text-status-error p-2 rounded-xl text-xs flex items-center justify-center h-8"
                            title="Delete course"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </GlassCard>
                    ))}
                    {courses.length === 0 && (
                      <GlassCard className="p-8 text-center text-gray-500 font-sans border border-white/5">
                        No custom elective courses added yet.
                      </GlassCard>
                    )}
                  </div>
                </div>

                {/* PART B: Primary Diploma Curriculum Chapters */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">Diploma Program Chapters</h2>
                      <p className="text-xs text-gray-400">Core pathway of 12 chapters to self-custody mastery.</p>
                    </div>
                    <Button onClick={handleAddNewDiplomaChapter} className="text-xs h-8 px-3.5 bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold flex items-center gap-1.5 shadow-md">
                      <Plus size={14} /> Append Chapter
                    </Button>
                  </div>

                  <div className="space-y-4 max-h-[620px] overflow-y-auto pr-2 custom-scrollbar border border-white/5 rounded-2xl p-3 bg-brand-dark-2">
                    {diplomaChapters.map((ch) => (
                      <div key={ch.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white/[0.015] hover:bg-white/[0.035] transition-colors rounded-xl border border-white/5">
                        <div className="space-y-1">
                          <div className="text-[10px] text-brand-gold font-bold font-mono">CHAPTER MODULE #{ch.id}</div>
                          <h3 className="font-bold text-xs sm:text-sm text-gray-100">{ch.title}</h3>
                          <p className="text-[10px] text-gray-400">
                            ⏱️ {ch.estimatedMinutes} Mins • {ch.quiz?.length || 0} Quiz Qs • {ch.videos?.length || 0} Lectures
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0 self-start sm:self-auto">
                          <Button 
                            onClick={() => { setEditingChapterId(ch.id); setEditingChapter(JSON.parse(JSON.stringify(ch))); }}
                            className="bg-white/5 hover:bg-white/10 text-white p-2 sm:p-1.5 rounded-lg text-xs flex items-center justify-center font-bold"
                            title="Edit dynamic chapter contents"
                          >
                            <Edit2 size={12} /> <span className="sm:hidden ml-1 text-[11px]">Edit</span>
                          </Button>
                          <Button 
                            onClick={() => handleDeleteDiplomaChapter(ch.id)}
                            className="bg-status-error/15 hover:bg-status-error/20 text-status-error p-2 sm:p-1.5 rounded-lg text-xs flex items-center justify-center font-bold"
                            title="Remove completely"
                          >
                            <Trash2 size={12} /> <span className="sm:hidden ml-1 text-[11px]">Delete</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : null}

            {/* SCREEN: EDIT SPECIALTY COURSE */}
            {editingCourseId && editingCourse && (
              <motion.div
                key="edit-course"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                {/* Editor Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <button 
                    onClick={() => { setEditingCourseId(null); setEditingCourse(null); }}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to dynamic registry
                  </button>
                  <Button onClick={handleSaveCourse} className="bg-brand-gold text-brand-black hover:bg-brand-gold/90 text-xs font-bold px-4 flex items-center gap-1 shadow-md">
                    <Save size={14} /> Save Course Changes
                  </Button>
                </div>

                <GlassCard className="p-6 space-y-6">
                  <h2 className="text-lg font-bold text-brand-gold flex items-center gap-1.5">
                    ⚙️ General Specialty Properties
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Program Course Title" 
                      value={editingCourse.title} 
                      onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                    />
                    <Input 
                      label="Timeline Duration (e.g. 4 Weeks / 5 Hours)" 
                      value={editingCourse.duration} 
                      onChange={e => setEditingCourse({...editingCourse, duration: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold uppercase">Difficulty level</label>
                      <select 
                        value={editingCourse.tag}
                        onChange={e => setEditingCourse({...editingCourse, tag: e.target.value, tags: [e.target.value]})}
                        className="bg-brand-dark-2 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold transition-colors"
                      >
                        <option value="Beginner">Beginner Level</option>
                        <option value="Intermediate">Intermediate Level</option>
                        <option value="Advanced">Advanced Specialty</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold uppercase">Launcher Vector Icon</label>
                      <select 
                        value={editingCourse.icon}
                        onChange={e => setEditingCourse({...editingCourse, icon: e.target.value})}
                        className="bg-brand-dark-2 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-gold transition-colors"
                      >
                        <option value="BookOpen">📕 BookOpen Icon</option>
                        <option value="Server">⚡ Server / Node Icon</option>
                        <option value="Globe2">🌍 Globe / Emerging Markets Icon</option>
                        <option value="Trophy">🏆 Trophy / Rewards Icon</option>
                        <option value="Star">⭐ Star / Favorite Icon</option>
                        <option value="Award">🎖️ Award badge Icon</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase">Brief Sidebar Description</label>
                    <textarea 
                      value={editingCourse.description}
                      onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                      className="bg-brand-dark-2 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-gold min-h-[60px]"
                      placeholder="Brief card level summary..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase">Expanded Long Description</label>
                    <textarea 
                      value={editingCourse.longDescription}
                      onChange={e => setEditingCourse({...editingCourse, longDescription: e.target.value})}
                      className="bg-brand-dark-2 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-gold min-h-[90px]"
                      placeholder="Detailed long program overview..."
                    />
                  </div>
                </GlassCard>

                {/* Outcomes Section */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-brand-gold flex items-center gap-1.5">
                      🎓 Program Core Outcomes (Bullet steps)
                    </h2>
                    <Button 
                      onClick={() => setEditingCourse({...editingCourse, outcomes: [...(editingCourse.outcomes || []), "New Course outcome parameter."]})}
                      className="text-[10px] h-7 bg-white/5 border border-white/5 rounded-lg px-2.5 hover:bg-white/10 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Outcome
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {editingCourse.outcomes?.map((outcome: string, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <textarea 
                          value={outcome}
                          onChange={e => {
                            const copy = [...editingCourse.outcomes];
                            copy[idx] = e.target.value;
                            setEditingCourse({...editingCourse, outcomes: copy});
                          }}
                          className="flex-1 bg-brand-dark-2 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
                        />
                        <button 
                          onClick={() => setEditingCourse({...editingCourse, outcomes: editingCourse.outcomes.filter((_: any, i: number) => i !== idx)})}
                          className="bg-status-error/15 hover:bg-status-error/25 text-status-error scale-90 p-2.5 rounded-xl border border-status-error/10 flex items-center justify-center shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Syllabus Chapters Editor */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-brand-gold flex items-center gap-1.5">
                      📖 Specialty Syllabus Coursework (Lessons list)
                    </h2>
                    <Button 
                      onClick={() => {
                        const newLessonObj = { title: "New Specialized Lecture Unit", duration: "45 mins", desc: "Introduce core configurations and metrics." };
                        setEditingCourse({...editingCourse, syllabus: [...(editingCourse.syllabus || []), newLessonObj]});
                      }}
                      className="text-[10px] h-7 bg-brand-gold text-brand-black hover:bg-brand-gold/90 rounded-lg px-2.5 flex items-center gap-1 font-bold"
                    >
                      <Plus size={12} /> Append Lesson
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {editingCourse.syllabus?.map((lesson: any, sIdx: number) => (
                      <div key={sIdx} className="p-4 bg-brand-dark-2 rounded-xl border border-white/5 space-y-3 text-xs">
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <span className="font-bold text-brand-gold font-mono uppercase text-[10px]">Lesson #{sIdx + 1}</span>
                          
                          <div className="flex items-center gap-1">
                            {/* Order adjusters */}
                            <button 
                              onClick={() => {
                                if (sIdx === 0) return;
                                const copy = [...editingCourse.syllabus];
                                const temp = copy[sIdx];
                                copy[sIdx] = copy[sIdx - 1];
                                copy[sIdx - 1] = temp;
                                setEditingCourse({...editingCourse, syllabus: copy});
                              }}
                              className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded"
                              disabled={sIdx === 0}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                if (sIdx === editingCourse.syllabus.length - 1) return;
                                const copy = [...editingCourse.syllabus];
                                const temp = copy[sIdx];
                                copy[sIdx] = copy[sIdx + 1];
                                copy[sIdx + 1] = temp;
                                setEditingCourse({...editingCourse, syllabus: copy});
                              }}
                              className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded"
                              disabled={sIdx === editingCourse.syllabus.length - 1}
                            >
                              <ChevronDown size={14} />
                            </button>
                            <button 
                              onClick={() => setEditingCourse({...editingCourse, syllabus: editingCourse.syllabus.filter((_: any, i: number) => i !== sIdx)})}
                              className="text-status-error hover:bg-status-error/15 p-1 rounded ml-1"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <Input 
                              label="Lesson Title" 
                              value={lesson.title} 
                              onChange={e => {
                                const copy = [...editingCourse.syllabus];
                                copy[sIdx] = { ...copy[sIdx], title: e.target.value };
                                setEditingCourse({...editingCourse, syllabus: copy});
                              }}
                            />
                          </div>
                          <div>
                            <Input 
                              label="Duration Estimate" 
                              value={lesson.duration} 
                              onChange={e => {
                                const copy = [...editingCourse.syllabus];
                                copy[sIdx] = { ...copy[sIdx], duration: e.target.value };
                                setEditingCourse({...editingCourse, syllabus: copy});
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase">Lesson Short Description</label>
                          <textarea 
                            value={lesson.desc}
                            onChange={e => {
                              const copy = [...editingCourse.syllabus];
                              copy[sIdx] = { ...copy[sIdx], desc: e.target.value };
                              setEditingCourse({...editingCourse, syllabus: copy});
                            }}
                            className="bg-brand-dark-1 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-gold min-h-[45px]"
                          />
                        </div>
                      </div>
                    ))}
                    {(!editingCourse.syllabus || editingCourse.syllabus.length === 0) && (
                      <div className="p-4 bg-brand-dark-2 rounded-xl text-center text-gray-400 text-xs font-sans">
                        Syllabus list complete empty. Append a dynamic lesson module to start coursework.
                      </div>
                    )}
                  </div>
                </GlassCard>

                <div className="flex justify-end pt-4 border-t border-white/5 gap-3">
                  <Button variant="outline" onClick={() => { setEditingCourseId(null); setEditingCourse(null); }}>
                    Cancel Changes
                  </Button>
                  <Button onClick={handleSaveCourse} className="bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold flex items-center gap-1 shadow-md">
                    <Save size={14} /> Save Course Changes
                  </Button>
                </div>
              </motion.div>
            )}

            {/* SCREEN: EDIT DIPLOMA CHAPTER */}
            {editingChapterId && editingChapter && (
              <motion.div
                key="edit-chapter"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 max-w-3xl mx-auto"
              >
                {/* Editor Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <button 
                    onClick={() => { setEditingChapterId(null); setEditingChapter(null); }}
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to dynamic registry
                  </button>
                  <Button onClick={handleSaveDiplomaChapter} className="bg-brand-gold text-brand-black hover:bg-brand-gold/90 text-xs font-bold px-4 flex items-center gap-1 shadow-md">
                    <Save size={14} /> Save Chapter Changes
                  </Button>
                </div>

                <GlassCard className="p-6 space-y-6">
                  <h2 className="text-base font-black text-brand-gold flex items-center gap-1.5">
                    ⚙️ Chapter General Properties
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Input 
                        label="Chapter ID Number" 
                        type="number"
                        disabled
                        value={editingChapter.id} 
                        onChange={e => setEditingChapter({...editingChapter, id: Number(e.target.value)})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Input 
                        label="Lecture Chapter Title" 
                        value={editingChapter.title} 
                        onChange={e => setEditingChapter({...editingChapter, title: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Study Duration (Minutes)" 
                      value={editingChapter.estimatedMinutes} 
                      onChange={e => setEditingChapter({...editingChapter, estimatedMinutes: Number(e.target.value)})}
                    />
                    <Input 
                      label="Bitcoin Reward (Sats possible)" 
                      value={editingChapter.satsPossible} 
                      onChange={e => setEditingChapter({...editingChapter, satsPossible: Number(e.target.value)})}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase">Chapter Syllabus Description</label>
                    <textarea 
                      value={editingChapter.description}
                      onChange={e => setEditingChapter({...editingChapter, description: e.target.value})}
                      className="bg-brand-dark-2 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-brand-gold min-h-[80px]"
                      placeholder="Detailed chapter topic summaries..."
                    />
                  </div>
                </GlassCard>

                {/* Videos Editor */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                      <Video size={16} /> Lecture Video Streams (YouTube)
                    </h2>
                    <Button 
                      onClick={() => setEditingChapter({
                        ...editingChapter, 
                        videos: [...(editingChapter.videos || []), { id: `vid-${Date.now()}`, title: "New Video Title", youtubeUrl: "https://www.youtube.com/watch?v=41JCp5tYci0", duration: "10:00" }]
                      })}
                      className="text-[10px] h-7 bg-white/5 border border-white/5 rounded-lg px-2.5 hover:bg-white/10 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Video
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {editingChapter.videos?.map((vid: any, vidIdx: number) => (
                      <div key={vidIdx} className="p-4 bg-brand-dark-2 rounded-xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-400">Stream Video #{vidIdx + 1}</span>
                          <button 
                            onClick={() => setEditingChapter({...editingChapter, videos: editingChapter.videos.filter((_: any, i: number) => i !== vidIdx)})}
                            className="text-status-error hover:bg-status-error/15 p-1 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input 
                            label="Video Lecture Title" 
                            value={vid.title} 
                            onChange={e => {
                              const copy = [...editingChapter.videos];
                              copy[vidIdx] = { ...copy[vidIdx], title: e.target.value };
                              setEditingChapter({...editingChapter, videos: copy});
                            }}
                          />
                          <Input 
                            label="YouTube Video Link" 
                            value={vid.youtubeUrl} 
                            placeholder="https://www.youtube.com/watch?v=..."
                            onChange={e => {
                              const copy = [...editingChapter.videos];
                              copy[vidIdx] = { ...copy[vidIdx], youtubeUrl: e.target.value };
                              setEditingChapter({...editingChapter, videos: copy});
                            }}
                          />
                        </div>
                        <div className="max-w-xs">
                          <Input 
                            label="Length (e.g. 12:45)" 
                            value={vid.duration} 
                            onChange={e => {
                              const copy = [...editingChapter.videos];
                              copy[vidIdx] = { ...copy[vidIdx], duration: e.target.value };
                              setEditingChapter({...editingChapter, videos: copy});
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Additional resources editor */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <FileText size={16} /> Reading Assignments & Web Links
                    </h2>
                    <Button 
                      onClick={() => setEditingChapter({
                        ...editingChapter, 
                        resources: [...(editingChapter.resources || []), { id: `res-${Date.now()}`, title: "Resource Name", description: "Learn more details here.", type: "link", url: "https://bitcoin.org" }]
                      })}
                      className="text-[10px] h-7 bg-white/5 border border-white/5 rounded-lg px-2.5 hover:bg-white/10 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Resource
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {editingChapter.resources?.map((res: any, rIdx: number) => (
                      <div key={rIdx} className="p-4 bg-brand-dark-2 rounded-xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-400">Resource Attachment #{rIdx + 1}</span>
                          <button 
                            onClick={() => setEditingChapter({...editingChapter, resources: editingChapter.resources.filter((_: any, i: number) => i !== rIdx)})}
                            className="text-status-error hover:bg-status-error/15 p-1 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input 
                            label="Document Title" 
                            value={res.title} 
                            onChange={e => {
                              const copy = [...editingChapter.resources];
                              copy[rIdx] = { ...copy[rIdx], title: e.target.value };
                              setEditingChapter({...editingChapter, resources: copy});
                            }}
                          />
                          <Input 
                            label="URL Endpoint" 
                            value={res.url} 
                            placeholder="https://..."
                            onChange={e => {
                              const copy = [...editingChapter.resources];
                              copy[rIdx] = { ...copy[rIdx], url: e.target.value };
                              setEditingChapter({...editingChapter, resources: copy});
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <Input 
                              label="Syllabus Description" 
                              value={res.description} 
                              onChange={e => {
                                const copy = [...editingChapter.resources];
                                copy[rIdx] = { ...copy[rIdx], description: e.target.value };
                                setEditingChapter({...editingChapter, resources: copy});
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-1 text-xs">
                            <label className="text-[10px] text-gray-400 uppercase font-black">Medium Category</label>
                            <select
                              value={res.type}
                              onChange={e => {
                                const copy = [...editingChapter.resources];
                                copy[rIdx] = { ...copy[rIdx], type: e.target.value };
                                setEditingChapter({...editingChapter, resources: copy});
                              }}
                              className="bg-brand-dark-1 border border-white/5 rounded-xl px-3 py-2.5 text-white"
                            >
                              <option value="link">🌐 Redirect Hyperlink</option>
                              <option value="pdf">📄 Paper / PDF Download</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Multiple Choice Quiz Builder */}
                <GlassCard className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                      <HelpCircle size={16} /> Interactive MC Quiz Builder
                    </h2>
                    <Button 
                      onClick={() => setEditingChapter({
                        ...editingChapter, 
                        quiz: [...(editingChapter.quiz || []), { id: `quiz-${Date.now()}`, question: "Insert multiple-choice question sentence here?", options: { A: "", B: "", C: "", D: "" }, correct: "A" }]
                      })}
                      className="text-[10px] h-7 bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold rounded-lg px-2.5 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Quiz Question
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {editingChapter.quiz?.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="p-4 bg-brand-dark-2 rounded-xl border border-white/5 space-y-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-purple-400 font-mono">Question Statement #{qIdx + 1}</span>
                          <button 
                            onClick={() => setEditingChapter({...editingChapter, quiz: editingChapter.quiz.filter((_: any, i: number) => i !== qIdx)})}
                            className="text-status-error hover:bg-status-error/15 p-1 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <textarea 
                          placeholder="Question Statement Description..." 
                          value={q.question} 
                          onChange={e => {
                            const copy = [...editingChapter.quiz];
                            copy[qIdx] = { ...copy[qIdx], question: e.target.value };
                            setEditingChapter({...editingChapter, quiz: copy});
                          }}
                          className="w-full bg-brand-dark-1 border border-white/5 rounded-xl px-3.5 py-2.5 outline-none focus:border-brand-gold text-xs"
                        />

                        {/* Options Choices Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <Input 
                              label="Option A text option" 
                              value={q.options?.A || ''} 
                              onChange={e => {
                                const copy = [...editingChapter.quiz];
                                copy[qIdx].options.A = e.target.value;
                                setEditingChapter({...editingChapter, quiz: copy});
                              }}
                            />
                          </div>
                          <div>
                            <Input 
                              label="Option B text option" 
                              value={q.options?.B || ''} 
                              onChange={e => {
                                const copy = [...editingChapter.quiz];
                                copy[qIdx].options.B = e.target.value;
                                setEditingChapter({...editingChapter, quiz: copy});
                              }}
                            />
                          </div>
                          <div>
                            <Input 
                              label="Option C text option" 
                              value={q.options?.C || ''} 
                              onChange={e => {
                                const copy = [...editingChapter.quiz];
                                copy[qIdx].options.C = e.target.value;
                                setEditingChapter({...editingChapter, quiz: copy});
                              }}
                            />
                          </div>
                          <div>
                            <Input 
                              label="Option D text option" 
                              value={q.options?.D || ''} 
                              onChange={e => {
                                const copy = [...editingChapter.quiz];
                                copy[qIdx].options.D = e.target.value;
                                setEditingChapter({...editingChapter, quiz: copy});
                              }}
                            />
                          </div>
                        </div>

                        {/* Correct Letter Selection Dropdown */}
                        <div className="flex flex-col gap-1 max-w-xs mt-1">
                          <label className="text-[10px] text-gray-400 font-bold uppercase">Correct Choice Key</label>
                          <select
                            value={q.correct}
                            onChange={e => {
                              const copy = [...editingChapter.quiz];
                              copy[qIdx] = { ...copy[qIdx], correct: e.target.value };
                              setEditingChapter({...editingChapter, quiz: copy});
                            }}
                            className="bg-brand-dark-1 border border-white/5 rounded-xl px-3 py-2 text-white"
                          >
                            <option value="A">Choice [A] represents the true answer</option>
                            <option value="B">Choice [B] represents the true answer</option>
                            <option value="C">Choice [C] represents the true answer</option>
                            <option value="D">Choice [D] represents the true answer</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <div className="flex justify-end pt-4 border-t border-white/5 gap-3">
                  <Button variant="outline" onClick={() => { setEditingChapterId(null); setEditingChapter(null); }}>
                    Cancel Changes
                  </Button>
                  <Button onClick={handleSaveDiplomaChapter} className="bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold flex items-center gap-1 shadow-md">
                    <Save size={14} /> Save Chapter Changes
                  </Button>
                </div>
              </motion.div>
            )}

          </motion.div>
        )}

        {/* TAB 3: CERTIFICATES & PAYOUTS HUB */}
        {activeTab === 'credentials' && (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Certificates & Lightning Payouts Hub</h2>
                <p className="text-xs text-gray-400">Approve graduate credentials, adjust diploma names, and verify SAT payout statuses.</p>
              </div>
            </div>

            {/* Main credentials workspace */}
            <div className="space-y-6">
              <GlassCard className="p-0 overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-brand-dark-2/80 text-gray-400 font-bold border-b border-white/5">
                        <th className="py-3.5 px-4 font-sans font-bold">Graduate Student</th>
                        <th className="py-3.5 px-4 font-sans font-bold">Claim Details & Contact</th>
                        <th className="py-3.5 px-4 text-center font-sans font-bold">Lightning Payout Destination</th>
                        <th className="py-3.5 px-4 text-center font-sans font-bold">Certificate Status</th>
                        <th className="py-3.5 px-4 text-center font-sans font-bold">SATS Payout</th>
                        <th className="py-3.5 px-4 text-right font-sans font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {/* Filter students who have either completed the course or have certificate/payout states */}
                      {users.filter(u => u.certificateStatus || u.payoutStatus).map((student, sIdx) => {
                        const payoutSats = student.totalSats || 0;
                        const isCertIssued = student.certificateStatus === 'issued';
                        const isPayoutPaid = student.payoutStatus === 'paid';

                        return (
                          <tr key={sIdx} className="hover:bg-white/[0.012] transition-colors">
                            {/* Student Base Info */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-sm shrink-0 border border-brand-gold/15">
                                  {student.avatar ? (
                                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                                  ) : (
                                    (student.name || student.email || 'G').charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  {/* Editable Legal Name input */}
                                  <div className="flex items-center gap-1.5">
                                    <input 
                                      type="text" 
                                      value={student.name}
                                      onChange={(e) => {
                                        const updatedName = e.target.value;
                                        setUsers(prev => prev.map((u) => u.email === student.email ? { ...u, name: updatedName } : u));
                                      }}
                                      onBlur={() => {
                                        updateUser(student.email, { name: student.name });
                                        toast(`Legal name successfully saved for ${student.email}!`, 'success');
                                      }}
                                      className="font-bold text-gray-100 bg-transparent border-b border-transparent hover:border-brand-gold/40 focus:border-brand-gold outline-none w-40 text-xs px-0.5 transition-colors focus:bg-brand-dark-2/60 focus:px-1.5 focus:py-0.5 rounded"
                                      title="Enter full legal name and tap outside to save"
                                    />
                                    <Edit2 size={10} className="text-gray-500 pointer-events-none" />
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-mono select-all">{student.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Contact, Dates & Country */}
                            <td className="py-4 px-4 text-gray-200">
                              <div className="font-sans font-semibold">{student.whatsapp || student.phone || 'No WhatsApp'}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5 font-sans">{student.country || 'Africa Region'} • Applied: {student.certificateAppliedDate ? new Date(student.certificateAppliedDate).toLocaleDateString() : 'Pending'}</div>
                            </td>

                            {/* Lightning Address & SATS */}
                            <td className="py-4 px-4 text-center">
                              <div className="text-brand-gold font-bold font-mono text-[11px] select-all break-all max-w-[170px] mx-auto hover:underline cursor-pointer" title="Copy Lightning address to clipboard" onClick={() => {
                                navigator.clipboard.writeText(student.btcAddress || '');
                                toast('Lightning Address Copied! ⚡', 'info');
                              }}>
                                {student.btcAddress || 'satoshi@getalby.com (default)'}
                              </div>
                              <span className="inline-block text-[10px] font-mono text-gray-400 mt-1">
                                Reward value: <strong className="text-brand-gold">+{payoutSats.toLocaleString()} SATS</strong>
                              </span>
                            </td>

                            {/* Certificate Status */}
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isCertIssued 
                                  ? 'bg-status-success/10 text-status-success border-status-success/20' 
                                  : 'bg-brand-gold/15 text-brand-gold border-brand-gold/20'
                              }`}>
                                {isCertIssued ? '🎓 Certificate Issued' : '⏳ Pending Approval'}
                              </span>
                            </td>

                            {/* Payout Status */}
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                isPayoutPaid 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20 animate-pulse'
                              }`}>
                                {isPayoutPaid ? '⚡ Paid & Settled' : '⏳ Pending Payment'}
                              </span>
                            </td>

                            {/* Actions Trigger Panel */}
                            <td className="py-4 px-4 text-right">
                              <div className="flex gap-2 justify-end">
                                {/* Toggle Certificate status */}
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const nextStatus = isCertIssued ? 'applied' : 'issued';
                                    updateUser(student.email, { certificateStatus: nextStatus });
                                    toast(isCertIssued ? 'Revoked certificate.' : 'Certificate issued successfully! 🎓', 'success');
                                    loadData();
                                  }}
                                  className={`text-[10px] py-1 px-3.5 h-8 font-bold rounded-xl flex items-center gap-1 ${
                                    isCertIssued 
                                      ? 'bg-white/5 border border-white/5 text-gray-300 hover:bg-white/10' 
                                      : 'bg-brand-gold text-brand-black hover:bg-brand-gold/80'
                                  }`}
                                >
                                  {isCertIssued ? 'Revoke Status' : 'Issue Credential'}
                                </Button>

                                {/* Toggle Payout status */}
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const nextPayout = isPayoutPaid ? 'pending' : 'paid';
                                    updateUser(student.email, { payoutStatus: nextPayout });
                                    toast(isPayoutPaid ? 'Reset reward to pending.' : 'Marked Lightning Payout as Paid! ⚡', 'success');
                                    loadData();
                                  }}
                                  className={`text-[10px] py-1 px-3.5 h-8 font-bold rounded-xl border border-white/5 ${
                                    isPayoutPaid 
                                      ? 'text-gray-400 bg-white/5 hover:bg-white/10' 
                                      : 'text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/20'
                                  }`}
                                >
                                  {isPayoutPaid ? 'Reset Payment' : 'Mark Paid (Sats)'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {users.filter(u => u.certificateStatus || u.payoutStatus).length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-gray-400 font-sans text-xs">
                            <Award size={36} className="mx-auto mb-3 text-brand-gold animate-pulse" />
                            <p className="font-bold text-gray-200">No active certification or payout requests in the queue.</p>
                            <p className="text-[10px] text-gray-400 mt-1 leading-relaxed max-w-sm mx-auto">When students complete the curriculum and submit details via the dynamic certificates tab, they will instantly appear here.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
