/**
 * ========================================
 * IPAL SELECTOR COMPONENT
 * ========================================
 * Dropdown selector for switching between IPALs
 * Used in Navbar
 */

import { ChevronDown, MapPin, Activity, Droplet } from "lucide-react";
import { useIPAL } from "../../context/IPALContext";
import { getEntityStatusColor } from "../../utils/statusConfig";

const IPALSelector = () => {
  const { currentIpalId, ipalList, currentIpal, isLoading, switchIpal } =
    useIPAL();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg animate-pulse">
        <div className="w-5 h-5 bg-gray-300 rounded"></div>
        <div className="w-32 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (ipalList.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
        <MapPin className="w-4 h-4" />
        <span>No IPAL available</span>
      </div>
    );
  }

  // If only one IPAL, show as label (no dropdown)
  if (ipalList.length === 1) {
    const ipal = ipalList[0];
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
        <Droplet className="w-4 h-4 text-cyan-600" />
        <span className="text-sm font-medium text-gray-900">
          {ipal.ipal_location}
        </span>
      </div>
    );
  }

  // Multiple IPALs - show dropdown
  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 rounded-lg border border-cyan-200 transition-all duration-200 group-hover:shadow-md"
        type="button"
      >
        <Droplet className="w-4 h-4 text-cyan-600" />
        <span className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
          {currentIpal?.ipal_location || "Select IPAL"}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-transform group-hover:rotate-180" />
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select IPAL Location
            </p>
          </div>

          <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
            {ipalList.map((ipal) => {
              const isActive = ipal.ipal_id === currentIpalId;

              return (
                <button
                  key={ipal.ipal_id}
                  onClick={() => switchIpal(ipal.ipal_id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive ? "bg-white/20" : "bg-cyan-100"
                      }`}
                    >
                      <MapPin
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : "text-cyan-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {ipal.ipal_location}
                      </p>
                      {ipal.ipal_description && (
                        <p
                          className={`text-xs mt-0.5 line-clamp-1 ${
                            isActive ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          {ipal.ipal_description}
                        </p>
                      )}

                      {/* Quick Info */}
                      <div className="flex items-center space-x-3 mt-1.5">
                        {ipal.sensor_count !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Activity
                              className={`w-3 h-3 ${
                                isActive ? "text-white/70" : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`text-xs ${
                                isActive ? "text-white/80" : "text-gray-500"
                              }`}
                            >
                              {ipal.sensor_count} sensors
                            </span>
                          </div>
                        )}

                        {ipal.status && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              isActive
                                ? "bg-white/20 text-white"
                                : getEntityStatusColor(ipal.status)
                            }`}
                          >
                            {ipal.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPALSelector;
