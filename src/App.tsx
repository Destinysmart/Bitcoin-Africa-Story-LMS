import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initStorage, getCurrentUser } from './lib/storage';
import AppLayout from './components/layout/AppLayout';

// Pages - Lazy loaded for code splitting
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

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

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
          <Suspense fallback={<LoadingFallback />}>
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
