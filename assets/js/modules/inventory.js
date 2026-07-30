let selectedInventory = null;

async function loadInventory() {

  setActiveMenu("inventory");

  document.getElementById("pageTitle").textContent = "Inventory";

  const app = document.getElementById("app");

  const response = await fetch("assets/html/inventory/index.html");

  app.innerHTML = await response.text();

  lucide.createIcons();

  await loadInventoryItems();
  renderInventoryDetail();
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
  console.log(data);
  console.log(inventoryItems[0]);
}

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
                        src="${material.materials.image || "https://placehold.co/96x96"}"
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

            <button
                id="saveInventory"
                class="w-full rounded-xl bg-red-600 py-3 font-semibold hover:bg-red-700"
            >
                Simpan
            </button>

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

  console.log("DATA :", data);
  console.log("ERROR :", error);

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
