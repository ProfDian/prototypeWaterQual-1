// src/pages/ManageIPAL.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Activity,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Building2,
  Phone,
  User,
  Clock,
} from "lucide-react";
import ipalService from "../services/ipalService";
import { useIPAL } from "../context/IPALContext";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/ui";

const ManageIPAL = () => {
  const { user } = useAuth();
  const { refreshIpalList } = useIPAL();
  const isSuperAdmin = user?.role === "superadmin";

  const [ipals, setIpals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIpal, setEditingIpal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [form, setForm] = useState({
    ipal_location: "",
    ipal_description: "",
    address: "",
    capacity: "",
    contact_person: "",
    contact_phone: "",
    operational_hours: "24/7",
    status: "active",
    coordinates: {
      lat: "",
      lng: "",
      inlet: { lat: "", lng: "" },
      outlet: { lat: "", lng: "" },
    },
  });

  useEffect(() => {
    fetchIpals();
  }, []);

  const fetchIpals = async () => {
    try {
      setLoading(true);
      const data = await ipalService.getAllIpals();
      setIpals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch IPALs");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      ipal_location: "",
      ipal_description: "",
      address: "",
      capacity: "",
      contact_person: "",
      contact_phone: "",
      operational_hours: "24/7",
      status: "active",
      coordinates: {
        lat: "",
        lng: "",
        inlet: { lat: "", lng: "" },
        outlet: { lat: "", lng: "" },
      },
    });
    setEditingIpal(null);
    setShowForm(false);
  };

  const handleEdit = (ipal) => {
    const coords = ipal.coordinates || {};
    setForm({
      ipal_location: ipal.ipal_location || "",
      ipal_description: ipal.ipal_description || "",
      address: ipal.address || "",
      capacity: ipal.capacity || "",
      contact_person: ipal.contact_person || "",
      contact_phone: ipal.contact_phone || "",
      operational_hours: ipal.operational_hours || "24/7",
      status: ipal.status || "active",
      coordinates: {
        lat: coords.lat ?? "",
        lng: coords.lng ?? "",
        inlet: {
          lat: coords.inlet?.lat ?? "",
          lng: coords.inlet?.lng ?? "",
        },
        outlet: {
          lat: coords.outlet?.lat ?? "",
          lng: coords.outlet?.lng ?? "",
        },
      },
    });
    setEditingIpal(ipal);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Build payload with numeric coordinates
      const payload = { ...form };
      const c = form.coordinates;
      const hasCoords =
        c.lat !== "" ||
        c.lng !== "" ||
        c.inlet.lat !== "" ||
        c.inlet.lng !== "" ||
        c.outlet.lat !== "" ||
        c.outlet.lng !== "";
      if (hasCoords) {
        payload.coordinates = {
          lat: c.lat !== "" ? Number(c.lat) : null,
          lng: c.lng !== "" ? Number(c.lng) : null,
          inlet: {
            lat: c.inlet.lat !== "" ? Number(c.inlet.lat) : null,
            lng: c.inlet.lng !== "" ? Number(c.inlet.lng) : null,
          },
          outlet: {
            lat: c.outlet.lat !== "" ? Number(c.outlet.lat) : null,
            lng: c.outlet.lng !== "" ? Number(c.outlet.lng) : null,
          },
        };
      } else {
        delete payload.coordinates;
      }

      if (editingIpal) {
        await ipalService.updateIpal(editingIpal.ipal_id, payload);
        setSuccess(`IPAL "${form.ipal_location}" updated successfully`);
      } else {
        await ipalService.createIpal(payload);
        setSuccess(`IPAL "${form.ipal_location}" created successfully`);
      }
      resetForm();
      fetchIpals();
      refreshIpalList();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Operation failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ipalId) => {
    try {
      setSubmitting(true);
      await ipalService.deleteIpal(ipalId);
      setSuccess("IPAL deleted successfully");
      setDeleteConfirm(null);
      fetchIpals();
      refreshIpalList();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Delete failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-dismiss messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) return <LoadingScreen message="Loading IPAL data..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage IPAL</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, or remove IPAL facilities
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchIpals}
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
            Add IPAL
          </button>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold">
                {editingIpal ? "Edit IPAL" : "Add New IPAL"}
              </h3>
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
                  IPAL Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.ipal_location}
                  onChange={(e) =>
                    setForm({ ...form, ipal_location: e.target.value })
                  }
                  placeholder="e.g. IPAL Teknik Lingkungan Undip"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={form.ipal_description}
                  onChange={(e) =>
                    setForm({ ...form, ipal_description: e.target.value })
                  }
                  placeholder="e.g. IPAL milik Teknik Lingkungan Undip"
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="e.g. Jl. Prof. Sudarto, SH, Tembalang"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                    placeholder="e.g. 100 m³/hari"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Operational Hours
                  </label>
                  <input
                    type="text"
                    value={form.operational_hours}
                    onChange={(e) =>
                      setForm({ ...form, operational_hours: e.target.value })
                    }
                    placeholder="e.g. 24/7"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person in Charge
                  </label>
                  <input
                    type="text"
                    value={form.contact_person}
                    onChange={(e) =>
                      setForm({ ...form, contact_person: e.target.value })
                    }
                    placeholder="e.g. Admin Teknik Lingkungan"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.contact_phone}
                    onChange={(e) =>
                      setForm({ ...form, contact_phone: e.target.value })
                    }
                    placeholder="e.g. +62-24-76480678"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              {editingIpal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}

              {/* Coordinates Section */}
              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Coordinates
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Map Center Lat
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.coordinates.lat}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coordinates: {
                            ...form.coordinates,
                            lat: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. -7.0506"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Map Center Lng
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.coordinates.lng}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coordinates: {
                            ...form.coordinates,
                            lng: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 110.4397"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-500 mb-2">Inlet</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Lat
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.coordinates.inlet.lat}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coordinates: {
                            ...form.coordinates,
                            inlet: {
                              ...form.coordinates.inlet,
                              lat: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. -7.050665"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Lng
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.coordinates.inlet.lng}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coordinates: {
                            ...form.coordinates,
                            inlet: {
                              ...form.coordinates.inlet,
                              lng: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 110.44008"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <p className="text-xs font-medium text-gray-500 mb-2">Outlet</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Lat
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.coordinates.outlet.lat}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coordinates: {
                            ...form.coordinates,
                            outlet: {
                              ...form.coordinates.outlet,
                              lat: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. -7.050193"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Lng
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={form.coordinates.outlet.lng}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          coordinates: {
                            ...form.coordinates,
                            outlet: {
                              ...form.coordinates.outlet,
                              lng: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="e.g. 110.44035"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
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
                  {submitting ? "Saving..." : editingIpal ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Delete IPAL</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete{" "}
              <strong>{deleteConfirm.ipal_location}</strong>? All associated
              sensors will be deactivated.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.ipal_id)}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IPAL List */}
      {ipals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No IPAL Found</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Click &quot;Add IPAL&quot; to add a new IPAL facility
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ipals.map((ipal) => (
            <div
              key={ipal.ipal_id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {ipal.ipal_location}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {ipal.ipal_description}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    ipal.status === "active"
                      ? "bg-green-100 text-green-700"
                      : ipal.status === "maintenance"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ipal.status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                {ipal.address && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{ipal.address}</span>
                  </div>
                )}
                {ipal.capacity && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{ipal.capacity}</span>
                  </div>
                )}
                {ipal.contact_person && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <User className="w-3.5 h-3.5" />
                    <span>{ipal.contact_person}</span>
                  </div>
                )}
                {ipal.contact_phone && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{ipal.contact_phone}</span>
                  </div>
                )}
              </div>

              {/* ID Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  IPAL ID: {ipal.ipal_id}
                </span>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ipal)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setDeleteConfirm(ipal)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageIPAL;
