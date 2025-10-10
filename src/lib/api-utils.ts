/**
 * Utility functions for API calls and response handling
 */

/**
 * Safely parse JSON responses with proper error handling
 * @param response - The fetch response object
 * @param fallback - Fallback data to return if parsing fails
 * @returns Parsed JSON data or fallback
 */
export async function safeJsonParse<T = any>(
  response: Response,
  fallback: T
): Promise<T> {
  try {
    const contentType = response.headers.get("content-type");

    // Check if response is JSON
    if (!contentType || !contentType.includes("application/json")) {
      console.warn("Response is not JSON, content-type:", contentType);
      console.warn("Response URL:", response.url);
      console.warn("Response status:", response.status);
      return fallback;
    }

    // Check if response is ok
    if (!response.ok) {
      console.warn("Response not ok:", response.status, response.statusText);
      return fallback;
    }

    const text = await response.text();

    // Check if response is empty
    if (!text.trim()) {
      console.warn("Empty response from:", response.url);
      return fallback;
    }

    // Try to parse JSON
    return JSON.parse(text);
  } catch (error) {
    console.error("JSON parsing error for URL:", response.url);
    console.error("Error details:", error);
    return fallback;
  }
}

/**
 * Make a safe API call with proper error handling
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param fallback - Fallback data if request fails
 * @returns Promise with parsed data or fallback
 */
export async function safeApiCall<T = any>(
  url: string,
  options: RequestInit = {},
  fallback: T
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    return await safeJsonParse(response, fallback);
  } catch (error) {
    console.error("API call failed for URL:", url);
    console.error("Error details:", error);
    return fallback;
  }
}

/**
 * Make multiple API calls safely in parallel
 * @param calls - Array of API call configurations
 * @returns Promise with array of results
 */
export async function safeParallelApiCalls<T = any>(
  calls: Array<{
    url: string;
    options?: RequestInit;
    fallback: T;
  }>
): Promise<T[]> {
  const promises = calls.map(({ url, options, fallback }) =>
    safeApiCall(url, options, fallback)
  );

  return Promise.all(promises);
}

/**
 * Check if a response contains HTML (error page)
 * @param response - The fetch response object
 * @returns True if response contains HTML
 */
export async function isHtmlResponse(response: Response): Promise<boolean> {
  const contentType = response.headers.get("content-type");
  return contentType ? contentType.includes("text/html") : false;
}

/**
 * Get error message from response
 * @param response - The fetch response object
 * @returns Error message string
 */
export async function getErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      return `Server returned HTML instead of JSON (${response.status})`;
    }
    return `HTTP ${response.status}: ${response.statusText}`;
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}
