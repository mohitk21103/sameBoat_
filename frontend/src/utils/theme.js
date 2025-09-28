


export function toggleTheme(html, toggleBtn) {
  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
    toggleBtn.textContent = "☀️";
    localStorage.setItem("theme", "light");
  } else {
    html.classList.add("dark");
    toggleBtn.textContent = "🌙";
    localStorage.setItem("theme", "dark");
  }
}

export function loadTheme(html, toggleBtn) {
  const savedTheme = localStorage.getItem("theme") || "light";
  html.classList.toggle("dark", savedTheme === "dark");
  toggleBtn.textContent = savedTheme === "dark" ? "🌙" : "☀️";
}
