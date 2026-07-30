let supabaseCraftings = [];

let craftingMaterials = [
  {
    materialId: "",
    qty: 1,
  },
];

let editingCraftingId = null;

async function fetchCraftingsFromSupabase() {
  const { data: craftings, error: craftingError } = await supabaseClient
    .from("craftings")
    .select("id, name, category, sell_price")
    .order("name", { ascending: true });

  if (craftingError) {
    console.error("Gagal mengambil craftings:", craftingError);
    supabaseCraftings = [];
    return;
  }

  const { data: recipeMaterials, error: materialsError } = await supabaseClient
    .from("crafting_materials")
    .select("crafting_id, material_id, qty");

  if (materialsError) {
    console.error("Gagal mengambil crafting materials:", materialsError);

    supabaseCraftings = [];
    return;
  }

  supabaseCraftings = (craftings || []).map((crafting) => ({
    id: crafting.id,
    name: crafting.name,
    category: crafting.category,
    sellPrice: Number(crafting.sell_price),

    materials: (recipeMaterials || [])
      .filter((item) => item.crafting_id === crafting.id)
      .map((item) => ({
        materialId: item.material_id,
        qty: item.qty,
      })),
  }));

  console.log("Craftings loaded from Supabase:", supabaseCraftings);
}

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

async function loadCraftings() {
  setActiveMenu("crafting");
  
  document.getElementById("pageTitle").textContent = "Crafting";

  document.getElementById("app").innerHTML = craftingPage();

  document.getElementById("craftingList").innerHTML = `
    <div class="text-center text-zinc-500 py-8">
      Memuat crafting...
    </div>
  `;

  await fetchMaterialsFromSupabase();
  await fetchCraftingsFromSupabase();

  renderMaterialRows();
  renderCraftingList();

  lucide.createIcons();
}

function addMaterialRow() {
  craftingMaterials.push({
    materialId: "",
    qty: 1,
  });

  renderMaterialRows();
}

function renderMaterialRows() {
  const materials = supabaseMaterials;

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

async function saveCrafting() {
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

  // ==========================================
  // UPDATE CRAFTING
  // ==========================================

  if (editingCraftingId !== null) {
    const saveButton = document.querySelector(
      'button[onclick="saveCrafting()"]',
    );

    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Mengupdate...";
    }

    const craftingId = Number(editingCraftingId);

    // 1. UPDATE DATA UTAMA CRAFTING
    const { error: craftingUpdateError } = await supabaseClient
      .from("craftings")
      .update({
        name: name,
        category: category,
        sell_price: sellPrice,
      })
      .eq("id", craftingId);

    if (craftingUpdateError) {
      console.error("Gagal mengupdate crafting:", craftingUpdateError);

      alert("Crafting gagal diupdate.");

      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = "💾 Update Crafting";
      }

      return;
    }

    // 2. HAPUS RECIPE LAMA
    const { error: deleteMaterialsError } = await supabaseClient
      .from("crafting_materials")
      .delete()
      .eq("crafting_id", craftingId);

    if (deleteMaterialsError) {
      console.error(
        "Gagal menghapus bahan crafting lama:",
        deleteMaterialsError,
      );

      alert("Data crafting terupdate, tetapi bahan lama gagal diperbarui.");

      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = "💾 Update Crafting";
      }

      return;
    }

    // 3. SIAPKAN RECIPE BARU
    const recipeRows = craftingMaterials.map((item) => ({
      crafting_id: craftingId,
      material_id: Number(item.materialId),
      qty: Number(item.qty),
    }));

    // 4. INSERT RECIPE BARU
    const { error: insertMaterialsError } = await supabaseClient
      .from("crafting_materials")
      .insert(recipeRows);

    if (insertMaterialsError) {
      console.error(
        "Gagal menyimpan bahan crafting baru:",
        insertMaterialsError,
      );

      alert("Crafting terupdate, tetapi bahan crafting baru gagal disimpan.");

      return;
    }

    alert("Crafting berhasil diupdate.");

    // 5. RESET MODE EDIT
    editingCraftingId = null;

    craftingMaterials = [
      {
        materialId: "",
        qty: 1,
      },
    ];

    // 6. AMBIL DATA TERBARU
    await fetchCraftingsFromSupabase();

    // 7. REFRESH HALAMAN
    document.getElementById("app").innerHTML = craftingPage();

    renderMaterialRows();
    renderCraftingList();

    lucide.createIcons();

    return;
  }

  const saveButton = document.querySelector('button[onclick="saveCrafting()"]');

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";
  }

  // ==========================================
  // 1. INSERT CRAFTING
  // ==========================================

  const { data: newCrafting, error: craftingError } = await supabaseClient
    .from("craftings")
    .insert({
      name: name,
      category: category,
      sell_price: sellPrice,
    })
    .select("id")
    .single();

  if (craftingError) {
    console.error("Gagal menyimpan crafting:", craftingError);

    alert("Crafting gagal disimpan.");

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "💾 Simpan Crafting";
    }

    return;
  }

  // ==========================================
  // 2. SIAPKAN MATERIAL CRAFTING
  // ==========================================

  const recipeRows = craftingMaterials.map((item) => ({
    crafting_id: newCrafting.id,
    material_id: Number(item.materialId),
    qty: Number(item.qty),
  }));

  // ==========================================
  // 3. INSERT CRAFTING MATERIALS
  // ==========================================

  const { error: materialsError } = await supabaseClient
    .from("crafting_materials")
    .insert(recipeRows);

  if (materialsError) {
    console.error("Gagal menyimpan bahan crafting:", materialsError);

    alert("Crafting berhasil dibuat, tetapi bahan crafting gagal disimpan.");

    return;
  }

  alert("Crafting berhasil disimpan.");

  // ==========================================
  // 4. RESET FORM
  // ==========================================

  editingCraftingId = null;

  craftingMaterials = [
    {
      materialId: "",
      qty: 1,
    },
  ];

  // ==========================================
  // 5. REFRESH DATA
  // ==========================================

  await fetchCraftingsFromSupabase();

  document.getElementById("app").innerHTML = craftingPage();

  renderMaterialRows();
  renderCraftingList();

  lucide.createIcons();
}

