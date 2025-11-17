/**
 * ========================================
 * ALERT COUNT HOOK (LIGHTWEIGHT)
 * ========================================
 * Hook untuk mendapatkan HANYA total count alerts
 * Tidak fetch dokumen penuh - SANGAT EFISIEN!
 *
 * Cara kerja:
 * - Gunakan getCountFromServer() - GRATIS! (tidak kena charge)
 * - Atau query metadata saja
 *
 * Usage:
 * const { totalCount, activeCount, criticalCount } = useAlertCount(ipalId);
 */

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const useAlertCount = (ipalId) => {
  const [counts, setCounts] = useState({
    total: 0,
    active: 0,
    critical: 0,
    high: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ipalId) return;

    const fetchCounts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Query untuk count (TIDAK fetch dokumen penuh!)
        const baseQuery = collection(db, "alerts");

        // Total active alerts
        const activeQuery = query(
          baseQuery,
          where("ipal_id", "==", parseInt(ipalId)),
          where("status", "==", "active")
        );

        // Critical active alerts
        const criticalQuery = query(
          baseQuery,
          where("ipal_id", "==", parseInt(ipalId)),
          where("status", "==", "active"),
          where("severity", "==", "critical")
        );

        // High active alerts
        const highQuery = query(
          baseQuery,
          where("ipal_id", "==", parseInt(ipalId)),
          where("status", "==", "active"),
          where("severity", "==", "high")
        );

        // Get counts in parallel
        const [activeSnapshot, criticalSnapshot, highSnapshot] =
          await Promise.all([
            getCountFromServer(activeQuery),
            getCountFromServer(criticalQuery),
            getCountFromServer(highQuery),
          ]);

        const newCounts = {
          active: activeSnapshot.data().count,
          critical: criticalSnapshot.data().count,
          high: highSnapshot.data().count,
          total: activeSnapshot.data().count, // Total = active count
        };

        console.log("📊 Alert counts fetched:", newCounts);
        setCounts(newCounts);
        setIsLoading(false);
      } catch (err) {
        console.error("❌ Error fetching alert counts:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCounts();

    // Refresh count every 60 seconds (optional)
    const interval = setInterval(fetchCounts, 60000);

    return () => clearInterval(interval);
  }, [ipalId]);

  return {
    ...counts,
    isLoading,
    error,
    hasCritical: counts.critical > 0,
    hasHigh: counts.high > 0,
  };
};

export default useAlertCount;
