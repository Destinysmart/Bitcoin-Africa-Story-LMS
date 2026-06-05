import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard, Logo } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { loginUser } from '../lib/storage';

export default function LogIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      setTimeout(() => {
        const user = loginUser(email, password);
        toast(`Welcome back! ⚡`, 'success');
        if (user.role === 'admin') navigate('/admin');
        else if (!user.onboardingComplete) navigate('/onboarding');
        else navigate('/dashboard');
      }, 600);
    } catch (err: any) {
      toast(err.message || 'Login failed', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full h-[400px] bg-brand-gold/10 max-w-lg blur-[120px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <GlassCard>
          <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-6">Log in to continue your journey.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              type="email" 
              label="Email" 
              required 
              placeholder="satoshi@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <div>
              <Input 
                type="password" 
                label="Password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <div className="flex justify-between items-center mt-2">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-600 bg-brand-dark-2 text-brand-gold focus:ring-brand-gold focus:ring-offset-brand-dark-1"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-brand-gold hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>
            
            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-gold hover:underline">
              Sign up
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
