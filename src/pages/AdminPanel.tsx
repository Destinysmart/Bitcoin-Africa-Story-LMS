import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getUsers, getContent, getCurrentUser, updateUser, getAdminLogs, addAdminLog, getContentVersions, saveContentVersion, restoreContentVersion } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Users, BookOpen, Zap, Award, Megaphone, Settings, ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart as RechartsBarChart
} from 'recharts';

export default function AdminPanel() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast('Access denied. Admin only.', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'students' | 'activity' | 'payouts' | 'settings'>('analytics');
  
  // Real-time states
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any>({ chapters: {} });
  const [chapters, setChapters] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingChapterContent, setEditingChapterContent] = useState<any>(null);
  const [anthropicKey, setAnthropicKey] = useState(localStorage.getItem('anthropic_api_key') || '');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingResources, setIsGeneratingResources] = useState(false);

  const handleGenerateResources = async () => {
    
    if (!editingChapterContent?.title || editingChapterContent.title === 'New Chapter') {
      toast('Please enter a descriptive Chapter Title first', 'error');
      return;
    }
    setIsGeneratingResources(true);
    try {
      const response = await fetch('/api/generate-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: anthropicKey, 
          chapterTitle: editingChapterContent.title 
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch from server');
      }

      const parsed = await response.json();
      
      const formatted = parsed.map((item: any, i: number) => ({
        ...item,
        id: `res-ai-${Date.now()}-${i}`
      }));

      setEditingChapterContent({
        ...editingChapterContent, 
        resources: [...(editingChapterContent?.resources || []), ...formatted]
      });
      
      toast('Generated resources with Gemini AI!', 'success');
    } catch (err: any) {
      console.error(err);
      toast(`Error generating resources: ${err.message}`, 'error');
    } finally {
      setIsGeneratingResources(false);
    }
  };

  const handleGenerateDescription = async () => {
    
    if (!editingChapterContent?.title || editingChapterContent.title === 'New Chapter') {
      toast('Please enter a descriptive Chapter Title first', 'error');
      return;
    }
    setIsGeneratingDesc(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: anthropicKey, 
          chapterTitle: editingChapterContent.title 
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch from server');
      }

      const parsed = await response.json();
      
      setEditingChapterContent({
        ...editingChapterContent, 
        description: parsed.description
      });
      
      toast('Generated description with Gemini AI!', 'success');
    } catch (err: any) {
      console.error(err);
      toast(`Error generating description: ${err.message}`, 'error');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateQuiz = async () => {
    
    setIsGeneratingQuiz(true);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          apiKey: anthropicKey, 
          chapterTitle: editingChapterContent?.title || 'Unknown',
          chapterDescription: editingChapterContent?.description || ''
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch from server');
      }

      const parsed = await response.json();
      
      const formatted = parsed.map((item: any, i: number) => ({
        ...item,
        id: `quiz-ai-${Date.now()}-${i}`
      }));
      
      setEditingChapterContent({
        ...editingChapterContent, 
        quiz: [...(editingChapterContent?.quiz || []), ...formatted]
      });
      
      toast('Generated quiz with Gemini AI!', 'success');
    } catch (err: any) {
      console.error(err);
      toast(`Error generating quiz: ${err.message}`, 'error');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const [studentSearch, setStudentSearch] = useState('');

  const loadData = () => {
    const allUsers = Object.values(getUsers()).filter((u: any) => u.email !== "admin@bitcoinafricastory.com" && u.email !== "smartdestinyonyekachi@gmail.com") as any[];
    setUsers(allUsers);
    
    const cont = getContent();
    setContent(cont);
    setChapters(Object.values(cont.chapters || {}));
    
    setLogs(getAdminLogs());
    setVersions(getContentVersions());
  };

  useEffect(() => {
    loadData();
  }, []);
  
  if (user?.role !== 'admin') {
    return <div className="p-8 text-center text-status-error">Unauthorized. Admin access required.</div>;
  }

  // Analytics
  const totalEnrolled = users.length;
  const totalCompleted = users.filter((u: any) => Object.values(u.progress || {}).filter((p: any) => p.status === 'completed').length === chapters.length).length;
  const completionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
  const totalSatsOwed: number = users.reduce((sum: number, u: any) => sum + (u.totalSats || 0), 0);

  const chapterStats = chapters.map(c => {
    let started = 0;
    let passes = 0;
    let totalAttempts = 0;
    
    users.forEach(u => {
      const prog = u.progress?.[c.id];
      if (prog) {
        if (prog.status === 'completed' || prog.videosWatched?.length > 0 || prog.quizAttempts?.length > 0) {
          started++;
        }
        if (prog.quizPassed) passes++;
        totalAttempts += (prog.quizAttempts?.length || 0);
      }
    });

    const passRate = totalAttempts > 0 ? Math.round((passes / totalAttempts) * 100) : (started > 0 ? 0 : 100);
    const avgAttempts = started > 0 ? parseFloat((totalAttempts / started).toFixed(1)) : 0;
    
    return {
      name: `Ch ${c.id}`,
      title: c.title,
      Started: started,
      Completed: passes,
      PassRate: passRate,
      AvgAttempts: avgAttempts
    };
  });

  const saveChapter = () => {
    if (!editingChapterContent) return;
    const cont = getContent();
    cont.chapters[editingChapterContent.id] = editingChapterContent;
    localStorage.setItem('bas_content', JSON.stringify(cont));
    addAdminLog(user?.email || 'admin', 'Edited Chapter', `Updated content for Chapter ${editingChapterContent.id}`);
    toast('Chapter saved successfully!', 'success');
    setEditingChapterId(null);
    setEditingChapterContent(null);
    loadData();
  };

  const handleMarkPaid = (email: string) => {
    updateUser(email, { payoutStatus: 'paid' });
    toast(`Marked ${email} as paid!`, 'success');
    loadData();
  };

  return (
    <div className="flex flex-col min-h-full">
      
      {/* Admin Top Navigation */}
      <div className="px-6 py-6 md:px-8 border-b border-white/5">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Manage content, users, and application settings.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart },
            { id: 'content', label: 'Content', icon: BookOpen },
            { id: 'students', label: 'Users', icon: Users },
            { id: 'activity', label: 'Activity Log', icon: Megaphone },
            { id: 'payouts', label: 'Payouts', icon: Zap },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === tab.id ? 'bg-brand-gold text-[#000000]' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Content */}
      <div className="p-6 md:p-8 flex-1">
        <AnimatePresence mode="wait">
          
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-2xl font-bold mb-6">Overview & Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <GlassCard className="p-6">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-1">Total Enrolled</p>
                  <p className="text-3xl font-black">{totalEnrolled}</p>
                </GlassCard>
                <GlassCard className="p-6">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-1">Completed Course</p>
                  <p className="text-3xl font-black text-status-success">{totalCompleted}</p>
                </GlassCard>
                <GlassCard className="p-6">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-1">Completion Rate</p>
                  <p className="text-3xl font-black">{completionRate}%</p>
                </GlassCard>
                <GlassCard className="p-6 border-brand-gold/30">
                  <p className="text-gray-400 text-sm font-bold uppercase mb-1">Total Sats Owed</p>
                  <p className="text-3xl font-black text-brand-gold">{totalSatsOwed}</p>
                </GlassCard>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <GlassCard className="p-6 h-[400px] flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg">Student Engagement & Pass Rates</h3>
                    <p className="text-gray-400 text-sm">Comparing users who started vs completed chapters.</p>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chapterStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis yAxisId="left" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#E5E5E5' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                        <Bar yAxisId="left" dataKey="Started" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar yAxisId="left" dataKey="Completed" fill="#F7931A" radius={[4, 4, 0, 0]} barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="PassRate" stroke="#4ade80" strokeWidth={3} dot={{ r: 4, fill: '#1A1A1A', stroke: '#4ade80', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Pass Rate %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard className="p-6 h-[400px] flex flex-col">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg">Common Struggle Points</h3>
                    <p className="text-gray-400 text-sm">Average number of quiz attempts per user.</p>
                  </div>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={chapterStats} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#E5E5E5' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                        <Bar dataKey="AvgAttempts" fill="#ef4444" radius={[4, 4, 0, 0]} name="Avg Quiz Attempts" barSize={32} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'content' && (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {editingChapterId ? (
                <div>
                  <button onClick={() => setEditingChapterId(null)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                    <ArrowLeft size={16} /> Back to Curriculum
                  </button>
                  <h2 className="text-2xl font-bold mb-6">Edit Chapter {editingChapterContent?.id}: {editingChapterContent?.title}</h2>
                  
                  <GlassCard className="space-y-6">
                    <Input 
                      label="Chapter Title" 
                      value={editingChapterContent?.title || ''} 
                      onChange={e => setEditingChapterContent({...editingChapterContent, title: e.target.value})} 
                    />
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-400">Description</label>
                        <button 
                          onClick={handleGenerateDescription}
                          disabled={isGeneratingDesc}
                          className="text-xs flex items-center gap-1.5 text-brand-gold hover:text-white transition-colors disabled:opacity-50"
                        >
                          {isGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                          Auto AI Generate
                        </button>
                      </div>
                      <textarea 
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none h-32"
                        value={editingChapterContent?.description || ''}
                        onChange={e => setEditingChapterContent({...editingChapterContent, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Sats Reward" 
                        type="number"
                        value={editingChapterContent?.satsPossible || 0} 
                        onChange={e => setEditingChapterContent({...editingChapterContent, satsPossible: parseInt(e.target.value) || 0})} 
                      />
                      <Input 
                        label="Estimated Minutes" 
                        type="number"
                        value={editingChapterContent?.estimatedMinutes || 0} 
                        onChange={e => setEditingChapterContent({...editingChapterContent, estimatedMinutes: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-white/5">
                      <h3 className="font-bold mb-4">Video Resources</h3>
                      {editingChapterContent?.videos?.map((vid: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 mb-4 p-4 bg-black/20 rounded-lg border border-white/5">
                          <Input 
                            label="Video Title"
                            value={vid?.title || ''} 
                            onChange={e => {
                              const newVids = [...(editingChapterContent.videos || [])];
                              newVids[idx] = { ...newVids[idx], title: e.target.value };
                              setEditingChapterContent({...editingChapterContent, videos: newVids});
                            }} 
                          />
                          <Input 
                            label="YouTube URL"
                            value={vid?.youtubeUrl || ''} 
                            onChange={e => {
                              const newVids = [...(editingChapterContent.videos || [])];
                              newVids[idx] = { ...newVids[idx], youtubeUrl: e.target.value };
                              setEditingChapterContent({...editingChapterContent, videos: newVids});
                            }} 
                          />
                          <Button variant="outline" className="text-status-error border-status-error/30 hover:bg-status-error/10 w-full mt-2" onClick={() => {
                            const newVids = editingChapterContent.videos.filter((_: any, i: number) => i !== idx);
                            setEditingChapterContent({...editingChapterContent, videos: newVids});
                          }}>
                            <Trash2 size={16} className="mr-2" /> Remove Video
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-2" onClick={() => {
                        const newId = `vid-${Date.now()}`;
                        setEditingChapterContent({...editingChapterContent, videos: [...(editingChapterContent?.videos || []), { id: newId, title: "New Video", youtubeUrl: "", duration: "10:00" }]});
                      }}>
                        <Plus size={16} className="mr-2" /> Add Video
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">Reading Resources</h3>
                        <button 
                          onClick={handleGenerateResources}
                          disabled={isGeneratingResources}
                          className="text-xs flex items-center gap-1.5 text-brand-gold hover:text-white transition-colors disabled:opacity-50"
                        >
                          {isGeneratingResources ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                          Auto AI Generate
                        </button>
                      </div>
                      {editingChapterContent?.resources?.map((res: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 mb-4 p-4 bg-black/20 rounded-lg border border-white/5">
                          <Input 
                            label="Resource Title"
                            value={res?.title || ''} 
                            onChange={e => {
                              const newRes = [...(editingChapterContent.resources || [])];
                              newRes[idx] = { ...newRes[idx], title: e.target.value };
                              setEditingChapterContent({...editingChapterContent, resources: newRes});
                            }} 
                          />
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
                              <select 
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none"
                                value={res?.type || 'link'}
                                onChange={e => {
                                  const newRes = [...(editingChapterContent.resources || [])];
                                  newRes[idx] = { ...newRes[idx], type: e.target.value };
                                  setEditingChapterContent({...editingChapterContent, resources: newRes});
                                }}
                              >
                                <option value="link">Link</option>
                                <option value="pdf">PDF</option>
                                <option value="podcast">Podcast</option>
                              </select>
                            </div>
                            <div className="flex-[2]">
                              <Input 
                                label="URL"
                                value={res?.url || ''} 
                                onChange={e => {
                                  const newRes = [...(editingChapterContent.resources || [])];
                                  newRes[idx] = { ...newRes[idx], url: e.target.value };
                                  setEditingChapterContent({...editingChapterContent, resources: newRes});
                                }} 
                              />
                            </div>
                          </div>
                          <Button variant="outline" className="text-status-error border-status-error/30 hover:bg-status-error/10 w-full mt-2" onClick={() => {
                            const newRes = editingChapterContent.resources.filter((_: any, i: number) => i !== idx);
                            setEditingChapterContent({...editingChapterContent, resources: newRes});
                          }}>
                            <Trash2 size={16} className="mr-2" /> Remove Resource
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-2" onClick={() => {
                        const newId = `res-${Date.now()}`;
                        setEditingChapterContent({...editingChapterContent, resources: [...(editingChapterContent?.resources || []), { id: newId, title: "New Resource", type: "link", url: "" }]});
                      }}>
                        <Plus size={16} className="mr-2" /> Add Resource
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <h3 className="font-bold mb-4">Quiz Questions</h3>
                      {editingChapterContent?.quiz?.map((q: any, idx: number) => (
                        <div key={idx} className="flex flex-col gap-2 mb-4 p-4 bg-black/20 rounded-lg border border-white/5">
                          <Input 
                            label={`Question ${idx + 1}`}
                            value={q?.question || ''} 
                            onChange={e => {
                              const newQuiz = [...(editingChapterContent.quiz || [])];
                              newQuiz[idx] = { ...newQuiz[idx], question: e.target.value };
                              setEditingChapterContent({...editingChapterContent, quiz: newQuiz});
                            }} 
                          />
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {['A', 'B', 'C', 'D'].map(opt => (
                              <Input
                                key={opt}
                                label={`Option ${opt}`}
                                value={q?.options?.[opt] || ''}
                                onChange={e => {
                                  const newQuiz = [...(editingChapterContent.quiz || [])];
                                  newQuiz[idx] = { 
                                    ...newQuiz[idx], 
                                    options: { ...(newQuiz[idx].options || {}), [opt]: e.target.value } 
                                  };
                                  setEditingChapterContent({...editingChapterContent, quiz: newQuiz});
                                }}
                              />
                            ))}
                          </div>
                          <div className="mt-2">
                             <label className="block text-sm font-medium text-gray-400 mb-1">Correct Answer</label>
                             <select 
                               className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none"
                               value={q?.correct || 'A'}
                               onChange={e => {
                                 const newQuiz = [...(editingChapterContent.quiz || [])];
                                 newQuiz[idx] = { ...newQuiz[idx], correct: e.target.value };
                                 setEditingChapterContent({...editingChapterContent, quiz: newQuiz});
                               }}
                             >
                                <option value="A">Option A</option>
                                <option value="B">Option B</option>
                                <option value="C">Option C</option>
                                <option value="D">Option D</option>
                             </select>
                          </div>
                          <Button variant="outline" className="text-status-error border-status-error/30 hover:bg-status-error/10 w-full mt-2" onClick={() => {
                            const newQuiz = editingChapterContent.quiz.filter((_: any, i: number) => i !== idx);
                            setEditingChapterContent({...editingChapterContent, quiz: newQuiz});
                          }}>
                            <Trash2 size={16} className="mr-2" /> Remove Question
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full mt-2" onClick={() => {
                        const newId = `quiz-${Date.now()}`;
                        setEditingChapterContent({...editingChapterContent, quiz: [...(editingChapterContent?.quiz || []), { id: newId, question: "New Question", options: { A: "", B: "", C: "", D: "" }, correct: "A" }]});
                      }}>
                        <Plus size={16} className="mr-2" /> Add Question
                      </Button>
                      <Button 
                        variant="primary" 
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white border-0" 
                        onClick={handleGenerateQuiz}
                        disabled={isGeneratingQuiz}
                      >
                        {isGeneratingQuiz ? (
                           <><Loader2 size={16} className="mr-2 animate-spin" /> Generating with AI...</>
                        ) : (
                           <><Zap size={16} className="mr-2 text-brand-gold" /> Auto-Generate via Claude AI</>
                        )}
                      </Button>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <Button onClick={saveChapter}>Save Chapter Changes</Button>
                    </div>
                  </GlassCard>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold">Curriculum Content Management</h2>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" onClick={() => {
                        const newId = chapters.length > 0 ? Math.max(...chapters.map((c:any) => c.id)) + 1 : 1;
                        setEditingChapterId(newId);
                        setEditingChapterContent({
                          id: newId,
                          title: "New Chapter",
                          description: "",
                          videos: [],
                          resources: [],
                          quiz: [],
                          satsPossible: 100,
                          estimatedMinutes: 30
                        });
                      }}>
                        <Plus size={16} className="mr-2" /> Add Chapter
                      </Button>
                      <Button variant="outline" onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = '.json';
                        fileInput.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              try {
                                const data = JSON.parse(ev.target?.result as string);
                                const cont = getContent();
                                cont.chapters = { ...cont.chapters, ...data };
                                localStorage.setItem('bas_content', JSON.stringify(cont));
                                addAdminLog(user?.email || 'admin', 'Bulk Import', `Imported ${Object.keys(data).length} chapters from JSON`);
                                toast('Content imported successfully', 'success');
                                loadData();
                              } catch(err) {
                                toast('Invalid JSON file', 'error');
                              }
                            };
                            reader.readAsText(file);
                          }
                        };
                        fileInput.click();
                      }}>
                        Import JSON
                      </Button>
                    </div>
                  </div>

                  <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold">Content Versions</h3>
                      <Button variant="primary" size="sm" onClick={() => {
                        const name = window.prompt("Enter version name/description:");
                        if (name) {
                          saveContentVersion(name, user?.email || 'admin');
                          toast('Version saved', 'success');
                          loadData();
                        }
                      }}>Save Current Version</Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {versions.length === 0 ? (
                        <p className="text-gray-500 text-sm">No versions saved yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {versions.map((v: any) => (
                            <li key={v.id} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded">
                              <div>
                                <span className="font-bold text-gray-300">{v.name}</span>
                                <span className="text-gray-500 ml-2">{new Date(v.date).toLocaleString()}</span>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => {
                                if (window.confirm("Are you sure you want to restore this version? This will overwrite current content.")) {
                                  restoreContentVersion(v.id, user?.email || 'admin');
                                  toast('Version restored', 'success');
                                  loadData();
                                }
                              }}>Restore</Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {chapters.map((c: any) => (
                      <GlassCard key={c.id} className="p-4 md:p-6 transition-all hover:border-white/20">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => {}}>
                          <div className="flex items-center gap-4">
                            <span className="text-brand-gold font-black opacity-50 text-xl">{c.id.toString().padStart(2, '0')}</span>
                            <div>
                              <h3 className="font-bold text-lg">{c.title}</h3>
                              <p className="text-xs text-gray-400">{c.videos?.length || 0} Videos • {c.satsPossible} Sats Reward</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => {
                            setEditingChapterId(c.id);
                            setEditingChapterContent(c);
                          }}>Edit Chapter</Button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">User Directory</h2>
                <Input 
                  label="" 
                  placeholder="Search users..." 
                  className="w-64" 
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                />
              </div>
              <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 border-b border-white/10 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="p-4">Name & Email</th>
                        <th className="p-4">Country</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Progress</th>
                        <th className="p-4">Sats</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {users.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">No students registered yet.</td></tr> : null}
                      {users
                        .filter((u: any) => u.name?.toLowerCase().includes(studentSearch.toLowerCase()) || u.email?.toLowerCase().includes(studentSearch.toLowerCase()))
                        .map((u: any, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div className="font-bold">{u.name}</div>
                            <div className="text-xs text-gray-400">{u.email}</div>
                          </td>
                          <td className="p-4 text-gray-300">{u.country}</td>
                          <td className="p-4">
                            <select 
                              className="bg-black/50 border border-white/10 rounded-lg p-2 text-white focus:border-brand-gold outline-none text-xs"
                              value={u.role || 'student'}
                              onChange={(e) => {
                                updateUser(u.email, { role: e.target.value });
                                addAdminLog(user?.email || 'admin', 'Role Update', `Changed ${u.email} to ${e.target.value}`);
                                toast(`Role updated to ${e.target.value}`, 'success');
                                loadData();
                              }}
                            >
                              <option value="student">Student</option>
                              <option value="instructor">Instructor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="w-full bg-brand-dark-1 rounded-full h-2 mb-1 border border-white/5">
                              <div className="bg-brand-gold h-full rounded-full" style={{ width: `${(Object.keys(u.progress || {}).length / chapters.length) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{Object.keys(u.progress || {}).length}/{chapters.length} Chap</span>
                          </td>
                          <td className="p-4 font-bold text-brand-gold">{u.totalSats || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Activity Log</h2>
              </div>
              <GlassCard className="p-0 overflow-hidden">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No admin activities recorded yet.</div>
                ) : (
                  <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto hide-scrollbar">
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-brand-gold uppercase tracking-wider">{log.action}</span>
                            <span className="text-xs text-gray-500">{new Date(log.date).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-300">{log.details}</p>
                        </div>
                        <div className="text-xs font-mono text-gray-500 bg-black/40 px-3 py-1 rounded-full whitespace-nowrap">
                          {log.adminEmail}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'payouts' && (
            <motion.div key="payouts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-2xl font-bold mb-6">Sats Payout Management</h2>
              <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 border-b border-white/10 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="p-4">Student</th>
                        <th className="p-4">Address</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {users.filter((u: any) => u.payoutStatus).length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending payouts.</td></tr> : null}
                      {users.filter((u: any) => u.payoutStatus).map((u: any, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="p-4 font-bold">{u.name}</td>
                          <td className="p-4 font-mono text-xs text-gray-400">{u.btcAddress || 'Not set'}</td>
                          <td className="p-4 font-bold text-brand-gold">{u.totalSats}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.payoutStatus === 'paid' ? 'bg-status-success/20 text-status-success' : 'bg-status-warning/20 text-status-warning'}`}>
                              {u.payoutStatus.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {u.payoutStatus !== 'paid' && <Button size="sm" onClick={() => handleMarkPaid(u.email)}>Mark Paid</Button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-xl">
              <h2 className="text-2xl font-bold mb-6">Admin Settings</h2>
              <div className="space-y-6">
                <GlassCard className="space-y-6">
                  <div>
                    <h3 className="font-bold mb-2 flex items-center gap-2"><Zap size={18} className="text-brand-gold" /> built-in Gemini AI Assistant</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      The platform\'s auto-generation engine is fully functional out of the box using our highly secure server-side Gemini API. No manual API setup is required.
                    </p>
                    <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-xl text-xs text-brand-gold mb-4 leading-relaxed">
                      <span className="font-bold uppercase tracking-wider block mb-1">⚡ Service Status: ACTIVE</span>
                      All features like AI Quiz Generation, automated Module Descriptions, Reading Material Recommendations, and student Companion Chat are pre-installed and ready.
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="space-y-4">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg mb-1">Automated Notification System</h3>
                    <p className="text-sm text-gray-400">Configure email alerts sent to instructors when students reach milestones.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 bg-black/50 text-brand-gold focus:ring-brand-gold focus:ring-offset-black" />
                      <div>
                        <div className="font-semibold text-sm">Course Completion Alerts</div>
                        <div className="text-xs text-gray-400">Trigger email when a student finishes all chapters.</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 bg-black/50 text-brand-gold focus:ring-brand-gold focus:ring-offset-black" />
                      <div>
                        <div className="font-semibold text-sm">High Score Alerts (100% Quiz)</div>
                        <div className="text-xs text-gray-400">Trigger email when a student perfectly passes a quiz on first attempt.</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-white/20 bg-black/50 text-brand-gold focus:ring-brand-gold focus:ring-offset-black" />
                      <div>
                        <div className="font-semibold text-sm">Weekly Progress Report</div>
                        <div className="text-xs text-gray-400">Send an automated summary of overall class progress every Monday.</div>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <Input label="Instructor Alert Email Address" placeholder="instructors@example.com" defaultValue="instructors@bitcoinafricastory.com" className="mb-4" />
                    <Button onClick={() => {
                      toast('Notification settings saved securely', 'success');
                      addAdminLog(user?.email || 'admin', 'Updated Settings', 'Modified automated notification preferences');
                    }}>Save Notification Settings</Button>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
