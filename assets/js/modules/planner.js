let productionItems = [
  {
    craftingId: "",
    qty: 1,
  },
];

let payment = {
  method: "dirty",
  cashPercent: 50,

  cleanMultiplier: 2,
};

function plannerPage() {
  return `
    
    <div class="card">

        <h2 class="text-2xl font-bold mb-6">
            Production Planner
        </h2>

        <div id="plannerRows"></div>

        <button
            onclick="addPlannerRow()"
            class="btn mt-5">

            ➕ Tambah Produksi

        </button>

    </div>

    <div class="card mt-6">

        <h2 class="text-2xl font-bold mb-5">
            📦 Ringkasan Produksi
        </h2>

        <div id="plannerSummary"></div>

    </div>

    <div class="card mt-6">

        <h2 class="text-2xl font-bold mb-5">
            🧱 Total Material
        </h2>

        <div id="plannerResult"></div>

    </div>

    <div class="card mt-6">

    <h2 class="text-2xl font-bold mb-5">
        💳 Metode Pembayaran
    </h2>

    <div id="paymentMethod">

        <label class="flex items-center gap-3 mb-4">

            <input
                type="radio"
                name="payment"
                value="dirty"
                checked
                onchange="changePaymentMethod('dirty')">

            Full Dirty Money

        </label>

        <label class="flex items-center gap-3 mb-4">

            <input
                type="radio"
                name="payment"
                value="clean"
                onchange="changePaymentMethod('clean')">

            Full Clean Money

        </label>

        <label class="flex items-center gap-3 mb-4">

            <input
                type="radio"
                name="payment"
                value="hybrid50"
                onchange="changePaymentMethod('hybrid50')">

            Hybrid 50% / 50%

        </label>

        <label class="flex items-center gap-3">

            <input
                type="radio"
                name="payment"
                value="hybridCustom"
                onchange="changePaymentMethod('hybridCustom')">

            Hybrid Custom

        </label>

        <div
            id="customPercent"
            class="mt-5 hidden">

            <label class="block mb-2">

                Persentase Cash

            </label>

                <input
                    id="cashPercent"
                    type="number"
                    min="0"
                    max="100"
                    value="50"
                    class="input"
                    oninput="changeCashPercent(this.value)">

                </div>

            </div>

        </div>

    <div class="card mt-6">

    <h2 class="text-2xl font-bold mb-5">
        📄 Ringkasan Transaksi
    </h2>

    <div id="transactionSummary"></div>

    <button
        onclick="saveTransaction()"
        class="btn mt-5 w-full">

        💾 Simpan Transaksi

    </button>

</div>


    <div class="card mt-6">

        <h2 class="text-2xl font-bold mb-5">
        💸 Modal Produksi
        </h2>

        <div id="plannerCost"></div>

    </div>

    <div class="card mt-6">

        <h2 class="text-2xl font-bold mb-5">
        📈 Profit Produksi
        </h2>

    <div id="plannerProfit"></div>

</div>

  `;
}

function refreshPlanner() {
  renderProductionSummary();
  calculatePlanner();
  renderProductionCost();
  renderProductionProfit();
  renderTransactionSummary();
}

function loadPlanner() {
  setActiveMenu("menu-calculator");

  document.getElementById("app").innerHTML = plannerPage();

  renderPlannerRows();
  refreshPlanner();
}

function addPlannerRow() {
  productionItems.push({
    craftingId: "",
    qty: 1,
  });

  renderPlannerRows();
  refreshPlanner();
}

function removePlannerRow(index) {
  if (productionItems.length === 1) {
    alert("Minimal harus ada satu item produksi.");
    return;
  }

  productionItems.splice(index, 1);

  renderPlannerRows();
  refreshPlanner();
}

