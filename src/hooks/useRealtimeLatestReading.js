/**
 * ========================================
 * REALTIME LATEST READING HOOK
 * ========================================
 * Hook untuk mendapatkan latest reading secara real-time dari Firestore
 * Includes: inlet, outlet, fuzzy_analysis (quality_score, violations, recommendations)
 *
 * Usage:
 * const { latestReading, qualityScore, violations, isListening } = useRealtimeLatestReading(ipalId);
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

export const useRealtimeLatestReading = (ipalId) => {
  const [latestReading, setLatestReading] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ipalId) {
      console.log("⚠️  useRealtimeLatestReading: No ipalId provided");
      return;
    }

    console.log(
      `🔥 Starting Firestore listener for IPAL ${ipalId} latest reading...`
    );
    setIsListening(true);
    setError(null);

    try {
      // Query: Get latest reading untuk IPAL ini
      const q = query(
        collection(db, "sensor_readings"),
        where("ipal_id", "==", parseInt(ipalId)),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      // Real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = {
              id: doc.id,
              ...doc.data(),
            };

            console.log("⚡ NEW READING from Firestore:", {
              timestamp: data.timestamp,
              quality_score: data.fuzzy_analysis?.quality_score,
              violations:
                data.fuzzy_analysis?.compliance?.violations?.length || 0,
            });

            setLatestReading(data);
            setError(null);
          } else {
            console.log("📭 No readings found for IPAL", ipalId);
            setLatestReading(null);
          }
        },
        (err) => {
          console.error("❌ Firestore listener error:", err);
          setError(err.message);
          setIsListening(false);
        }
      );

      // Cleanup on unmount
      return () => {
        console.log("🔥 Stopping Firestore listener for latest reading");
        unsubscribe();
        setIsListening(false);
      };
    } catch (err) {
      console.error("❌ Error setting up Firestore listener:", err);
      setError(err.message);
      setIsListening(false);
    }
  }, [ipalId]);

  // Derived values untuk convenience
  const qualityScore = latestReading?.fuzzy_analysis?.quality_score || 0;
  const status = latestReading?.fuzzy_analysis?.status || "unknown";
  const violations =
    latestReading?.fuzzy_analysis?.compliance?.violations || [];
  const recommendations = latestReading?.fuzzy_analysis?.recommendations || [];
  const inlet = latestReading?.inlet || null;
  const outlet = latestReading?.outlet || null;
  const timestamp = latestReading?.timestamp || null;

  return {
    // Raw data
    latestReading,

    // Convenience values
    qualityScore,
    status,
    violations,
    recommendations,
    inlet,
    outlet,
    timestamp,

    // Status
    isListening,
    error,
    hasData: !!latestReading,
  };
};

export default useRealtimeLatestReading;
