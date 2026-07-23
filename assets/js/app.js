document.addEventListener("DOMContentLoaded", () => {
  loadOverview();

  lucide.createIcons();
});

function setActiveMenu(menuId) {
  document.querySelectorAll(".menu-item").forEach((menu) => {
    menu.classList.remove("active");
  });

  document.getElementById(menuId)?.classList.add("active");
}

function setPageTitle(title) {
  document.getElementById("pageTitle").textContent = title;

  lucide.createIcons();
}
