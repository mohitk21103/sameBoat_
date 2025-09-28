import { setFlash } from "../components/flash.js";

export function requireAuth(redirectTo = "./login.html") {
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token → redirect user to login
    window.location.href = redirectTo;
    return false;
  }

//   // Optional: for expiry tokens : will implement later
//   const expiry = localStorage.getItem("token_expiry");
//   if (expiry && Date.now() > Number(expiry)) {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("token_expiry");
//     window.location.href = redirectTo;
//     return false;
//   }

  return true; // User is authenticated
}
