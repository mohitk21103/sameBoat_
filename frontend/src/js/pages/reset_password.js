import { reset_password } from "../api/auth.js";
import { showToast } from "../../components/toast.js";
import { setFlash } from "../../components/flash.js";

export async function initResetPassword() {

  const form = document.getElementById("reset-password-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const new_pass = form.new_password.value.trim();
    const confirm_pass = form.confirm_password.value.trim();

    if (!new_pass || !confirm_pass) {
      showToast("Password fields cannot be empty.", "error");
      return;
    }

    if (new_pass !== confirm_pass) {
      showToast("Passwords do not match.", "error");
      form.reset();
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get("uid");
    const token = urlParams.get("token");

    if (!uid || !token) {
      showToast("Invalid or expired password reset link.", "error");
      return;
    }

    const data = { new_password: new_pass, confirm_password: confirm_pass };

    try {
      const res = await reset_password(uid, token, data);

      if (res.success) {
        setFlash(res.message, "success");

        window.location.href = "login.html";
      } else {
        showToast(res.message || "Password reset failed.", "error");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      showToast(
        "An unexpected error occurred. Please try again later.",
        "error"
      );
    }
  });
}
