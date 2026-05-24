const menuBtn = document.querySelector("[data-menu-btn]");
const nav = document.querySelector("[data-nav]");

if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll("[data-nav] a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage) {
    link.classList.add("active");
  }
});

const yearNode = document.querySelector("[data-year]");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const heroCard = document.querySelector(".hero-card");
const heroImage = document.querySelector(".hero-image");
const heroMedia = window.matchMedia("(min-width: 981px)");

function syncHeroImageHeight() {
  if (!heroCard || !heroImage) return;

  if (!heroMedia.matches) {
    heroImage.style.height = "";
    return;
  }

  heroImage.style.height = `${Math.round(heroCard.getBoundingClientRect().height)}px`;
}

if (heroCard && heroImage) {
  const scheduleHeroSync = () => requestAnimationFrame(syncHeroImageHeight);

  scheduleHeroSync();
  heroMedia.addEventListener("change", scheduleHeroSync);
  window.addEventListener("resize", scheduleHeroSync);
  window.addEventListener("load", scheduleHeroSync);

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(scheduleHeroSync).observe(heroCard);
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(scheduleHeroSync);
  }
}
