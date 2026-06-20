import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { GlassCard, Logo } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { registerUser } from '../lib/storage';

export default function SignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    role: 'student', // 'student' | 'instructor'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network
    setTimeout(() => {
      try {
        registerUser(formData);
        toast('Account created successfully! ⚡', 'success');
        if (formData.role === 'instructor') {
          navigate('/instructor');
        } else {
          navigate('/onboarding');
        }
      } catch (err: any) {
        toast(err.message || 'Failed to sign up', 'error');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[400px] bg-brand-gold/5 max-w-lg blur-[100px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <GlassCard>
          <h2 className="text-2xl font-bold mb-2">Create an account</h2>
          <p className="text-gray-400 text-sm mb-6">Earn sats while you learn Bitcoin.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Full Name" 
              required 
              placeholder="Satoshi Nakamoto"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input 
              type="email" 
              label="Email" 
              required 
              placeholder="satoshi@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <Input 
              type="password" 
              label="Password (min 8 characters)" 
              required 
              minLength={8}
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-300">Join as:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    formData.role === 'student'
                      ? 'bg-brand-gold/15 border-brand-gold text-brand-gold shadow-[0_0_12px_rgba(253,184,19,0.15)]'
                      : 'bg-brand-dark-2/50 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span>🎓 Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'instructor' })}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    formData.role === 'instructor'
                      ? 'bg-brand-gold/15 border-brand-gold text-brand-gold shadow-[0_0_12px_rgba(253,184,19,0.15)]'
                      : 'bg-brand-dark-2/50 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
                  }`}
                >
                  <span>👨‍🏫 Instructor</span>
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full mt-2 lg:mt-4" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-gold hover:underline">
              Log in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
