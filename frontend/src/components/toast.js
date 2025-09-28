export function showToast(message, type = "info", duration = 3000) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-20 right-4 space-y-2 z-50";
    document.body.appendChild(container);
  }
  

  const toast = document.createElement("div");
  toast.className = `
  relative text-white text-base font-semibold px-6 py-3 rounded-xl shadow-2xl 
  flex justify-between items-center gap-4 animate-slide-in
  ${type === "success" ? "bg-green-600" : ""}
  ${type === "error" ? "bg-red-600" : ""}
  ${type === "info" ? "bg-blue-600" : ""}
  ${type === "warning" ? "bg-yellow-600 text-black" : ""}
  `;

  // message span
  const msg = document.createElement("span");
  msg.textContent = message;

  // close button
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "  &times;";
  closeBtn.className =
    "absolute top-1 right-2 text-xl font-bold hover:scale-110 transition-transform duration-200";

  // when clicking close → animate out then remove
  closeBtn.addEventListener("click", () => {
    hideToast(toast, container);
  });

  toast.appendChild(msg);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  // auto-hide after duration
  setTimeout(() => {
    hideToast(toast, container);
  }, duration);
}

function hideToast(toast, container) {
  toast.classList.remove("animate-slide-in");
  toast.classList.add("animate-slide-out");

  toast.addEventListener("animationend", () => {
    toast.remove();
    if (!container.hasChildNodes()) {
      container.remove();
    }
  });
}
