// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    console.log("🚫 User not authenticated, redirecting to login");
    console.log("   Intended path:", location.pathname + location.search);

    // ALWAYS preserve the intended destination for redirect after login
    const intendedPath = location.pathname + location.search;
    const loginPath = `/login?from=protected&redirect=${encodeURIComponent(intendedPath)}`;

    return <Navigate to={loginPath} replace />;
  }

  // Render children if authenticated
  return children;
};

export default ProtectedRoute;
