// src/pages/ManageUser.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Users,
  Shield,
  ShieldCheck,
  Mail,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/ui";

const ManageUser = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      const userList = data?.data || data?.users || data || [];
      setUsers(Array.isArray(userList) ? userList : []);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ email: "", password: "", username: "" });
    setShowForm(false);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await userService.createUser({
        email: form.email,
        password: form.password,
        username: form.username,
        role: "admin",
      });
      setSuccess(`Admin "${form.username}" created successfully`);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uid) => {
    try {
      setSubmitting(true);
      await userService.deleteUser(uid);
      setSuccess("User deleted successfully");
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-dismiss
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const getRoleIcon = (role) => {
    if (role === "superadmin")
      return <ShieldCheck className="w-4 h-4 text-amber-600" />;
    return <Shield className="w-4 h-4 text-cyan-600" />;
  };

  const getRoleBadge = (role) => {
    if (role === "superadmin") return "bg-amber-100 text-amber-700";
    return "bg-cyan-100 text-cyan-700";
  };

  if (loading) return <LoadingScreen message="Loading users..." />;

  // Only superadmin can access user management
  if (!isSuperAdmin) {
    return (
      <div className="text-center py-16">
        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
        <p className="text-sm text-gray-500 mt-1">
          Only SuperAdmin can manage users
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add or remove admin accounts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Admin
          </button>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold">Add New Admin</h3>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    placeholder="e.g. admin_tl"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="e.g. admin@example.com"
                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="Min. 6 characters"
                    className="w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                <p className="font-medium mb-1">Note:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>
                    User will be created with <strong>Admin</strong> role
                  </li>
                  <li>SuperAdmin can only be created via Firebase Console</li>
                  <li>Admin can manage IPAL & Sensors (except delete)</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.username || deleteConfirm.email}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.uid)}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Table */}
      {users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            No Users Found
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-cyan-700">
                          {(u.username || u.email || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {u.username || "-"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${getRoleBadge(u.role)}`}
                    >
                      {getRoleIcon(u.role)}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {u.role !== "superadmin" && u.uid !== currentUser?.uid && (
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUser;
