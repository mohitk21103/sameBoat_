import { loginUser } from "../api/auth.js";
import { showToast } from "../../components/toast.js";
import { setFlash, readFlash } from "../../components/flash.js";

/**
 * Initializes login form functionality:
 *  - Handles flash messages
 *  - Toggles password visibility
 *  - Submits login credentials
 *  - Redirects on success
 */
export function initLogin() {

  // Show any flash message from previous page
  const flash = readFlash();
  if (flash) {
    showToast(flash.message, flash.type, flash?.duration);
  }

  const form = document.getElementById("login-form");
  if (!form) return;

  // Toggle password visibility
  const toggle_pass = document.getElementById("toggle-pass");
  toggle_pass.addEventListener("click", () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
  });

  // Handle login form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      showToast("Email and password are required", "error");
      return;
    }

    const res = await loginUser({ email, password });

    if (res.success) {
      // Store flash message for next page
      setFlash("Welcome back! You’re now logged in", "success", 4000);
      window.location.href = "job_sheet.html";
    } else {
      showToast(res.message || "Login failed", "error");
      localStorage.removeItem("token");
    }
  });
}
