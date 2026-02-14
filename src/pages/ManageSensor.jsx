// src/pages/ManageSensor.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Cpu,
  Activity,
  Droplets,
  Thermometer,
} from "lucide-react";
import sensorService from "../services/sensorServices";
import ipalService from "../services/ipalService";
import { getEntityStatusColor } from "../utils/statusConfig";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/ui";

const SENSOR_TYPES = [
  {
    value: "ph",
    label: "pH",
    icon: Droplets,
    color: "text-blue-600 bg-blue-100",
  },
  {
    value: "tds",
    label: "TDS",
    icon: Activity,
    color: "text-green-600 bg-green-100",
  },
  {
    value: "temperature",
    label: "Temperature",
    icon: Thermometer,
    color: "text-red-600 bg-red-100",
  },
];

const SENSOR_LOCATIONS = [
  { value: "inlet", label: "Inlet" },
  { value: "outlet", label: "Outlet" },
];

const ManageSensor = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "superadmin";

  const [sensors, setSensors] = useState([]);
  const [ipals, setIpals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSensor, setEditingSensor] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterIpal, setFilterIpal] = useState("");

  // Form state
  const [form, setForm] = useState({
    ipal_id: "",
    sensor_type: "",
    sensor_location: "",
    sensor_description: "",
    status: "active",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sensorResult, ipalList] = await Promise.all([
        sensorService.getAllSensors({ limit: 200 }),
        ipalService.getAllIpals(),
      ]);
      setSensors(sensorResult.sensors || []);
      setIpals(Array.isArray(ipalList) ? ipalList : []);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSensors = async () => {
    try {
      const filters = { limit: 200 };
      if (filterIpal) filters.ipal_id = filterIpal;
      const result = await sensorService.getAllSensors(filters);
      setSensors(result.sensors || []);
    } catch (err) {
      setError("Failed to refresh sensors");
    }
  };

  useEffect(() => {
    if (!loading) fetchSensors();
  }, [filterIpal]);

  const resetForm = () => {
    setForm({
      ipal_id: "",
      sensor_type: "",
      sensor_location: "",
      sensor_description: "",
      status: "active",
    });
    setEditingSensor(null);
    setShowForm(false);
  };

  const handleEdit = (sensor) => {
    setForm({
      ipal_id: sensor.ipal_id || "",
      sensor_type: sensor.sensor_type || "",
      sensor_location: sensor.sensor_location || "",
      sensor_description: sensor.sensor_description || "",
      status: sensor.status || "active",
    });
    setEditingSensor(sensor);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingSensor) {
        await sensorService.updateSensor(editingSensor.id, {
          sensor_description: form.sensor_description,
          status: form.status,
        });
        setSuccess(`Sensor ${editingSensor.id} updated successfully`);
      } else {
        const payload = {
          ...form,
          ipal_id: Number(form.ipal_id),
        };
        await sensorService.createSensor(payload);
        setSuccess(
          `Sensor ${form.sensor_type.toUpperCase()} ${form.sensor_location} created successfully`,
        );
      }
      resetForm();
      fetchSensors();
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Operation failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sensorId) => {
    try {
      setSubmitting(true);
      await sensorService.deleteSensor(sensorId);
      setSuccess("Sensor deleted successfully");
      setDeleteConfirm(null);
      fetchSensors();
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

  const getSensorMeta = (type) =>
    SENSOR_TYPES.find((s) => s.value === type) || SENSOR_TYPES[0];

  const getIpalName = (ipalId) => {
    const ipal = ipals.find((i) => i.ipal_id === ipalId);
    return ipal ? ipal.ipal_location : `IPAL ${ipalId}`;
  };

  if (loading) return <LoadingScreen message="Loading sensors..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Sensors</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, or remove sensors from IPAL facilities
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchSensors}
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
            Add Sensor
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          Filter IPAL:
        </label>
        <select
          value={filterIpal}
          onChange={(e) => setFilterIpal(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">All IPALs</option>
          {ipals.map((ipal) => (
            <option key={ipal.ipal_id} value={ipal.ipal_id}>
              {ipal.ipal_location}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {sensors.length} sensor(s) found
        </span>
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

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="text-lg font-semibold">
                {editingSensor ? "Edit Sensor" : "Add New Sensor"}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {!editingSensor ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IPAL *
                    </label>
                    <select
                      required
                      value={form.ipal_id}
                      onChange={(e) =>
                        setForm({ ...form, ipal_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select IPAL</option>
                      {ipals.map((ipal) => (
                        <option key={ipal.ipal_id} value={ipal.ipal_id}>
                          {ipal.ipal_location} (ID: {ipal.ipal_id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sensor Type *
                    </label>
                    <select
                      required
                      value={form.sensor_type}
                      onChange={(e) =>
                        setForm({ ...form, sensor_type: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select Type</option>
                      {SENSOR_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sensor Location *
                    </label>
                    <select
                      required
                      value={form.sensor_location}
                      onChange={(e) =>
                        setForm({ ...form, sensor_location: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select Location</option>
                      {SENSOR_LOCATIONS.map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p>
                    <strong>Sensor ID:</strong> {editingSensor.id}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {editingSensor.sensor_type?.toUpperCase()}
                  </p>
                  <p>
                    <strong>Location:</strong> {editingSensor.sensor_location}
                  </p>
                  <p>
                    <strong>IPAL:</strong> {getIpalName(editingSensor.ipal_id)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description {editingSensor ? "" : "(optional)"}
                </label>
                <input
                  type="text"
                  value={form.sensor_description}
                  onChange={(e) =>
                    setForm({ ...form, sensor_description: e.target.value })
                  }
                  placeholder="e.g. Primary inlet pH sensor"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {editingSensor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              )}

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
                  {submitting ? "Saving..." : editingSensor ? "Update" : "Save"}
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
                <h3 className="font-semibold text-gray-900">Delete Sensor</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete sensor{" "}
              <strong>{deleteConfirm.id}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={submitting}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Grid */}
      {sensors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Cpu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            No Sensors Found
          </h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Click &quot;Add Sensor&quot; to register a new sensor
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((sensor) => {
            const meta = getSensorMeta(sensor.sensor_type);
            const Icon = meta.icon;
            return (
              <div
                key={sensor.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {meta.label}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {sensor.sensor_location}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${getEntityStatusColor(sensor.status)}`}
                  >
                    {sensor.status}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1 mb-3">
                  <p>
                    <span className="font-medium text-gray-600">ID:</span>{" "}
                    {sensor.id}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">IPAL:</span>{" "}
                    {getIpalName(sensor.ipal_id)}
                  </p>
                  {sensor.sensor_description && (
                    <p className="truncate">{sensor.sensor_description}</p>
                  )}
                  {sensor.latest_reading && (
                    <p>
                      <span className="font-medium text-gray-600">Latest:</span>{" "}
                      {sensor.latest_reading.value}{" "}
                      {sensor.latest_reading.unit || ""}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleEdit(sensor)}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => setDeleteConfirm(sensor)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageSensor;
