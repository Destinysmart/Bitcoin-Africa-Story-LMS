import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getCurrentUser, getContent, updateUser, getUsers, getChapterWiki, addChapterWikiPost, addNotification } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { VideoEmbedder } from '../components/ui/VideoEmbedder';
import { CourseCompanion } from '../components/ui/CourseCompanion';
import { CheckCircle2, PlayCircle, Lock, Zap, ArrowLeft, ExternalLink, FileText, FileDown, Headphones, Trophy, Twitter, Linkedin, Share2, MessageSquare, Send } from 'lucide-react';
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
  
  const user = getCurrentUser();
  const content = getContent();

  // Sync chosen answer when question index changes
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestion] || null);
  }, [currentQuestion, answers]);
  
  if (!user || !id || !content.chapters[id]) {
    return <div className="p-8"><Button onClick={() => navigate('/dashboard')}>Return Home</Button></div>;
  }
  
  const chapter = content.chapters[id];
  const userProg = user.progress?.[id] || {
    status: 'locked',
    videosWatched: [],
    resourcesRead: [],
    quizAttempts: [],
    quizPassed: false,
    satsEarned: 0
  };

  useEffect(() => {
    // If opening a chapter that is supposed to be locked, theoretically we could bounce them.
    // For now we'll allow viewing but it might be just "in_progress".
    // Let's at least mark it in progress if they view it and it was locked/null.
    if (!user.progress?.[id] || user.progress?.[id].status === 'locked') {
      const newProg = { ...user.progress };
      newProg[id] = { ...userProg, status: 'in_progress' };
      updateUser(user.email, { progress: newProg });
    }
    setWikiPosts(getChapterWiki(id));
  }, [id]);

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
      updateUser(user.email, { progress: newProg, totalSats: newSats });
      toast('Video completed! Pass the chapter quiz to stack 2 Sats! ⚡', 'success');
    }
  };

  const handleReadResource = (resId: string) => {
    if (!userProg.resourcesRead.includes(resId)) {
      const newProg = { ...user.progress };
      newProg[id].resourcesRead.push(resId);
      
      const newSats = user.totalSats; // 0 sats for resource
      updateUser(user.email, { progress: newProg, totalSats: newSats });
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
    const passed = score >= 70; // 70% passing grade
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
      
      updateUser(user.email, { 
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
      const totalChapters = Object.keys(getContent().chapters || {}).length;
      const completedChaptersCount = Object.values(newProg).filter((p: any) => p.status === 'completed').length;
      if (completedChaptersCount >= totalChapters && totalChapters > 0) {
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
    } else {
      updateUser(user.email, { progress: newProg });
      setQuizResult({ passed: false, score, satsEarned: 0 });

      // Trigger In-app Notification
      addNotification(
        user.email,
        'Quiz Attempt Failed ❌',
        `You got ${score}% on the "${chapter.title}" quiz. 70% is required to pass. Read the materials and review Satoshi companion recommendations before trying again!`,
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
      <div className="fixed inset-0 z-50 bg-brand-black flex flex-col items-center justify-center p-6 text-center">
        {/* Confetti placeholder */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-gold/10 via-brand-black to-brand-black pointer-events-none" />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 flex flex-col items-center max-w-lg w-full">
          <div className="w-24 h-24 mb-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-5xl">
            <Zap size={48} className="text-brand-gold drop-shadow-[0_0_12px_rgba(253,184,19,0.8)]" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Chapter Complete!</h1>
          <p className="text-xl text-gray-300 mb-8">You've mastered "{chapter.title}"</p>
          
          <div className="bg-brand-dark-2 border border-brand-gold/30 rounded-2xl p-6 w-full mb-8 flex flex-col gap-2 gold-glow">
            <span className="text-5xl font-black text-brand-gold">+{quizResult.satsEarned}</span>
            <span className="text-brand-gold font-medium uppercase tracking-widest text-sm">Sats Earned</span>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400 border-t border-white/5 pt-4">
              <span>Quiz Score: {quizResult.score}%</span>
              <span>XP: +{userProg.quizAttempts.length <= 1 ? '175' : '140'} XP</span>
            </div>
          </div>
          
          <div className="w-full flex flex-col gap-3 mb-8">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Share Your Progress</p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="flex-1 gap-2 flex items-center justify-center border-white/10 hover:border-white/30 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]" onClick={() => handleShare('twitter')}>
                <Twitter size={18} /> X
              </Button>
              <Button variant="outline" className="flex-1 gap-2 flex items-center justify-center border-white/10 hover:border-white/30 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]" onClick={() => handleShare('linkedin')}>
                <Linkedin size={18} /> LinkedIn
              </Button>
              <Button variant="outline" className="flex-1 gap-2 flex items-center justify-center border-white/10 hover:border-white/30" onClick={() => handleShare()}>
                <Share2 size={18} /> Share
              </Button>
            </div>
          </div>
          
          <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
            Continue to Next Chapter →
          </Button>
        </motion.div>
      </div>
    );
  }

  if (quizResult && !quizResult.passed) {
    return (
      <div className="fixed inset-0 z-50 bg-brand-black flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-status-error/10 via-brand-black to-brand-black pointer-events-none" />
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 flex flex-col items-center max-w-lg w-full">
          <div className="w-24 h-24 mb-6 rounded-full bg-status-error/20 flex items-center justify-center text-4xl font-bold text-status-error">
            ✕
          </div>
          <h1 className="text-4xl font-bold mb-4">Quiz Unsuccessful</h1>
          <p className="text-xl text-gray-300 mb-8">You got {quizResult.score}% (70% required to pass)</p>
          
          <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-sm">
            Don't worry! Review the materials or ask the AI Course Companion at the right to clarify any concepts.
          </p>
          
          <div className="w-full flex flex-col gap-3">
            <Button size="lg" className="w-full bg-brand-gold text-[#000000] hover:bg-brand-gold/80" onClick={() => {
              setQuizResult(null);
              setCurrentQuestion(0);
              setSelectedAnswer(null);
              setAnswers({});
              setQuizMode(true);
            }}>
              Try Again
            </Button>
            <Button variant="ghost" size="lg" className="w-full text-gray-400 border border-white/5 hover:border-white/10" onClick={() => {
              setQuizResult(null);
              setQuizMode(false);
              setActiveTab('videos');
            }}>
              Back to Chapter Videos
            </Button>
          </div>
        </motion.div>
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
      <div className="fixed inset-0 z-50 bg-brand-black flex flex-col p-4 md:p-8">
        <SEO 
          title={`Quiz: ${chapter.title}`}
          description={`Take the interactive knowledge assessment on ${chapter.title} to demonstrate learning mastery and unlock real satoshi rewards!`}
          keywords={`Bitcoin Quiz, Bitcoin Chapter ${id} Quiz, Bitcoin Diploma Questions, proof of work test`}
        />
        <header className="flex justify-between items-center mb-8">
          <span className="text-gray-400 font-medium">Question {currentQuestion + 1} of {questions.length}</span>
          <button className="text-gray-500 hover:text-white" onClick={() => setQuizMode(false)}>Exit Quiz</button>
        </header>

        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full pt-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-tight">{q.question}</h2>
          
          <div className="flex flex-col gap-4">
            {Object.entries(q.options).map(([key, value]) => {
              const isSelected = selectedAnswer === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedAnswer(key);
                    setAnswers(prev => ({ ...prev, [currentQuestion]: key }));
                  }}
                  className={`text-left p-6 rounded-xl border transition-all ${
                    isSelected ? 'bg-brand-gold/10 border-brand-gold gold-glow' : 'bg-brand-dark-2 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 mr-4 ${isSelected ? 'bg-brand-gold text-[#000000] font-bold' : 'bg-white/10 text-white'}`}>
                    {key}
                  </span>
                  <span className={isSelected ? 'text-white font-medium' : 'text-gray-300'}>{value as string}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto py-6 border-t border-white/5 flex justify-end">
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
            >
              {currentQuestion < questions.length - 1 ? 'Next Question →' : 'Submit Quiz'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-brand-black min-h-full">
      <SEO 
        title={chapter.title}
        description={chapter.description || "Master decentralized proof-of-work consensus mechanism, digital signatures, and decentralized custody procedures in this specialized Bitcoin Diploma program study chapter."}
        keywords={`Bitcoin ${chapter.title}, Bitcoin Chapter ${id}, Learn Cryptography, Satoshi Nakamoto Philosophy, Educational Bitcoin Diploma`}
      />
      {/* Hero */}
      <div className="bg-brand-dark-2 border-b border-white/5 pt-8 pb-12 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 transition-colors w-fit">
            <ArrowLeft size={16} /> Dashboard
          </button>
          
          <div className="flex flex-col gap-3">
            <span className="bg-brand-gold/10 text-brand-gold px-3 py-1 rounded border border-brand-gold/20 w-fit text-sm font-bold tracking-widest uppercase">
              Chapter {id.padStart(2, '0')}
            </span>
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight">{chapter.title}</h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-4 opacity-80">
              <div className="flex items-center gap-2 text-gray-300">
                <PlayCircle size={18} /> {chapter.videos?.length || 0} Videos
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Zap size={18} className="text-brand-gold" /> {chapter.satsPossible} Sats
              </div>
              <div className="flex items-center gap-2 text-status-success">
                {userProg.status === 'completed' && <><CheckCircle2 size={18} /> Completed</>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-12 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Tabs Sidebar */}
        <div className="w-full md:w-64 flex md:flex-col gap-2 shrink-0 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setActiveTab('videos')}
            className={`flex items-center justify-between p-4 rounded-xl text-left border whitespace-nowrap transition-all ${activeTab === 'videos' ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-white' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <PlayCircle size={18} className={activeTab === 'videos' ? 'text-brand-gold' : ''} />
              <span className="font-medium">Videos</span>
            </div>
            {allVideosWatched && chapter.videos.length > 0 && <CheckCircle2 size={16} className="text-status-success hidden md:block" />}
          </button>
          
          <button 
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-3 p-4 rounded-xl text-left border whitespace-nowrap transition-all ${activeTab === 'resources' ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-white' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5'}`}
          >
            <FileText size={18} className={activeTab === 'resources' ? 'text-brand-gold' : ''} />
            <span className="font-medium">Resources</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center justify-between p-4 rounded-xl text-left border whitespace-nowrap transition-all ${activeTab === 'quiz' ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-white' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              {allVideosWatched ? <Trophy size={18} className={activeTab === 'quiz' ? 'text-brand-gold' : ''} /> : <Lock size={18} className="text-gray-500" />}
              <span className="font-medium">Quiz</span>
            </div>
            {userProg.quizPassed && <CheckCircle2 size={16} className="text-status-success hidden md:block" />}
          </button>

          <button 
            onClick={() => setActiveTab('wiki')}
            className={`flex items-center gap-3 p-4 rounded-xl text-left border whitespace-nowrap transition-all ${activeTab === 'wiki' ? 'bg-brand-gold/10 border-brand-gold/30 gold-glow text-white' : 'bg-brand-dark-2 border-transparent text-gray-400 hover:bg-white/5'}`}
          >
            <MessageSquare size={18} className={activeTab === 'wiki' ? 'text-brand-gold' : ''} />
            <span className="font-medium">Community Wiki</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {activeTab === 'videos' && (
              <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-8">
                {chapter.videos?.length > 0 ? (
                  chapter.videos.map((vid: any, idx: number) => {
                    const isLegacyString = typeof vid === 'string';
                    const videoObj = isLegacyString ? { id: `legacy-${idx}`, youtubeUrl: vid, title: `Video ${idx + 1}`, duration: "10:00" } : vid;
                    const isWatched = userProg.videosWatched.includes(videoObj.id);
                    return (
                      <GlassCard key={videoObj.id || idx} className={`p-4 ${isWatched ? 'border-status-success/30' : ''}`}>
                        <VideoEmbedder 
                          url={videoObj.youtubeUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"} 
                          title={videoObj.title}
                          className="mb-4"
                        />
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{videoObj.title}</h3>
                            <span className="text-gray-400 text-sm">{videoObj.duration || '10:00'}</span>
                          </div>
                          {isWatched ? (
                            <div className="bg-status-success/10 text-status-success px-3 py-1 rounded text-sm font-medium flex items-center gap-2">
                              <CheckCircle2 size={16} /> Watched
                            </div>
                          ) : (
                            <Button size="sm" onClick={() => handleWatchVideo(videoObj.id)}>Mark Watched</Button>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })
                ) : (
                  <GlassCard className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <PlayCircle size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                    <p className="text-gray-400 max-w-md">The admin has not added any videos to this chapter yet.</p>
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
                      if (res.type === 'pdf') return <FileDown size={24} className="text-error" />;
                      if (res.type === 'podcast') return <Headphones size={24} className="text-brand-gold" />;
                      if (res.type === 'link') return <ExternalLink size={24} className="text-blue-400" />;
                      return <FileText size={24} className="text-gray-300" />;
                    };
                    return (
                      <GlassCard key={res.id || `res-${idx}`} className="p-6 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="bg-brand-dark-2 p-3 rounded-xl border border-white/5">
                            {getIcon()}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg leading-tight mb-1">{res.title}</h3>
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{res.type}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-6 flex-1">{res.description}</p>
                        
                        <div className="flex gap-2 mt-auto pt-4 border-t border-white/5">
                          <Button variant="outline" className="flex-1" onClick={() => window.open(res.url, '_blank')}>
                            Open <ExternalLink size={14} className="ml-2" />
                          </Button>
                          {!isRead ? (
                            <Button variant="secondary" onClick={() => handleReadResource(res.id)}>Done</Button>
                          ) : (
                            <div className="bg-status-success/10 text-status-success px-4 py-2 rounded-xl border border-status-success/20 flex items-center justify-center">
                              <CheckCircle2 size={18} />
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })
                ) : (
                  <GlassCard className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <FileText size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No resources</h3>
                    <p className="text-gray-400">Additional reading materials will appear here.</p>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'quiz' && (
              <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {allVideosWatched || chapter.videos?.length === 0 ? (
                  <GlassCard className="text-center p-8 md:p-12">
                    <div className="mx-auto w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
                      <Trophy size={40} className="text-brand-gold" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Final Chapter Quiz</h2>
                    <p className="text-gray-400 max-w-lg mx-auto mb-8">
                      Test your knowledge on "{chapter.title}". Pass with 70% or higher to unlock the next chapter and earn bonus sats!
                    </p>
                    
                    <div className="flex justify-center gap-6 mb-10 text-left opacity-80">
                      <div>
                        <span className="block text-sm text-gray-500 mb-1">Questions</span>
                        <span className="font-semibold text-lg">{chapter.quiz?.length || 5}</span>
                      </div>
                      <div>
                        <span className="block text-sm text-gray-500 mb-1">Passing Score</span>
                        <span className="font-semibold text-lg text-status-success">70%</span>
                      </div>
                      <div>
                        <span className="block text-sm text-gray-500 mb-1">Total Attempts</span>
                        <span className="font-semibold text-lg">{userProg.quizAttempts.length}</span>
                      </div>
                    </div>
                    
                    <Button size="lg" className="w-full md:w-auto min-w-[200px]" onClick={() => setQuizMode(true)}>
                      {userProg.quizPassed ? 'Retake Quiz' : 'Start Quiz →'}
                    </Button>
                    
                    {userProg.quizPassed && (
                      <p className="mt-4 text-sm text-status-success font-medium">You have already passed this quiz!</p>
                    )}
                  </GlassCard>
                ) : (
                  <GlassCard className="text-center p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-brand-black/60 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <Lock size={32} className="text-gray-400" />
                      </div>
                      <h2 className="text-2xl font-bold mb-3">Quiz is Locked</h2>
                      <p className="text-gray-400 max-w-md mx-auto mb-6">
                        You must watch all videos in this chapter before you can take the quiz.
                      </p>
                      
                      <div className="w-full max-w-md bg-brand-dark-2 rounded-full h-2 overflow-hidden mb-2 relative border border-white/5">
                        <div 
                          className="absolute top-0 left-0 h-full bg-brand-gold transition-all" 
                          style={{ width: `${(userProg.videosWatched.length / (chapter.videos?.length || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-brand-gold">
                        {userProg.videosWatched.length} of {chapter.videos?.length} videos watched
                      </span>
                    </div>
                  </GlassCard>
                )}
              </motion.div>
            )}

            {activeTab === 'wiki' && (
              <motion.div key="wiki" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
                <GlassCard className="p-6">
                  <h3 className="text-xl font-bold mb-2">Community Wiki</h3>
                  <p className="text-gray-400 text-sm mb-6">Contribute notes, community FAQs, and additional resource links. This wiki is shared among students and instructors.</p>
                  
                  <div className="flex gap-4">
                    <Input 
                      value={newWikiPost}
                      onChange={(e) => setNewWikiPost(e.target.value)}
                      placeholder="Share a useful note or link..."
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handlePostWiki();
                      }}
                    />
                    <Button onClick={handlePostWiki} className="shrink-0">
                      <Send size={16} className="mr-2" /> Post
                    </Button>
                  </div>
                </GlassCard>

                <div className="space-y-4">
                  {wikiPosts.slice().reverse().map((post: any) => (
                    <GlassCard key={post.id} className="p-4 md:p-6 transition-all hover:border-white/20 hover:bg-white/5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center overflow-hidden font-bold">
                            {post.authorAvatar ? (
                              <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              post.authorName?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold flex items-center gap-2">
                              {post.authorName} 
                              {post.authorRole === 'instructor' && <span className="bg-brand-gold/20 text-brand-gold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Instructor</span>}
                              {post.authorRole === 'admin' && <span className="bg-brand-gold text-brand-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Admin</span>}
                            </div>
                            <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </div>
                    </GlassCard>
                  ))}
                  
                  {wikiPosts.length === 0 && (
                    <div className="text-center p-12 text-gray-500 border border-t-white/5 border-transparent bg-white/[0.02] rounded-2xl">
                      <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
                      <p>Be the first to share a note for this chapter!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      <CourseCompanion chapterTitle={chapter.title} chapterDescription={chapter.description || ''} />
    </div>
  );
}
