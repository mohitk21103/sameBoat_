import { logoutUser } from "../js/api/auth.js";
import { showToast } from "./toast.js";
import { setFlash } from "./flash.js";

// ---------------------------
// Global Config
// ---------------------------
const NAVBAR_PATH = "../src/components/navbar.html";
const TOKEN_KEY = "token";

const navConfig = [
  { id: "login", authRequired: false },
  { id: "login-mobile", authRequired: false },
  { id: "contact", authRequired: false },
  { id: "add_job", authRequired: true },
  { id: "job_sheet", authRequired: true },
  { id: "logout-btn", authRequired: true },
];

// ---------------------------
// Utils
// ---------------------------
const isLoggedIn = () => !!localStorage.getItem(TOKEN_KEY);
const currentPage = () => document.body.getAttribute("data-page");

// ---------------------------
// Theme Management
// ---------------------------
function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
}

function setupThemeToggle() {
  const buttons = document.querySelectorAll(".theme-toggle");
  if (!buttons.length) return;

  const updateIcons = (theme) =>
    buttons.forEach(
      (btn) => (btn.textContent = theme === "dark" ? "☀️" : "🌙")
    );

  const toggle = () => {
    const current = localStorage.getItem("theme") || "light";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    updateIcons(next);
  };

  buttons.forEach((btn) => btn.addEventListener("click", toggle));

  // Initialize icons
  updateIcons(localStorage.getItem("theme") || "light");
}

// ---------------------------
// Navigation Handling
// ---------------------------
function updateNav() {
  navConfig.forEach(({ id, authRequired }) => {
    const els = document.querySelectorAll(`#${id}, #${id}-mobile`); // handle both desktop & mobile
    els.forEach((el) => {
      if (!el) return;

      // Hide if requires auth and user is not logged in
      if (authRequired && !isLoggedIn()) {
        el.classList.add("hidden");
      }

      // Hide if current page matches
      if (currentPage()?.toLowerCase() === id.toLowerCase()) {
        el.classList.add("hidden");
      }
    });
  });

  // Special case: hide "About" if not on index page(later: make it scalable)
  if (currentPage() !== "index") {
    document
      .querySelectorAll("#about-link")
      .forEach((el) => el.classList.add("hidden"));
  }
  if (currentPage() !== "index") {
    document
      .querySelectorAll("#services-link")
      .forEach((el) => el.classList.add("hidden"));
  }
}

function setupLogout() {
  const buttons = document.querySelectorAll("#logout-btn, #logout-btn-mobile");
  buttons.forEach((btn) =>
    btn.addEventListener("click", async () => {
      const res = await logoutUser();
      if (res.success) {
        setFlash("Logout successful", "success", 4000);
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = "./login.html";
      } else {
        showToast("Logout failed", "error");
      }
    })
  );
}

// ---------------------------
// Mobile Menu Handling
// ---------------------------
function setupMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const backdrop = document.getElementById("mobile-backdrop");

  if (!menuToggle || !mobileMenu || !backdrop) return;

  // Toggle open/close
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.contains("translate-x-0")
      ? closeMobileMenu()
      : openMobileMenu();
  });

  // Click backdrop closes
  backdrop.addEventListener("click", closeMobileMenu);
}

function openMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const backdrop = document.getElementById("mobile-backdrop");
  const links = document.querySelectorAll(".mobile-link");

  // Show drawer + backdrop
  menu.classList.remove("translate-x-full");
  menu.classList.add("translate-x-0");
  backdrop.classList.remove("opacity-0", "pointer-events-none");

  // Animate links one by one
  links.forEach((link, i) => {
    setTimeout(() => {
      link.classList.add("transition-all", "duration-500", "ease-out");
      link.classList.remove("opacity-0", "translate-x-6");
    }, i * 100);
  });
}

function closeMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  const backdrop = document.getElementById("mobile-backdrop");
  const links = document.querySelectorAll(".mobile-link");

  // Hide drawer
  menu.classList.add("translate-x-full");
  menu.classList.remove("translate-x-0");
  backdrop.classList.add("opacity-0", "pointer-events-none");

  // Reset links
  links.forEach((link) => {
    link.classList.add("opacity-0", "translate-x-6");
  });
}

// ---------------------------
// Main Entry
// ---------------------------
export async function loadNavbar() {
  const res = await fetch(NAVBAR_PATH);
  const html = await res.text();
  document.body.insertAdjacentHTML("afterbegin", html);

  initTheme();
  setupThemeToggle();
  setupMobileMenu();
  updateNav();
  setupLogout();

  const loginBtns = ["login", "login-mobile"];

  loginBtns.forEach((id) => {
    const el = document.getElementById(id);
    if (el && isLoggedIn()) {
      el.classList.add("hidden");
    }
  });

}

document.addEventListener("DOMContentLoaded",loadNavbar);


