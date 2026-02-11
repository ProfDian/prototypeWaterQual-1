// src/components/layout/Sidebar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdSensors,
  MdNotifications,
  MdAssessment,
  MdLogout,
  MdClose,
  MdWaterDrop,
  MdDeviceHub,
  MdPeople,
  MdAccountTree,
  MdPerson,
} from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import LogoutModal from "../ui/LogoutModal";
import { useActiveAlerts } from "../../hooks/useQueryHooks";
import { useIPAL } from "../../context/IPALContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ⭐ USE IPAL CONTEXT - Dynamic IPAL ID
  const { currentIpalId } = useIPAL();

  // Role-based access
  const isAdmin = user?.role === "superadmin" || user?.role === "admin";
  const isSuperAdmin = user?.role === "superadmin";

  // Fetch active alerts count
  const { data: alertsData } = useActiveAlerts(currentIpalId);
  const activeAlertsCount = alertsData?.count || 0;

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    setSidebarOpen(false);
    navigate("/login"); // Redirect to login page
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-all duration-300 md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 bg-gradient-to-b from-slate-900 via-cyan-950 to-blue-950 text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:z-auto shadow-2xl flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Border kanan yang seamless dengan navbar */}
        <div className="hidden md:block absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/30 via-cyan-400/20 to-blue-500/20"></div>
        {/* Sidebar header - height yang sama dengan navbar */}
        <div className="relative px-5 py-3.5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-600/15 via-blue-600/15 to-cyan-600/15 backdrop-blur-sm flex-shrink-0">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent"></div>
          {/* Border bawah yang seamless */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-cyan-500/30 via-cyan-400/20 to-transparent"></div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-50"></div>
                <div className="relative p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-xl ring-2 ring-cyan-400/30">
                  <MdWaterDrop className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  IPAL Monitor
                </h1>
                <p className="text-xs text-cyan-300/90 font-medium">
                  Teknik Lingkungan Universitas Diponegoro
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50 active:scale-95"
              aria-label="Close sidebar"
            >
              <MdClose className="w-5 h-5 text-white/80 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto custom-scrollbar">
          {/* Main Menu */}
          <div className="mb-6">
            <h2 className="px-3 mb-3 text-[10px] font-bold text-cyan-300/70 uppercase tracking-widest">
              SideBar
            </h2>
            <div className="space-y-1">
              <NavItem
                to="/dashboard"
                icon={<MdDashboard />}
                label="Dashboard"
                onClick={() => setSidebarOpen(false)}
              />
              <NavItem
                to="/sensors"
                icon={<MdSensors />}
                label="Sensors"
                onClick={() => setSidebarOpen(false)}
              />
              <NavItem
                to="/alerts"
                icon={<MdNotifications />}
                label="Alerts"
                badge={activeAlertsCount > 0 ? activeAlertsCount : null}
                onClick={() => setSidebarOpen(false)}
              />
              <NavItem
                to="/reports"
                icon={<MdAssessment />}
                label="Reports"
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          </div>

          {/* Admin Menu - Only for admin & superadmin */}
          {isAdmin && (
            <div className="mb-6">
              <h2 className="px-3 mb-3 text-[10px] font-bold text-cyan-300/70 uppercase tracking-widest">
                Management
              </h2>
              <div className="space-y-1">
                <NavItem
                  to="/manage/ipal"
                  icon={<MdAccountTree />}
                  label="Manage IPAL"
                  onClick={() => setSidebarOpen(false)}
                />
                <NavItem
                  to="/manage/sensors"
                  icon={<MdDeviceHub />}
                  label="Manage Sensors"
                  onClick={() => setSidebarOpen(false)}
                />
                {isSuperAdmin && (
                  <NavItem
                    to="/manage/users"
                    icon={<MdPeople />}
                    label="Manage Users"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Account */}
          <div className="mb-6">
            <h2 className="px-3 mb-3 text-[10px] font-bold text-cyan-300/70 uppercase tracking-widest">
              Account
            </h2>
            <div className="space-y-1">
              <NavItem
                to="/account"
                icon={<MdPerson />}
                label="Account Info"
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </nav>

        {/* Logout */}
        <div className="flex-shrink-0 px-3 py-4 border-t border-white/10 bg-gradient-to-t from-slate-950/80 to-transparent backdrop-blur-sm">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-200 hover:text-white hover:bg-red-500/15 transition-all duration-200 group border border-transparent hover:border-red-400/20 active:scale-[0.98]"
          >
            <MdLogout className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.25);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </>
  );
};

const NavItem = ({ to, icon, label, badge, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/15 text-white shadow-lg shadow-blue-500/5 border border-blue-400/30 font-semibold"
            : "text-blue-100/90 hover:bg-white/8 hover:text-white hover:translate-x-0.5 border border-transparent hover:border-white/5"
        }`
      }
    >
      <div className="flex items-center space-x-3">
        <span
          className={`text-[22px] transition-all duration-200 group-hover:scale-110`}
        >
          {icon}
        </span>
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && (
        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30 animate-pulse">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

export default Sidebar;
