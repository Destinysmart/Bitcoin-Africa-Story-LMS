import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { BookOpen, PlayCircle, Lock, Trophy, Star, Server, Globe2, Clock } from 'lucide-react';
import { getCurrentUser, getContent } from '../lib/storage';

const UPCOMING_COURSES = [
  {
    id: 'course-lightning',
    title: 'Lightning Node Operator',
    description: 'Learn how to set up, secure, and manage your own Lightning node. Route payments and earn routing fees.',
    icon: Server,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    tags: ['Advanced', 'Infrastructure'],
    duration: '4 Weeks',
  },
  {
    id: 'course-markets',
    title: 'Bitcoin in Emerging Markets',
    description: 'Deep dive into how Bitcoin is being adopted for cross-border payments and inflation hedging across the global south.',
    icon: Globe2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    tags: ['Economics', 'Intermediate'],
    duration: '3 Weeks',
  },
  {
    id: 'course-script',
    title: 'Mastering Bitcoin Script',
    description: 'Explore the technical foundations of Bitcoin. Learn about UTXOs, sighashes, and basic smart contracts.',
    icon: BookOpen,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    tags: ['Developer', 'Advanced'],
    duration: '6 Weeks',
  }
];

export default function Courses() {
  const navigate = useNavigate();
  const user = getCurrentUser() || {};
  const { chapters: rawChapters } = getContent();
  const chapters = Object.values(rawChapters || {}) as any[];
  
  const completedCount = chapters.filter((c: any) => user.progress?.[c.id]?.status === 'completed').length;
  const progressPercent = Math.round((completedCount / (chapters.length || 1)) * 100);

  const [selectedTag, setSelectedTag] = useState<string>('All');
  
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    // Adding some placeholder tags that were requested in case they're not in the initial array
    ['Beginner', 'AI', 'Development'].forEach(t => tags.add(t));
    UPCOMING_COURSES.forEach(c => c.tags.forEach(t => tags.add(t)));
    return ['All', ...Array.from(tags).sort()];
  }, []);

  const filteredCourses = useMemo(() => {
    if (selectedTag === 'All') return UPCOMING_COURSES;
    return UPCOMING_COURSES.filter(c => c.tags.includes(selectedTag));
  }, [selectedTag]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-gray-400">Manage your learning journey and explore new topics.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <PlayCircle className="text-brand-gold" /> Active Enrolments
        </h2>
        
        {/* Active Course Card */}
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
              <p className="text-gray-400 mb-6 max-w-xl">
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
              
              <Button onClick={() => navigate('/dashboard')}>
                Continue Learning →
              </Button>
            </div>
            
            <div className="w-full md:w-64 flex flex-col gap-3">
               <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                 <span className="text-gray-400 text-sm">Modules</span>
                 <span className="font-bold">{chapters.length}</span>
               </div>
               <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                 <span className="text-gray-400 text-sm">Duration</span>
                 <span className="font-bold flex items-center gap-2"><Clock size={16} /> ~10 Hours</span>
               </div>
               <div className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                 <span className="text-gray-400 text-sm">Certificate</span>
                 <span className="font-bold text-green-400">Included</span>
               </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Lock className="text-gray-400" /> Upcoming & Recommended
          </h2>
        </div>
        
        <div className="flex flex-wrap gap-2 pb-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === tag 
                  ? 'bg-brand-gold text-brand-black' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <GlassCard key={course.id} className="bg-black/40 border border-white/5 flex flex-col group relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="flex-1 relative z-10">
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
                 
                 <div className="relative z-10 pt-4 border-t border-white/5">
                   <Button variant="outline" className="w-full justify-center gap-2 opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                     <Lock size={16} /> Coming Soon
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
              We couldn't find any courses matching the "{selectedTag}" category. Check back later!
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setSelectedTag('All')}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
