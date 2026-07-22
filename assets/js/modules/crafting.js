let craftingMaterials = [
  {
    materialId: "",
    qty: 1,
  },
];

let editingCraftingId = null;

function craftingPage() {
  return `
        <div class="card">

            <h2 class="text-2xl font-bold mb-6">
                Crafting
            </h2>

            <div class="grid md:grid-cols-3 gap-4">

    <input
        id="craftingName"
        placeholder="Nama Item"
        class="input">

    <select
        id="craftingCategory"
        class="input">

        <option>Weapon</option>
        <option>Attachment</option>
        <option>Medical</option>
        <option>Tool</option>
        <option>Misc</option>

    </select>

    <input
        id="craftingPrice"
        type="number"
        min="0"
        placeholder="Harga Jual"
        class="input">

</div>

            <div class="mt-8">

    <h3 class="text-xl font-semibold mb-4">
        Bahan Crafting
    </h3>

    <div id="materialRows"></div>

    <button
        onclick="addMaterialRow()"
        class="btn mt-4">

        ➕ Tambah Bahan

    </button>

    <div class="mt-6">

   <button
    onclick="saveCrafting()"
    class="btn-red w-full">

    ${editingCraftingId === null ? "💾 Simpan Crafting" : "💾 Update Crafting"}

</button>

    <div class="card mt-6">

    <h2 class="text-2xl font-bold mb-5">
        Daftar Crafting
    </h2>

    <div id="craftingList">

    </div>

</div>

</div>

</div>

        </div>
    `;
}

function loadCraftings() {
  setActiveMenu("menu-crafting");

  document.getElementById("app").innerHTML = craftingPage();

  renderMaterialRows();

  renderCraftingList();
}

function addMaterialRow() {
  craftingMaterials.push({
    materialId: "",
    qty: 1,
  });

  renderMaterialRows();
}

function renderMaterialRows() {
  const materials = getMaterials();

  let html = "";

  craftingMaterials.forEach((item, index) => {
    html += `
            <div class="grid md:grid-cols-3 gap-4 mb-4">

                <select
                    class="input"
                    onchange="craftingMaterials[${index}].materialId=this.value">

                    <option value="">
                        Pilih Material
                    </option>

                    ${materials
                      .map(
                        (material) => `
                        <option
                            value="${material.id}"
                            ${item.materialId == material.id ? "selected" : ""}>

                            ${material.name}

                        </option>
                    `,
                      )
                      .join("")}

                </select>

                <input
                    type="number"
                    min="1"
                    value="${item.qty}"
                    class="input"
                    onchange="craftingMaterials[${index}].qty=parseInt(this.value)">

                <button
                    onclick="removeMaterialRow(${index})"
                    class="btn-delete">

                    🗑 Hapus

                </button>

            </div>
        `;
  });

  document.getElementById("materialRows").innerHTML = html;
}

function removeMaterialRow(index) {
  if (craftingMaterials.length === 1) {
    alert("Minimal harus ada satu bahan.");
    return;
  }

  craftingMaterials.splice(index, 1);

  renderMaterialRows();
}

function saveCrafting() {
  const name = document.getElementById("craftingName").value.trim();

  const category = document.getElementById("craftingCategory").value;

  const sellPrice = parseInt(document.getElementById("craftingPrice").value);

  if (name === "") {
    alert("Nama item wajib diisi.");
    return;
  }

  if (isNaN(sellPrice) || sellPrice < 0) {
    alert("Harga jual harus diisi.");
    return;
  }

  if (craftingMaterials.some((x) => x.materialId === "")) {
    alert("Masih ada material yang belum dipilih.");
    return;
  }

  if (craftingMaterials.some((x) => x.qty <= 0 || isNaN(x.qty))) {
    alert("Jumlah material harus lebih dari 0.");
    return;
  }

  const data = getCraftings();

  if (editingCraftingId === null) {
    data.push({
      id: Date.now(),
      name,
      category,
      sellPrice,
      materials: [...craftingMaterials],
    });
  } else {
    const index = data.findIndex((item) => item.id === editingCraftingId);

    if (index !== -1) {
      data[index] = {
        id: editingCraftingId,
        name,
        category,
        sellPrice,
        materials: [...craftingMaterials],
      };
    }
  }

  saveCraftings(data);

  alert("Crafting berhasil disimpan.");

  editingCraftingId = null;

  craftingMaterials = [
    {
      materialId: "",
      qty: 1,
    },
  ];

  loadCraftings();
}

function renderCraftingList() {
  const craftings = getCraftings();

  const materials = getMaterials();

  let html = "";

  craftings.forEach((crafting) => {
    let recipe = "";

    crafting.materials.forEach((mat) => {
      const material = materials.find((x) => x.id == mat.materialId);

      recipe += `
                <p>
                    • ${material ? material.name : "Material Tidak Ditemukan"} x${mat.qty}
                </p>
            `;
    });

    html += `

        <div class="border border-zinc-800 rounded-xl p-5 mb-4">

            <div class="flex justify-between items-start">

                <div>

                    <h3 class="text-xl font-bold">

                        ${crafting.name}

                    </h3>

                    <p class="text-gray-400">

    ${crafting.category}

</p>

<p class="text-green-400 font-semibold mb-3">

    💰 Harga Jual :
    Rp ${Number(crafting.sellPrice ?? 0).toLocaleString("id-ID")}

</p>

                    ${recipe}

                </div>

                <div class="space-y-2">

                    <button
                        onclick="editCrafting(${crafting.id})"
                        class="btn w-full">

                        ✏ Edit

                    </button>

                    <button
                        onclick="deleteCrafting(${crafting.id})"
                        class="btn-delete w-full">

                        🗑 Hapus

                    </button>

                </div>

            </div>

        </div>

        `;
  });

  document.getElementById("craftingList").innerHTML = html;
}

function deleteCrafting(id) {
  if (!confirm("Yakin ingin menghapus crafting ini?")) {
    return;
  }

  const data = getCraftings().filter((item) => item.id !== id);

  saveCraftings(data);

  renderCraftingList();
}

function editCrafting(id) {
  const crafting = getCraftings().find((item) => item.id === id);

  if (!crafting) return;

  editingCraftingId = id;

  craftingMaterials = crafting.materials.map((item) => ({
    materialId: item.materialId,
    qty: item.qty,
  }));

  document.getElementById("app").innerHTML = craftingPage();

  document.getElementById("craftingName").value = crafting.name;
  document.getElementById("craftingCategory").value = crafting.category;
  document.getElementById("craftingPrice").value = crafting.sellPrice ?? 0;

  renderMaterialRows();
  renderCraftingList();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
