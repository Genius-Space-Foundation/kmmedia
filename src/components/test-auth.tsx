"use client";

import { useState } from "react";

export function TestAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  };

  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    window.location.reload();
  };

  const simulateLogin = () => {
    // Simulate a login by setting a fake token
    localStorage.setItem("accessToken", "fake-token-for-testing");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: "test", role: "student" })
    );
    setIsLoggedIn(true);
  };

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="font-bold mb-2">🧪 Auth Test Panel</h3>
      <div className="space-y-2">
        <div className="text-sm">
          Status: {isLoggedIn ? "✅ Logged In" : "❌ Not Logged In"}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={checkAuth}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Check Auth
          </button>
          <button
            onClick={clearAuth}
            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Clear Auth
          </button>
          <button
            onClick={simulateLogin}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            Simulate Login
          </button>
        </div>
      </div>
    </div>
  );
}





