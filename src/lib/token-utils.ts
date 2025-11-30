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

  // Try to get token from localStorage (legacy support)
  let accessToken = localStorage.getItem("accessToken");

  // Prepare headers
  const headers: HeadersInit = {
    ...options.headers,
    "Content-Type": "application/json",
  };

  // If token exists, add it to headers
  if (accessToken) {
    (headers as any)["Authorization"] = `Bearer ${accessToken}`;
  }

  // Proceed with request - if no token, we rely on session cookies
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent with the request
  });

  // If we get a 401 and we had a token, it might be expired
  if (response.status === 401 && accessToken) {
    // Try to refresh token
    const newToken = await refreshTokenIfNeeded();
    if (newToken) {
      // Retry with new token
      return fetch(url, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${newToken}`,
        },
        credentials: 'include',
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
