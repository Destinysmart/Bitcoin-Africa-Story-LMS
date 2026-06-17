import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initStorage, getCurrentUser } from './lib/storage';
import AppLayout from './components/layout/AppLayout';

// Lazily Load Pages for Maximum Performance & Code Splitting
const Landing = lazy(() => import('./pages/Landing'));
const SignUp = lazy(() => import('./pages/SignUp'));
const LogIn = lazy(() => import('./pages/LogIn'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chapter = lazy(() => import('./pages/Chapter'));
const Profile = lazy(() => import('./pages/Profile'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Certificate = lazy(() => import('./pages/Certificate'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const InstructorDashboard = lazy(() => import('./pages/InstructorDashboard'));
const Courses = lazy(() => import('./pages/Courses'));

// Custom Elegant Loading Fallback Component styled for absolute seamlessness
function PageLoader() {
  return (
    <div className="min-h-screen bg-brand-dark-2 flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        {/* Outer pulse */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-brand-gold/15 animate-ping" />
        {/* Core spinning circle */}
        <div className="w-12 h-12 rounded-full border-4 border-t-brand-gold border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <span className="absolute text-brand-gold text-lg font-bold">₿</span>
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wider text-gray-400 uppercase select-none animate-pulse">
        Loading Satoshi's network...
      </p>
    </div>
  );
}

// Protect routes component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin' && user.role !== 'instructor' && !user.onboardingComplete) return <Navigate to="/onboarding" />;
  
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
  if (user.role === 'admin' || user.role === 'instructor' || user.onboardingComplete) return <Navigate to="/dashboard" />;
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
          <Suspense fallback={<PageLoader />}>
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
              
              <Route path="/instructor" element={
                <ProtectedRoute><InstructorDashboard /></ProtectedRoute>
              } />
              
              <Route path="/courses" element={
                <ProtectedRoute><Courses /></ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}

