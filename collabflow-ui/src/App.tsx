import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { TeamsList } from './pages/TeamsList';
import { TeamDetails } from './pages/TeamDetails';
import { InviteAccept } from './pages/InviteAccept';
import AuthForm from './components/auth/AuthForm';
import { AuthProvider } from './context/AuthContext';
import { ProjectList } from './pages/ProjectsList';
import { ProjectDetails } from './pages/ProjectDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<AuthForm />} />
              
              {/* Teams */}
              <Route path="/teams" element={<TeamsList />} />
              <Route path="/teams/:teamId" element={<TeamDetails />} />
              <Route path="/invite/:token" element={<InviteAccept />} />
              
              {/* Projects - nested under teams */}
              <Route path="/teams/:teamId/projects" element={<ProjectList />} />
              <Route path="/teams/:teamId/projects/:projectId" element={<ProjectDetails />} />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;