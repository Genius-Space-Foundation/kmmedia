"use client";

import { useState, useEffect } from "react";

export default function TestJWT() {
  const [token, setToken] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") {
      return;
    }

    const storedToken = localStorage.getItem("accessToken");
    setToken(storedToken);
  }, []);

  const testAuth = async () => {
    // Check if we're on the client side
    if (typeof window === "undefined") {
      return;
    }

    if (!token) {
      alert("No token found in localStorage. Please log in first.");
      return;
    }

    try {
      const response = await fetch("/api/test-auth", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: error.message });
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">JWT Authentication Test</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Token Status:</h2>
          <p className="text-sm text-gray-600">
            {token ? `Found: ${token.substring(0, 20)}...` : "No token found"}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Test Authentication:</h2>
          <button
            onClick={testAuth}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={!token}
          >
            Test API Call with JWT Token
          </button>
        </div>

        {testResult && (
          <div>
            <h2 className="text-lg font-semibold">Test Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Go to{" "}
              <a href="/auth/login" className="text-blue-500 underline">
                Login Page
              </a>
            </li>
            <li>Log in with your credentials</li>
            <li>Come back to this page</li>
            <li>Click "Test API Call with JWT Token"</li>
            <li>Check the result</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
