import { API_BASE_URL } from "../../utils/constants.js";


export async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      // if server returns empty body (e.g., 204 No Content)
    }

    if (!res.ok) {
      throw new Error(data.message || `HTTP ${res.status}: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    // Normalize errors
    throw new Error(error.message || "Network error, please try again");
  }
}
