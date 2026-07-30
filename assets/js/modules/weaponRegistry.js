let weaponCraftings = [];

let editingWeaponRegistryId = null;

let weaponRegistry = [];

async function loadWeaponRegistry() {
  setPage("weapon-registry", "Weapon Registry");

  const app = document.getElementById("app");

  const response = await fetch("assets/html/weapon-registry/index.html");

  app.innerHTML = await response.text();

  await loadWeaponCraftings();
  await loadWeaponRegistryData();

  document
    .getElementById("btnSaveWeapon")
    ?.addEventListener("click", saveWeaponRegistry);

  document
    .getElementById("searchWeaponRegistry")
    ?.addEventListener("input", filterWeaponRegistry);

  lucide.createIcons();
}

async function loadWeaponCraftings() {
  const { data, error } = await supabaseClient
    .from("craftings")
    .select("id, name")
    .order("name");

  if (error) {
    console.error(error);
    return;
  }

  weaponCraftings = data;

  renderWeaponCraftingOptions();
}

function renderWeaponCraftingOptions() {
  const select = document.getElementById("weaponCrafting");

  if (!select) return;

  select.innerHTML = `
    <option value="">Pilih Weapon</option>
  `;

  weaponCraftings.forEach((weapon) => {
    select.innerHTML += `
      <option value="${weapon.id}">
        ${weapon.name}
      </option>
    `;
  });
}

async function saveWeaponRegistry() {
    const isEdit = editingWeaponRegistryId !== null;
  const craftingId = Number(document.getElementById("weaponCrafting").value);
  const serialInput = document.getElementById("weaponSerial");
  const saveButton = document.getElementById("btnSaveWeapon");

  const serialNumber = serialInput.value.trim();

  if (!craftingId) {
    showToast("Pilih weapon terlebih dahulu.", "error");
    return;
  }

  if (!serialNumber) {
    showToast("Serial Number wajib diisi.", "error");
    serialInput.focus();
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Menyimpan...";

  try {
    if (isEdit) {
      const { error } = await supabaseClient
        .from("weapon_registry")
        .update({
          crafting_id: craftingId,
          serial_number: serialNumber,
        })
        .eq("id", editingWeaponRegistryId);

      if (error) throw error;

      showToast("Weapon berhasil diperbarui.");
    } else {
      const { error } = await supabaseClient.from("weapon_registry").insert({
        crafting_id: craftingId,
        serial_number: serialNumber,
      });

      if (error) throw error;

      showToast("Weapon berhasil didaftarkan.");
    }

    serialInput.value = "";
    document.getElementById("weaponCrafting").value = "";

    editingWeaponRegistryId = null;

    saveButton.textContent = "Tambah";
    saveButton.disabled = false;

    await loadWeaponRegistryData();

    document.getElementById("searchWeaponRegistry").value = "";
    renderWeaponRegistryTable();

    serialInput.focus();
  } catch (error) {
    console.error(error);

    showToast(error.message, "error");

    saveButton.disabled = false;
    saveButton.textContent = isEdit ? "Update" : "Tambah";
  }
}

async function loadWeaponRegistryData() {
  const { data, error } = await supabaseClient
    .from("weapon_registry")
    .select(
      `
      id,
      crafting_id,
      serial_number,
      craftings (
        name
      )
    `,
    )
    .order("id", { ascending: false });

  console.log("LOAD DATA:", data);
  console.log("LOAD ERROR:", error);

  if (error) {
    console.error(error);
    return;
  }

  weaponRegistry = data;

  renderWeaponRegistryTable();
}

function renderWeaponRegistryTable(data = weaponRegistry) {
  const container = document.getElementById("weaponRegistryTable");

  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `
      <div class="text-center text-zinc-500 py-8">
        Belum ada data.
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-800">
            <th class="text-left py-3">Weapon</th>
            <th class="text-left py-3">Serial Number</th>
            <th class="text-center py-3 w-24">Aksi</th>
          </tr>
        </thead>

        <tbody>
          ${data
            .map(
              (item) => `
                <tr class="border-b border-zinc-800/50">
                  <td class="py-3">${item.craftings?.name ?? "-"}</td>
                  <td class="py-3 font-mono">${item.serial_number}</td>
                  <td class="text-center py-3">
                    <button
                      onclick="editWeaponRegistry(${item.id})"
                      class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
                      title="Edit"
                    >
                      <i data-lucide="square-pen" class="w-4 h-4"></i>
                    </button>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  lucide.createIcons();
}

function editWeaponRegistry(id) {
  const item = weaponRegistry.find((row) => row.id === Number(id));

  console.log(item);

  if (!item) return;

  editingWeaponRegistryId = item.id;

  document.getElementById("weaponCrafting").value = item.crafting_id;
  document.getElementById("weaponSerial").value = item.serial_number;

  document.getElementById("btnSaveWeapon").textContent = "Update";

  const saveButton = document.getElementById("btnSaveWeapon");

  saveButton.textContent = "Update";

  document.getElementById("weaponSerial").focus();
}

function filterWeaponRegistry() {
  const keyword = document
    .getElementById("searchWeaponRegistry")
    .value.trim()
    .toLowerCase();

  if (!keyword) {
    renderWeaponRegistryTable();
    return;
  }

  const filtered = weaponRegistry.filter((item) => {
    const weaponName = item.craftings?.name?.toLowerCase() || "";
    const serial = item.serial_number.toLowerCase();

    return weaponName.includes(keyword) || serial.includes(keyword);
  });

  renderWeaponRegistryTable(filtered);
}
