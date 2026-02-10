/**
 * Water Quality Parameter Status Utility
 * Determines individual parameter status based on value and threshold
 */

/**
 * Get status for individual water quality parameter
 * @param {string} paramKey - Parameter key (ph, temperature, tds, turbidity)
 * @param {number} value - Parameter value
 * @param {string} location - Location (inlet or outlet)
 * @returns {string|null} Status (Excellent, Good, Fair, Poor, Very Poor)
 */
export const getParameterStatus = (paramKey, value, location = "outlet") => {
  if (value === null || value === undefined) return null;

  switch (paramKey) {
    case "ph":
      if (value < 6.0 || value > 9.0) return "Very Poor";
      if (value < 6.5 || value > 8.5) return "Poor";
      if (value >= 6.5 && value <= 8.5) return "Excellent";
      return "Good";

    case "temperature":
      if (value < 20 || value > 38) return "Poor";
      if (value > 35) return "Fair";
      if (value >= 20 && value <= 30) return "Excellent";
      return "Good";

    case "tds":
      const tdsThreshold = location === "outlet" ? 1000 : 2000;
      if (value > tdsThreshold * 1.2) return "Very Poor";
      if (value > tdsThreshold) return "Poor";
      if (value <= tdsThreshold * 0.5) return "Excellent";
      if (value <= tdsThreshold * 0.75) return "Good";
      return "Fair";

    case "turbidity":
      const turbidityThreshold = location === "outlet" ? 25 : 400;
      if (value > turbidityThreshold * 1.5) return "Very Poor";
      if (value > turbidityThreshold) return "Poor";
      if (value <= turbidityThreshold * 0.3) return "Excellent";
      if (value <= turbidityThreshold * 0.6) return "Good";
      return "Fair";

    default:
      return null;
  }
};

/**
 * Get status color classes for UI components
 * @param {string} status - Status string
 * @returns {string} Tailwind CSS classes
 */
export const getStatusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-700 border-gray-300";

  const statusMap = {
    Excellent: "bg-emerald-50 text-emerald-700 border-emerald-300",
    Good: "bg-green-50 text-green-700 border-green-300",
    Fair: "bg-yellow-50 text-yellow-700 border-yellow-300",
    Poor: "bg-orange-50 text-orange-700 border-orange-300",
    "Very Poor": "bg-red-50 text-red-700 border-red-300",
  };

  return statusMap[status] || "bg-gray-100 text-gray-700 border-gray-300";
};
