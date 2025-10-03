import { showToast } from "../../components/toast.js";

export function initIndex() {
  const get_started = document.getElementById("get-started");
  if (isAuthenticated()) {
    get_started.classList.toggle("hidden");
  }
  showToast("Welcome to Samboat", "success");
  setTimeout(() => {
    showToast(
      "This is a prototype version — performance may vary. Thanks for your patience!",
      "info",
      5000
    );
  }, 5000);
}

function isAuthenticated() {
  return !!localStorage.getItem("token");
}
