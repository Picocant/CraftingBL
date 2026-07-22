document.addEventListener("DOMContentLoaded", () => {
  showDashboard();
});

function showDashboard() {

  setActiveMenu("menu-dashboard");
  
  document.getElementById("app").innerHTML = `

        <div class="grid lg:grid-cols-3 gap-6">

            <div class="card">

                <h3>📦 Material</h3>

                <h1>${getMaterials().length}</h1>

                <p>Total Material</p>

            </div>

            <div class="card">

                <h3>🔫 Crafting</h3>

                <h1>0</h1>

                <p>Total Crafting</p>

            </div>

            <div class="card">

                <h3>💰 Fee Crafting</h3>

                <h1>5000</h1>

                <p>Dirty Money</p>

            </div>

        </div>

    `;
}

function setActiveMenu(menuId) {
  document.querySelectorAll(".menu").forEach((menu) => {
    menu.classList.remove("active");
  });

  document.getElementById(menuId).classList.add("active");
}
