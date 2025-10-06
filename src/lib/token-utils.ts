// Token utility functions for handling JWT tokens and refresh logic

export async function refreshTokenIfNeeded(): Promise<string | null> {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (result.success && result.tokens) {
      // Update tokens in localStorage
      localStorage.setItem("accessToken", result.tokens.accessToken);
      localStorage.setItem("refreshToken", result.tokens.refreshToken);
      return result.tokens.accessToken;
    }

    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Check if we're on the client side
  if (typeof window === "undefined") {
    throw new Error(
      "makeAuthenticatedRequest can only be used on the client side"
    );
  }

  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    // Try to refresh token
    accessToken = await refreshTokenIfNeeded();
    if (!accessToken) {
      throw new Error("No valid authentication token available");
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  // If token is invalid, try to refresh and retry once
  if (response.status === 401) {
    const newToken = await refreshTokenIfNeeded();
    if (newToken) {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      });
    }
  }

  return response;
}

export function clearAuthTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}
