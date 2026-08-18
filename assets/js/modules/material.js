let editingMaterialId = null;
let supabaseMaterials = [];
let selectedMaterialPhoto = null;

async function fetchMaterialsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("materials")
    .select("id, name, price, currency, image_url")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil materials:", error);
    supabaseMaterials = [];
    return;
  }

  supabaseMaterials = data || [];

  console.log("Materials loaded from Supabase:", supabaseMaterials);
}

function resetMaterialForm() {
  editingMaterialId = null;

  document.getElementById("materialName").value = "";

  document.getElementById("materialPrice").value = "";

  document.getElementById("materialCurrency").value = "Clean";

  selectedMaterialPhoto = null;
  document.getElementById("materialPhoto").value = "";
  document.getElementById("materialPhotoPreview").innerHTML = "";

  document.getElementById("saveMaterialBtn").textContent = "Simpan Material";

  document.getElementById("cancelMaterialBtn").classList.add("hidden");

  document.getElementById("materialName").focus();
}

function materialPage() {
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

                  <div class="mt-4">
                    <label for="materialPhoto" class="block text-sm text-zinc-400 mb-2">
                      Foto Material
                    </label>

                    <input
                      id="materialPhoto"
                      type="file"
                      accept="image/*"
                      class="input"
                      onchange="previewMaterialPhoto()">

                    <div id="materialPhotoPreview" class="mt-3"></div>
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

async function saveMaterial() {
  const name = document.getElementById("materialName").value.trim();
  const price = parseInt(document.getElementById("materialPrice").value);
  const currency = document.getElementById("materialCurrency").value;

  if (name === "") {
    alert("Nama wajib diisi.");
    return;
  }

  if (isNaN(price) || price <= 0) {
    alert("Harga harus lebih dari 0.");
    return;
  }

  const exists = supabaseMaterials.find(
    (material) =>
      material.name.toLowerCase() === name.toLowerCase() &&
      material.id !== editingMaterialId,
  );

  if (exists) {
    alert("Nama material sudah ada.");
    return;
  }

  // Untuk step ini kita kerjakan CREATE dahulu.

  const saveButton = document.getElementById("saveMaterialBtn");

  saveButton.disabled = true;
  saveButton.textContent =
    editingMaterialId === null ? "Menyimpan..." : "Mengupdate...";

  let error;
  let imageUrl = editingMaterialId === null
    ? null
    : supabaseMaterials.find((material) => material.id === editingMaterialId)?.image_url || null;

  try {
    if (editingMaterialId === null) {
      if (selectedMaterialPhoto) {
        imageUrl = await uploadMaterialPhoto(selectedMaterialPhoto);
      }

      const result = await supabaseClient.from("materials").insert({
        name: name,
        price: price,
        currency: currency,
        image_url: imageUrl,
      });

      error = result.error;
    } else {
      if (selectedMaterialPhoto) {
        imageUrl = await uploadMaterialPhoto(selectedMaterialPhoto);
      }

      const result = await supabaseClient
        .from("materials")
        .update({
          name: name,
          price: price,
          currency: currency,
          image_url: imageUrl,
        })
        .eq("id", editingMaterialId);

      error = result.error;
    }
  } catch (uploadError) {
    console.error("Gagal mengupload foto material:", uploadError);
    alert(`Foto material gagal disimpan.\n\n${uploadError.message || ""}`);
    saveButton.disabled = false;
    saveButton.textContent =
      editingMaterialId === null ? "Simpan Material" : "Update Material";
    return;
  }

  if (error) {
    console.error("Gagal menyimpan material:", error);

    alert(
      `${editingMaterialId === null ? "Material gagal disimpan." : "Material gagal diupdate."}\n\n${error.message || error.details || "Unknown Supabase error"}`,
    );

    saveButton.disabled = false;

    saveButton.textContent =
      editingMaterialId === null ? "Simpan Material" : "Update Material";

    return;
  }

  alert(
    editingMaterialId === null
      ? "Material berhasil disimpan."
      : "Material berhasil diupdate.",
  );

  await fetchMaterialsFromSupabase();

  renderMaterials();

  resetMaterialForm();
}

function editMaterial(id) {
  const material = supabaseMaterials.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!material) {
    alert("Material tidak ditemukan.");
    return;
  }

  editingMaterialId = Number(id);
  selectedMaterialPhoto = null;

  const photoInput = document.getElementById("materialPhoto");
  photoInput.value = "";

  document.getElementById("materialName").value = material.name;
  document.getElementById("materialPrice").value = material.price;
  document.getElementById("materialCurrency").value = material.currency;

  const preview = document.getElementById("materialPhotoPreview");
  preview.innerHTML = material.image_url
    ? `<img src="${material.image_url}" alt="Foto ${material.name}" class="w-24 h-24 object-cover rounded-xl border border-zinc-800">`
    : "";

  document.getElementById("saveMaterialBtn").textContent = "Update Material";

  document.getElementById("cancelMaterialBtn").classList.remove("hidden");

  document.getElementById("materialName").focus();
}

