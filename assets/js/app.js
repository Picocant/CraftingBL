document.addEventListener("DOMContentLoaded", async () => {
  await initializeAuth();

  applyRoleAccess();
  // Ambil status sidebar terakhir
  const sidebarCollapsed = localStorage.getItem("sidebarCollapsed") === "true";

  if (sidebarCollapsed) {
    document.getElementById("sidebar")?.classList.add("collapsed");
  }

  loadOverview();

  updateSidebarIcon();

  lucide.createIcons();
});

function applyRoleAccess() {
  const adminMenus = document.querySelectorAll('[data-access="admin"]');

  adminMenus.forEach((menu) => {
    if (isAdmin()) {
      menu.classList.remove("hidden");
    } else {
      menu.classList.add("hidden");
    }
  });
}

function setActiveMenu(menuId) {
  document.querySelectorAll(".menu-item").forEach((menu) => {
    menu.classList.remove("active");
  });

  document.getElementById(menuId)?.classList.add("active");
}

function setPageTitle(title) {
  const pageTitle = document.getElementById("pageTitle");

  if (pageTitle) {
    pageTitle.textContent = title;
  }

  lucide.createIcons();
}

/* =========================================================
   SIDEBAR
========================================================= */

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");

  if (!sidebar) return;

  sidebar.classList.toggle("collapsed");

  const isCollapsed = sidebar.classList.contains("collapsed");

  localStorage.setItem("sidebarCollapsed", isCollapsed);

  updateSidebarIcon();
}

function updateSidebarIcon() {
  const sidebar = document.getElementById("sidebar");
  const icon = document.getElementById("sidebarToggleIcon");

  if (!sidebar || !icon) return;

  const isCollapsed = sidebar.classList.contains("collapsed");

  icon.setAttribute(
    "data-lucide",
    isCollapsed ? "panel-left-open" : "panel-left-close",
  );

  lucide.createIcons();
}
