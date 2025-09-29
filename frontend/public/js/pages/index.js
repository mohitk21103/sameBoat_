export function initIndex() {
  const get_started = document.getElementById("get-started");
  if (isAuthenticated()) {
    get_started.classList.toggle("hidden");
  }
}

function isAuthenticated() {
  return !!localStorage.getItem("token");
}
