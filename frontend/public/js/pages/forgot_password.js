// services/forgotPassword.js
import { forgotPassword } from "../api/auth.js";
import { showToast } from "../../components/toast.js";

/**
 * Initializes forgot password form submission handling
 */
export function initForgotPassword() {

  const form = document.getElementById("forgot-password-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = form.email.value.trim();
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    // disable submit button to prevent duplicate requests
    const submitBtn = form.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    try {
      const result = await forgotPassword(email);

      if (!result.success) {
        if (result.error?.toLowerCase().includes("network")) {
          showToast("Service unavailable. Please try again shortly.", "error");
        } else {
          showToast(result.error || "Unable to send reset link.", "error");
        }
      } else {
        showToast("Password reset link sent to your email!", "success", 4000);
        form.reset();
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
