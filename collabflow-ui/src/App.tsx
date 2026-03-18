// App.tsx - UPDATED VERSION
import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { TeamsList } from './pages/TeamsList';
import { TeamDetails } from './pages/TeamDetails';
import { InviteAccept } from './pages/InviteAccept';
import AuthForm from './components/auth/AuthForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectList } from './pages/ProjectsList';
import { ProjectDetails } from './pages/ProjectDetails';
import { KanbanWorkspace } from './pages/KanbanWorkspace';
import { Dashboard } from './pages/Dashboard';
import { ProfileSettings } from './pages/ProfileSettings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationBell } from './components/NotificationBell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function SmartRedirect() {
  const { currentUser } = useAuth();
  return <Navigate to={currentUser ? "/dashboard" : "/login"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <NotificationProvider>
            <BrowserRouter>
              <ErrorBoundary>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-slate-950">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<AuthForm />} />
                <Route path="/invite/:token" element={<InviteAccept />} />

                {/* Protected routes — redirect to /login if unauthenticated */}
                <Route element={<ProtectedRoute />}>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Settings */}
                  <Route path="/settings" element={<ProfileSettings />} />

                  {/* Teams */}
                  <Route path="/teams" element={<TeamsList />} />
                  <Route path="/teams/:teamId" element={<TeamDetails />} />

                  {/* Projects - nested under teams */}
                  <Route path="/teams/:teamId/projects" element={<ProjectList />} />
                  <Route path="/teams/:teamId/projects/:projectId" element={<ProjectDetails />} />

                  {/* Kanban Workspace */}
                  <Route
                    path="/teams/:teamId/projects/:projectId/workspace"
                    element={<KanbanWorkspace />}
                  />
                </Route>

                {/* Default redirect — smart: dashboard if logged in, login if not */}
                <Route path="/" element={<SmartRedirect />} />

                {/* 404 catch-all */}
                <Route path="*" element={<SmartRedirect />} />
              </Routes>
              <NotificationBell />
              </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </NotificationProvider>
        </ToastProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
