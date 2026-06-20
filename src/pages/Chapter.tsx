import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, getContent, updateUser, getUsers, getChapterWiki, addChapterWikiPost, addNotification } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { VideoEmbedder } from '../components/ui/VideoEmbedder';
import { CourseCompanion } from '../components/ui/CourseCompanion';
import { CheckCircle2, PlayCircle, Lock, Zap, ArrowLeft, ExternalLink, FileText, FileDown, Headphones, Trophy, Twitter, Linkedin, Share2, MessageSquare, Send, Volume2, VolumeX, Play, Pause, Square } from 'lucide-react';
import { triggerSuccessConfetti, triggerMilestoneConfetti } from '../lib/confetti';
import SEO from '../components/ui/SEO';

export default function Chapter() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'videos' | 'resources' | 'quiz' | 'wiki'>('videos');
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  
  const [wikiPosts, setWikiPosts] = useState<any[]>([]);
  const [newWikiPost, setNewWikiPost] = useState('');

  // Reset quiz and tab state when ID changes
  useEffect(() => {
    setActiveTab('videos');
    setQuizMode(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizResult(null);
    setNewWikiPost('');
  }, [id]);
  
  // TTS State variables
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playRate, setPlayRate] = useState<number>(1.0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize Speech Voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const availableVoices = window.speechSynthesis.getVoices();
        // Prefer English first, then list others
        const sorted = [...availableVoices].sort((a, b) => {
          const aEng = a.lang.toLowerCase().startsWith('en');
          const bEng = b.lang.toLowerCase().startsWith('en');
          if (aEng && !bEng) return -1;
          if (!aEng && bEng) return 1;
          return a.name.localeCompare(b.name);
        });
        setVoices(sorted);
        if (sorted.length > 0) {
          const defaultVoice = sorted.find(v => v.lang.startsWith('en')) || sorted[0];
          setSelectedVoiceName(prev => prev || defaultVoice.name);
        }
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  const handleSpeakToggle = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast('Speech synthesis is not supported in this browser.', 'error');
      return;
    }

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      window.speechSynthesis.cancel();
      // Combine chapter title and description for reading
      const textToSpeak = `${chapter.title}. ${chapter.description || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      if (selectedVoiceName) {
        const voice = voices.find(v => v.name === selectedVoiceName);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      utterance.rate = playRate;
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      utterance.onerror = (e) => {
        console.error("SpeechSynthesisUtterance error:", e);
        setIsPlaying(false);
        setIsPaused(false);
      };

      utteranceRef.current = utterance;
      setIsPlaying(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const handleRateChange = (newRate: number) => {
    setPlayRate(newRate);
    if (isPlaying && !isPaused) {
      // Re-trigger speak with new rate
      setTimeout(() => {
        window.speechSynthesis.cancel();
        const textToSpeak = `${chapter.title}. ${chapter.description || ''}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        if (selectedVoiceName) {
          const voice = voices.find(v => v.name === selectedVoiceName);
          if (voice) utterance.voice = voice;
        }
        utterance.rate = newRate;
        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  };
  
  const [user, setUser] = useState(() => getCurrentUser());
  const content = useMemo(() => getContent(), []);
  const { theme } = useTheme();

  // Keep user state in sync when id changes
  useEffect(() => {
    setUser(getCurrentUser());
  }, [id]);

  const handleUpdateUser = (email: string, updates: any) => {
    const updated = updateUser(email, updates);
    setUser(updated);
    return updated;
  };

  // Sync chosen answer when question index changes
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestion] || null);
  }, [currentQuestion, answers]);
  
  const isElective = id && id.includes('_');

  // Multi-course resolver
  const { chapter, allChaptersList, currentIndex, prevChapter, nextChapter } = useMemo(() => {
    if (isElective) {
      const parts = id.split('_');
      const courseId = parts.slice(0, -1).join('_');
      const lessonIndex = parseInt(parts[parts.length - 1], 10);
      
      const course = content.courses?.find((c: any) => c.id === courseId);
      if (course && course.syllabus && course.syllabus[lessonIndex]) {
        const lesson = course.syllabus[lessonIndex];
        
        // Build interactive quiz array from lesson or default
        const quizList = lesson.quiz && lesson.quiz.length > 0 ? lesson.quiz : [
          {
            id: `q_${id}_1`,
            question: `In context of ${course.title}, what is the main objective of "${lesson.title}"?`,
            options: {
              A: "Establishing best practices and structural setup rules",
              B: "Increasing general transactional processing delays",
              C: "Converting all consensus rules to Proof-of-Stake protocols",
              D: "Circumventing validation procedures completely"
            },
            correct: "A"
          }
        ];

        // Build interactive video arrays
        const videoList = lesson.videoUrl ? [
          { id: `v_${id}_1`, title: `Syllabus Lecture: ${lesson.title}`, youtubeUrl: lesson.videoUrl, duration: lesson.duration || "15 mins" }
        ] : [
          { id: `v_${id}_0`, title: `Syllabus Masterclass: ${lesson.title}`, youtubeUrl: "https://www.youtube.com/watch?v=IP0y984Z_V8", duration: "10 mins" }
        ];

        // Build interactive study handouts
        const resourceList = lesson.resourceLink ? [
          { id: `r_${id}_1`, title: `Syllabus Handout: ${lesson.title}`, description: "Supplemental reading manual and specifications sheet.", type: "link", url: lesson.resourceLink }
        ] : [
          { id: `r_${id}_0`, title: `Technical Overview — ${lesson.title}`, description: "Official protocol specs and technical guidelines.", type: "link", url: "https://bitcoin.org" }
        ];

        const chapObj = {
          id: id,
          courseId: course.id,
          courseTitle: course.title,
          isElective: true,
          title: lesson.title,
          description: lesson.desc || `Lectures covering ${lesson.title}.`,
          estimatedMinutes: parseInt(lesson.duration) || 45,
          satsPossible: 2,
          enabled: true,
          videos: videoList,
          resources: resourceList,
          quiz: quizList
        };

        const list = course.syllabus.map((l: any, idx: number) => ({
          id: `${courseId}_${idx}`,
          title: l.title,
          satsPossible: 2
        }));

        const prev = lessonIndex > 0 ? list[lessonIndex - 1] : null;
        const next = lessonIndex < list.length - 1 ? list[lessonIndex + 1] : null;

        return {
          chapter: chapObj,
          allChaptersList: list,
          currentIndex: lessonIndex,
          prevChapter: prev,
          nextChapter: next
        };
      }
    } else {
      const chapObj = content.chapters[id];
      if (chapObj) {
        const list = (Object.values(content.chapters || {}) as any[])
          .sort((a, b) => Number(a.id) - Number(b.id));
        const index = list.findIndex(c => String(c.id) === String(id));
        const prev = index > 0 ? list[index - 1] : null;
        const next = index !== -1 && index < list.length - 1 ? list[index + 1] : null;
        return {
          chapter: chapObj,
          allChaptersList: list,
          currentIndex: index,
          prevChapter: prev,
          nextChapter: next
        };
      }
    }

    return { chapter: null, allChaptersList: [], currentIndex: -1, prevChapter: null, nextChapter: null };
  }, [id, content.chapters, content.courses, isElective]);

  // Lock Check: Students cannot proceed to next chapter without completing the previous with 100% quiz score
  const isPrerequisiteLocked = useMemo(() => {
    if (!user || !id || currentIndex <= 0 || allChaptersList.length === 0) {
      return false;
    }
    const prevChap = allChaptersList[currentIndex - 1];
    const prevProg = user.progress?.[prevChap.id];
    return !prevProg || prevProg.status !== 'completed';
  }, [currentIndex, allChaptersList, user, id]);

  const userProg = useMemo(() => {
    if (!user || !id) {
      return {
        status: 'locked',
        videosWatched: [],
        resourcesRead: [],
        quizAttempts: [],
        quizPassed: false,
        satsEarned: 0
      };
    }
    return user.progress?.[id] || {
      status: 'locked',
      videosWatched: [],
      resourcesRead: [],
      quizAttempts: [],
      quizPassed: false,
      satsEarned: 0
    };
  }, [user, id]);

  useEffect(() => {
    if (!id) return;
    setWikiPosts(getChapterWiki(id));
  }, [id]);

  useEffect(() => {
    if (!user || !id || !chapter || isPrerequisiteLocked) return;
    const currentStatus = user.progress?.[id]?.status;
    if (!currentStatus || currentStatus === 'locked') {
      const newProg = { ...user.progress };
      const defaultProg = {
        status: 'in_progress',
        videosWatched: [],
        resourcesRead: [],
        quizAttempts: [],
        quizPassed: false,
        satsEarned: 0
      };
      const existingProg = user.progress?.[id] || defaultProg;
      newProg[id] = { ...existingProg, status: 'in_progress' };
      handleUpdateUser(user.email, { progress: newProg });
    }
  }, [id, chapter, user?.email, isPrerequisiteLocked]);

  if (!user || !id || !chapter) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="mb-4 font-bold text-lg text-white">Course Classroom Not Found</p>
        <Button onClick={() => navigate('/courses')} className="bg-brand-gold text-brand-black">Return to Courses Catalog</Button>
      </div>
    );
  }

  if (isPrerequisiteLocked) {
    const prevChapObj = currentIndex > 0 ? allChaptersList[currentIndex - 1] : null;
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center min-h-[80vh] ${theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-brand-black text-white'}`}>
        <div className="max-w-md w-full p-6 sm:p-8 border border-white/5 rounded-3xl bg-brand-dark-2 flex flex-col items-center shadow-2xl relative overflow-hidden font-sans">
          <div className="absolute inset-0 bg-brand-gold/5 pointer-events-none" />
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center text-brand-gold mb-4 sm:mb-6 relative z-10 animate-bounce">
            <Lock size={26} className="sm:size-8" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 relative z-10 uppercase tracking-tight text-white">Unit Locked</h2>
          <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed relative z-10 px-1">
            You must complete the previous unit <span className="text-brand-gold font-bold">"{prevChapObj?.title}"</span> and pass its quiz with 100% score (all correct) before unlocking this classroom!
          </p>

          <div className="flex flex-col gap-2 w-full relative z-10">
            {prevChapObj && (
              <Button 
                onClick={() => navigate(`/chapter/${prevChapObj.id}`)} 
                className="w-full bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-semibold py-2.5 px-4 text-xs sm:text-sm leading-tight h-auto min-h-[44px]"
              >
                Go to: {prevChapObj.title}
              </Button>
            )}
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              className="w-full border-white/10 hover:bg-white/5 text-white py-2 px-4 text-xs sm:text-sm h-auto min-h-[44px]"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handlePostWiki = () => {
    if (!newWikiPost.trim()) return;
    const authorRole = user.role === 'admin' || user.role === 'instructor' ? user.role : 'student';
    const updated = addChapterWikiPost(id, {
      content: newWikiPost.trim(),
      authorName: user.name,
      authorEmail: user.email,
      authorRole,
      authorAvatar: user.avatar || ''
    });
    setWikiPosts(updated);
    setNewWikiPost('');
    toast('Note added to chapter Wiki!', 'success');
  };

  const allVideosWatched = chapter.videos.length === 0 || chapter.videos.every((v: any) => userProg.videosWatched.includes(v.id));

  // Placeholder actions
  const handleWatchVideo = (videoId: string) => {
    if (!userProg.videosWatched.includes(videoId)) {
      const newProg = { ...user.progress };
      newProg[id].videosWatched.push(videoId);
      
      const newSats = user.totalSats; // 0 sats for video
      handleUpdateUser(user.email, { progress: newProg, totalSats: newSats });
      toast('Video completed! Pass the chapter quiz to stack 2 Sats! ⚡', 'success');
    }
  };

  const handleReadResource = (resId: string) => {
    if (!userProg.resourcesRead.includes(resId)) {
      const newProg = { ...user.progress };
      newProg[id].resourcesRead.push(resId);
      
      const newSats = user.totalSats; // 0 sats for resource
      handleUpdateUser(user.email, { progress: newProg, totalSats: newSats });
      toast('Resource reviewed! Pass the chapter quiz to stack 2 Sats! ⚡', 'success');
    }
  };

  const handleSubmitQuiz = () => {
    const questions = chapter.quiz?.length > 0 ? chapter.quiz : [{
      id: 'mock1',
      question: "What is the primary innovation that allows Bitcoin to solve the double-spending problem?",
      options: { A: "Blockchain", B: "Proof of Work consensus", C: "Digital signatures", D: "Smart contracts" },
      correct: "B"
    }];

    // Evaluate answers
    let correctCount = 0;
    questions.forEach((q: any, idx: number) => {
      const chosen = idx === currentQuestion ? selectedAnswer : answers[idx];
      if (chosen === q.correct) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score === 100; // 100% passing grade required (get all correct, with unlimited attempts)
    const isFirstAttempt = userProg.quizAttempts.length === 0;
    
    const newProg = { ...user.progress };
    if (!newProg[id].quizAttempts) {
      newProg[id].quizAttempts = [];
    }
    newProg[id].quizAttempts.push({ date: new Date().toISOString(), score, passed });
    newProg[id].quizPassed = passed || userProg.quizPassed;
    
    if (passed) {
      newProg[id].status = 'completed';
      newProg[id].completedDate = new Date().toISOString();
      const satsToEarn = 2; // Each chapter is worth exactly 2 sats
      const activeSatsEarned = userProg.quizPassed ? 0 : satsToEarn;
      
      handleUpdateUser(user.email, { 
        progress: newProg, 
        totalSats: user.totalSats + activeSatsEarned,
        xp: user.xp + 100 + (isFirstAttempt ? 75 : 40)
      });
      setQuizResult({ passed: true, score, satsEarned: activeSatsEarned });

      // Trigger In-app Notification
      addNotification(
        user.email,
        'Chapter Completed! 🎓',
        `Mastery achieved! You scored ${score}% on the "${chapter.title}" quiz and stacked ${activeSatsEarned} Sats! Keep it up!`,
        'success',
        '/dashboard'
      );

      // Celebrate!
      if (chapter.isElective) {
        const totalUnits = allChaptersList.length;
        const electiveCompletedList = allChaptersList.filter(l => newProg[l.id]?.status === 'completed');
        
        if (electiveCompletedList.length >= totalUnits && totalUnits > 0) {
          addNotification(
            user.email,
            'Specialty Course Completed! 🏆',
            `Incredible work! You have mastered the entire "${chapter.courseTitle}" specialized curriculum!`,
            'success',
            '/courses'
          );
          triggerMilestoneConfetti();
        } else {
          triggerSuccessConfetti();
        }
      } else {
        const totalChapters = Object.keys(getContent().chapters || {}).length;
        const coreCompletedList = Object.keys(getContent().chapters || {}).filter(cid => newProg[cid]?.status === 'completed');
        if (coreCompletedList.length >= totalChapters && totalChapters > 0) {
          addNotification(
            user.email,
            'Full Curriculum Completed! 🏆',
            `Incredible work! You have mastered all ${totalChapters} chapters of the Bitcoin Diploma curriculum! Retrieve your Certificate.`,
            'success',
            '/certificate'
          );
          triggerMilestoneConfetti();
        } else {
          triggerSuccessConfetti();
        }
      }
    } else {
      handleUpdateUser(user.email, { progress: newProg });
      setQuizResult({ passed: false, score, satsEarned: 0 });

      // Trigger In-app Notification
      addNotification(
        user.email,
        'Quiz Attempt Failed ❌',
        `You got ${score}% on the "${chapter.title}" quiz. 100% (all correct) is required to pass. Read the materials and review Satoshi companion recommendations before trying again!`,
        'alert',
        `/chapter/${chapter.id}`
      );
    }
  };

  if (quizResult?.passed) {
    const handleShare = (platform?: 'twitter' | 'linkedin') => {
      const text = `I just mastered "${chapter.title}" and earned ${quizResult.satsEarned} Sats on the Bitcoin learning app! ⚡📖`;
      const url = window.location.href;
      
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
      } else {
        if (navigator.share) {
          navigator.share({ title: 'Bitcoin Course Completed!', text, url }).catch(console.error);
        } else {
          navigator.clipboard.writeText(`${text} ${url}`);
          toast('Copied to clipboard!', 'success');
        }
      }
    };

    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto transition-colors ${theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-brand-black text-white'}`}>
        {/* Confetti placeholder */}
        <div className={`absolute inset-0 pointer-events-none opacity-40 ${
          theme === 'light' 
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-gold/20 via-white to-white'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-gold/10 via-brand-black to-brand-black'
        }`} />
        <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-lg mx-auto w-full relative">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full my-auto font-sans">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-3xl sm:text-5xl">
              <Zap size={32} className="text-brand-gold drop-shadow-[0_0_12px_rgba(253,184,19,0.8)] sm:size-12" />
            </div>
            <h1 className={`text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Chapter Complete!</h1>
            <p className={`text-base sm:text-xl mb-4 sm:mb-8 px-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>You've mastered "{chapter.title}"</p>
            
            <div className={`border rounded-2xl p-4 sm:p-6 w-full mb-4 sm:mb-8 flex flex-col gap-1 sm:gap-2 transition-all ${
              theme === 'light' ? 'bg-white border-brand-gold/40 shadow-sm' : 'bg-brand-dark-2 border-brand-gold/30 gold-glow'
            }`}>
              <span className="text-3xl sm:text-5xl font-black text-brand-gold">+{quizResult.satsEarned}</span>
              <span className="text-brand-gold font-medium uppercase tracking-widest text-xs">Sats Earned</span>
              <div className={`flex justify-between items-center mt-3 sm:mt-4 text-xs sm:text-sm border-t pt-3 sm:pt-4 ${theme === 'light' ? 'text-gray-500 border-gray-100' : 'text-gray-400 border-white/5'}`}>
                <span>Quiz Score: {quizResult.score}%</span>
                <span>XP: +{userProg.quizAttempts.length <= 1 ? '175' : '140'} XP</span>
              </div>
            </div>
            
            <div className="w-full flex flex-col gap-2.5 mb-6 sm:mb-8">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-widest">Share Your Progress</p>
              <div className="flex gap-2 sm:gap-4 w-full">
                <Button variant="outline" className={`flex-1 gap-1.5 flex items-center justify-center py-2 text-xs sm:text-sm h-10 ${
                  theme === 'light' ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50' : 'border-white/10 hover:border-white/10'
                }`} onClick={() => handleShare('twitter')}>
                  <Twitter size={14} className="sm:size-[16px]" /> X
                </Button>
                <Button variant="outline" className={`flex-1 gap-1.5 flex items-center justify-center py-2 text-xs sm:text-sm h-10 ${
                  theme === 'light' ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50' : 'border-white/10 hover:border-white/10'
                }`} onClick={() => handleShare('linkedin')}>
                  <Linkedin size={14} className="sm:size-[16px]" /> LinkedIn
                </Button>
                <Button variant="outline" className={`flex-1 gap-1.5 flex items-center justify-center py-2 text-xs sm:text-sm h-10 ${
                  theme === 'light' ? 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium' : 'border-white/10 hover:border-white/10'
                }`} onClick={() => handleShare()}>
                  <Share2 size={14} className="sm:size-[16px]" /> Share
                </Button>
              </div>
            </div>
            
            <Button 
              size="md" 
              className="w-full py-2.5 sm:py-3.5 text-sm sm:text-base font-bold min-h-[44px]" 
              onClick={() => {
                if (nextChapter && nextChapter.id) {
                  navigate(`/chapter/${nextChapter.id}`);
                } else {
                  navigate('/dashboard');
                }
              }}
            >
              Continue to Next Chapter →
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (quizResult && !quizResult.passed) {
    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto transition-colors ${theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-brand-black text-white'}`}>
        <div className={`absolute inset-0 pointer-events-none opacity-40 ${
          theme === 'light' 
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-status-error/15 via-white to-white'
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-status-error/10 via-brand-black to-brand-black'
        }`} />
        <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-lg mx-auto w-full relative">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full my-auto font-sans">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-status-error/20 flex items-center justify-center text-xl sm:text-2xl font-bold text-status-error">
              ✕
            </div>
            <h1 className={`text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Quiz Unsuccessful</h1>
            <p className={`text-base sm:text-xl mb-3 sm:mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>You got {quizResult.score}% (100% required to pass)</p>
            
            <p className="text-gray-400 text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed max-w-sm px-4">
              Don't worry! Review the materials or ask the AI Course Companion at the right to clarify any concepts.
            </p>
            
            <div className="w-full flex flex-col gap-2.5 sm:gap-3">
              <Button size="md" className="w-full bg-brand-gold text-[#000000] hover:bg-brand-gold/80 font-bold py-2.5 sm:py-3.5 text-sm sm:text-base min-h-[44px]" onClick={() => {
                setQuizResult(null);
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setAnswers({});
                setQuizMode(true);
              }}>
                Try Again
              </Button>
              <Button variant="ghost" size="md" className={`w-full border py-2.5 sm:py-3.5 text-sm sm:text-base min-h-[44px] ${theme === 'light' ? 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50' : 'text-gray-400 border-white/5 hover:border-white/10'}`} onClick={() => {
                setQuizResult(null);
                setQuizMode(false);
                setActiveTab('videos');
              }}>
                Back to Chapter Videos
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz Overlay
  if (quizMode) {
    const questions = chapter.quiz?.length > 0 ? chapter.quiz : [{
      id: 'mock1',
      question: "What is the primary innovation that allows Bitcoin to solve the double-spending problem?",
      options: { A: "Blockchain", B: "Proof of Work consensus", C: "Digital signatures", D: "Smart contracts" },
      correct: "B"
    }];
    
    const q = questions[currentQuestion];
    
    return (
      <div className={`fixed inset-0 z-50 overflow-y-auto transition-colors ${theme === 'light' ? 'bg-gray-150 text-gray-800' : 'bg-brand-black text-white'}`}>
        <SEO 
          title={`Quiz: ${chapter.title}`}
          description={`Take the interactive knowledge assessment on ${chapter.title} to demonstrate learning mastery and unlock real satoshi rewards!`}
          keywords={`Bitcoin Quiz, Bitcoin Chapter ${id} Quiz, Bitcoin Diploma Questions, proof of work test`}
        />
        <div className="min-h-full flex flex-col p-4 sm:p-6 md:p-8 max-w-3xl mx-auto w-full">
          <header className="flex justify-between items-center mb-6 sm:mb-8">
            <span className={`font-semibold text-xs sm:text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Question {currentQuestion + 1} of {questions.length}</span>
            <button className={`text-xs sm:text-sm font-semibold transition-colors ${theme === 'light' ? 'text-gray-500 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`} onClick={() => setQuizMode(false)}>Exit Quiz</button>
          </header>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 leading-tight ${theme === 'light' ? 'text-gray-950 font-black' : 'text-white'}`}>{q.question}</h2>
            
            <div className="flex flex-col gap-3 sm:gap-4">
              {Object.entries(q.options).map(([key, value]) => {
                const isSelected = selectedAnswer === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedAnswer(key);
                      setAnswers(prev => ({ ...prev, [currentQuestion]: key }));
                    }}
                    className={`text-left p-4 sm:p-6 rounded-xl border transition-all flex items-center ${
                      isSelected 
                        ? 'bg-brand-gold/10 border-brand-gold gold-glow' 
                        : (theme === 'light' ? 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50' : 'bg-brand-dark-2 border-white/10 hover:border-white/30')
                    }`}
                  >
                    <span className={`inline-block w-7 h-7 sm:w-8 sm:h-8 rounded-full text-center leading-7 sm:leading-8 mr-3 sm:mr-4 text-xs sm:text-sm font-bold shrink-0 transition-colors ${isSelected ? 'bg-brand-gold text-brand-black' : 'bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white'}`}>
                      {key}
                    </span>
                    <span className={`transition-colors text-sm sm:text-base ${isSelected ? (theme === 'light' ? 'text-gray-950 font-bold' : 'text-white font-medium') : (theme === 'light' ? 'text-gray-700 font-medium' : 'text-gray-300')}`}>{value as string}</span>
                  </button>
                );
              })}
            </div>

            <div className={`mt-8 py-4 sm:py-6 border-t flex justify-end ${theme === 'light' ? 'border-gray-200' : 'border-white/5'}`}>
              <Button 
                disabled={!selectedAnswer}
                onClick={() => {
                  if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(c => c + 1);
                    setSelectedAnswer(null);
                  } else {
                    handleSubmitQuiz();
                  }
                }}
                className="w-full sm:w-auto px-6 h-11"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question →' : 'Submit Exam'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col min-h-full transition-colors duration-200 ${theme === 'light' ? 'bg-gray-50 text-gray-800' : 'bg-brand-black text-white'}`}>
      <SEO 
        title={chapter.title}
        description={chapter.description || "Master decentralized proof-of-work consensus mechanism, digital signatures, and decentralized custody procedures in this specialized Bitcoin Diploma program study chapter."}
        keywords={`Bitcoin ${chapter.title}, Bitcoin Chapter ${id}, Learn Cryptography, Satoshi Nakamoto Philosophy, Educational Bitcoin Diploma`}
      />
      {/* Hero */}
      <div className={`border-b transition-colors duration-200 pt-8 pb-12 px-6 lg:px-12 relative overflow-hidden ${theme === 'light' ? 'bg-[#ffffff] border-gray-200' : 'bg-brand-dark-2 border-white/5'}`}>
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] pointer-events-none rounded-full ${theme === 'light' ? 'bg-brand-gold/10' : 'bg-brand-gold/5'}`} />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col">
          <button onClick={() => navigate('/dashboard')} className={`flex items-center gap-2 mb-6 transition-colors w-fit font-medium text-sm ${theme === 'light' ? 'text-gray-500 hover:text-gray-800' : 'text-gray-400 hover:text-white'}`}>
            <ArrowLeft size={16} /> Course Dashboard
          </button>
          
          <div className="flex flex-col gap-3">
            <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded border border-brand-gold/20 w-fit text-sm font-bold tracking-widest uppercase">
              Chapter {id.padStart(2, '0')}
            </span>
            <h1 className={`text-3xl lg:text-5xl font-bold tracking-tight ${theme === 'light' ? 'text-gray-950 font-black' : 'text-white'}`}>{chapter.title}</h1>
            
            <p className={`mt-2 max-w-4xl text-sm md:text-base leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              {chapter.description}
            </p>

            {/* Curriculum Audio Companion (Web Speech API) */}
            <div className={`mt-4 p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 max-w-4xl transition-all ${
              theme === 'light' ? 'bg-gray-100/50 border-gray-200' : 'bg-white/[0.02] border-white/5'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-brand-gold/10 text-brand-gold ${isPlaying && !isPaused ? 'animate-pulse' : ''}`}>
                  <Headphones size={20} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold flex items-center gap-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                    Listen to Lesson
                    {isPlaying && !isPaused && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold"></span>
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isPlaying ? (isPaused ? 'Audio paused.' : 'Reading chapter curriculum...') : 'Click Listen to start hands-free voice narration.'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Voice Selector */}
                {voices.length > 0 && (
                  <div className="flex flex-col gap-1 w-full md:w-44">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Voice Narrator</span>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => {
                        setSelectedVoiceName(e.target.value);
                        if (isPlaying) {
                          handleStopSpeaking();
                          setTimeout(() => {
                            const textToSpeak = `${chapter.title}. ${chapter.description || ''}`;
                            const utterance = new SpeechSynthesisUtterance(textToSpeak);
                            const voice = voices.find(v => v.name === e.target.value);
                            if (voice) utterance.voice = voice;
                            utterance.rate = playRate;
                            utterance.onend = () => {
                              setIsPlaying(false);
                              setIsPaused(false);
                            };
                            utterance.onerror = () => {
                              setIsPlaying(false);
                              setIsPaused(false);
                            };
                            utteranceRef.current = utterance;
                            setIsPlaying(true);
                            setIsPaused(false);
                            window.speechSynthesis.speak(utterance);
                          }, 100);
                        }
                      }}
                      className={`text-xs rounded-lg p-1.5 focus:outline-none focus:border-brand-gold cursor-pointer w-full ${
                        theme === 'light' ? 'bg-white border border-gray-300 text-gray-700' : 'bg-brand-dark-1 border-white/10 text-gray-300'
                      }`}
                    >
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Speed Selector */}
                <div className="flex flex-col gap-1 w-20 md:w-24">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Speed</span>
                  <select
                    value={playRate}
                    onChange={(e) => handleRateChange(parseFloat(e.target.value))}
                    className={`text-xs rounded-lg p-1.5 focus:outline-none focus:border-brand-gold cursor-pointer w-full ${
                      theme === 'light' ? 'bg-white border border-gray-300 text-gray-700' : 'bg-brand-dark-1 border-white/10 text-gray-300'
                    }`}
                  >
                    <option value="0.75">0.75x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                  </select>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-1.5 mt-auto">
                  <Button
                    onClick={handleSpeakToggle}
                    className="h-8 py-0 px-3 bg-brand-gold text-brand-black hover:bg-brand-gold/90 font-bold text-xs flex items-center gap-1 shrink-0"
                  >
                    {isPlaying && !isPaused ? (
                      <>
                        <Pause size={12} /> Pause
                      </>
                    ) : (
                      <>
                        <Play size={12} /> {isPaused ? 'Resume' : 'Listen'}
                      </>
                    )}
                  </Button>

                  {isPlaying && (
                    <Button
                      variant="secondary"
                      onClick={handleStopSpeaking}
                      className={`h-8 py-0 px-3 font-semibold text-xs flex items-center gap-1 shrink-0 ${
                        theme === 'light' ? 'bg-white text-gray-750 border border-gray-250 hover:bg-gray-100' : 'bg-brand-dark-2 text-white border border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <Square size={10} /> Stop
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-4 opacity-90">
              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>
                <PlayCircle size={14} className="text-brand-gold" /> {chapter.videos?.length || 0} Lectures
              </div>
              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>
                <FileText size={14} className="text-brand-gold" /> {chapter.resources?.length || 0} Study Guides
              </div>
              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md ${theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-white/5 text-gray-300'}`}>
                <Zap size={14} className="text-brand-gold font-bold" /> {chapter.satsPossible} Sats Reward
              </div>
              {userProg.status === 'completed' && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-md bg-status-success/15 text-status-success border border-status-success/25">
                  <CheckCircle2 size={14} /> Completed & Verified
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-12 py-8">
        
        {/* Left column (Tabs List + Tab Content) */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          {/* Tabs Sidebar - Fixed mobile scroll cut-off with automatic wrapping grid */}
          <div className="w-full md:w-48 grid grid-cols-2 md:flex md:flex-col gap-2 shrink-0 pb-4 md:pb-0">
            <button 
              onClick={() => setActiveTab('videos')}
              className={`flex items-center justify-between p-3 rounded-xl text-left border transition-all text-xs sm:text-sm shrink-0 ${
                activeTab === 'videos' 
                  ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-brand-gold font-bold' 
                  : (theme === 'light' ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50/85 hover:text-gray-900' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5')
              }`}
            >
              <div className="flex items-center gap-2">
                <PlayCircle size={15} className={activeTab === 'videos' ? 'text-brand-gold' : ''} />
                <span className="truncate md:whitespace-normal">Lecture Videos</span>
              </div>
              {allVideosWatched && chapter.videos?.length > 0 && <CheckCircle2 size={13} className="text-status-success hidden sm:block" />}
            </button>
            
            <button 
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 p-3 rounded-xl text-left border transition-all text-xs sm:text-sm shrink-0 ${
                activeTab === 'resources' 
                  ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-brand-gold font-bold' 
                  : (theme === 'light' ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50/85 hover:text-gray-900' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5')
              }`}
            >
              <FileText size={15} className={activeTab === 'resources' ? 'text-brand-gold' : ''} />
              <span className="truncate md:whitespace-normal">Study Handouts</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center justify-between p-3 rounded-xl text-left border transition-all text-xs sm:text-sm shrink-0 ${
                activeTab === 'quiz' 
                  ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-brand-gold font-bold' 
                  : (theme === 'light' ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50/85 hover:text-gray-900' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5')
              }`}
            >
              <div className="flex items-center gap-2">
                {allVideosWatched ? <Trophy size={15} className={activeTab === 'quiz' ? 'text-brand-gold' : ''} /> : <Lock size={15} className="text-gray-500" />}
                <span className="truncate md:whitespace-normal">Exam Quiz</span>
              </div>
              {userProg.quizPassed && <CheckCircle2 size={13} className="text-status-success hidden sm:block" />}
            </button>

            <button 
              onClick={() => setActiveTab('wiki')}
              className={`flex items-center gap-2 p-3 rounded-xl text-left border transition-all text-xs sm:text-sm shrink-0 ${
                activeTab === 'wiki' 
                  ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-brand-gold font-bold' 
                  : (theme === 'light' ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50/85 hover:text-gray-900' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5')
              }`}
            >
              <MessageSquare size={15} className={activeTab === 'wiki' ? 'text-brand-gold' : ''} />
              <span className="truncate md:whitespace-normal">Community Wiki</span>
            </button>
          </div>

        {/* Tab Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {activeTab === 'videos' && (
              <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                {chapter.videos?.length > 0 ? (
                  chapter.videos.map((vid: any, idx: number) => {
                    const isLegacyString = typeof vid === 'string';
                    const videoObj = isLegacyString ? { id: `legacy-${idx}`, youtubeUrl: vid, title: `Video ${idx + 1}`, duration: "10:00" } : vid;
                    const isWatched = userProg.videosWatched.includes(videoObj.id);
                    return (
                      <GlassCard key={videoObj.id || idx} className={`p-4 transition-all border ${
                        theme === 'light' ? 'bg-[#ffffff] border-gray-200 shadow-sm' : 'bg-brand-dark-2 border-white/5'
                      } ${isWatched ? 'border-status-success/40' : ''}`}>
                        <VideoEmbedder 
                          url={videoObj.youtubeUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                          title={videoObj.title}
                          className="mb-4"
                        />
                        <div className="flex justify-between items-start gap-4 flex-wrap md:flex-nowrap">
                          <div>
                            <h3 className={`text-lg font-bold mb-1 ${theme === 'light' ? 'text-gray-950 font-black' : 'text-white'}`}>{videoObj.title}</h3>
                            <span className="text-gray-450 text-xs font-mono">{videoObj.duration || '10:00'} Duration</span>
                          </div>
                          {isWatched ? (
                            <div className="bg-status-success/10 text-status-success px-3.5 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-status-success/25 self-start shrink-0">
                              <CheckCircle2 size={16} /> Completed
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => handleWatchVideo(videoObj.id)} className="self-start shrink-0">Mark Watched & Complete Unit</Button>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })
                ) : (
                  <GlassCard className={`flex flex-col items-center justify-center py-20 text-center border ${
                    theme === 'light' ? 'bg-white border-gray-200' : 'bg-brand-dark-2 border-white/5'
                  }`}>
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4">
                      <PlayCircle size={32} className="text-brand-gold" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>No videos yet</h3>
                    <p className="text-gray-500 max-w-md text-sm">The instructor has not added any videos to this chapter yet.</p>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'resources' && (
              <motion.div key="resources" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapter.resources?.length > 0 ? (
                  chapter.resources.map((res: any, idx: number) => {
                    const isRead = userProg.resourcesRead.includes(res.id);
                    const getIcon = () => {
                      if (res.type === 'pdf') return <FileDown size={24} className="text-red-500" />;
                      if (res.type === 'podcast') return <Headphones size={24} className="text-brand-gold" />;
                      if (res.type === 'link') return <ExternalLink size={24} className="text-blue-500" />;
                      return <FileText size={24} className="text-gray-400" />;
                    };
                    return (
                      <GlassCard key={res.id || `res-${idx}`} className={`p-6 flex flex-col transition-all border ${
                        theme === 'light' ? 'bg-[#ffffff] border-gray-200 shadow-sm' : 'bg-brand-dark-2 border-white/5'
                      }`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-brand-dark-2 border-white/5'}`}>
                            {getIcon()}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg leading-tight mb-1 ${theme === 'light' ? 'text-gray-950' : 'text-white'}`}>{res.title}</h3>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-gold">{res.type} Reference</span>
                          </div>
                        </div>
                        <p className={`text-sm mb-6 flex-1 leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{res.description}</p>
                        
                        <div className={`flex gap-2 mt-auto pt-4 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                          <Button variant="outline" className={`flex-1 ${theme === 'light' ? 'border-gray-250 hover:bg-gray-50 text-gray-700' : ''}`} onClick={() => window.open(res.url, '_blank')}>
                            Open Materials <ExternalLink size={14} className="ml-2" />
                          </Button>
                          {!isRead ? (
                            <Button variant="secondary" onClick={() => handleReadResource(res.id)}>Done</Button>
                          ) : (
                            <div className="bg-status-success/10 text-status-success px-4 py-2 rounded-xl border border-status-success/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={18} />
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })
                ) : (
                  <GlassCard className={`col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center border ${
                    theme === 'light' ? 'bg-white border-gray-200' : 'bg-brand-dark-2 border-white/5'
                  }`}>
                    <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mb-4">
                      <FileText size={32} className="text-brand-gold" />
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-gray-850' : 'text-gray-300'}`}>No resources</h3>
                    <p className="text-gray-500 text-sm">Additional reading materials and educational guides will appear here.</p>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {allVideosWatched || chapter.videos?.length === 0 ? (
                  <GlassCard className={`text-center p-6 sm:p-8 md:p-12 border ${
                    theme === 'light' ? 'bg-[#ffffff] border-gray-200' : 'bg-brand-dark-2 border-white/5'
                  }`}>
                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mb-5 sm:mb-6">
                      <Trophy size={36} className="text-brand-gold sm:size-10" />
                    </div>
                    <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 ${theme === 'light' ? 'text-gray-900 font-extrabold' : 'text-white'}`}>Final Chapter Exam</h2>
                    <p className={`max-w-lg mx-auto mb-6 sm:mb-8 text-xs sm:text-sm md:text-base leading-relaxed ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                      Complete the interactive knowledge assessment on "{chapter.title}". Pass with 100% score (all correct) to graduate and redeem your Satoshi reward!
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 max-w-xl mx-auto mb-8 sm:mb-10 text-center sm:text-left border-y border-gray-200/50 dark:border-white/5 py-4 sm:border-y-0 sm:py-0">
                      <div className="flex flex-col items-center sm:items-start px-2">
                        <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold">Questions</span>
                        <span className={`font-bold text-base sm:text-lg ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{chapter.quiz?.length || 5} Questions</span>
                      </div>
                      <div className="flex flex-col items-center sm:items-start sm:border-l border-gray-250 dark:border-white/10 sm:pl-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-150/40 dark:border-white/5 px-2">
                        <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold">Passing Mark</span>
                        <span className="font-extrabold text-base sm:text-lg text-status-success">100% (All Correct)</span>
                      </div>
                      <div className="flex flex-col items-center sm:items-start sm:border-l border-gray-250 dark:border-white/10 sm:pl-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-150/40 dark:border-white/5 px-2">
                        <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1 font-bold">Your Attempts</span>
                        <span className={`font-bold text-base sm:text-lg ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>{userProg.quizAttempts?.length || 0} Attempts</span>
                      </div>
                    </div>
                    
                    <Button size="md" className="w-full sm:w-auto min-w-[180px] font-bold text-sm sm:text-base py-2.5 sm:py-3.5" onClick={() => setQuizMode(true)}>
                      {userProg.quizPassed ? 'Retake Examination' : 'Start Knowledge Assessment →'}
                    </Button>
                    
                    {userProg.quizPassed && (
                      <p className="mt-4 text-sm text-status-success font-bold flex items-center justify-center gap-1.5 bg-status-success/5 py-2 px-4 rounded-lg w-fit mx-auto border border-status-success/15">
                        <CheckCircle2 size={16} /> Program Certification Exam Cleared!
                      </p>
                    )}
                  </GlassCard>
                ) : (
                  <GlassCard className={`text-center p-8 md:p-12 relative overflow-hidden border ${
                    theme === 'light' ? 'bg-[#ffffff] border-gray-200' : 'bg-brand-dark-2 border-white/5'
                  }`}>
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-brand-gold/5 rounded-full flex items-center justify-center mb-6 border border-brand-gold/15">
                        <Lock size={32} className="text-brand-gold" />
                      </div>
                      <h2 className={`text-2xl font-bold mb-3 ${theme === 'light' ? 'text-gray-900 font-extrabold' : 'text-white'}`}>Quiz Blocked</h2>
                      <p className={`max-w-md mx-auto mb-6 text-sm ${theme === 'light' ? 'text-gray-650' : 'text-gray-400'}`}>
                        Unlock curriculum milestones by watching all video lectures first before taking this evaluation chapter quiz.
                      </p>
                      
                      <div className={`w-full max-w-md rounded-full h-2.5 overflow-hidden mb-3.5 relative border ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-brand-dark-1 border-white/5'}`}>
                        <div 
                          className="absolute top-0 left-0 h-full bg-brand-gold transition-all" 
                          style={{ width: `${(userProg.videosWatched.length / (chapter.videos?.length || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                        {userProg.videosWatched.length} of {chapter.videos?.length} lectures watched ({Math.round((userProg.videosWatched.length / (chapter.videos?.length || 1)) * 100)}%)
                      </span>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'wiki' && (
              <motion.div key="wiki" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                <GlassCard className={`p-6 border ${
                  theme === 'light' ? 'bg-[#ffffff] border-gray-200 shadow-sm' : 'bg-brand-dark-2 border-white/5'
                }`}>
                  <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-gray-950 font-black' : 'text-white'}`}>Open Collaboration Wiki</h3>
                  <p className={`text-sm mb-6 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Share questions, study handouts, or notes with peers studying in this classroom tier.</p>
                  
                  <div className="flex gap-3">
                    <Input 
                      value={newWikiPost}
                      onChange={(e) => setNewWikiPost(e.target.value)}
                      placeholder="Contribute wiki notes or ask a question directly..."
                      className={`flex-1 ${theme === 'light' ? 'bg-gray-50 border-gray-250 text-gray-800 placeholder-gray-400 focus-visible:ring-brand-gold' : ''}`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handlePostWiki();
                      }}
                    />
                    <Button onClick={handlePostWiki} className="shrink-0">
                      <Send size={16} className="mr-2" /> Contribute
                    </Button>
                  </div>
                </GlassCard>

                <div className="space-y-4">
                  {wikiPosts.slice().reverse().map((post: any) => (
                    <GlassCard key={post.id} className={`p-4 md:p-6 transition-all border ${
                      theme === 'light' ? 'bg-[#ffffff] border-gray-200 hover:border-gray-300' : 'bg-brand-dark-2 border-white/5 hover:bg-white/5'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center overflow-hidden font-bold border border-brand-gold/20">
                            {post.authorAvatar ? (
                              <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              post.authorName?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              <span className={theme === 'light' ? 'text-gray-900 font-extrabold' : 'text-white'}>{post.authorName}</span>
                              {post.authorRole === 'instructor' && <span className="bg-brand-gold/20 text-brand-gold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Instructor</span>}
                              {post.authorRole === 'admin' && <span className="bg-brand-gold text-brand-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Admin</span>}
                            </div>
                            <div className="text-[11px] text-gray-400 font-medium">{new Date(post.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      <div className={`leading-relaxed whitespace-pre-wrap text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        {post.content}
                      </div>
                    </GlassCard>
                  ))}
                  
                  {wikiPosts.length === 0 && (
                    <div className={`text-center p-12 rounded-2xl border ${
                      theme === 'light' ? 'bg-gray-100/50 border-gray-200' : 'bg-white/[0.02] border-white/5'
                    }`}>
                      <MessageSquare size={32} className="mx-auto mb-4 text-brand-gold opacity-50 animate-bounce" />
                      <p className={`font-semibold ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Be the first student to publish notes or links in this room wiki!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Lesson Navigation Controls Panel */}
          <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between gap-4 ${theme === 'light' ? 'border-gray-200' : 'border-white/5'}`}>
            {prevChapter ? (
              <button
                onClick={() => {
                  handleStopSpeaking();
                  navigate(`/chapter/${prevChapter.id}`);
                }}
                className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:scale-[1.01] flex-1 ${
                  theme === 'light' 
                    ? 'bg-white border-gray-200 hover:bg-gray-50 text-gray-800 hover:border-gray-350' 
                    : 'bg-brand-dark-2 border-white/5 hover:bg-white/5 text-white'
                }`}
              >
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">← Previous Chapter</span>
                <span className="text-sm font-extrabold truncate w-full">{prevChapter.title}</span>
              </button>
            ) : (
              <div className="flex-1 hidden sm:block" />
            )}

            {nextChapter ? (
              <button
                onClick={() => {
                  handleStopSpeaking();
                  navigate(`/chapter/${nextChapter.id}`);
                }}
                className={`flex flex-col items-end p-4 rounded-xl border text-right transition-all hover:scale-[1.01] flex-1 group ${
                  userProg.status === 'completed' || userProg.quizPassed
                    ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold font-bold'
                    : (theme === 'light' 
                        ? 'bg-white border-gray-200 hover:bg-gray-50 text-gray-805' 
                        : 'bg-brand-dark-2 border-white/5 hover:bg-white/5 text-white')
                }`}
              >
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 group-hover:text-brand-gold transition-colors">Next Chapter →</span>
                <span className="text-sm font-extrabold truncate w-full flex items-center justify-end gap-1.5">
                  {nextChapter.title}
                  {!(userProg.status === 'completed' || userProg.quizPassed) && (
                    <Lock size={12} className="text-gray-500 shrink-0" />
                  )}
                </span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/courses')}
                className={`flex flex-col items-end p-4 rounded-xl border text-right transition-all hover:scale-[1.01] flex-1 bg-brand-gold/15 border-brand-gold/30 text-brand-gold`}
              >
                <span className="text-[10px] uppercase tracking-widest font-bold mb-1 text-brand-gold">Pathway Complete 🎓</span>
                <span className="text-sm font-extrabold">Return to Course Catalog</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>

    <CourseCompanion chapterTitle={chapter.title} chapterDescription={chapter.description || ''} />
  </div>
);
}
