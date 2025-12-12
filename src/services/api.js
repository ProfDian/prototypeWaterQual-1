/**
 * ========================================
 * API SERVICE (Base)
 * ========================================
 * Lokasi: src/services/api.js
 *
 * Base service untuk semua API calls
 * - Auto attach token
 * - Error handling
 * - Single source of truth untuk base URL
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Debug logging
console.log("🌐 API Configuration:");
console.log("   VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("   API_BASE_URL:", API_BASE_URL);
console.log("   Mode:", import.meta.env.MODE);

/**
 * Get auth token from localStorage
 */
const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Base fetch wrapper dengan auto token
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Debug logging
  console.log("🌐 API Request:", {
    url: `${API_BASE_URL}${endpoint}`,
    method: config.method || 'GET',
    hasToken: !!token
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Check if response is ok
    if (!response.ok) {
      // Handle 401 Unauthorized (token expired/invalid)
      if (response.status === 401) {
        console.error("🔒 Token expired or invalid, logging out...");

        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("currentIpalId");

        // Redirect to login page
        window.location.href = "/login?expired=true";

        throw new Error("Token expired. Please login again.");
      }

      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("❌ API Error:", error);
    console.error("   URL:", `${API_BASE_URL}${endpoint}`);
    console.error("   Error type:", error.name);
    console.error("   Error message:", error.message);
    throw error;
  }
};

/**
 * API Methods
 */
const api = {
  /**
   * GET request
   */
  get: (endpoint, options = {}) => {
    // Build URL with query params if provided
    let url = endpoint;
    if (options.params) {
      const searchParams = new URLSearchParams();
      Object.keys(options.params).forEach((key) => {
        if (options.params[key] !== undefined && options.params[key] !== null) {
          searchParams.append(key, options.params[key]);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
      // Remove params from options to avoid passing it to fetch
      delete options.params;
    }

    return apiFetch(url, {
      method: "GET",
      ...options,
    });
  },

  /**
   * POST request
   */
  post: (endpoint, body, options = {}) => {
    return apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * PUT request
   */
  put: (endpoint, body, options = {}) => {
    return apiFetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * DELETE request
   */
  delete: (endpoint, options = {}) => {
    return apiFetch(endpoint, {
      method: "DELETE",
      ...options,
    });
  },
};

export default api;
export { API_BASE_URL };
