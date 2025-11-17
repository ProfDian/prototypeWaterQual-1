/**
 * ========================================
 * REALTIME ALERTS HOOK
 * ========================================
 * Hook untuk mendapatkan active alerts secara real-time dari Firestore
 * Auto-update ketika ada alert baru, resolved, atau acknowledged
 *
 * Usage:
 * const { activeAlerts, alertCount, isListening } = useRealtimeAlerts(ipalId);
 */

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const useRealtimeAlerts = (ipalId, options = {}) => {
  const {
    maxAlerts = 10, // OPTIMIZED: Reduced from 20 to 10 (only critical ones)
    statusFilter = "active", // 'active' | 'all' | 'acknowledged' | 'resolved'
    severityFilter = null, // 'critical' | 'high' | 'medium' | 'low' (for filtering)
    priorityOnly = true, // OPTIMIZED: Only fetch critical/high by default
  } = options;

  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ipalId) {
      console.log("⚠️  useRealtimeAlerts: No ipalId provided");
      return;
    }

    console.log(`🔥 Starting Firestore listener for IPAL ${ipalId} alerts...`);
    setIsListening(true);
    setError(null);

    try {
      // Build query
      let q = query(
        collection(db, "alerts"),
        where("ipal_id", "==", parseInt(ipalId))
      );

      // Filter by status if specified
      if (statusFilter !== "all") {
        q = query(q, where("status", "==", statusFilter));
      }

      // 🎯 OPTIMIZED: Filter by severity for priority alerts only
      if (priorityOnly && !severityFilter) {
        // Only fetch critical & high severity (reduces reads significantly!)
        q = query(q, where("severity", "in", ["critical", "high"]));
      } else if (severityFilter) {
        // Custom severity filter
        q = query(q, where("severity", "==", severityFilter));
      }

      // Order by created_at descending
      q = query(q, orderBy("created_at", "desc"));

      // Limit results
      q = query(q, limit(maxAlerts));

      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const alerts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("⚡ ALERTS UPDATED from Firestore:", {
            count: alerts.length,
            status: statusFilter,
            latest: alerts[0]?.type || "none",
          });

          setActiveAlerts(alerts);
          setAlertCount(alerts.length);
          setError(null);

          // Optional: Trigger notification jika ada alert baru
          if (alerts.length > alertCount && alertCount > 0) {
            console.log("🚨 NEW ALERT DETECTED!");
            // Bisa trigger notification popup atau sound di sini
          }
        },
        (err) => {
          console.error("❌ Firestore alerts listener error:", err);
          setError(err.message);
          setIsListening(false);
        }
      );

      // Cleanup on unmount
      return () => {
        console.log("🔥 Stopping Firestore listener for alerts");
        unsubscribe();
        setIsListening(false);
      };
    } catch (err) {
      console.error("❌ Error setting up Firestore alerts listener:", err);
      setError(err.message);
      setIsListening(false);
    }
  }, [ipalId, statusFilter, severityFilter, priorityOnly, maxAlerts]);

  // Get alerts by severity
  const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");
  const highAlerts = activeAlerts.filter((a) => a.severity === "high");
  const mediumAlerts = activeAlerts.filter((a) => a.severity === "medium");
  const lowAlerts = activeAlerts.filter((a) => a.severity === "low");

  // Get alerts by type
  const violationAlerts = activeAlerts.filter((a) => a.type === "VIOLATION");
  const sensorAlerts = activeAlerts.filter((a) => a.type === "SENSOR_FAULT");
  const effectivenessAlerts = activeAlerts.filter(
    (a) => a.type?.includes("EFFECTIVENESS") || a.type?.includes("REDUCTION")
  );

  return {
    // Main data
    activeAlerts,
    alertCount,

    // By severity
    criticalAlerts,
    highAlerts,
    mediumAlerts,
    lowAlerts,
    criticalCount: criticalAlerts.length,
    highCount: highAlerts.length,

    // By type
    violationAlerts,
    sensorAlerts,
    effectivenessAlerts,
    violationCount: violationAlerts.length,
    sensorFaultCount: sensorAlerts.length,

    // Status
    isListening,
    error,
    hasAlerts: alertCount > 0,
  };
};

export default useRealtimeAlerts;
