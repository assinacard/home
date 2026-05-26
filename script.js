const cookieBox = document.getElementById("cookieBox");
const acceptCookies = document.getElementById("acceptCookies");

if (localStorage.getItem("assinacardCookiesOk") === "yes") {
  cookieBox?.remove();
}

acceptCookies?.addEventListener("click", () => {
  localStorage.setItem("assinacardCookiesOk", "yes");
  cookieBox?.remove();
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
