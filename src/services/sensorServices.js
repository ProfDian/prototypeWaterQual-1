/**
 * ========================================
 * SENSOR SERVICE
 * ========================================
 * Lokasi: src/services/sensorService.js
 *
 * Service untuk fetch sensor readings data
 */

import api from "./api";

const sensorService = {
  /**
   * Get sensor readings dengan filter
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of readings
   */
  getReadings: async (filters = {}) => {
    try {
      const {
        ipal_id = 1,
        limit = 50,
        order = "desc",
        start_date = null,
        end_date = null,
      } = filters;

      console.log("📊 Fetching sensor readings...");
      console.log("   Filters:", { ipal_id, limit, order });

      let queryParams = `ipal_id=${ipal_id}&limit=${limit}&order=${order}`;

      if (start_date) {
        queryParams += `&start_date=${start_date}`;
      }

      if (end_date) {
        queryParams += `&end_date=${end_date}`;
      }

      const response = await api.get(`/api/sensors/readings?${queryParams}`);

      console.log("✅ Sensor readings fetched successfully");
      console.log("   Total readings:", response.data?.length || 0);

      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch sensor readings:", error.message);
      throw error;
    }
  },

  /**
   * Get latest reading untuk IPAL tertentu
   * @param {number} ipalId - IPAL ID
   * @returns {Promise<Object|null>} Latest reading atau null
   */
  getLatestReading: async (ipalId = 1) => {
    try {
      console.log(`📊 Fetching latest reading for IPAL ${ipalId}...`);

      const readings = await sensorService.getReadings({
        ipal_id: ipalId,
        limit: 1,
        order: "desc",
      });

      if (readings && readings.length > 0) {
        console.log("✅ Latest reading found");
        return readings[0];
      }

      console.log("⚠️  No readings found");
      return null;
    } catch (error) {
      console.error("❌ Failed to fetch latest reading:", error.message);
      throw error;
    }
  },

  /**
   * Create new sensor reading (dari ESP32/Arduino)
   * @param {Object} data - Reading data
   * @returns {Promise<Object>} Response
   */
  createReading: async (data) => {
    try {
      console.log("📤 Creating new sensor reading...");

      const response = await api.post("/api/sensors/readings", data);

      console.log("✅ Sensor reading created successfully");
      console.log("   Reading ID:", response.data?.reading_id);

      return response;
    } catch (error) {
      console.error("❌ Failed to create sensor reading:", error.message);
      throw error;
    }
  },

  // ========================================
  // SENSOR METADATA (NEW)
  // ========================================

  /**
   * Get all sensors
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of sensors
   */
  getAllSensors: async (filters = {}) => {
    try {
      const { ipal_id, sensor_type, status, limit = 50 } = filters;

      console.log("🔧 Fetching all sensors...");

      let queryParams = `limit=${limit}`;
      if (ipal_id) queryParams += `&ipal_id=${ipal_id}`;
      if (sensor_type) queryParams += `&sensor_type=${sensor_type}`;
      if (status) queryParams += `&status=${status}`;

      const response = await api.get(`/api/sensors?${queryParams}`);

      console.log("🔍 DEBUG Response:", response);

      // Backend returns: { success: true, count: 8, online_count: 5, offline_count: 3, data: [...] }
      // Return the full response so frontend can access online_count
      const result = {
        sensors: response.data || [],
        count: response.count || 0,
        online_count: response.online_count || 0,
        offline_count: response.offline_count || 0,
      };

      console.log("✅ Sensors fetched:", result.sensors.length);
      console.log("   Online:", result.online_count);
      console.log("   Offline:", result.offline_count);

      return result;
    } catch (error) {
      console.error("❌ Failed to fetch sensors:", error.message);
      throw error;
    }
  },

  /**
   * Get sensor by ID
   * @param {string} sensorId - Sensor ID
   * @returns {Promise<Object>} Sensor object
   */
  getSensorById: async (sensorId) => {
    try {
      console.log(`🔧 Fetching sensor: ${sensorId}...`);

      const response = await api.get(`/api/sensors/${sensorId}`);

      console.log("🔍 DEBUG getSensorById response:", response);

      // api.get returns parsed JSON directly
      // Backend returns: { success: true, data: {...} }
      const sensor = response.data;

      console.log("✅ Sensor found:", sensor?.id);

      return sensor;
    } catch (error) {
      console.error("❌ Failed to fetch sensor:", error.message);
      throw error;
    }
  },

  /**
   * Get sensors by IPAL ID
   * @param {number} ipalId - IPAL ID
   * @returns {Promise<Array>} Array of sensors
   */
  getSensorsByIpal: async (ipalId) => {
    try {
      console.log(`🔧 Fetching sensors for IPAL ${ipalId}...`);

      const response = await api.get(`/api/sensors/ipal/${ipalId}`);

      console.log("✅ Sensors fetched:", response.data.count);

      return response.data.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch sensors by IPAL:", error.message);
      throw error;
    }
  },

  /**
   * Get latest reading untuk sensor tertentu
   * @param {string} sensorId - Sensor ID (e.g., "sensor-ph-inlet-001")
   * @returns {Promise<Object>} Sensor with latest reading
   */
  getSensorLatestReading: async (sensorId) => {
    try {
      console.log(`📊 Fetching latest reading for sensor ${sensorId}...`);

      const response = await api.get(`/api/sensors/${sensorId}/latest`);

      console.log("✅ Latest reading found");

      // api.get returns parsed JSON
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch sensor latest reading:", error.message);
      throw error;
    }
  },

  /**
   * Get historical data untuk sensor tertentu
   * @param {string} sensorId - Sensor ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Sensor with history
   */
  getSensorHistory: async (sensorId, filters = {}) => {
    try {
      const { limit = 100, start_date, end_date } = filters;

      console.log(`📈 Fetching history for sensor ${sensorId}...`);

      let queryParams = `limit=${limit}`;
      if (start_date) queryParams += `&start_date=${start_date}`;
      if (end_date) queryParams += `&end_date=${end_date}`;

      const response = await api.get(
        `/api/sensors/${sensorId}/history?${queryParams}`
      );

      console.log("🔍 DEBUG history response:", response);

      console.log("✅ History fetched:", response.count || 0, "readings");

      // api.get returns parsed JSON
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch sensor history:", error.message);
      throw error;
    }
  },

  /**
   * Add new sensor (Manager/Admin only)
   * @param {Object} data - Sensor data
   * @returns {Promise<Object>} Created sensor
   */
  addSensor: async (data) => {
    try {
      console.log("➕ Adding new sensor...");

      const response = await api.post("/api/sensors", data);

      console.log("✅ Sensor added:", response.data.data.sensor_id);

      return response.data;
    } catch (error) {
      console.error("❌ Failed to add sensor:", error.message);
      throw error;
    }
  },

  /**
   * Update sensor (Manager/Admin only)
   * @param {string} sensorId - Sensor ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated sensor
   */
  updateSensor: async (sensorId, data) => {
    try {
      console.log(`✏️ Updating sensor ${sensorId}...`);

      const response = await api.put(`/api/sensors/${sensorId}`, data);

      console.log("✅ Sensor updated");

      return response.data;
    } catch (error) {
      console.error("❌ Failed to update sensor:", error.message);
      throw error;
    }
  },

  /**
   * Delete sensor (Admin only)
   * @param {string} sensorId - Sensor ID
   * @returns {Promise<Object>} Response
   */
  deleteSensor: async (sensorId) => {
    try {
      console.log(`🗑️ Deleting sensor ${sensorId}...`);

      const response = await api.delete(`/api/sensors/${sensorId}`);

      console.log("✅ Sensor deleted");

      return response.data;
    } catch (error) {
      console.error("❌ Failed to delete sensor:", error.message);
      throw error;
    }
  },

  /**
   * Get sensor status (online/offline)
   * @param {string} sensorId - Sensor ID
   * @returns {Promise<Object>} Sensor status
   */
  getSensorStatus: async (sensorId) => {
    try {
      console.log(`🔍 Checking sensor status: ${sensorId}...`);

      const response = await api.get(`/api/sensors/${sensorId}/status`);

      console.log("✅ Status:", response.data.data.status);

      return response.data.data;
    } catch (error) {
      console.error("❌ Failed to fetch sensor status:", error.message);
      throw error;
    }
  },
};

export default sensorService;
