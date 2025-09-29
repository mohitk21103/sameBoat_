import { refresh_token } from "./auth.js"; // your refresh endpoint call.
import { API_BASE_URL } from "../../utils/constants.js";

export async function authorizedFetch(url, options = {}) {
  try {
    let token = localStorage.getItem("token");

    let res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
      credentials: "include",
    });

    if (res.status === 401) {
      const ref = await refresh_token();
      if (!ref?.success) {
        return {
          success: false,
          message: ref?.message || "Session expired. Please login again.",
        };
      }
      token = ref.data;
      localStorage.setItem("token", token);

      res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    }

    // parse once only
    const contentType = res.headers.get("content-type") || "";
    let data = null;

    if (contentType && contentType.includes("application/json")) {
      const text = await res.text();
      data = text ? JSON.parse(text) : null;
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      return {
        success: false,
        message: data?.error || data || "Unknown server error",
      };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Authorized fetch error:", err);
    return { success: false, message: err.message || "Network error" };
  }
}
