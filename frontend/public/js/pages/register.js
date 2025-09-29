import { registerUser } from "../api/auth.js";
import { showToast } from "../../components/toast.js";
import { setFlash } from "../../components/flash.js";
import { isFormEmpty } from "../../utils/validation.js";

export function initRegister() {

  const form = document.getElementById("register-form");
  if (!form) return;

  const passwordInput = document.getElementById("password");

  // Toggle password visibility
  const toggle_pass = document.getElementById("toggle-pass");
  toggle_pass.addEventListener("click", () => {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
  });

  // Live updates
  passwordInput.addEventListener("input", (e) => {
    const value = e.target.value;
    updateGuidelines(value);
    updatePasswordStrength(value);
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (isFormEmpty(form)) {
      showToast("All fields must be filled before registration.", "error");
      return;
    }

    const {
      first_name,
      last_name,
      user_name,
      email,
      password,
      confirm_password,
    } = form;

    if (!isValidEmail(email.value)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    const passwordError = validatePasswordOnSubmit(password.value);
    if (passwordError) {
      showToast(passwordError, "error");
      return;
    }

    if (password.value !== confirm_password.value) {
      showToast("Password and confirm password do not match.", "error");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    submitBtn.disabled = true;

    const user_data = {
      first_name: first_name.value,
      last_name: last_name.value,
      user_name: user_name.value,
      email: email.value,
      password: password.value,
    };

    try {
      const result = await registerUser(user_data);

      if (result.success) {
        form.reset();
        setFlash("You’ve registered successfully! Please log in.", "success");
        window.location.href = "login.html";
      } else {
        showToast(result.message, "error");
      }
    } finally {
      submitBtn.disabled = false;
    }
  });
}




//  Email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Password rule checks
function checkPasswordRules(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_\-+=<>?{}[\]~]/.test(password),
  };
}

//  Update guidelines dynamically
function updateGuidelines(password) {
  const rules = checkPasswordRules(password);

  const updateItem = (id, passed) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.color = passed ? "green" : "red";
    el.textContent = passed
      ? `✅ ${el.textContent.replace(/^❌|✅ /, "")}`
      : `❌ ${el.textContent.replace(/^❌|✅ /, "")}`;
  };

  updateItem("guideline-length", rules.length);
  updateItem("guideline-upper", rules.upper);
  updateItem("guideline-lower", rules.lower);
  updateItem("guideline-number", rules.number);
  updateItem("guideline-special", rules.special);
}

//  Update strength bar
function updatePasswordStrength(password) {
  const bar = document.getElementById("password-strength-fill");
  const text = document.getElementById("password-strength-text");

  if (!password) {
    bar.style.width = "0%";
    bar.className = "h-2 w-0 bg-red-500 transition-all duration-300";
    text.textContent = "Enter a password to check strength";
    return;
  }

  const { score, feedback } = zxcvbn(password);
  const strengthLevels = [
    { label: "Very Weak", color: "bg-red-500", width: "20%" },
    { label: "Weak", color: "bg-orange-500", width: "40%" },
    { label: "Fair", color: "bg-yellow-500", width: "60%" },
    { label: "Good", color: "bg-blue-500", width: "80%" },
    { label: "Strong", color: "bg-green-600", width: "100%" },
  ];

  const { label, color, width } = strengthLevels[score];
  bar.style.width = width;
  bar.className = `h-2 ${color} transition-all duration-300 rounded-lg`;

  text.textContent = feedback.warning
    ? `${label} – ${feedback.warning}`
    : label;
}

//  Password validator (for submit)
function validatePasswordOnSubmit(password) {
  const rules = checkPasswordRules(password);
  const { score } = zxcvbn(password);

  if (!rules.length) return "Password must be at least 8 characters long.";
  if (!rules.upper)
    return "Password must contain at least one uppercase letter.";
  if (!rules.lower)
    return "Password must contain at least one lowercase letter.";
  if (!rules.number) return "Password must contain at least one number.";
  if (!rules.special)
    return "Password must contain at least one special character.";
  if (score < 3) return "Password is too weak. Try making it more unique.";

  return null; //  valid
}
