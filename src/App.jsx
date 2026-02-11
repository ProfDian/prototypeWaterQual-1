// src/App.jsx
import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { IPALProvider } from "./context/IPALContext";
import {
  requestNotificationPermission,
  registerFCMToken,
  onMessageListener,
} from "./services/fcmService";

// ⚡ Eager load - Always needed
import Login from "./pages/Login";
import ClearCache from "./pages/ClearCache";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import { LoadingScreen } from "./components/ui";

// ⚡ Lazy load pages - Load on demand
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sensors = lazy(() => import("./pages/Sensors"));
const SensorDetail = lazy(() => import("./pages/SensorDetail"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Reports = lazy(() => import("./pages/Reports"));
const ManageIPAL = lazy(() => import("./pages/ManageIPAL"));
const ManageSensor = lazy(() => import("./pages/ManageSensor"));
const ManageUser = lazy(() => import("./pages/ManageUser"));
const AccountInfo = lazy(() => import("./pages/AccountInfo"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  // ⭐ FCM INITIALIZATION
  useEffect(() => {
    let unsubscribe = null;

    const initFCM = async () => {
      // Check if user is logged in
      const token = localStorage.getItem("token");

      if (token) {
        console.log("🔔 Initializing FCM...");

        try {
          // Request notification permission & get FCM token
          const result = await requestNotificationPermission();

          if (result.success && result.token) {
            console.log("✅ FCM Token obtained");

            // Register token to backend
            await registerFCMToken(result.token);

            // Listen for foreground notifications (after successful init)
            unsubscribe = onMessageListener((payload) => {
              console.log("📬 Foreground notification received:", payload);

              // Optional: Show toast notification in UI
              // You can add react-toastify or custom notification here
              alert(
                `🔔 ${payload.notification.title}\n${payload.notification.body}`,
              );
            });
          } else {
            console.log("⚠️ FCM initialization skipped:", result.error);
          }
        } catch (error) {
          console.error("❌ FCM initialization error:", error);
        }
      } else {
        console.log("ℹ️ User not logged in, skipping FCM");
      }
    };

    // Initialize FCM
    initFCM();

    // Cleanup: unsubscribe from message listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []); // Run once on mount

  return (
    <IPALProvider>
      <Suspense fallback={<LoadingScreen message="Loading..." />}>
        <Routes>
          {/* Auth pages */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clear-cache" element={<ClearCache />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/sensors/:id" element={<SensorDetail />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/reports" element={<Reports />} />

            {/* Admin Management Routes */}
            <Route path="/manage/ipal" element={<ManageIPAL />} />
            <Route path="/manage/sensors" element={<ManageSensor />} />
            <Route path="/manage/users" element={<ManageUser />} />
            <Route path="/account" element={<AccountInfo />} />
          </Route>

          {/* 404 Not Found - catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </IPALProvider>
  );
}

export default App;
