let selectedInventory = null;

async function loadInventory() {
  setActiveMenu("inventory");

  document.getElementById("pageTitle").textContent = "Inventory";

  const app = document.getElementById("app");

  const response = await fetch("assets/html/inventory/index.html");

  app.innerHTML = await response.text();

  lucide.createIcons();

  document
    .getElementById("btnAddInventory")
    ?.addEventListener("click", openAddInventoryModal);

  await loadInventoryItems();
  await loadAvailableMaterials();
  renderInventoryDetail();

  document
    .getElementById("inventorySearch")
    .addEventListener("input", filterInventory);
}

async function loadInventoryItems() {
  const { data, error } = await supabaseClient
    .from("inventory")
    .select(
      `
            id,
            stock,
            materials (
                id,
                name,
                price,
                currency
            )
        `,
    )
    .order("id");
  if (error) {
    console.error(error);
    return;
  }

  inventoryItems = data;

  renderInventory(inventoryItems);
}

function filterInventory() {
  const keyword = document
    .getElementById("inventorySearch")
    .value.trim()
    .toLowerCase();

  if (!keyword) {
    renderInventory(inventoryItems);
    return;
  }

  const filtered = inventoryItems.filter((item) =>
    item.materials.name.toLowerCase().includes(keyword),
  );

  renderInventory(filtered);
}

let availableMaterials = [];
let inventoryItems = [];
function renderInventory(materials) {
  const grid = document.getElementById("inventoryGrid");

  grid.innerHTML = materials
    .map(
      (material) => `
            <div
                class="inventory-card bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer transition-all hover:border-red-500 hover:-translate-y-1"
                data-id="${material.id}"
                onclick="selectInventory('${material.id}')"
            >
                <div class="flex justify-center">
                    <img
                        src="https://placehold.co/96x96"
                        class="w-24 h-24 object-contain"
                    >
                </div>

                <h3 class="mt-4 text-center font-semibold text-lg">
                    ${material.materials.name}
                </h3>

                <div class="mt-3 flex justify-center">
                    <span class="rounded-lg bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                        Stock : ${material.stock}
                    </span>
                </div>
            </div>
        `,
    )
    .join("");
}

function renderInventoryDetail(item = null) {
  const detail = document.getElementById("inventoryDetail");

  if (!item) {
    detail.innerHTML = `
            <div class="text-center text-zinc-500 py-20">
                <i data-lucide="package" class="w-16 h-16 mx-auto mb-4"></i>
                <p>Pilih item untuk melihat detail.</p>
            </div>
        `;

    lucide.createIcons();
    return;
  }

  detail.innerHTML = `
        <div class="space-y-6">

            <div class="flex justify-center">
                <img
                    src="https://placehold.co/180x180"
                    class="w-40 h-40 object-contain"
                >
            </div>

            <div class="text-center">
                <h2 class="text-2xl font-bold">
                    ${item.materials.name}
                </h2>

                <p class="text-zinc-500 mt-2">
                    ${item.materials.currency} Money
                </p>

                <p class="text-green-500 font-semibold">
                    $${Number(item.materials.price).toLocaleString()}
                </p>
            </div>

            <div>
    <label class="text-zinc-400 text-sm">
        Current Stock
    </label>

    <div
        class="mt-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 font-semibold"
    >
        ${item.stock}
    </div>
        </div>

        <div>
            <label class="text-zinc-400 text-sm">
                Action
            </label>

            <select
                id="stockAction"
                class="mt-2 w-full rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3"
            >
                <option value="deposit">📥 Deposit</option>
                <option value="withdraw">📤 Withdraw</option>
            </select>
        </div>

        <div>
            <label class="text-zinc-400 text-sm">
                Quantity
            </label>

            <input
                id="quantityInput"
                type="number"
                min="0"
                value="0"
                class="mt-2 w-full rounded-xl bg-zinc-950 border border-zinc-700 px-4 py-3"
            >
        </div>

        <div>
            <label class="text-zinc-400 text-sm">
                Result Stock
            </label>

            <div
                id="resultStock"
                class="mt-2 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 font-bold"
            >
                ${item.stock}
            </div>
        </div>

            <div class="flex gap-3">

            <button
                id="saveInventory"
                class="flex-1 rounded-xl bg-red-600 py-3 font-semibold hover:bg-red-700"
            >
                Simpan
            </button>

            <button
                id="deleteInventory"
                class="rounded-xl bg-zinc-700 px-5 py-3 hover:bg-red-700 transition"
            >
                Hapus
            </button>

        </div>    

        </div>
        `;

  const action = document.getElementById("stockAction");
  const quantity = document.getElementById("quantityInput");
  const result = document.getElementById("resultStock");

  function calculateResult() {
    const qty = Number(quantity.value) || 0;

    let finalStock = item.stock;

    if (action.value === "deposit") {
      finalStock += qty;
    } else {
      finalStock -= qty;
    }

    if (finalStock < 0) {
      finalStock = 0;
    }

    result.textContent = finalStock;
  }

  action.addEventListener("change", calculateResult);
  quantity.addEventListener("input", calculateResult);

  calculateResult();

  document
    .getElementById("saveInventory")
    .addEventListener("click", updateInventoryStock);

  document
    .getElementById("deleteInventory")
    .addEventListener("click", deleteInventory);
}

function selectInventory(id) {
  selectedInventory = inventoryItems.find((item) => item.id == id);

  document.querySelectorAll(".inventory-card").forEach((card) => {
    card.classList.remove("border-red-500");
    card.classList.add("border-zinc-800");
  });

  const card = document.querySelector(`[data-id="${id}"]`);

  card.classList.remove("border-zinc-800");
  card.classList.add("border-red-500");

  renderInventoryDetail(selectedInventory);
}

