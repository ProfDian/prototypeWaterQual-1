// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MdMenu, MdClose } from "react-icons/md";
import { Bell, BellDot, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LogoutModal from "../ui/LogoutModal";
import IPALSelector from "../ipal/IPALSelector";
import { useRealtimeAlerts } from "../../hooks/useRealtimeAlerts";
import { useIPAL } from "../../context/IPALContext";
import { getSeverityColor } from "../../utils/statusConfig";
import { format } from "date-fns";

const Navbar = ({ setSidebarOpen }) => {
  // Get user from AuthContext (same as Sidebar)
  const { user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);
  const navigate = useNavigate();

  // Get current IPAL from context
  const { selectedIPAL } = useIPAL();
  const ipalId = selectedIPAL || 1;

  // 🔥 Real-time alerts from Firestore
  const { activeAlerts, alertCount, criticalCount, isListening } =
    useRealtimeAlerts(ipalId, {
      maxAlerts: 5,
      statusFilter: "active",
      priorityOnly: true,
    });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
      if (
        notifMenuRef.current &&
        !notifMenuRef.current.contains(event.target)
      ) {
        setNotifMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    setProfileMenuOpen(false);
    navigate("/login"); // Redirect to login page
  };

  return (
    <header className="relative z-10 bg-gradient-to-r from-white/95 via-cyan-50/90 to-blue-50/95 backdrop-blur-xl shadow-lg shadow-cyan-500/5">
      {/* Border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/20 via-cyan-200/60 to-blue-200/60"></div>

      <div className="px-3 sm:px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl text-cyan-700 hover:text-cyan-900 hover:bg-cyan-100 transition-all duration-200 lg:hidden focus:outline-none focus:ring-2 focus:ring-cyan-500/30 active:scale-95"
              aria-label="Toggle sidebar"
            >
              <MdMenu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Logo & Title - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <img
                  src="/LogoIPAL.png"
                  alt="Logo IPAL"
                  className="w-10 h-10 object-contain rounded-lg shadow-md"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent tracking-tight">
                  IPAL Monitor
                </h2>
                <p className="text-xs text-cyan-600 font-semibold">
                  Department of Environmental Engineering - Diponegoro
                  University
                </p>
              </div>
            </div>

            {/* Logo & Title - Mobile/Tablet */}
            <div className="flex lg:hidden items-center gap-2 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src="/LogoIPAL.png"
                  alt="Logo IPAL"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded-lg shadow-md"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  IPAL Monitor
                </h1>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* IPAL Selector - Hidden on small mobile */}
            <div className="hidden sm:block">
              <IPALSelector />
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifMenuRef}>
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="relative p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-95"
                aria-label="Notifications"
              >
                {alertCount > 0 ? (
                  <BellDot className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                ) : (
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-lg">
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notifMenuOpen && (
                <div className="fixed inset-x-0 top-[60px] mx-2 sm:absolute sm:inset-x-auto sm:top-auto sm:mx-0 sm:right-0 sm:mt-2 sm:w-80 sm:max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-fadeIn z-50">
                  <div className="px-4 py-3.5 border-b border-slate-200/80 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Notifications
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {alertCount > 0
                          ? `${alertCount} active alert${
                              alertCount > 1 ? "s" : ""
                            }`
                          : "No active alerts"}
                        {criticalCount > 0 && (
                          <span className="ml-1 text-red-600 font-semibold">
                            ({criticalCount} critical)
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setNotifMenuOpen(false)}
                      className="sm:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MdClose className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                  <div className="max-h-[60vh] sm:max-h-[24rem] overflow-y-auto custom-scrollbar">
                    {!isListening ? (
                      <div className="px-4 py-6 text-center text-slate-500 text-sm">
                        Loading alerts...
                      </div>
                    ) : activeAlerts.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">
                          No active alerts
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          System is running normally
                        </p>
                      </div>
                    ) : (
                      activeAlerts.map((alert) => (
                        <NotificationItem
                          key={alert.id}
                          alert={alert}
                          onClick={() => {
                            setNotifMenuOpen(false);
                            navigate("/alerts");
                          }}
                        />
                      ))
                    )}
                  </div>
                  {alertCount > 0 && (
                    <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50/50">
                      <button
                        onClick={() => {
                          setNotifMenuOpen(false);
                          navigate("/alerts");
                        }}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View All Alerts →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 active:scale-95 group"
                aria-label="User menu"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-sm opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user?.username || user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-slate-600 leading-tight font-mono truncate max-w-[120px]">
                    {user?.email || ""}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* IPAL Selector - Mobile Only (shown below) */}
        <div className="sm:hidden mt-3 pt-3 border-t border-slate-200/50">
          <IPALSelector />
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
};

const NotificationItem = ({ alert, onClick }) => {
  const getSeverityIcon = (severity) => {
    if (severity === "critical" || severity === "high") {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Bell className="w-4 h-4" />;
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      const diff = Date.now() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return format(date, "MMM d, HH:mm");
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <div
      onClick={onClick}
      className="px-4 py-3.5 border-b border-slate-200/80 hover:bg-slate-50/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start space-x-3">
        <div
          className={`p-1.5 rounded-lg flex-shrink-0 ${getSeverityColor(
            alert.severity,
          )}`}
        >
          {getSeverityIcon(alert.severity)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-slate-900 truncate flex-1">
              {alert.type || "Alert"}
            </p>
            <span
              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getSeverityColor(
                alert.severity,
              )}`}
            >
              {alert.severity}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-1.5 leading-relaxed line-clamp-2">
            {alert.message ||
              alert.description ||
              "Water quality alert detected"}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">
            {timeAgo(alert.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
