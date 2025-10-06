"use client";

import { useEffect, useState } from "react";

export function DebugAuth() {
  const [authInfo, setAuthInfo] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const user = localStorage.getItem("user");

      setAuthInfo({
        hasAccessToken: !!token,
        hasRefreshToken: !!refreshToken,
        hasUser: !!user,
        tokenLength: token?.length || 0,
        userData: user ? JSON.parse(user) : null,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    };

    checkAuth();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info</h3>
      <pre className="text-xs whitespace-pre-wrap">
        {JSON.stringify(authInfo, null, 2)}
      </pre>
    </div>
  );
}





