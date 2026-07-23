let editingMaterialId = null;

function resetMaterialForm() {
  editingMaterialId = null;

  document.getElementById("materialName").value = "";

  document.getElementById("materialPrice").value = "";

  document.getElementById("materialCurrency").value = "Clean";

  document.getElementById("saveMaterialBtn").textContent = "Simpan Material";

  document.getElementById("cancelMaterialBtn").classList.add("hidden");

  document.getElementById("materialName").focus();
}

function materialPage() {
  const data = getMaterials();

  return `
        <div class="space-y-6">

            <div class="card">

                    <div class="flex justify-between items-center mb-6">

                            <h2 class="text-2xl font-bold">
                                Materials
                            </h2>
                        <span
                          id="materialCount"
                          class="px-3 py-1 rounded-lg bg-zinc-800 text-sm">

                          0 Material

                        </span>

                      </div>

                    <div class="grid md:grid-cols-3 gap-4">

                    <input
                        id="materialName"
                        placeholder="Nama Material"
                        class="input">

                    <input
                        id="materialPrice"
                        type="number"
                        placeholder="Harga"
                        class="input">

                    <select id="materialCurrency" class="input">

                        <option value="Clean">
                            Clean Money
                        </option>

                        <option value="Dirty">
                            Dirty Money
                        </option>

                    </select>

                </div>

                <button
                    id="saveMaterialBtn"
                    onclick="saveMaterial()"
                    class="btn-red mt-5">

                    Simpan Material

                </button>

                <button
                  id="cancelMaterialBtn"
                  onclick="resetMaterialForm()"
                  class="btn hidden">

                     Batal

                </button>

            </div>

            <div class="card">

                <input
                    id="searchMaterial"
                    placeholder="Cari Material..."
                    onkeyup="renderMaterials()"
                    class="input mb-5">

                <div id="materialList">

                </div>

            </div>

        </div>
    `;
}

function saveMaterial() {
  const name = document.getElementById("materialName").value.trim();
  const price = parseInt(document.getElementById("materialPrice").value);
  const currency = document.getElementById("materialCurrency").value;
  if (name == "") {
    alert("Nama wajib diisi");

    return;
  }

  const data = getMaterials();

  const exists = data.find(
    (material) =>
      material.name.toLowerCase() === name.toLowerCase() &&
      material.id !== editingMaterialId,
  );

  if (exists) {
    alert("Nama material sudah ada.");
    return;
  }

  if (isNaN(price) || price <= 0) {
    alert("Harga harus lebih dari 0.");
    return;
  }

  if (editingMaterialId === null) {
    data.push({
      id: Date.now(),

      name,

      price,

      currency,
    });

    saveMaterials(data);

    loadMaterials();

    setTimeout(() => {
      resetMaterialForm();
    }, 0);
  } else {
    const index = data.findIndex((x) => x.id === editingMaterialId);

    if (index !== -1) {
      data[index] = {
        id: editingMaterialId,
        name,
        price,
        currency,
      };

      saveMaterials(data);

      loadMaterials();

      setTimeout(() => {
        resetMaterialForm();
      }, 0);
    }
  }
  editingMaterialId = null;
}

function editMaterial(id) {
  const data = getMaterials();

  const material = data.find((item) => item.id === id);

  if (!material) return;

  editingMaterialId = id;

  document.getElementById("saveMaterialBtn").textContent = "Update Material";

  document.getElementById("materialName").value = material.name;

  document.getElementById("materialPrice").value = material.price;

  document.getElementById("materialCurrency").value = material.currency;

  document.getElementById("cancelMaterialBtn").classList.remove("hidden");
}

function renderMaterials() {
  const keyword = document.getElementById("searchMaterial").value.toLowerCase();

  const data = getMaterials();

  let html = "";

  data
    .filter((x) => x.name.toLowerCase().includes(keyword))
    .sort((a, b) => a.name.localeCompare(b.name, "id"))
    .forEach((item) => {
      html += `

        <div class="border border-zinc-800 rounded-xl p-5 mb-3 flex justify-between items-center">

            <div>

                <h3 class="font-bold text-lg">

                    ${item.name}

                </h3>

                <p>

                    ${item.currency == "Clean" ? "🟢 Clean" : "🔴 Dirty"}

                </p>

                <p>

                    Rp ${item.price.toLocaleString()}

                </p>

            </div>

            <div class="space-x-2">

                <button
                onclick="editMaterial(${item.id})"
                class="btn">

                Edit

                </button>

                <button
                onclick="deleteMaterial(${item.id})"
                class="btn-delete">

                Hapus

                </button>

            </div>

        </div>

        `;
    });

  document.getElementById("materialList").innerHTML = html;
  document.getElementById("materialCount").textContent =
    `${data.length} Material`;
}

function deleteMaterial(id) {
  if (!confirm("Hapus material?")) return;

  const data = getMaterials().filter((x) => x.id != id);

  saveMaterials(data);

  renderMaterials();
}

function loadMaterials() {
  setActiveMenu("menu-material");
  setPageTitle("Materials");
  document.getElementById("app").innerHTML = materialPage();

  renderMaterials();
  lucide.createIcons();
}
