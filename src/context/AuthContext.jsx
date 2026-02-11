/**
 * ========================================
 * AUTH CONTEXT
 * ========================================
 * Lokasi: src/context/AuthContext.jsx
 *
 * Global state management untuk authentication
 * Semua component bisa akses user & token
 */

import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authServices";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentUser = authService.getCurrentUser();
        const currentToken = authService.getToken();

        if (currentUser && currentToken) {
          setUser(currentUser);
          setToken(currentToken);
          console.log("✅ User loaded from localStorage:", currentUser.email);
        } else {
          console.log("ℹ️  No user logged in");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);

      setUser(response.user);
      setToken(response.token);

      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    console.log("✅ User logged out");
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!(user && token);
  };

  const value = {
    user,
    setUser,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
