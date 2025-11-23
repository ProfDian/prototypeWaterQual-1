// src/components/layout/DashboardLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/80 via-cyan-50/70 to-sky-100/60 overflow-hidden backdrop-blur-3xl">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar - seamless dengan sidebar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-b from-transparent via-blue-50/10 to-cyan-50/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
