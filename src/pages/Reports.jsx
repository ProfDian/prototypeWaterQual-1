// src/pages/Reports.jsx
import React, { useState, useEffect } from "react";
import {
  MdDownload,
  MdCalendarToday,
  MdFilterList,
  MdRefresh,
  MdVisibility,
  MdDescription,
  MdTableChart,
  MdPictureAsPdf,
  MdCheckCircle,
  MdWarning,
} from "react-icons/md";
import reportService from "../services/reportService";
import { InlineLoader } from "../components/ui";
import { useIPAL } from "../context/IPALContext";

const Reports = () => {
  // ⭐ USE IPAL CONTEXT - Dynamic IPAL ID
  const { currentIpalId, currentIpal } = useIPAL();
  // State
  const [datePreset, setDatePreset] = useState("last7Days");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedParameters, setSelectedParameters] = useState([
    "ph",
    "tds",
    "turbidity",
    "temperature",
  ]);
  const [selectedLocation, setSelectedLocation] = useState("both");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Get date presets
  const datePresets = reportService.getDatePresets();

  // All available parameters
  const allParameters = [
    { value: "ph", label: "pH", color: "blue" },
    { value: "tds", label: "TDS", color: "green" },
    { value: "turbidity", label: "Turbidity", color: "yellow" },
    { value: "temperature", label: "Temperature", color: "red" },
  ];

  // Get current date range
  const getCurrentDateRange = () => {
    if (datePreset === "custom") {
      return {
        start: customDateRange.start,
        end: customDateRange.end,
      };
    }
    const preset = datePresets[datePreset];
    return {
      start: preset?.start_date || "",
      end: preset?.end_date || "",
    };
  };

  // ✅ FIX: Load preview when filters change OR custom date changes
  useEffect(() => {
    const dateRange = getCurrentDateRange();

    console.log("🔄 useEffect triggered - Date range:", dateRange);

    // Only load preview if date range is valid
    if (dateRange.start && dateRange.end) {
      handlePreview();
    }
  }, [
    datePreset,
    selectedLocation,
    selectedParameters,
    customDateRange.start, // ✅ Monitor custom start date
    customDateRange.end, // ✅ Monitor custom end date
  ]);

  // Handle preview
  const handlePreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const dateRange = getCurrentDateRange();

      console.log("📅 Preview with date range:", dateRange);

      if (!dateRange.start || !dateRange.end) {
        setError("Please select both start and end dates");
        setPreview(null);
        setLoading(false);
        return;
      }

      const validation = reportService.validateDateRange(
        dateRange.start,
        dateRange.end,
      );

      if (!validation.valid) {
        setError(validation.error);
        setPreview(null);
        setLoading(false);
        return;
      }

      if (validation.warning) {
        console.warn(validation.warning);
      }

      const previewData = await reportService.previewReport({
        start_date: dateRange.start,
        end_date: dateRange.end,
        ipal_id: currentIpalId,
        parameters: selectedParameters.join(","),
        location: selectedLocation,
      });

      setPreview(previewData);
      setShowPreview(true);
    } catch (err) {
      console.error("❌ Preview error:", err);
      setError(err.message);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = async (format) => {
    try {
      setDownloading(true);
      setError(null);

      const dateRange = getCurrentDateRange();

      if (!dateRange.start || !dateRange.end) {
        alert("Please select both start and end dates");
        setDownloading(false);
        return;
      }

      const validation = reportService.validateDateRange(
        dateRange.start,
        dateRange.end,
      );

      if (!validation.valid) {
        alert(validation.error);
        setDownloading(false);
        return;
      }

      await reportService.downloadReport({
        format,
        start_date: dateRange.start,
        end_date: dateRange.end,
        ipal_id: currentIpalId,
        parameters: selectedParameters.join(","),
        location: selectedLocation,
      });

      alert(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (err) {
      console.error("❌ Download error:", err);
      setError(err.message);
      alert(`Failed to download report: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  // Toggle parameter selection
  const toggleParameter = (param) => {
    if (selectedParameters.includes(param)) {
      setSelectedParameters(selectedParameters.filter((p) => p !== param));
    } else {
      setSelectedParameters([...selectedParameters, param]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Water Quality Reports
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate and download comprehensive water quality reports
          </p>
        </div>
        <button
          onClick={handlePreview}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <MdRefresh className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Preview
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <MdFilterList className="text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Report Filters
          </h3>
        </div>

        <div className="space-y-6">
          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MdCalendarToday className="inline-block mr-1" />
              Date Range
            </label>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {Object.entries(datePresets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => {
                    setDatePreset(key);
                    console.log("📅 Selected preset:", key, preset);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    datePreset === key
                      ? "bg-primary-50 border-primary-500 text-primary-700 font-medium"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    console.log("📅 Custom start date changed:", newStart);
                    setCustomDateRange({
                      ...customDateRange,
                      start: newStart,
                    });
                    setDatePreset("custom");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    console.log("📅 Custom end date changed:", newEnd);
                    setCustomDateRange({
                      ...customDateRange,
                      end: newEnd,
                    });
                    setDatePreset("custom");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Date Range Display */}
            {getCurrentDateRange().start && getCurrentDateRange().end && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Selected Period:</strong>{" "}
                  {reportService.formatDateDisplay(getCurrentDateRange().start)}{" "}
                  - {reportService.formatDateDisplay(getCurrentDateRange().end)}
                </p>
                {datePreset === "custom" && (
                  <p className="text-xs text-blue-600 mt-1">
                    (Custom Date Range)
                  </p>
                )}
              </div>
            )}

            {/* Warning */}
            {datePreset === "custom" &&
              (!customDateRange.start || !customDateRange.end) && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <MdWarning className="inline mr-1" />
                    Please select both start and end dates for custom range
                  </p>
                </div>
              )}
          </div>

          {/* Parameters Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Parameters to Include
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allParameters.map((param) => (
                <button
                  key={param.value}
                  onClick={() => toggleParameter(param.value)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition ${
                    selectedParameters.includes(param.value)
                      ? "bg-primary-50 border-primary-500"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`text-sm font-medium ${
                      selectedParameters.includes(param.value)
                        ? "text-primary-700"
                        : "text-gray-700"
                    }`}
                  >
                    {param.label}
                  </span>
                  {selectedParameters.includes(param.value) && (
                    <MdCheckCircle className="text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Location
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["both", "inlet", "outlet"].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition ${
                    selectedLocation === loc
                      ? "bg-primary-50 border-primary-500 text-primary-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <MdWarning className="text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && preview && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MdVisibility className="text-gray-400 mr-2 h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-900">
                Report Preview
              </h3>
            </div>
            <div className="text-sm text-gray-500">
              Estimated size:{" "}
              <span className="font-medium text-gray-900">
                {reportService.estimateFileSize(preview.total_readings, "pdf")}
              </span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium mb-1">
                Total Readings
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {preview.total_readings}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium mb-1">
                Period Start
              </p>
              <p className="text-sm font-semibold text-green-900">
                {new Date(preview.period_start).toLocaleDateString("id-ID", {
                  dateStyle: "medium",
                })}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium mb-1">
                Period End
              </p>
              <p className="text-sm font-semibold text-purple-900">
                {new Date(preview.period_end).toLocaleDateString("id-ID", {
                  dateStyle: "medium",
                })}
              </p>
            </div>
          </div>

          {/* Parameter Statistics */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parameter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Readings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(preview.parameters).map(([key, stats]) => {
                  if (typeof stats !== "object") return null;
                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 uppercase">
                        {key.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {stats.avg}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {stats.min}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {stats.max}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stats.count}
                      </td>
                    </tr>
                  );
                })}

                {/* Removal Efficiency Rows */}
                {Object.entries(preview.parameters).map(([key, value]) => {
                  if (typeof value === "string" && key.includes("removal")) {
                    return (
                      <tr key={key} className="bg-green-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-800 uppercase">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td
                          colSpan={4}
                          className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-900"
                        >
                          {value}
                        </td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <InlineLoader message="Loading preview..." size="lg" />
        </div>
      )}

      {/* Download Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg shadow-sm border border-primary-200 p-6">
        <div className="flex items-center mb-4">
          <MdDownload className="text-primary-600 mr-2 h-5 w-5" />
          <h3 className="text-lg font-semibold text-gray-900">
            Download Report
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Choose your preferred format to download the complete report
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* CSV Button */}
          <button
            onClick={() => handleDownload("csv")}
            disabled={downloading || !preview}
            className="flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <MdTableChart className="text-gray-600 group-hover:text-primary-600 mr-3 h-6 w-6" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">CSV</p>
              <p className="text-xs text-gray-500">Raw data export</p>
            </div>
          </button>

          {/* Excel Button */}
          <button
            onClick={() => handleDownload("excel")}
            disabled={downloading || !preview}
            className="flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <MdDescription className="text-gray-600 group-hover:text-green-600 mr-3 h-6 w-6" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Excel</p>
              <p className="text-xs text-gray-500">With statistics</p>
            </div>
          </button>

          {/* PDF Button */}
          <button
            onClick={() => handleDownload("pdf")}
            disabled={downloading || !preview}
            className="flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <MdPictureAsPdf className="text-gray-600 group-hover:text-red-600 mr-3 h-6 w-6" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">PDF</p>
              <p className="text-xs text-gray-500">Formatted report</p>
            </div>
          </button>
        </div>

        {downloading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              Downloading report... Please wait.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