function renderPlannerRows() {
  const craftings = getCraftings();

  let html = "";

  productionItems.forEach((item, index) => {
    html += `
        <div class="grid md:grid-cols-3 gap-4 mb-4">

            <select
                class="input"
                onchange="productionItems[${index}].craftingId=this.value; refreshPlanner();">
                <option value="">
                    Pilih Crafting
                </option>

                ${craftings
                  .map(
                    (crafting) => `
                    <option
                        value="${crafting.id}"
                        ${item.craftingId == crafting.id ? "selected" : ""}>

                        ${crafting.name}

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
                onchange="productionItems[${index}].qty=parseInt(this.value); refreshPlanner();">

            <button
                onclick="removePlannerRow(${index})"
                class="btn-delete">

                🗑 Hapus

            </button>

        </div>
        `;
  });

  document.getElementById("plannerRows").innerHTML = html;
}

function calculatePlanner() {
  const summary = getMaterialSummary();

  let html = "";

  summary.materials.forEach((material) => {
    html += `
<div class="border border-zinc-800 rounded-lg p-4 mb-3">

    <div class="flex justify-between">

        <strong>${material.name}</strong>

        <strong>${material.qty}</strong>

    </div>

    <div class="flex justify-between text-sm text-gray-400 mt-2">

        <span>

            ${material.currency}

            • Rp ${material.price.toLocaleString("id-ID")}

        </span>

        <span>

            Rp ${material.subtotal.toLocaleString("id-ID")}

        </span>

    </div>

</div>
`;
  });

  if (html === "") {
    html = `
      <p class="text-gray-500">
          Belum ada produksi.
      </p>
    `;
  }

  document.getElementById("plannerResult").innerHTML = html;
}

function renderProductionSummary() {
  const craftings = getCraftings();

  let totalQty = 0;
  let totalPrice = 0;

  let html = "";

  productionItems.forEach((plan) => {
    if (plan.craftingId === "") return;

    const crafting = craftings.find((c) => c.id == plan.craftingId);

    if (!crafting) return;

    const subtotal = crafting.sellPrice * plan.qty;

    totalQty += plan.qty;
    totalPrice += subtotal;

    html += `
        <div class="flex justify-between items-center border-b border-zinc-800 py-3">

            <div>

                <div class="font-semibold">
                    ${crafting.name}
                </div>

                <div class="text-sm text-gray-400">
                    Qty : ${plan.qty}
                </div>

            </div>

            <div class="font-semibold text-green-400">

                Rp ${subtotal.toLocaleString("id-ID")}

            </div>

        </div>
        `;
  });

  if (html === "") {
    html = `
            <p class="text-gray-500">
                Belum ada item produksi.
            </p>
        `;
  } else {
    html += `
        <div class="mt-5 border-t border-zinc-700 pt-4 space-y-2">

            <div class="flex justify-between">

                <span>Total Item</span>

                <strong>${totalQty}</strong>

            </div>

            <div class="flex justify-between text-lg">

                <span>Total Harga</span>

                <strong class="text-green-400">
                    Rp ${totalPrice.toLocaleString("id-ID")}
                </strong>

            </div>

        </div>
        `;
  }

  document.getElementById("plannerSummary").innerHTML = html;
}

function renderProductionCost() {
  const summary = getMaterialSummary();
  const { cleanCost, dirtyCost, totalCost } = summary;

  document.getElementById("plannerCost").innerHTML = `
    
        <div class="space-y-3">

            <div class="flex justify-between">

                <span>🟢 Clean Material</span>

                <strong>
                    Rp ${cleanCost.toLocaleString("id-ID")}
                </strong>

            </div>

            <div class="flex justify-between">

                <span>🔴 Dirty Material</span>

                <strong>
                    Rp ${dirtyCost.toLocaleString("id-ID")}
                </strong>

            </div>

            <hr class="border-zinc-700">

            <div class="flex justify-between text-lg">

                <span>Total Modal</span>

                <strong class="text-red-400">

                    Rp ${totalCost.toLocaleString("id-ID")}

                </strong>

            </div>

        </div>

    `;
}

function renderProductionProfit() {
  const totalSell = getTotalSellPrice();

  const { totalCost } = getMaterialSummary();

  const profit = totalSell - totalCost;

  document.getElementById("plannerProfit").innerHTML = `

        <div class="space-y-3">

            <div class="flex justify-between">

                <span>Total Harga Jual</span>

                <strong>

                    Rp ${totalSell.toLocaleString("id-ID")}

                </strong>

            </div>

            <div class="flex justify-between">

                <span>Total Modal</span>

                <strong>

                    Rp ${totalCost.toLocaleString("id-ID")}

                </strong>

            </div>

            <hr class="border-zinc-700">

            <div class="flex justify-between text-xl">

                <span>Profit</span>

                <strong class="text-green-400">

                    Rp ${profit.toLocaleString("id-ID")}

                </strong>

            </div>

        </div>

    `;
}

function changePaymentMethod(method) {
  payment.method = method;

  document
    .getElementById("customPercent")
    .classList.toggle("hidden", method !== "hybridCustom");

  renderTransactionSummary();
}

function changeCashPercent(value) {
  let percent = Number(value);

  if (isNaN(percent)) percent = 0;

  percent = Math.min(100, Math.max(0, percent));
  payment.cashPercent = percent;

  renderTransactionSummary();
}

function renderTransactionSummary() {
  const transaction = getTransactionResult();

  let html = "";

  switch (transaction.method) {
    case "dirty":
      html = renderDirtyTransaction(transaction);
      break;

    case "clean":
      html = renderCleanTransaction(transaction);
      break;

    case "hybrid50":
      html = renderHybrid50Transaction(transaction);
      break;

    case "hybridCustom":
      html = renderHybridCustomTransaction(transaction);
      break;

    default:
      html = `
        <p class="text-gray-500">
            Metode belum dibuat.
        </p>
      `;
  }

  document.getElementById("transactionSummary").innerHTML = html;
}

function getTotalSellPrice() {
  const craftings = getCraftings();

  let total = 0;

  productionItems.forEach((plan) => {
    if (plan.craftingId === "") return;

    const crafting = craftings.find((c) => c.id == plan.craftingId);

    if (!crafting) return;

    total += crafting.sellPrice * plan.qty;
  });

  return total;
}

function getTotalMaterials() {
  const craftings = getCraftings();

  const materials = {};

  productionItems.forEach((plan) => {
    if (!plan.craftingId) return;

    const crafting = craftings.find((c) => c.id == plan.craftingId);

    if (!crafting) return;

    crafting.materials.forEach((item) => {
      const qty = item.qty * plan.qty;

      if (!materials[item.materialId]) {
        materials[item.materialId] = 0;
      }

      materials[item.materialId] += qty;
    });
  });

  return materials;
}

function getMaterialSummary() {
  const totalMaterials = getTotalMaterials();
  const materials = getMaterials() || [];

  let cleanCost = 0;
  let dirtyCost = 0;

  const detail = [];

  Object.entries(totalMaterials).forEach(([id, qty]) => {
    const material = materials.find((m) => m.id == id);

    if (!material) return;

    const subtotal = qty * material.price;

    if (material.currency === "Clean") {
      cleanCost += subtotal;
    } else {
      dirtyCost += subtotal;
    }

    detail.push({
      id,
      name: material.name,
      qty,
      currency: material.currency,
      price: material.price,
      subtotal,
    });
  });

  return {
    materials: detail,

    cleanCost,

    dirtyCost,

    totalCost: cleanCost + dirtyCost,
  };
}

function getTransactionResult() {
  const totalSellPrice = getTotalSellPrice();

  const summary = getMaterialSummary();

  switch (payment.method) {
    case "dirty":
      return {
        method: "dirty",
        totalSellPrice,
        dirtyMoney: totalSellPrice,
        cleanMoney: 0,
        cashPercent: 100,
        materialPercent: 0,
        cleanMultiplier: payment.cleanMultiplier,
        materials: [],
      };

    case "clean":
      return {
        method: "clean",
        totalSellPrice,
        dirtyMoney: 0,
        cleanMoney: totalSellPrice * payment.cleanMultiplier,
        cashPercent: 100,
        materialPercent: 0,
        cleanMultiplier: payment.cleanMultiplier,
        materials: [],
      };

    case "hybrid50": {
      const cashPercent = 50;

      const materials = summary.materials.map(
        ({ id, name, qty, currency }) => ({
          id,
          name,
          qty: Math.ceil(qty * 0.5),
          currency,
        }),
      );

      return {
        method: "hybrid50",
        totalSellPrice,
        dirtyMoney: totalSellPrice * (cashPercent / 100),
        cleanMoney: 0,
        cashPercent: cashPercent,
        materialPercent: 100 - cashPercent,
        cleanMultiplier: payment.cleanMultiplier,
        materials,
      };
    }

    case "hybridCustom": {
      const materialPercent = 100 - payment.cashPercent;

      const materials = summary.materials.map(
        ({ id, name, qty, currency }) => ({
          id,
          name,
          qty: Math.ceil(qty * (materialPercent / 100)),
          currency,
        }),
      );

      return {
        method: "hybridCustom",
        totalSellPrice,
        dirtyMoney: totalSellPrice * (payment.cashPercent / 100),
        cleanMoney: 0,
        cashPercent: payment.cashPercent,
        materialPercent,
        cleanMultiplier: payment.cleanMultiplier,
        materials,
      };
    }

    default:
      return {
        method: payment.method,
        totalSellPrice,
        dirtyMoney: 0,
        cleanMoney: 0,
        cashPercent: payment.cashPercent,
        materialPercent: 100 - payment.cashPercent,
        cleanMultiplier: payment.cleanMultiplier,
        materials: [],
      };
  }
}

function saveTransaction() {
  const transactions = getTransactions();

  const transaction = getTransactionResult();

  transactions.push({
    id: Date.now(),
    createdAt: new Date().toISOString(),
    transaction,
  });

  saveTransactions(transactions);

  alert("Transaksi berhasil disimpan.");
}

function renderDirtyTransaction(transaction) {
  return `
    <div class="space-y-3">

        <div class="flex justify-between">
            <span>Metode</span>
            <strong>Full Dirty Money</strong>
        </div>

        <hr class="border-zinc-700">

        <div class="flex justify-between text-lg">
            <span>🔴 Dirty Money</span>

            <strong class="text-red-400">
                Rp ${transaction.dirtyMoney.toLocaleString("id-ID")}
            </strong>

        </div>

    </div>
    `;
}

function renderCleanTransaction(transaction) {
  return `
    <div class="space-y-3">

        <div class="flex justify-between">
            <span>Metode</span>
            <strong>Full Clean Money</strong>
        </div>

        <hr class="border-zinc-700">

        <div class="flex justify-between">
            <span>Multiplier</span>
            <strong>x${transaction.cleanMultiplier}</strong>
        </div>

        <div class="flex justify-between text-lg">

            <span>🟢 Clean Money</span>

            <strong class="text-green-400">
                Rp ${transaction.cleanMoney.toLocaleString("id-ID")}
            </strong>

        </div>

    </div>
    `;
}

function renderHybrid50Transaction(transaction) {
  let materialHTML = "";

  transaction.materials.forEach((material) => {
    materialHTML += `
        <div class="flex justify-between">
            <span>${material.name}</span>
            <strong>${material.qty}</strong>
        </div>
    `;
  });

  return `
    <div class="space-y-4">

        <div class="flex justify-between">
            <span>Metode</span>
            <strong>Hybrid 50%</strong>
        </div>

        <hr class="border-zinc-700">

        <div class="flex justify-between">
            <span>🔴 Dirty Money</span>

            <strong class="text-red-400">
                Rp ${transaction.dirtyMoney.toLocaleString("id-ID")}
            </strong>

        </div>

        <hr class="border-zinc-700">

        <h3 class="font-semibold">
            Material yang harus dibawa
        </h3>

        ${materialHTML}

    </div>
    `;
}

function renderHybridCustomTransaction(transaction) {
  let materialHTML = "";

  transaction.materials.forEach((material) => {
    materialHTML += `
        <div class="flex justify-between">
            <span>${material.name}</span>
            <strong>${material.qty}</strong>
        </div>
    `;
  });

  return `
    <div class="space-y-4">

        <div class="flex justify-between">
            <span>Metode</span>
            <strong>Hybrid Custom</strong>
        </div>

        <div class="flex justify-between">
            <span>Cash</span>
            <strong>${transaction.cashPercent}%</strong>
        </div>

        <div class="flex justify-between">
            <span>Material</span>
            <strong>${transaction.materialPercent}%</strong>
        </div>

        <hr class="border-zinc-700">

        <div class="flex justify-between">

            <span>🔴 Dirty Money</span>

            <strong class="text-red-400">
                Rp ${transaction.dirtyMoney.toLocaleString("id-ID")}
            </strong>

        </div>

        <hr class="border-zinc-700">

        <h3 class="font-semibold">
            Material yang harus dibawa
        </h3>

        ${materialHTML}

    </div>
    `;
}
