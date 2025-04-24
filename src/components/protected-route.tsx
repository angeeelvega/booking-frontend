import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import { getCookie } from "../utils/cookie-utils";
import AuthService from "../services/auth-service";

export function ProtectedRoute() {
  const { isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  
  // Immediately check if token cookie exists regardless of validation
  const hasTokenCookie = !!getCookie('auth_token');
  
  // Validate that the token is actually valid
  const isTokenValid = hasTokenCookie && AuthService.isAuthenticated();
  
  const isAuthorized = isAuthenticated || isTokenValid;

  // Show loading indicator when auth state is being determined
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If token exists but is invalid, clear it and redirect to login
  if (hasTokenCookie && !isTokenValid) {
    logout();
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect to login if not authenticated
  if (!isAuthorized) {
    // Remember the attempted URL to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Render the protected routes
  return <Outlet />;
} 