function renderMaterials() {
  const searchInput = document.getElementById("searchMaterial");

  if (!searchInput) return;

  const keyword = searchInput.value.toLowerCase();

  const data = supabaseMaterials;

  let html = "";

  data
    .filter((x) => x.name.toLowerCase().includes(keyword))
    .sort((a, b) => a.name.localeCompare(b.name, "id"))
    .forEach((item) => {
      html += `
        <div class="border border-zinc-800 rounded-xl p-5 mb-3 flex justify-between items-center">

      <div class="flex items-center gap-4">

        <img
          src="${item.image_url || "https://placehold.co/96x96?text=No+Photo"}"
          alt="Foto ${item.name}"
          class="w-20 h-20 object-cover rounded-xl border border-zinc-800">

      <div>

                <h3 class="font-bold text-lg">
                    ${item.name}
                </h3>

                <p>
                    ${item.currency === "Clean" ? "🟢 Clean" : "🔴 Dirty"}
                </p>

                <p>
                    Rp ${Number(item.price).toLocaleString("id-ID")}
                </p>

            </div>

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

  document.getElementById("materialList").innerHTML =
    html ||
    `
      <div class="text-center text-zinc-500 py-8">
        Material tidak ditemukan.
      </div>
    `;

  document.getElementById("materialCount").textContent =
    `${data.length} Material`;
}

function previewMaterialPhoto() {
  const input = document.getElementById("materialPhoto");
  const preview = document.getElementById("materialPhotoPreview");
  selectedMaterialPhoto = input.files?.[0] || null;

  if (!selectedMaterialPhoto) {
    preview.innerHTML = "";
    return;
  }

  const imageUrl = URL.createObjectURL(selectedMaterialPhoto);
  preview.innerHTML = `
    <img src="${imageUrl}" alt="Preview foto material" class="w-24 h-24 object-cover rounded-xl border border-zinc-800">
  `;
}

async function uploadMaterialPhoto(file) {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabaseClient.storage
    .from("material-images")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabaseClient.storage
    .from("material-images")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function deleteMaterial(id) {
  if (!confirm("Yakin ingin menghapus material ini?")) {
    return;
  }

  const { error } = await supabaseClient
    .from("materials")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Gagal menghapus material:", error);

    alert(
      "Material gagal dihapus. Material mungkin masih digunakan oleh crafting atau transaksi.",
    );

    return;
  }

  await fetchMaterialsFromSupabase();

  renderMaterials();

  alert("Material berhasil dihapus.");
}

async function loadMaterials() {
  setActiveMenu("material");
  setPageTitle("Materials");

  document.getElementById("app").innerHTML = materialPage();

  document.getElementById("materialList").innerHTML = `
    <div class="text-center text-zinc-500 py-8">
      Memuat material...
    </div>
  `;

  await fetchMaterialsFromSupabase();

  renderMaterials();

  lucide.createIcons();
}
