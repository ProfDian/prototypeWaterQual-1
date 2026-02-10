/**
 * ========================================
 * AUTH SERVICE
 * ========================================
 * Lokasi: src/services/authService.js
 *
 * Handle authentication:
 * - Login
 * - Logout
 * - Get current user
 * - Check if authenticated
 */

import api from "./api";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase";

const authService = {
  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User data & token
   */
  login: async (email, password) => {
    try {
      console.log("🔐 Attempting login...");
      console.log("   Email:", email);
      console.log("   API URL:", import.meta.env.VITE_API_URL);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("✅ Login successful!");
      console.log("   User:", response.user?.email);
      console.log("   UID:", response.user?.uid);
      console.log("   Role:", response.user?.role);
      console.log(
        "   Token preview:",
        response.token?.substring(0, 20) + "...",
      );

      // Save to localStorage
      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        console.log("✅ Token & user saved to localStorage");
      }

      return response;
    } catch (error) {
      console.error("❌ Login failed:", error.message);
      console.error("   Error details:", error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    console.log("🚪 Logging out...");

    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("fcm_token"); // Also clear FCM token

    console.log("✅ Token, user, and FCM token cleared from localStorage");
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User data or null
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  },

  /**
   * Get token from localStorage
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem("token");
  },

  /**
   * Send password reset email
   * @param {string} email - User email address
   * @returns {Promise<void>}
   */
  sendPasswordResetEmail: async (email) => {
    console.log("📧 Sending password reset email to:", email);

    // STEP 1: Check if email exists in backend
    try {
      console.log("🔍 Checking if email exists in database...");
      const checkResponse = await api.post("/auth/check-email", { email });

      console.log("📋 Check email response:", checkResponse);

      // If exists is explicitly false, STOP HERE!
      if (checkResponse.success && checkResponse.exists === false) {
        console.log("❌ Email not found in database - STOPPING");
        throw new Error("No account found with this email address.");
      }

      // If exists is not true, something is wrong
      if (!checkResponse.exists) {
        console.log("⚠️  Unexpected response from API");
        throw new Error("No account found with this email address.");
      }

      console.log(
        "✅ Email exists in Firebase Auth, proceeding to send reset link",
      );
    } catch (error) {
      console.error("❌ API check error:", error);
      // Re-throw the error - DO NOT continue to Firebase
      throw error;
    }

    // STEP 2: Send email via Firebase (only if we reach here)
    try {
      // ALWAYS use production URL for password reset redirect
      // localhost is not whitelisted in Firebase Console
      // Redirect to login page after password reset
      const redirectUrl =
        "https://ipal-monitoring-teklingundip.vercel.app/login";

      const actionCodeSettings = {
        url: redirectUrl,
        handleCodeInApp: false,
      };

      console.log("📧 Password reset redirect URL:", redirectUrl);
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      console.log("✅ Password reset email sent successfully!");
      return { success: true };
    } catch (firebaseError) {
      console.error("❌ Firebase error:", firebaseError);

      let errorMessage = "Failed to send reset email. Please try again.";

      if (firebaseError.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (firebaseError.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (firebaseError.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (firebaseError.code === "auth/unauthorized-continue-uri") {
        errorMessage =
          "Password reset service is temporarily unavailable. Please contact administrator.";
      }

      throw new Error(errorMessage);
    }
  },
};

export default authService;
