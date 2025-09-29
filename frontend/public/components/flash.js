export function setFlash(message, type = "info", duration=3000) {
  sessionStorage.setItem("flash", JSON.stringify({ message, type, duration}));
}

export function readFlash() {
  const raw = sessionStorage.getItem("flash");
  if (!raw) return null;

  const data = JSON.parse(raw);
  sessionStorage.removeItem("flash"); // clear after reading (one-time)
  return data;
}
