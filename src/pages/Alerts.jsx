// src/pages/Alerts.jsx
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Filter,
  RefreshCw,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { acknowledgeAlert, resolveAlert } from "../services/alertServices";
import AlertGroupList from "../components/alerts/AlertGroupList";
import { useAlertsData } from "../hooks/useQueryHooks";
import { LoadingScreen } from "../components/ui";
import { useRealtimeAlerts } from "../hooks/useRealtimeAlerts";
import { useAlertCount } from "../hooks/useAlertCount";

const Alerts = () => {
  // ⚡ FIRESTORE REAL-TIME - Top 10 critical alerts
  const {
    activeAlerts: realtimeCriticalAlerts,
    criticalCount,
    highCount,
    isListening,
  } = useRealtimeAlerts(1, {
    maxAlerts: 10,
    priorityOnly: true, // Only critical & high
  });

  // 📊 LIGHTWEIGHT - Total counts (FREE!)
  const {
    total: totalAlertCount,
    active: activeAlertCount,
    critical: criticalAlertCount,
  } = useAlertCount(1);

  // 🆕 REACT QUERY - Full alert history (API with pagination)
  const {
    alerts: allAlerts,
    stats,
    isLoading: loading,
    error,
    refetch: refresh,
  } = useAlertsData(1, false); // Disable polling, use Firestore instead

  // Last update time (untuk display)
  const [lastUpdate] = useState(new Date());
  const isPolling = isListening; // Real-time via Firestore

  // Local state
  const [filter, setFilter] = useState("all");
  const [parameterFilter, setParameterFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Combine real-time critical alerts + API historical alerts
  const alerts =
    filter === "active"
      ? [
          ...realtimeCriticalAlerts,
          ...allAlerts.filter(
            (a) =>
              a.status === "active" &&
              !realtimeCriticalAlerts.find((r) => r.id === a.id)
          ),
        ]
      : allAlerts;

  // Show loading screen on initial load
  if (loading && alerts.length === 0) {
    return <LoadingScreen message="Loading Alerts" icon={AlertTriangle} />;
  }

  // Filter alerts locally
  const filteredAlerts = alerts.filter((alert) => {
    const statusMatch = filter === "all" || alert.status === filter;
    const parameterMatch =
      parameterFilter === "all" ||
      alert.parameter?.toLowerCase() === parameterFilter.toLowerCase();
    return statusMatch && parameterMatch;
  });

  // Handle acknowledge all (bulk)
  const handleAcknowledgeAll = async (alertIds) => {
    try {
      // Acknowledge all alerts in parallel
      await Promise.all(alertIds.map((id) => acknowledgeAlert(id)));
      console.log(`✅ Acknowledged ${alertIds.length} alerts`);
      refresh();
    } catch (error) {
      console.error("❌ Error acknowledging alerts:", error);
      alert("Failed to acknowledge alerts");
    }
  };

  // Handle resolve all (bulk)
  const handleResolveAll = async (alertIds) => {
    try {
      // Resolve all alerts in parallel
      await Promise.all(alertIds.map((id) => resolveAlert(id)));
      console.log(`✅ Resolved ${alertIds.length} alerts`);
      refresh();
    } catch (error) {
      console.error("❌ Error resolving alerts:", error);
      alert("Failed to resolve alerts");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Alerts</h2>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {format(lastUpdate, "HH:mm:ss")}
              {isPolling && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <span className="animate-pulse mr-1">●</span> Live
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          {/* Refresh Button */}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`mr-2 h-5 w-5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all"
            >
              <Filter className="mr-2 h-5 w-5 text-gray-500" />
              Filter
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-10">
                {/* Status Filter */}
                <div className="py-2">
                  <p className="px-4 pb-1 text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </p>
                  {["all", "active", "acknowledged", "resolved"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`block w-full text-left px-4 py-2 text-sm rounded-md ${
                        filter === f
                          ? "bg-yellow-100 text-yellow-800 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {f === "all"
                        ? "All"
                        : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Parameter Filter */}
                <div className="py-2">
                  <p className="px-4 pb-1 text-xs font-semibold text-gray-500 uppercase">
                    Parameter
                  </p>
                  {["all", "ph", "temperature", "tds", "turbidity"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setParameterFilter(p)}
                      className={`block w-full text-left px-4 py-2 text-sm rounded-md ${
                        parameterFilter === p
                          ? "bg-yellow-100 text-yellow-800 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {p === "all" ? "All Parameters" : p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">
            ⚠️ Error loading alerts: {error}
          </p>
        </div>
      )}

      {/* Summary Cards - Real-time counts */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-4 flex items-center">
          <div className="flex-shrink-0 rounded-full bg-blue-100 p-4">
            <AlertTriangle className="h-7 w-7 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Alerts</h3>
            <p className="text-2xl font-bold text-gray-900">
              {totalAlertCount || 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">All time</p>
          </div>
        </div>

        <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-4 flex items-center">
          <div className="flex-shrink-0 rounded-full bg-orange-100 p-4">
            <AlertTriangle className="h-7 w-7 text-orange-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Active Alerts</h3>
            <p className="text-2xl font-bold text-gray-900">
              {activeAlertCount || 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isListening && <span className="text-green-600">● Live</span>}
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-4 flex items-center">
          <div className="flex-shrink-0 rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Critical</h3>
            <p className="text-2xl font-bold text-red-900">
              {criticalAlertCount || 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Needs attention</p>
          </div>
        </div>

        <div className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-4 flex items-center">
          <div className="flex-shrink-0 rounded-full bg-green-100 p-4">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "..." : stats?.by_status?.resolved || 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Completed</p>
          </div>
        </div>
      </div>

      {/* ⭐ NEW: Alert Group List */}
      <AlertGroupList
        alerts={filteredAlerts}
        loading={loading}
        onAcknowledgeAll={handleAcknowledgeAll}
        onResolveAll={handleResolveAll}
      />
    </div>
  );
};

export default Alerts;
