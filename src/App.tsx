import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import Objectives from './components/objectives/Objectives';
import KPIs from './components/kpis/KPIs';
import Team from './components/team/Team';
import Projects from './components/projects/Projects';
import Settings from './components/settings/Settings';
import Documentation from './components/documentation/Documentation';
import UserManagement from './components/users/UserManagement';
import Analytics from './components/analytics/Analytics';
import Reports from './components/reports/Reports';
import Notifications from './components/notifications/Notifications';
import Security from './components/security/Security';
import Departments from './components/departments/Departments';
import Planning from './components/planning/Planning';
import Messages from './components/messages/Messages';
import Integrations from './components/integrations/Integrations';
import API from './components/api/API';
import Support from './components/support/Support';
import OnboardingTour from './components/onboarding/OnboardingTour';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <>
      {user && <OnboardingTour />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/objectives/*" element={
          <PrivateRoute>
            <Objectives />
          </PrivateRoute>
        } />
        <Route path="/kpis" element={
          <PrivateRoute>
            <KPIs />
          </PrivateRoute>
        } />
        <Route path="/team" element={
          <PrivateRoute>
            <Team />
          </PrivateRoute>
        } />
        <Route path="/projects" element={
          <PrivateRoute>
            <Projects />
          </PrivateRoute>
        } />
        <Route path="/documentation" element={
          <PrivateRoute>
            <Documentation />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute adminOnly>
            <UserManagement />
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute adminOnly>
            <Analytics />
          </PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute adminOnly>
            <Reports />
          </PrivateRoute>
        } />
        <Route path="/notifications" element={
          <PrivateRoute>
            <Notifications />
          </PrivateRoute>
        } />
        <Route path="/security" element={
          <PrivateRoute adminOnly>
            <Security />
          </PrivateRoute>
        } />
        <Route path="/departments" element={
          <PrivateRoute adminOnly>
            <Departments />
          </PrivateRoute>
        } />
        <Route path="/planning" element={
          <PrivateRoute>
            <Planning />
          </PrivateRoute>
        } />
        <Route path="/messages" element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        <Route path="/integrations" element={
          <PrivateRoute adminOnly>
            <Integrations />
          </PrivateRoute>
        } />
        <Route path="/api" element={
          <PrivateRoute adminOnly>
            <API />
          </PrivateRoute>
        } />
        <Route path="/support" element={
          <PrivateRoute>
            <Support />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;