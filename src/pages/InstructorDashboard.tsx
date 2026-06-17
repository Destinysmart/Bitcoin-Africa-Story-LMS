import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { BookOpen, Users, CheckCircle, Clock } from 'lucide-react';
import { getUsers, getContent, getCurrentUser } from '../lib/storage';
import { useToast } from '../contexts/ToastContext';

export default function InstructorDashboard() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'instructor')) {
      toast('Access denied', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate, toast]);
  const [users, setUsers] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);

  useEffect(() => {
    const allUsers = Object.values(getUsers());
    // Exclude admins/instructors from the "student" view for simplicity
    setUsers(allUsers.filter((u: any) => !u.role || u.role === 'student'));
    
    const cont = getContent();
    const allChapters = Object.values(cont.chapters || {});
    // Mock instructor assignments: Assign roughly half the chapters to the current instructor
    // For a real app, this would use a mapping in the database
    setChapters(allChapters.slice(0, 4));
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

  // Aggregate recent submissions across assigned chapters
  const recentSubmissions = useMemo(() => {
    let submissions: any[] = [];
    const assignedIds = chapters.map(c => c.id);

    users.forEach((u) => {
      if (u.progress) {
        Object.keys(u.progress).forEach((chapterId) => {
          const cid = Number(chapterId);
          if (assignedIds.includes(cid) && u.progress[cid].quizPassed) {
            submissions.push({
              studentName: u.name,
              studentEmail: u.email,
              studentAvatar: u.avatar || '',
              chapterTitle: chapters.find(c => c.id === cid)?.title || `Chapter ${cid}`,
              chapterId: cid,
              // We'll mock the date since we didn't store completion date on progress.
              // Just randomizing a date within the last 7 days.
              date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
            });
          }
        });
      }
    });

    // Sort descending by date
    submissions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return submissions.slice(0, 10);
  }, [users, chapters]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
        <p className="text-gray-400">Welcome, {user?.name}. Here are the courses you are assigned to manage.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="bg-brand-gold/20 p-4 rounded-xl text-brand-gold">
            <BookOpen size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-400">Assigned Courses</div>
            <div className="text-2xl font-bold">{chapters.length}</div>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400">
            <Users size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-400">Active Students</div>
            <div className="text-2xl font-bold">{users.length}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-4">
          <div className="bg-green-500/20 p-4 rounded-xl text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Completions</div>
            <div className="text-2xl font-bold">{chapterStats.reduce((sum, c) => sum + c.passes, 0)}</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Course Overview</h2>
          <div className="space-y-4">
            {chapterStats.map((c) => (
              <GlassCard key={c.id} className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{c.title}</h3>
                    <p className="text-sm text-gray-400">Chapter {c.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-brand-gold">{c.completionRate}% Pass</div>
                    <div className="text-xs text-gray-500">{c.passes} / {c.started} passed</div>
                  </div>
                </div>
                
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="bg-brand-gold h-full rounded-full transition-all duration-1000"
                    style={{ width: `${c.started > 0 ? (c.passes / c.started) * 100 : 0}%` }}
                  />
                </div>
                
                <div className="flex gap-4 text-sm mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400"/>
                    <span><strong className="text-white">{c.started}</strong> Active</span>
                  </div>
                </div>
              </GlassCard>
            ))}
            {chapterStats.length === 0 && (
              <GlassCard className="p-8 text-center text-gray-500">
                You currently have no assigned courses.
              </GlassCard>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Recent Submissions (Mocked)</h2>
          <GlassCard className="p-0 overflow-hidden">
            {recentSubmissions.length > 0 ? (
              <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto hide-scrollbar">
                {recentSubmissions.map((sub: any, i: number) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center overflow-hidden font-bold relative shrink-0">
                        {sub.studentAvatar ? (
                          <img src={sub.studentAvatar} alt={sub.studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          sub.studentName.charAt(0).toUpperCase()
                        )}
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-black rounded-full p-0.5 border border-black">
                          <CheckCircle size={10} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{sub.studentName}</div>
                        <div className="text-xs text-brand-gold">Passed: {sub.chapterTitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {new Date(sub.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent submissions found.
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
