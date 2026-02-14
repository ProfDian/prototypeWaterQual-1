/**
 * ========================================
 * STATUS CONFIG - Single Source of Truth
 * ========================================
 * Centralized status, severity, and entity color configurations.
 * All components should import from here instead of defining their own colors.
 *
 * Domains:
 * 1. Quality Status  → excellent, good, fair, poor, critical
 * 2. Severity        → critical, high, medium, low
 * 3. Entity Status   → active, maintenance, inactive
 * 4. Alert Status    → active, acknowledged, resolved
 */

// ========================================
// 1. QUALITY STATUS (from backend fuzzyService)
// Score ranges: excellent(≥85), good(70-84), fair(50-69), poor(30-49), critical(<30)
// ========================================

export const QUALITY_STATUS = {
  excellent: {
    label: "Excellent",
    labelId: "Sangat Baik",
    tailwind: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-300",
      borderAlt: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-800",
      gradient: "from-emerald-500 to-green-500",
      bgGradient: "from-emerald-50 to-green-50",
    },
    hex: "#10B981", // emerald-500
  },
  good: {
    label: "Good",
    labelId: "Baik",
    tailwind: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-300",
      borderAlt: "border-green-200",
      badge: "bg-green-100 text-green-800",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    hex: "#22C55E", // green-500
  },
  fair: {
    label: "Fair",
    labelId: "Sedang",
    tailwind: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-300",
      borderAlt: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800",
      gradient: "from-yellow-500 to-orange-400",
      bgGradient: "from-yellow-50 to-orange-50",
    },
    hex: "#EAB308", // yellow-500
  },
  poor: {
    label: "Poor",
    labelId: "Buruk",
    tailwind: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-300",
      borderAlt: "border-orange-200",
      badge: "bg-orange-100 text-orange-800",
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    hex: "#F97316", // orange-500
  },
  critical: {
    label: "Critical",
    labelId: "Sangat Buruk",
    tailwind: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-300",
      borderAlt: "border-red-200",
      badge: "bg-red-100 text-red-800",
      gradient: "from-red-500 to-rose-600",
      bgGradient: "from-red-50 to-rose-50",
    },
    hex: "#EF4444", // red-500
  },
};

// Score thresholds for quality status
export const QUALITY_THRESHOLDS = [
  { min: 85, status: "excellent" },
  { min: 70, status: "good" },
  { min: 50, status: "fair" },
  { min: 30, status: "poor" },
  { min: 0, status: "critical" },
];

// ========================================
// 2. SEVERITY (for alerts, violations, priorities)
// ========================================

export const SEVERITY = {
  critical: {
    label: "Critical",
    tailwind: {
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-500",
      borderAlt: "border-red-200",
      badge: "bg-red-100 text-red-800",
      icon: "bg-red-100 text-red-600",
      borderLeft: "border-l-4 border-red-500",
    },
    hex: "#DC2626", // red-600
  },
  high: {
    label: "High",
    tailwind: {
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-500",
      borderAlt: "border-orange-200",
      badge: "bg-orange-100 text-orange-800",
      icon: "bg-orange-100 text-orange-600",
      borderLeft: "border-l-4 border-orange-500",
    },
    hex: "#EA580C", // orange-600
  },
  medium: {
    label: "Medium",
    tailwind: {
      text: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      borderAlt: "border-yellow-200",
      badge: "bg-yellow-100 text-yellow-800",
      icon: "bg-yellow-100 text-yellow-600",
      borderLeft: "border-l-4 border-yellow-500",
    },
    hex: "#CA8A04", // yellow-600
  },
  low: {
    label: "Low",
    tailwind: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-500",
      borderAlt: "border-blue-200",
      badge: "bg-blue-100 text-blue-800",
      icon: "bg-blue-100 text-blue-600",
      borderLeft: "border-l-4 border-blue-500",
    },
    hex: "#2563EB", // blue-600
  },
};

// ========================================
// 3. ENTITY STATUS (IPAL, Sensor)
// ========================================

export const ENTITY_STATUS = {
  active: {
    label: "Active",
    tailwind: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
      badge: "bg-green-100 text-green-700",
    },
  },
  maintenance: {
    label: "Maintenance",
    tailwind: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
      badge: "bg-yellow-100 text-yellow-700",
    },
  },
  inactive: {
    label: "Inactive",
    tailwind: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      dot: "bg-gray-300",
      badge: "bg-gray-100 text-gray-600",
    },
  },
};

// ========================================
// 4. ALERT STATUS (lifecycle)
// ========================================

