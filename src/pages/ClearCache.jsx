import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ClearCache = () => {
  const navigate = useNavigate();
  const [isCleared, setIsCleared] = useState(false);

  const handleClearCache = () => {
    // Clear localStorage
    localStorage.clear();
    console.log("✅ localStorage cleared");

    // Clear sessionStorage
    sessionStorage.clear();
    console.log("✅ sessionStorage cleared");

    // Clear cookies
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    console.log("✅ Cookies cleared");

    // Show success message
    setIsCleared(true);

    // Redirect to login after 2 seconds
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-3xl">🧹</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clear Browser Cache
          </h1>
          <p className="text-gray-600">
            Hapus semua data tersimpan di browser untuk login dengan akun baru
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-gray-800 mb-2">
            Ini akan menghapus:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Token login lama
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              User data cached
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Session data
            </li>
            <li className="flex items-center">
              <span className="mr-2">✓</span>
              Browser cookies
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
          <p className="font-semibold text-amber-900 mb-2">
            ⚠️ Setelah clear cache, login dengan:
          </p>
          <div className="text-sm text-amber-800 space-y-1">
            <p>
              <strong>Email:</strong> fattah.afr2@gmail.com
            </p>
            <p>
              <strong>Password:</strong> Cerberus02 (huruf C kapital)
            </p>
          </div>
        </div>

        {!isCleared ? (
          <button
            onClick={handleClearCache}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            Clear All Cache & Reload
          </button>
        ) : (
          <div className="bg-green-100 border border-green-400 rounded-lg p-4 text-center">
            <p className="text-green-800 font-semibold">
              ✅ Cache cleared! Redirecting to login...
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearCache;
