/**
 * ========================================
 * REACT QUERY HOOKS (SIMPLE VERSION)
 * ========================================
 * Custom hooks untuk data fetching dengan React Query
 * Sederhana dan mudah digunakan!
 */

import { useQuery } from "@tanstack/react-query";
import dashboardService from "../services/dashboardService";
import sensorService from "../services/sensorServices";
import { getAlerts, getAlertStats } from "../services/alertServices";

// ========================================
// DASHBOARD HOOKS
// ========================================

/**
 * Hook untuk dashboard summary
 * Auto-cached 30 detik (sesuai backend)
 */
export const useDashboardSummary = (ipalId, options = {}) => {
  return useQuery({
    queryKey: ["dashboard", "summary", ipalId],
    queryFn: () => dashboardService.getSummary(ipalId),
    staleTime: 30000, // 30 detik
    enabled: !!ipalId && options.enabled !== false, // Only fetch if ipalId exists
  });
};

/**
 * Hook untuk chart readings
 * Auto-cached 60 detik (sesuai backend)
 */
export const useDashboardReadings = (ipalId, options = {}) => {
  const {
    period = "week",
    limit = 100,
    enabled = true,
    refetchInterval,
    refetchOnWindowFocus,
  } = options;

  return useQuery({
    queryKey: ["dashboard", "readings", ipalId, period, limit],
    queryFn: () =>
      dashboardService.getReadingsForChart(ipalId, { period, limit }),
    staleTime: 30000, // 30 detik - more frequent updates
    enabled: !!ipalId && enabled, // Only fetch if ipalId exists
    refetchInterval, // Optional auto-refresh
    refetchOnWindowFocus, // Optional refresh on focus
  });
};

// ========================================
// SENSOR HOOKS
// ========================================

/**
 * Hook untuk sensor readings
 * Auto-cached 45 detik (sesuai backend)
 */
export const useSensorReadings = (filters = {}, options = {}) => {
  const { ipal_id, limit = 50, order = "desc" } = filters;
  const {
    enabled = true,
    staleTime = 30000,
    cacheTime = 60000,
    refetchInterval,
    refetchOnWindowFocus,
  } = options;

  return useQuery({
    queryKey: ["sensors", "readings", ipal_id, limit, order],
    queryFn: () => sensorService.getReadings(filters),
    staleTime, // Use custom staleTime from options
    cacheTime, // Use custom cacheTime from options
    enabled: !!ipal_id && enabled, // Only fetch if ipal_id exists
    refetchInterval, // Optional auto-refresh
    refetchOnWindowFocus, // Optional refresh on focus
  });
};

/**
 * Hook untuk sensor list
 * Auto-cached 60 detik (jarang berubah)
 */
export const useSensors = (filters = {}) => {
  const { ipal_id } = filters;

  return useQuery({
    queryKey: ["sensors", "list", ipal_id],
    queryFn: () => sensorService.getAllSensors(filters),
    staleTime: 60000, // 60 detik
  });
};

/**
 * Hook untuk sensor detail
 * Auto-cached 90 detik (metadata jarang berubah)
 */
export const useSensor = (sensorId) => {
  return useQuery({
    queryKey: ["sensors", "detail", sensorId],
    queryFn: () => sensorService.getSensorById(sensorId),
    staleTime: 90000, // 90 detik
    enabled: !!sensorId, // Hanya fetch jika sensorId ada
  });
};

/**
 * Hook untuk sensor history
 * Auto-cached 60 detik
 */
export const useSensorHistory = (sensorId, filters = {}) => {
  return useQuery({
    queryKey: ["sensors", "history", sensorId, filters],
    queryFn: () => sensorService.getSensorHistory(sensorId, filters),
    staleTime: 60000, // 60 detik
    enabled: !!sensorId,
  });
};

// ========================================
// ALERT HOOKS
// ========================================

/**
 * Hook untuk alerts list
 * Auto-cached 30 detik (perlu cukup fresh)
 *
 * ⚠️ NOTE: Untuk real-time alerts, gunakan dengan refetchInterval
 */
export const useAlerts = (filters = {}, enablePolling = false) => {
  return useQuery({
    queryKey: ["alerts", filters],
    queryFn: () => getAlerts(filters),
    staleTime: 30000, // 30 detik
    refetchInterval: enablePolling ? 30000 : false, // Auto-refresh setiap 30s jika enabled
  });
};

/**
 * Hook untuk alert statistics
 * Auto-cached 45 detik
 */
export const useAlertStats = (ipalId = 1) => {
  return useQuery({
    queryKey: ["alerts", "stats", ipalId],
    queryFn: () => getAlertStats(ipalId),
    staleTime: 45000, // 45 detik
  });
};

/**
 * Hook untuk active alerts count (untuk badge)
 * Auto-cached 30 detik dengan auto-refresh
 */
export const useActiveAlerts = (ipalId = 1) => {
  return useQuery({
    queryKey: ["alerts", "active", ipalId],
    queryFn: async () => {
      const response = await getAlerts({ ipal_id: ipalId, status: "active" });
      return {
        count: response.count || 0,
        alerts: response.data || [],
      };
    },
    staleTime: 30000, // 30 detik
    refetchInterval: 60000, // Auto-refresh setiap 60 detik
  });
};

// ========================================
// COMBINED HOOKS (untuk convenience)
// ========================================

/**
 * Hook untuk fetch semua data dashboard sekaligus
 * Returns: { summary, readings, isLoading, error }
 */
export const useDashboardData = (ipalId = 1, period = "week") => {
  const summary = useDashboardSummary(ipalId);
  const readings = useDashboardReadings(ipalId, { period });

  return {
    summary: summary.data,
    readings: readings.data,
    isLoading: summary.isLoading || readings.isLoading,
    error: summary.error || readings.error,
    isSuccess: summary.isSuccess && readings.isSuccess,
    refetch: () => {
      summary.refetch();
      readings.refetch();
    },
  };
};

/**
 * Hook untuk alerts page (dengan polling)
 * Returns: { alerts, stats, isLoading, error }
 */
export const useAlertsData = (ipalId = 1, enablePolling = true) => {
  const alerts = useAlerts({ ipal_id: ipalId }, enablePolling);
  const stats = useAlertStats(ipalId);

  return {
    alerts: alerts.data?.data || [],
    stats: stats.data?.data || null,
    isLoading: alerts.isLoading || stats.isLoading,
    error: alerts.error || stats.error,
    activeCount: stats.data?.data?.by_status?.active || 0,
    totalCount: stats.data?.data?.total || 0,
    refetch: () => {
      alerts.refetch();
      stats.refetch();
    },
  };
};

export default {
  useDashboardSummary,
  useDashboardReadings,
  useSensorReadings,
  useSensors,
  useSensor,
  useSensorHistory,
  useAlerts,
  useAlertStats,
  useActiveAlerts,
  useDashboardData,
  useAlertsData,
};