function renderCraftingList() {
  const craftings = supabaseCraftings;

  const materials = supabaseMaterials;

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

async function deleteCrafting(id) {
  const crafting = supabaseCraftings.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!crafting) {
    alert("Data crafting tidak ditemukan.");
    return;
  }

  const confirmed = confirm(
    `Yakin ingin menghapus crafting "${crafting.name}"?`,
  );

  if (!confirmed) {
    return;
  }

  const craftingId = Number(id);

  // ==========================================
  // 1. HAPUS CRAFTING MATERIALS
  // ==========================================

  const { error: materialsError } = await supabaseClient
    .from("crafting_materials")
    .delete()
    .eq("crafting_id", craftingId);

  if (materialsError) {
    console.error("Gagal menghapus bahan crafting:", materialsError);

    alert("Bahan crafting gagal dihapus.");
    return;
  }

  // ==========================================
  // 2. HAPUS CRAFTING
  // ==========================================

  const { error: craftingError } = await supabaseClient
    .from("craftings")
    .delete()
    .eq("id", craftingId);

  if (craftingError) {
    console.error("Gagal menghapus crafting:", craftingError);

    alert("Crafting gagal dihapus.");
    return;
  }

  alert("Crafting berhasil dihapus.");

  // ==========================================
  // 3. RESET EDIT MODE JIKA DIPERLUKAN
  // ==========================================

  if (Number(editingCraftingId) === craftingId) {
    editingCraftingId = null;

    craftingMaterials = [
      {
        materialId: "",
        qty: 1,
      },
    ];
  }

  // ==========================================
  // 4. REFRESH DATA DARI SUPABASE
  // ==========================================

  await fetchCraftingsFromSupabase();

  document.getElementById("app").innerHTML = craftingPage();

  renderMaterialRows();
  renderCraftingList();

  lucide.createIcons();
}

function editCrafting(id) {
  const crafting = supabaseCraftings.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!crafting) {
    alert("Data crafting tidak ditemukan.");
    return;
  }

  editingCraftingId = crafting.id;

  craftingMaterials = crafting.materials.map((item) => ({
    materialId: String(item.materialId),
    qty: Number(item.qty),
  }));

  document.getElementById("app").innerHTML = craftingPage();

  document.getElementById("craftingName").value = crafting.name;
  document.getElementById("craftingCategory").value = crafting.category;
  document.getElementById("craftingPrice").value = crafting.sellPrice ?? 0;

  renderMaterialRows();
  renderCraftingList();

  lucide.createIcons();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
