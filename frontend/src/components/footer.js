const FOOTER_PATH = "../src/components/footer.html";

export async function laodFooter() {
    const res = await fetch(FOOTER_PATH)
    const html = await res.text()
    document.body.insertAdjacentHTML("afterend", html);
}

document.addEventListener("DOMContentLoaded",laodFooter);