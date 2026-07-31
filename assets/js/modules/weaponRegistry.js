let weaponCraftings = [];

let editingWeaponRegistryId = null;

let weaponRegistry = [];

// Pagination
let currentPage = 1;
let perPage = 10;
let totalData = 0;
let totalPages = 1;

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
    .getElementById("btnCancelWeapon")
    ?.addEventListener("click", cancelEditWeaponRegistry);

  document
    .getElementById("searchWeaponRegistry")
    ?.addEventListener("input", filterWeaponRegistry);

  document
    .getElementById("btnPrevWeapon")
    ?.addEventListener("click", previousWeaponPage);

  document
    .getElementById("btnNextWeapon")
    ?.addEventListener("click", nextWeaponPage);

  document
    .getElementById("btnExportWeapon")
    ?.addEventListener("click", exportWeaponRegistryExcel);

  document
    .getElementById("weaponRegistryPerPage")
    ?.addEventListener("change", async (e) => {
      perPage = Number(e.target.value);

      currentPage = 1;

      await loadWeaponRegistryData();
    });

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
  console.log("SAVE DIPANGGIL");
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
      console.log("UPDATE ID :", editingWeaponRegistryId);
      console.log("CRAFTING :", craftingId);
      console.log("SERIAL :", serialNumber);
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

    saveButton.disabled = false;

    cancelEditWeaponRegistry();

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
  const from = (currentPage - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabaseClient
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
      { count: "exact" },
    )
    .order("id", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return;
  }

  weaponRegistry = data ?? [];

  totalData = count ?? 0;
  totalPages = Math.max(1, Math.ceil(totalData / perPage));

  renderWeaponRegistryTable();
}

function renderWeaponRegistryTable(data = weaponRegistry) {
  const container = document.getElementById("weaponRegistryTable");

  const totalBadge = document.getElementById("weaponRegistryTotal");

  const info = document.getElementById("weaponRegistryInfo");

  const btnPrev = document.getElementById("btnPrevWeapon");

  const btnNext = document.getElementById("btnNextWeapon");

  if (btnPrev) {
    btnPrev.disabled = currentPage === 1;
    btnPrev.classList.toggle("opacity-50", currentPage === 1);
  }

  if (btnNext) {
    btnNext.disabled = currentPage === totalPages;
    btnNext.classList.toggle("opacity-50", currentPage === totalPages);
  }

  if (totalBadge) {
    totalBadge.innerHTML = `
        <div class="text-xs uppercase tracking-widest text-red-300">
            Total Weapon
        </div>

        <div class="mt-1 text-2xl font-bold text-white">
            ${totalData}
        </div>
    `;
  }

  if (info) {
    const start = totalData === 0 ? 0 : (currentPage - 1) * perPage + 1;

    const end = Math.min(currentPage * perPage, totalData);

    info.textContent = `Menampilkan ${start}–${end} dari ${totalData} data`;
  }

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
                    <div class="flex items-center justify-center gap-2">

                      <button
                        onclick="editWeaponRegistry(${item.id})"
                        class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                        title="Edit"
                      >
                        <i data-lucide="square-pen" class="w-4 h-4"></i>
                      </button>

                      <button
                        onclick="deleteWeaponRegistry(${item.id})"
                        class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-600 hover:bg-red-700 transition"
                        title="Hapus"
                      >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                      </button>

                    </div>
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

  renderWeaponPagination();
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
  const cancelButton = document.getElementById("btnCancelWeapon");

  saveButton.textContent = "Update";
  cancelButton.classList.remove("hidden");

  document.getElementById("weaponSerial").focus();
}

function cancelEditWeaponRegistry() {
  editingWeaponRegistryId = null;

  document.getElementById("weaponSerial").value = "";

  const saveButton = document.getElementById("btnSaveWeapon");
  const cancelButton = document.getElementById("btnCancelWeapon");

  saveButton.textContent = "Tambah";
  cancelButton.classList.add("hidden");

  document.getElementById("weaponSerial").focus();
}

async function deleteWeaponRegistry(id) {
  const item = weaponRegistry.find((row) => row.id === Number(id));

  if (!item) return;

  const confirmed = confirm(
    `Yakin ingin menghapus weapon "${item.craftings?.name ?? "-"}"\n\nSerial: ${item.serial_number}?`,
  );

  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("weapon_registry")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    showToast(error.message, "error");
    return;
  }

  showToast("Weapon berhasil dihapus.");

  await loadWeaponRegistryData();
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

function exportWeaponRegistryExcel() {
  if (!weaponRegistry.length) {
    showToast("Belum ada data untuk diexport.", "error");
    return;
  }

  const rows = weaponRegistry.map((item, index) => ({
    No: index + 1,
    Weapon: item.craftings?.name ?? "-",
    "Serial Number": item.serial_number,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Weapon Registry");

  const today = new Date();

  const fileName = `Weapon Registry ${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.xlsx`;

  XLSX.writeFile(workbook, fileName);

  showToast("Export Excel berhasil.");
}

async function previousWeaponPage() {
  if (currentPage <= 1) return;

  currentPage--;

  await loadWeaponRegistryData();
}

async function nextWeaponPage() {
  if (currentPage >= totalPages) return;

  currentPage++;

  await loadWeaponRegistryData();
}

function renderWeaponPagination() {
  const container = document.getElementById("weaponRegistryPageNumbers");

  if (!container) return;

  container.innerHTML = "";

  const pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  pages.forEach((page) => {
    if (page === "...") {
      const span = document.createElement("span");
      span.className = "px-2 text-zinc-500";
      span.textContent = "...";
      container.appendChild(span);
      return;
    }

    const button = document.createElement("button");

    button.textContent = page;

    button.className = "px-3 py-2 rounded-lg transition";

    if (page === currentPage) {
      button.classList.add("bg-red-600", "text-white");
    } else {
      button.classList.add("bg-zinc-800", "hover:bg-zinc-700");
    }

    button.onclick = async () => {
      currentPage = page;
      await loadWeaponRegistryData();
    };

    container.appendChild(button);
  });
}