async function updateInventoryStock() {
  const action = document.getElementById("stockAction").value;

  const quantity = Number(document.getElementById("quantityInput").value) || 0;

  if (quantity <= 0) {
    alert("Quantity harus lebih dari 0.");
    return;
  }

  const beforeStock = selectedInventory.stock;

  let afterStock = beforeStock;

  if (action === "deposit") {
    afterStock += quantity;
  } else {
    afterStock -= quantity;
  }

  if (afterStock < 0) {
    alert("Stock tidak boleh kurang dari 0.");
    return;
  }

  const transaction = {
    inventoryId: selectedInventory.id,
    materialId: selectedInventory.materials.id,
    materialName: selectedInventory.materials.name,

    action,

    before: beforeStock,
    quantity,
    after: afterStock,
  };

  console.log(transaction);

  const { error } = await supabaseClient
    .from("inventory")
    .update({
      stock: transaction.after,
    })
    .eq("id", transaction.inventoryId);

  if (error) {
    console.error(error);
    return;
  }

  await saveInventoryLog(transaction);

  const discordSent = await sendInventoryDiscord(transaction);

  if (!discordSent) {
    console.warn("Inventory Discord gagal dikirim.");
  }

  selectedInventory.stock = transaction.after;

  const index = inventoryItems.findIndex(
    (item) => item.id === selectedInventory.id,
  );

  if (index !== -1) {
    inventoryItems[index].stock = transaction.after;
  }

  renderInventory(inventoryItems);
  selectInventory(selectedInventory.id);
}

async function saveInventoryLog(transaction) {
  console.log("Save Inventory Log", transaction);

  const { data, error } = await supabaseClient
    .from("inventory_logs")
    .insert({
      inventory_id: transaction.inventoryId,
      material_id: transaction.materialId,
      action: transaction.action,
      before_stock: transaction.before,
      quantity: transaction.quantity,
      after_stock: transaction.after,
    })
    .select();

  if (error) {
    return;
  }
}

async function sendInventoryDiscord(transaction) {
  const payload = buildInventoryEmbed(transaction);

  const type =
    transaction.action === "deposit" ? "inventoryDeposit" : "inventoryWithdraw";

  return await sendDiscordWebhook(type, payload);
}

async function openAddInventoryModal() {
  const options = availableMaterials
    .map(
      (material) => `
      <option value="${material.id}">
          ${material.name}
      </option>
  `,
    )
    .join("");

  const modal = document.createElement("div");

  modal.id = "inventoryModal";

  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm";

  modal.innerHTML = `
      <div class="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

          <h2 class="text-xl font-bold mb-6">
              Tambah Inventory
          </h2>

          <div class="space-y-5">

              <div>
                  <label class="block mb-2 text-sm text-zinc-400">
                      Material
                  </label>

                  <select
                      id="inventoryMaterial"
                      class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
                  >
                      ${options}
                  </select>
              </div>

              <div>
                  <label class="block mb-2 text-sm text-zinc-400">
                      Stock Awal
                  </label>

                  <input
                      id="inventoryStock"
                      type="number"
                      min="0"
                      value="0"
                      class="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3"
                  >
              </div>

              <div class="flex justify-end gap-3">

                  <button
                      id="btnCloseInventoryModal"
                      class="rounded-xl bg-zinc-700 px-5 py-3 hover:bg-zinc-600"
                  >
                      Batal
                  </button>

                  <button
                      id="btnSaveInventoryModal"
                      class="rounded-xl bg-red-600 px-5 py-3 hover:bg-red-700"
                  >
                      Simpan
                  </button>

              </div>

          </div>

      </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("btnCloseInventoryModal").onclick = () =>
    modal.remove();

  document.getElementById("btnSaveInventoryModal").onclick = saveNewInventory;
}

async function loadAvailableMaterials() {
  const inventoryMaterialIds = inventoryItems.map((item) => item.materials.id);

  let query = supabaseClient.from("materials").select("id, name").order("name");

  if (inventoryMaterialIds.length > 0) {
    query = query.not("id", "in", `(${inventoryMaterialIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return;
  }

  availableMaterials = data;
}

async function saveNewInventory() {
  const materialId = Number(document.getElementById("inventoryMaterial").value);
  const stock = Number(document.getElementById("inventoryStock").value);

  if (!materialId) {
    alert("Pilih material.");
    return;
  }

  if (stock < 0) {
    alert("Stock tidak valid.");
    return;
  }

  const { data, error } = await supabaseClient
    .from("inventory")
    .insert({
      material_id: materialId,
      stock: stock,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  document.getElementById("inventoryModal")?.remove();

  await loadInventoryItems();
  await loadAvailableMaterials();

  const newItem = inventoryItems.find(
    (item) => item.materials.id === materialId,
  );

  if (newItem) {
    selectInventory(newItem.id);
  }

  alert("Inventory berhasil ditambahkan.");
}

async function deleteInventory() {
  if (!selectedInventory) return;

  const result = await Swal.fire({
    title: "Hapus Inventory?",
    html: `
            Item <b>${selectedInventory.materials.name}</b>
            akan dihapus dari inventory.
        `,
    icon: "warning",

    background: "#18181b",
    color: "#fff",

    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#3f3f46",

    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
  });

  if (!result.isConfirmed) return;

  const { error } = await supabaseClient
    .from("inventory")
    .delete()
    .eq("id", selectedInventory.id);

  if (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: "Inventory gagal dihapus.",
      background: "#18181b",
      color: "#fff",
    });

    return;
  }

  selectedInventory = null;

  await loadInventoryItems();
  await loadAvailableMaterials();

  renderInventoryDetail();

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Inventory berhasil dihapus.",
    timer: 1800,
    showConfirmButton: false,

    background: "#18181b",
    color: "#fff",
  });
}
