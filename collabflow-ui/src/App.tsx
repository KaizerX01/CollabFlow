import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { TeamsList } from './pages/TeamsList';
import { TeamDetails } from './pages/TeamDetails';
import { InviteAccept } from './pages/InviteAccept';
import AuthForm from './components/auth/AuthForm';

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
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/teams" element={<TeamsList />} />
            <Route path='/login' element={<AuthForm />} />
            <Route path="/teams/:teamId" element={<TeamDetails />} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
