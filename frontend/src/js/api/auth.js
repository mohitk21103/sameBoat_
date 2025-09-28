import { API_BASE_URL } from "../../utils/constants.js";

/**
 * Logs in a user with given credentials.
 *
 * @param {Object} credentials - User credentials.
 * @param {string} credentials.email - User email.
 * @param {string} credentials.password - User password.
 * @returns {Promise<{ success: boolean, token?: string, message: string }>}
 *   - success: true if login succeeded, false otherwise
 *   - token: JWT or session token if login succeeded
 *   - message: user-friendly status message
 */
export async function loginUser(credentials) {
  try {
    const res = await fetch(`${API_BASE_URL}/login/`, {
      method: "POST",
      credentials: "include", // include cookies if server sets them
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    // Specific error handling
    if (res.status === 400) throw new Error("Invalid email or password");
    if (res.status === 401) throw new Error("Unauthorized, please login again");
    if (res.status === 500) throw new Error("Server error, try later");
    if (!res.ok) throw new Error("Unexpected error occurred");

    const data = await res.json();

    if (!data.token) throw new Error("No token returned from server");

    // Store token securely (localStorage for demo, consider HttpOnly cookies for prod)
    localStorage.setItem("token", data.token);

    return { success: true, token: data.token, message: "Login successful" };
  } catch (error) {
    console.error("login error:", error);
    if (error.message === "Failed to fetch") {
      const msg =
        "Login Service is unavailable right now. Please try after sometime";
      return { success: false, message: msg || "Login failed" };
    }
    return { success: false, message: error.message || "Login failed" };
  }
}

/**
 * Register a new user with the backend.
 *
 * @param {Object} user_data - The user details for registration.
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 *          - A standard response object:
 *              success: true with `data` if successful
 *              success: false with `message` if failed
 */
export async function registerUser(user_data) {
  try {
    const res = await fetch(`${API_BASE_URL}/register-user/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user_data),
    });

    const data = await res.json().catch(() => ({})); // fallback if no JSON

    if (!res.ok) {
      // Extract error message(s)
      let message = "Something went wrong";
      if (typeof data === "object" && data !== null) {
        message = Object.values(data).flat().join(" ") || message;
      }

      return { success: false, message };
    }

    return { success: true, data };
  } catch (error) {
    if (error.message === "Failed to fetch") {
      const msg =
        "Register Service is unavailable right now. Please try after sometime";
      return { success: false, message: msg || "Login failed" };
    }
    return {
      success: false,
      message: error.message || "Network error, please try again",
    };
  }
}

/**
 * Logout user by invalidating the session on the server
 * and cleaning up client-side tokens.
 *
 * @returns {Promise<{ success: boolean, data?: any, message: string }>}
 *   - success: indicates if logout was successful
 *   - data: optional extra data (not needed here, so usually undefined)
 *   - message: success or error message
 */
export async function logoutUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ensures cookies (refresh token) are sent
    });

    if (!res.ok) {
      return {
        success: false,
        message: "Logout failed. Please try again.",
      };
    }

    // cleanup frontend tokens
    localStorage.removeItem("token");
    localStorage.removeItem("JobToUpdate");

    return {
      success: true,
      message: "Logout successful.",
    };
  } catch (error) {
    console.error("Logout error:", error);
    if (error.message === "Failed to fetch") {
      const msg = "Login failed. Please try after sometime";
      return { success: false, message: msg || "Login failed" };
    }
    return {
      success: false,
      message: error.message || "Network error. Please try again.",
    };
  }
}

/**
 * Sends a reset password link to the user's email.
 * @param {string} email
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export async function forgotPassword(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/send-reset-password-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    let responseData = {};
    try {
      responseData = await response.json();
    } catch {
      // No JSON returned
    }

    if (!response.ok) {
      return {
        success: false,
        error: responseData.message || "Failed to send reset password link",
      };
    }

    return { success: true, data: responseData };
  } catch (error) {
    console.error("Forgot password API error:", error);
    return { success: false, error: "Network error, please try again" };
  }
}

/**
 * Resets the user's password using UID and token.
 *
 * @param {string} uid - Unique user identifier from reset link.
 * @param {string} token - Password reset token from reset link.
 * @param {Object} data - New password data.
 * @param {string} data.new_password - The new password.
 * @param {string} data.confirm_password - Confirmation of the new password.
 * @returns {Promise<{ success: boolean, data?: any, message?: string }>}
 *          - success: Indicates if reset was successful.
 *          - data: Optional response data on success.
 *          - message: Error or success message.
 */
export async function reset_password(uid, token, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/reset-password/${uid}/${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      if (typeof errorData === "object" && errorData !== null) {
        // Extract unique values
        const messages = [
          ...new Set(
            Object.values(errorData)
              .flat()
              .map((msg) => {
                if (msg === "Ensure this field has at least 8 characters.") {
                  return "Password must be at least 8 characters long";
                }
                return msg;
              })
          ),
        ].join(" "); // join into single string

        throw new Error(messages || "Validation failed");
      }

      throw new Error(
        errorData.detail || errorData.message || "Password reset failed"
      );
    }

    const responseData = await res.json();
    return {
      success: true,
      data: responseData,
      message: "Password reset successful.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong, please try again.",
    };
  }
}

export async function refresh_token() {
  localStorage.removeItem("token")
  try {
    const res = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      credentials: "include", // send cookies
    });

    if (!res.ok) throw new Error("Failed to refresh session");

    const data = await res.json();
    console.log(data);
    
    localStorage.setItem("token", data.access);
    return { success: true, data: data.access };
  } catch (error) {
    console.error("error while refreshing the token:", error);
    return {
      success: false,
      message:
        error?.message || "Currently service is unavailable, please try again",
    };
  }
}
