let editingMaterialId = null;

function materialPage() {
  const data = getMaterials();

  return `
        <div class="space-y-6">

            <div class="card">

                <h2 class="text-2xl font-bold mb-6">
                    Materials
                </h2>

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
                    onclick="saveMaterial()"
                    class="btn-red mt-5">

                    Simpan Material

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
  if (editingMaterialId === null) {
    const data = getMaterials();

    data.push({
      id: Date.now(),

      name,

      price,

      currency,
    });

    saveMaterials(data);

    loadMaterials();
  } else {
    const data = getMaterials();

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
    }
  }
  editingMaterialId = null;
}

function editMaterial(id) {
  const data = getMaterials();

  const material = data.find((item) => item.id === id);

  if (!material) return;

  editingMaterialId = id;

  document.getElementById("materialName").value = material.name;

  document.getElementById("materialPrice").value = material.price;

  document.getElementById("materialCurrency").value = material.currency;
}

function renderMaterials() {
  const keyword = document.getElementById("searchMaterial").value.toLowerCase();

  const data = getMaterials();

  let html = "";

  data
    .filter((x) => x.name.toLowerCase().includes(keyword))

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
}

function deleteMaterial(id) {
  if (!confirm("Hapus material?")) return;

  const data = getMaterials().filter((x) => x.id != id);

  saveMaterials(data);

  renderMaterials();
}

function loadMaterials() {
  setActiveMenu("menu-material");
  document.getElementById("app").innerHTML = materialPage();

  renderMaterials();
}
