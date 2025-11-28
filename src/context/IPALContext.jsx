/**
 * ========================================
 * IPAL CONTEXT
 * ========================================
 * Global state management for current IPAL
 * Allows dynamic switching between multiple IPALs
 */

import { createContext, useContext, useState, useEffect } from "react";
import ipalService from "../services/ipalService";
import { useAuth } from "./AuthContext";

const IPALContext = createContext();

/**
 * IPAL Provider Component
 */
export const IPALProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // State
  const [currentIpalId, setCurrentIpalId] = useState(null);
  const [ipalList, setIpalList] = useState([]);
  const [currentIpal, setCurrentIpal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all available IPALs
   */
  const fetchIpalList = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching IPAL list...");
      const response = await ipalService.getAllIpals({ status: "active" });
      console.log("📊 IPAL list response:", response);

      // Response is already the data array from ipalService
      if (Array.isArray(response) && response.length > 0) {
        setIpalList(response);
        console.log(`✅ Loaded ${response.length} IPAL(s)`);

        // If no IPAL selected yet, select the first one
        if (!currentIpalId) {
          const firstIpal = response[0];
          setCurrentIpalId(firstIpal.ipal_id);
          localStorage.setItem("currentIpalId", firstIpal.ipal_id.toString());
          console.log(
            `🎯 Auto-selected IPAL ${firstIpal.ipal_id}: ${firstIpal.ipal_location}`
          );
        }
      } else {
        console.warn("⚠️ No active IPALs found");
        setError("No active IPALs found");
      }
    } catch (err) {
      console.error("❌ Error fetching IPAL list:", err);
      setError(err.message || "Failed to fetch IPAL list");

      // Don't create fallback data if token expired (401)
      // User will be redirected to login by api.js
      if (!err.message?.includes("Token expired")) {
        // Fallback: If error, create dummy IPAL entry and use IPAL ID 1 as default
        console.log("🔄 Fallback: Using IPAL ID 1 as default");
        setCurrentIpalId(1);
        setIpalList([
          {
            ipal_id: 1,
            ipal_location: "IPAL Teknik Lingkungan Undip",
            status: "active",
            sensor_count: 8,
          },
        ]);
        localStorage.setItem("currentIpalId", "1");
      }
    } finally {
      setIsLoading(false);
      console.log("✅ IPAL Context loading completed");
    }
  };

  /**
   * Fetch current IPAL details
   */
  const fetchCurrentIpal = async (ipalId) => {
    try {
      console.log(`🔍 Fetching IPAL details for ID: ${ipalId}`);
      const response = await ipalService.getIpalById(ipalId);
      console.log(`📊 IPAL ${ipalId} response:`, response);

      // Backend returns direct data object, not {success: true, data: {...}}
      if (response && response.ipal_id) {
        setCurrentIpal(response);
        console.log(
          `✅ IPAL ${ipalId} details loaded:`,
          response.ipal_location
        );
      } else if (response.success && response.data) {
        // Fallback: if response has success wrapper
        setCurrentIpal(response.data);
        console.log(
          `✅ IPAL ${ipalId} details loaded:`,
          response.data.ipal_location
        );
      } else {
        console.warn(`⚠️ IPAL ${ipalId} response invalid:`, response);
        // Fallback: Use from ipalList if available
        const ipalFromList = ipalList.find((ipal) => ipal.ipal_id === ipalId);
        if (ipalFromList) {
          console.log(`🔄 Using IPAL from list as fallback`);
          setCurrentIpal(ipalFromList);
        }
      }
    } catch (err) {
      console.error(`❌ Error fetching IPAL ${ipalId}:`, err);

      // Don't fallback if token expired - user will be redirected to login
      if (!err.message?.includes("Token expired")) {
        // Fallback: Try to use from ipalList
        const ipalFromList = ipalList.find((ipal) => ipal.ipal_id === ipalId);
        if (ipalFromList) {
          console.log(`🔄 Error fallback: Using IPAL from list`);
          setCurrentIpal(ipalFromList);
        } else {
          console.error(`❌ No fallback available for IPAL ${ipalId}`);
        }
      }
    }
  };

  /**
   * Switch to different IPAL
   */
  const switchIpal = (ipalId) => {
    setCurrentIpalId(ipalId);
    localStorage.setItem("currentIpalId", ipalId.toString());
    console.log(`🔄 Switched to IPAL ${ipalId}`);
  };

  /**
   * Initialize: Load IPAL list and restore last selected IPAL from localStorage
   */
  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuthenticated()) {
      console.log("ℹ️  User not logged in, skipping IPAL fetch");
      setIsLoading(false);
      return;
    }

    console.log("✅ User authenticated, initializing IPAL Context");

    // Try to restore last selected IPAL from localStorage
    const savedIpalId = localStorage.getItem("currentIpalId");
    if (savedIpalId) {
      setCurrentIpalId(parseInt(savedIpalId));
    }

    // Fetch IPAL list only if logged in
    fetchIpalList();
  }, [isAuthenticated]); // Re-run when auth state changes

  /**
   * When currentIpalId changes, fetch its details
   */
  useEffect(() => {
    if (currentIpalId) {
      fetchCurrentIpal(currentIpalId);
    }
  }, [currentIpalId]);

  // Context value
  const value = {
    // State
    currentIpalId,
    ipalList,
    currentIpal,
    isLoading,
    error,

    // Actions
    switchIpal,
    refreshIpalList: fetchIpalList,
    refreshCurrentIpal: () => fetchCurrentIpal(currentIpalId),
  };

  return <IPALContext.Provider value={value}>{children}</IPALContext.Provider>;
};

/**
 * Custom hook to use IPAL context
 * @returns {Object} IPAL context value
 */
export const useIPAL = () => {
  const context = useContext(IPALContext);

  if (!context) {
    throw new Error("useIPAL must be used within IPALProvider");
  }

  return context;
};

export default IPALContext;
