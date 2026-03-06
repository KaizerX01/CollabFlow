import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccessToken } from '../api/tokenStore';

/**
 * Wrapper route that redirects unauthenticated users to /login.
 *
 * Usage in App.tsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/teams" element={<TeamsList />} />
 *     ...
 *   </Route>
 */
export function ProtectedRoute() {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();
  const token = getAccessToken();

  // Wait for auth state to resolve before deciding
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // User is authenticated if we have either a user object or a valid token
  if (!currentUser && !token) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
