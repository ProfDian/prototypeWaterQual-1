/**
 * ========================================
 * IPAL SERVICE
 * ========================================
 * API calls for IPAL management (Full CRUD)
 */

import api from "./api";

const ipalService = {
  /**
   * Get all IPALs
   */
  async getAllIpals(params = {}) {
    try {
      const response = await api.get("/api/ipals", { params });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching IPALs:", error);
      throw error;
    }
  },

  /**
   * Get IPAL by ID
   */
  async getIpalById(ipalId) {
    try {
      const response = await api.get(`/api/ipals/${ipalId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching IPAL ${ipalId}:`, error);
      throw error;
    }
  },

  /**
   * Get IPAL statistics
   */
  async getIpalStats(ipalId) {
    try {
      const response = await api.get(`/api/ipals/${ipalId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching IPAL stats ${ipalId}:`, error);
      throw error;
    }
  },

  /**
   * Create new IPAL
   * @param {Object} data - { ipal_location, ipal_description, address?, capacity?, contact_person?, contact_phone?, coordinates?, operational_hours? }
   */
  async createIpal(data) {
    try {
      const response = await api.post("/api/ipals", data);
      return response;
    } catch (error) {
      console.error("❌ Error creating IPAL:", error);
      throw error;
    }
  },

  /**
   * Update IPAL
   * @param {number} ipalId - IPAL ID
   * @param {Object} data - Fields to update
   */
  async updateIpal(ipalId, data) {
    try {
      const response = await api.put(`/api/ipals/${ipalId}`, data);
      return response;
    } catch (error) {
      console.error(`❌ Error updating IPAL ${ipalId}:`, error);
      throw error;
    }
  },

  /**
   * Delete IPAL (SuperAdmin only)
   * @param {number} ipalId - IPAL ID
   */
  async deleteIpal(ipalId) {
    try {
      const response = await api.delete(`/api/ipals/${ipalId}`);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting IPAL ${ipalId}:`, error);
      throw error;
    }
  },
};

export default ipalService;
