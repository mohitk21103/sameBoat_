const FOOTER_PATH = "./components/footer.html";

export async function loadFooter() {
    const res = await fetch(FOOTER_PATH)
    const html = await res.text()
    document.body.insertAdjacentHTML("afterend", html);
}

document.addEventListener("DOMContentLoaded", loadFooter);