export const ALERT_STATUS = {
  active: {
    label: "Active",
    tailwind: {
      badge: "bg-red-100 text-red-700",
    },
  },
  acknowledged: {
    label: "Acknowledged",
    tailwind: {
      badge: "bg-yellow-100 text-yellow-700",
    },
  },
  resolved: {
    label: "Resolved",
    tailwind: {
      badge: "bg-green-100 text-green-700",
    },
  },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get quality status config (case-insensitive).
 * Handles: "excellent", "Excellent", "Sangat Baik", etc.
 */
export const getQualityConfig = (status) => {
  if (!status) return null;
  const key = status.toLowerCase();

  // Direct match
  if (QUALITY_STATUS[key]) return QUALITY_STATUS[key];

  // Indonesian mapping
  const idMap = {
    "sangat baik": "excellent",
    baik: "good",
    sedang: "fair",
    buruk: "poor",
    "sangat buruk": "critical",
  };
  const mapped = idMap[key];
  return mapped ? QUALITY_STATUS[mapped] : null;
};

/**
 * Get quality Tailwind classes: "bg-xxx text-xxx border-xxx"
 * Drop-in replacement for old getStatusColor()
 */
export const getQualityColor = (status) => {
  const config = getQualityConfig(status);
  if (!config) return "bg-gray-100 text-gray-700 border-gray-300";
  const { bg, text, border } = config.tailwind;
  return `${bg} ${text} ${border}`;
};

/**
 * Get quality hex color (for charts)
 */
export const getQualityHex = (status) => {
  const config = getQualityConfig(status);
  return config?.hex || "#9CA3AF";
};

/**
 * Get quality status config with icon (for StatsOverview)
 * @param {string} status
 * @param {object} icons - { up, down, neutral } icon components
 */
export const getQualityStatusConfig = (status, icons = {}) => {
  const config = getQualityConfig(status);
  if (!config) {
    return {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: icons.neutral || null,
      gradient: "from-gray-400 to-gray-500",
      bgGradient: "from-gray-50 to-gray-100",
      borderColor: "border-gray-300",
      textColor: "text-gray-700",
    };
  }
  const t = config.tailwind;
  const isNegative = ["poor", "critical"].includes(
    status?.toLowerCase() === "buruk" ||
      status?.toLowerCase() === "sangat buruk"
      ? status.toLowerCase()
      : status?.toLowerCase(),
  );
  const statusKey = status?.toLowerCase();
  const isNeg =
    statusKey === "poor" ||
    statusKey === "critical" ||
    statusKey === "buruk" ||
    statusKey === "sangat buruk";
  const isMid = statusKey === "fair" || statusKey === "sedang";

  return {
    bg: t.bg,
    text: t.text,
    border: t.borderAlt,
    icon: isNeg ? icons.down : isMid ? icons.neutral : icons.up,
    gradient: t.gradient,
    bgGradient: t.bgGradient,
    borderColor: t.border,
    textColor: t.text,
  };
};

/**
 * Get severity config (for alerts, violations, priorities)
 */
export const getSeverityConfig = (severity) => {
  if (!severity) return SEVERITY.low;
  return SEVERITY[severity.toLowerCase()] || SEVERITY.low;
};

/**
 * Get severity Tailwind text+bg classes
 */
export const getSeverityColor = (severity) => {
  const config = getSeverityConfig(severity);
  return `${config.tailwind.text} ${config.tailwind.bg}`;
};

/**
 * Get severity full styles (border-left, bg, badge, icon)
 * For AlertGroupCard-style components
 */
export const getSeverityStyles = (severity) => {
  const config = getSeverityConfig(severity);
  return {
    border: config.tailwind.borderLeft,
    bg: config.tailwind.bg,
    badge: config.tailwind.badge,
    icon: config.tailwind.icon,
  };
};

/**
 * Get entity status badge classes (for IPAL/Sensor status)
 */
export const getEntityStatusColor = (status) => {
  const config = ENTITY_STATUS[status] || ENTITY_STATUS.inactive;
  return config.tailwind.badge;
};

/**
 * Get alert lifecycle status badge classes
 */
export const getAlertStatusColor = (status) => {
  const config = ALERT_STATUS[status] || ALERT_STATUS.active;
  return config.tailwind.badge;
};

/**
 * Get all quality hex colors as a map (for charts)
 * Returns: { excellent: "#10B981", good: "#22C55E", ... }
 */
export const getQualityHexMap = () => {
  return Object.fromEntries(
    Object.entries(QUALITY_STATUS).map(([key, val]) => [key, val.hex]),
  );
};
