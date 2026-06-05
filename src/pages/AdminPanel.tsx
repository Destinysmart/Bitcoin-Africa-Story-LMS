import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getUsers, getContent, getCurrentUser, updateUser } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Users, BookOpen, Zap, Award, Megaphone, Settings, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { 
  ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart as RechartsBarChart
} from 'recharts';

export default function AdminPanel() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'students' | 'payouts' | 'settings'>('analytics');
  
  // Real-time states
  const [users, setUsers] = useState<any[]>([]);
  const [content, setContent] = useState<any>({ chapters: {} });
  const [chapters, setChapters] = useState<any[]>([]);
  
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingChapterContent, setEditingChapterContent] = useState<any>(null);

  const [studentSearch, setStudentSearch] = useState('');

  const loadData = () => {
    const allUsers = Object.values(getUsers()).filter((u: any) => u.email !== "admin@bitcoinafricastory.com" && u.email !== "smartdestinyonyekachi@gmail.com") as any[];
    setUsers(allUsers);
    
    const cont = getContent();
    setContent(cont);
    setChapters(Object.values(cont.chapters || {}));
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
          <p className="text-sm text-gray-400 mt-1">Manage content, students, and application settings.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'analytics', label: 'Analytics', icon: BarChart },
            { id: 'content', label: 'Content', icon: BookOpen },
            { id: 'students', label: 'Students', icon: Users },
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
                      <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
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
                      <h3 className="font-bold mb-4">Reading Resources</h3>
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
                    </div>

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                      <Button onClick={saveChapter}>Save Chapter Changes</Button>
                    </div>
                  </GlassCard>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6">Curriculum Content Management</h2>
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
                <h2 className="text-2xl font-bold">Student Directory</h2>
                <Input 
                  label="" 
                  placeholder="Search students..." 
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
                            <div className="w-full bg-brand-dark-1 rounded-full h-2 mb-1 border border-white/5">
                              <div className="bg-brand-gold h-full rounded-full" style={{ width: `${(Object.keys(u.progress || {}).length / chapters.length) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-500">{Object.keys(u.progress || {}).length}/10 Chap</span>
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
              <GlassCard className="space-y-6">
                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2"><Zap size={18} className="text-brand-gold" /> AI Quiz Generator Integration</h3>
                  <p className="text-sm text-gray-400 mb-4">You need an Anthropic API Key to use the automatic quiz generation feature.</p>
                  <Input type="password" label="Anthropic API Key" placeholder="sk-ant-..." className="mb-4" />
                  <Button>Save Settings</Button>
                </div>
              </GlassCard>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
