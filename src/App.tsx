import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initStorage, getCurrentUser } from './lib/storage';
import AppLayout from './components/layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

import Chapter from './pages/Chapter';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import Certificate from './pages/Certificate';
import AdminPanel from './pages/AdminPanel';

import Courses from './pages/Courses';

// Protect routes component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  
  // Enforce AppLayout for protected routes (except onboarding)
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (user.onboardingComplete) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  useEffect(() => {
    initStorage();
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Main Routes */}
          <Route path="/onboarding" element={
            <OnboardingRoute><Onboarding /></OnboardingRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          
          <Route path="/chapter/:id" element={
            <ProtectedRoute><Chapter /></ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute><Leaderboard /></ProtectedRoute>
          } />
          
          <Route path="/certificate" element={
            <ProtectedRoute><Certificate /></ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute><AdminPanel /></ProtectedRoute>
          } />
          
          <Route path="/courses" element={
            <ProtectedRoute><Courses /></ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

