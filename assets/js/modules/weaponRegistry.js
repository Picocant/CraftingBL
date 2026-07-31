let weaponCraftings = [];

let editingWeaponRegistryId = null;

let weaponRegistry = [];

const selectedWeapons = new Set();

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

  document
    .getElementById("btnCancelSelectedWeapon")
    ?.addEventListener("click", clearWeaponSelection);

  document
    .getElementById("btnDeleteSelectedWeapon")
    ?.addEventListener("click", deleteSelectedWeapons);
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

  if (!select) {
    return;
  }

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
        <thead class="border-b border-zinc-800 bg-zinc-800/40">
          <tr>

            <th class="w-12 px-4 py-3 text-center">
              <input
                type="checkbox"
                id="selectAllWeapons"
                class="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-red-600"
              />
            </th>

            <th class="w-16 px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
              No
            </th>

            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Weapon
            </th>

            <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Serial Number
            </th>

            <th class="w-28 px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Aksi
            </th>

          </tr>
        </thead>

        <tbody>
            ${data
              .map(
                (item, index) => `
                  <tr class="group border-b border-zinc-800/50 transition-colors duration-200 hover:bg-zinc-800/40">

                    <td class="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        class="weapon-checkbox h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-red-600"
                        data-id="${item.id}"
                        ${selectedWeapons.has(item.id) ? "checked" : ""}
                      />
                    </td>

                    <td class="w-16 px-4 py-4 text-center text-sm text-zinc-500">
                      ${(currentPage - 1) * perPage + index + 1}
                    </td>

                    <!-- Weapon -->
                    <td class="px-4 py-4">
                      <span class="font-medium text-white">
                        ${item.craftings?.name ?? "-"}
                      </span>
                    </td>

                    <!-- Serial -->
                    <td class="px-4 py-4">
                      <span class="font-mono text-sm text-zinc-300">
                        ${item.serial_number}
                      </span>
                    </td>

                    <!-- Action -->
                    <td class="px-4 py-4">
                      <div class="flex items-center justify-center gap-2">

                        <button
                          onclick="editWeaponRegistry(${item.id})"
                          title="Edit"
                          class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30"
                        >
                          <i data-lucide="square-pen" class="h-4 w-4"></i>
                        </button>

                        <button
                          onclick="deleteWeaponRegistry(${item.id})"
                          title="Hapus"
                          class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30"
                        >
                          <i data-lucide="trash-2" class="h-4 w-4"></i>
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

  initWeaponSelection();

  initSelectAllWeapon();

  updateSelectAllState();

  updateSelectionToolbar();
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

function initWeaponSelection() {
  document.querySelectorAll(".weapon-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const id = Number(this.dataset.id);

      if (this.checked) {
        selectedWeapons.add(id);
      } else {
        selectedWeapons.delete(id);
      }

      updateSelectAllState();
      updateSelectionToolbar();

      console.log([...selectedWeapons]);
    });
  });
}

function initSelectAllWeapon() {
  const selectAll = document.getElementById("selectAllWeapons");

  if (!selectAll) return;

  selectAll.addEventListener("change", function () {
    const checked = this.checked;

    document.querySelectorAll(".weapon-checkbox").forEach((checkbox) => {
      checkbox.checked = checked;

      const id = Number(checkbox.dataset.id);

      if (checked) {
        selectedWeapons.add(id);
      } else {
        selectedWeapons.delete(id);
      }
    });

    updateSelectionToolbar();
    updateSelectAllState();

    console.log([...selectedWeapons]);
  });
}

function updateSelectionToolbar() {
  const normalToolbar = document.getElementById("weaponNormalToolbar");
  const selectionToolbar = document.getElementById("weaponSelectionToolbar");
  const counter = document.getElementById("selectedWeaponCount");

  if (!normalToolbar || !selectionToolbar || !counter) return;

  const total = selectedWeapons.size;

  counter.textContent = total;

  if (total > 0) {
    normalToolbar.classList.add("hidden");
    selectionToolbar.classList.remove("hidden");
  } else {
    normalToolbar.classList.remove("hidden");
    selectionToolbar.classList.add("hidden");
  }
}

function updateSelectAllState() {
  const selectAll = document.getElementById("selectAllWeapons");

  if (!selectAll) return;

  const checkboxes = document.querySelectorAll(".weapon-checkbox");

  if (checkboxes.length === 0) {
    selectAll.checked = false;
    return;
  }

  selectAll.checked = [...checkboxes].every((checkbox) => checkbox.checked);
}

function clearWeaponSelection() {
  selectedWeapons.clear();

  document.querySelectorAll(".weapon-checkbox").forEach((checkbox) => {
    checkbox.checked = false;
  });

  const selectAll = document.getElementById("selectAllWeapons");
  if (selectAll) {
    selectAll.checked = false;
  }

  updateSelectionToolbar();
}

async function deleteSelectedWeapons() {
  if (selectedWeapons.size === 0) return;

  const confirmed = confirm(
    `Yakin ingin menghapus ${selectedWeapons.size} weapon yang dipilih?`,
  );

  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("weapon_registry")
    .delete()
    .in("id", [...selectedWeapons]);

  if (error) {
    console.error(error);
    showToast(error.message, "error");
    return;
  }

  showToast(`${selectedWeapons.size} weapon berhasil dihapus.`);

  selectedWeapons.clear();

  await loadWeaponRegistryData();
}
