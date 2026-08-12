document.addEventListener("DOMContentLoaded", async () => {
  await initializeAuth();
  applyRoleAccess();
  applyTaskAccess();
  updateAuthButtons();

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

function applyTaskAccess() {
  const taskMenu = document.getElementById("menu-tasks");

  if (!taskMenu) {
    return;
  }

  const allowedRoles = [
    "admin",
    "pj_activity",
    "pj_bendahara",
    "sekretaris",
    "pj_brankas",
  ];

  const hasAccess = allowedRoles.includes(currentRole);

  if (hasAccess) {
    taskMenu.classList.remove("hidden");
    taskMenu.setAttribute("aria-hidden", "false");
  } else {
    taskMenu.classList.add("hidden");
    taskMenu.setAttribute("aria-hidden", "true");
  }
}

function updateAuthButtons() {
  const loginButton = document.getElementById("loginButton");
  const logoutButton = document.getElementById("logoutButton");

  if (isAdmin()) {
    loginButton?.classList.add("hidden");
    logoutButton?.classList.remove("hidden");
  } else {
    loginButton?.classList.remove("hidden");
    logoutButton?.classList.add("hidden");
  }

  lucide.createIcons();
}

function setActiveMenu(menuId) {
  document.querySelectorAll(".menu-item").forEach((menu) => {
    menu.classList.remove("active");
  });

  document.getElementById(`menu-${menuId}`)?.classList.add("active");
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

function setPage(menuId, title) {
  setActiveMenu(menuId);
  setPageTitle(title);
}

function showToast(message, type = "success") {
  const oldToast = document.getElementById("app-toast");

  if (oldToast) {
    oldToast.remove();
  }

  const toast = document.createElement("div");

  toast.id = "app-toast";

  toast.className = `
    fixed top-6 right-6 z-50
    px-5 py-3 rounded-xl shadow-xl
    text-white font-medium
    transition-all duration-300
    ${type === "success" ? "bg-green-600" : "bg-red-600"}
  `;

  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
