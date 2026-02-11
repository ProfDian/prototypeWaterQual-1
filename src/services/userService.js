/**
 * ========================================
 * USER SERVICE
 * ========================================
 * API calls for user management (SuperAdmin only)
 */

import api from "./api";

const userService = {
  /**
   * Get all users
   */
  async getAllUsers() {
    try {
      const response = await api.get("/api/users");
      return response;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Create new admin user (SuperAdmin only)
   * @param {Object} data - { email, password, username, role }
   */
  async createUser(data) {
    try {
      const response = await api.post("/api/users", {
        ...data,
        role: "admin", // Can only create admin
      });
      return response;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  },

  /**
   * Get own profile (full data including timestamps)
   */
  async getProfile() {
    try {
      const response = await api.get("/api/users/profile");
      return response;
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      throw error;
    }
  },

  /**
   * Update own profile (username)
   * @param {Object} data - { username }
   */
  async updateProfile(data) {
    try {
      const response = await api.put("/api/users/profile", data);
      return response;
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      throw error;
    }
  },

  /**
   * Update user
   * @param {string} uid - User UID
   * @param {Object} data - { username?, role? }
   */
  async updateUser(uid, data) {
    try {
      const response = await api.put(`/api/users/${uid}`, data);
      return response;
    } catch (error) {
      console.error(`❌ Error updating user ${uid}:`, error);
      throw error;
    }
  },

  /**
   * Delete user (SuperAdmin only)
   * @param {string} uid - User UID
   */
  async deleteUser(uid) {
    try {
      const response = await api.delete(`/api/users/${uid}`);
      return response;
    } catch (error) {
      console.error(`❌ Error deleting user ${uid}:`, error);
      throw error;
    }
  },

  /**
   * Reset user password (SuperAdmin only)
   * @param {string} uid - User UID
   * @param {string} newPassword - New password
   */
  async resetPassword(uid, newPassword) {
    try {
      const response = await api.post(`/api/users/${uid}/reset-password`, {
        newPassword,
      });
      return response;
    } catch (error) {
      console.error(`❌ Error resetting password for ${uid}:`, error);
      throw error;
    }
  },
};

export default userService;
