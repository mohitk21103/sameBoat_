import { showToast } from "../../components/toast.js";

export async function initContact() {
  showToast("Great things are on the way. Stay tuned!");
  showToast("Currently Working on this page", "error", "5000");

  const submitBtn = document.querySelector("#contact-btn");
  submitBtn.disabled = true;
}
