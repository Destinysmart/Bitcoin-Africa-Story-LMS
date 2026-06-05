import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard, Logo } from '../components/ui/GlassCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for password reset
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast('Recovery email sent', 'success');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full h-[400px] bg-brand-gold/10 max-w-lg blur-[120px] pointer-events-none rounded-full" />
      
      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        
        <GlassCard>
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold mb-2">Reset password</h2>
              <p className="text-gray-400 text-sm mb-6">Enter your email and we'll send you instructions to reset your password.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  type="email" 
                  label="Email address" 
                  required 
                  placeholder="satoshi@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                
                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 bg-status-success/20 text-status-success rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
              <p className="text-gray-400 mb-6 text-sm">
                We've sent a password reset link to <span className="text-white">{email}</span>.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSubmitted(false)}>
                Try another email
              </Button>
            </div>
          )}
          
          <div className="mt-8 text-center text-sm">
            <Link to="/login" className="text-brand-gold hover:underline flex items-center justify-center gap-1">
              ← Back to Log In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
