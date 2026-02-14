/**
 * ========================================
 * REPORT SERVICE (Frontend)
 * ========================================
 * Lokasi: src/services/reportService.js
 *
 * Service untuk generate & download reports
 */

import api from "./api";

const reportService = {
  /**
   * Preview report summary before download
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Preview data
   */
  previewReport: async (filters = {}) => {
    try {
      const {
        start_date,
        end_date,
        ipal_id = 1,
        parameters = "ph,tds,temperature",
        location = "both",
      } = filters;

      console.log("👁️ Previewing report...", filters);
      console.log("📅 Date range:", start_date, "to", end_date);

      // Validation
      if (!start_date || !end_date) {
        throw new Error("Start date and end date are required");
      }

      // Build query params
      const queryParams = new URLSearchParams({
        start_date,
        end_date,
        ipal_id,
        parameters,
        location,
      });

      console.log("🔗 Query URL:", `/api/reports/preview?${queryParams}`);

      const response = await api.get(`/api/reports/preview?${queryParams}`);

      console.log("🔍 Response:", response);
      console.log("✅ Preview loaded");

      return response.preview;
    } catch (error) {
      console.error("❌ Failed to preview report:", error.message);
      throw error;
    }
  },

  /**
   * Download report (CSV, Excel, PDF)
   * @param {Object} options - Download options
   */
  downloadReport: async (options = {}) => {
    try {
      const {
        format,
        start_date,
        end_date,
        ipal_id = 1,
        parameters = "ph,tds,temperature",
        location = "both",
      } = options;

      console.log("📥 Downloading report...", options);

      if (!format || !start_date || !end_date) {
        throw new Error("Format, start_date, and end_date are required");
      }

      const queryParams = new URLSearchParams({
        format,
        start_date,
        end_date,
        ipal_id,
        parameters,
        location,
      });

      const token = localStorage.getItem("token");

      // ⚠️ IMPORTANT: Use direct backend URL, bypass Vite proxy for binary files
      const BACKEND_URL =
        import.meta.env.VITE_API_URL || "http://localhost:3000";
      const url = `${BACKEND_URL}/api/reports/export?${queryParams}`;

      console.log("🔗 Download URL:", url);

      // Fetch file as blob
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // ⚠️ CRITICAL: Disable any response transformation
        cache: "no-cache",
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", {
        contentType: response.headers.get("content-type"),
        contentLength: response.headers.get("content-length"),
        contentDisposition: response.headers.get("content-disposition"),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("text/html")) {
          throw new Error(
            "Backend returned HTML instead of file - check if backend is running!",
          );
        }

        if (contentType && contentType.includes("application/json")) {
          const error = await response.json();
          throw new Error(error.message || "Failed to download report");
        }

        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`,
        );
      }

      // Get filename
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `water_quality_report_${start_date}_${end_date}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else {
        const extensions = { csv: ".csv", excel: ".xlsx", pdf: ".pdf" };
        filename += extensions[format] || "";
      }

      console.log("📄 Filename:", filename);

      // Convert to blob
      const blob = await response.blob();
      console.log("📦 Blob size:", blob.size, "bytes");
      console.log("📦 Blob type:", blob.type);

      if (blob.size === 0) {
        throw new Error("Downloaded file is empty - check backend logs");
      }

      // Validate blob type
      if (blob.type.includes("text/html")) {
        throw new Error("Downloaded file is HTML page, not the actual report!");
      }

      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      console.log("✅ Report downloaded:", filename);

      return { success: true, filename };
    } catch (error) {
      console.error("❌ Failed to download report:", error);
      console.error("Error details:", error.message);
      throw error;
    }
  },

  /**
   * Get quick date presets
   * @returns {Object} Date presets
   */
  getDatePresets: () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const lastMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1,
    );
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };

    return {
      today: {
        label: "Today",
        start_date: formatDate(today),
        end_date: formatDate(today),
      },
      yesterday: {
        label: "Yesterday",
        start_date: formatDate(yesterday),
        end_date: formatDate(yesterday),
      },
      last7Days: {
        label: "Last 7 Days",
        start_date: formatDate(last7Days),
        end_date: formatDate(today),
      },
      last30Days: {
        label: "Last 30 Days",
        start_date: formatDate(last30Days),
        end_date: formatDate(today),
      },
      thisMonth: {
        label: "This Month",
        start_date: formatDate(thisMonthStart),
        end_date: formatDate(today),
      },
      lastMonth: {
        label: "Last Month",
        start_date: formatDate(lastMonthStart),
        end_date: formatDate(lastMonthEnd),
      },
    };
  },

  /**
   * Validate date range
   * @param {string} start_date - Start date (YYYY-MM-DD)
   * @param {string} end_date - End date (YYYY-MM-DD)
   * @returns {Object} Validation result
   */
  validateDateRange: (start_date, end_date) => {
    if (!start_date || !end_date) {
      return {
        valid: false,
        error: "Please select both start and end dates",
      };
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (start > end) {
      return {
        valid: false,
        error: "Start date must be before end date",
      };
    }

    if (end > today) {
      return {
        valid: false,
        error: "End date cannot be in the future",
      };
    }

    // Check if range is too large (>1 year)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (daysDiff > 365) {
      return {
        valid: false,
        error: "Date range cannot exceed 1 year",
      };
    }

    // Warning for large datasets
    if (daysDiff > 90) {
      return {
        valid: true,
        warning: "Large date range may take longer to generate",
        days: daysDiff,
      };
    }

    return {
      valid: true,
      days: daysDiff,
    };
  },

  /**
   * Format date for display
   * @param {string} dateString - Date string (YYYY-MM-DD)
   * @returns {string} Formatted date
   */
  formatDateDisplay: (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  },

  /**
   * Calculate estimated file size
   * @param {number} recordCount - Number of records
   * @param {string} format - File format
   * @returns {string} Estimated size
   */
  estimateFileSize: (recordCount, format) => {
    // Rough estimates in KB
    const sizePerRecord = {
      csv: 0.5, // ~500 bytes per record
      excel: 1.5, // ~1.5KB per record (with formatting)
      pdf: 0.8, // ~800 bytes per record
    };

    const baseSize = {
      csv: 1, // 1KB header
      excel: 10, // 10KB base (workbook structure)
      pdf: 50, // 50KB base (PDF structure, fonts, etc)
    };

    const sizeKB = baseSize[format] + recordCount * sizePerRecord[format];

    if (sizeKB < 1024) {
      return `${Math.round(sizeKB)} KB`;
    } else {
      return `${(sizeKB / 1024).toFixed(2)} MB`;
    }
  },
};

export default reportService;
