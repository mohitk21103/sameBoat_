import { initLogin } from "./pages/login.js";
import { initRegister } from "./pages/register.js";
import { initJobsheet } from "./pages/job_sheet.js";
import { initForgotPassword } from "./pages/forgot_password.js";
import { initResetPassword } from "./pages/reset_password.js";
import { initAddJob } from "./pages/add_job.js";
import { initIndex } from "./pages/index.js";
import { initUpdateJob } from "./pages/update_job.js";
import { requireAuth } from "../utils/authGuard.js";
import { initContact } from "./pages/contact.js";

// pages with their initializer and options
const pageConfigs = [
  { name: "index", init: initIndex },
  { name: "login", init: initLogin },
  { name: "register", init: initRegister },
  { name: "forgot_password", init: initForgotPassword },
  { name: "reset_password", init: initResetPassword },
  { name: "contact", init: initContact },
  { name: "add_job", init: initAddJob, requiresAuth: true },
  { name: "job_sheet", init: initJobsheet, requiresAuth: true },
  { name: "update_job", init: initUpdateJob, requiresAuth: true },
];

// initializer based on current page
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  const config = pageConfigs.find((c) => c.name === page);

  if (config) {
    if (config.requiresAuth) {
      requireAuth();
    }
    config.init();
  } else {
    console.log("No specific script for this page.");
  }
});
