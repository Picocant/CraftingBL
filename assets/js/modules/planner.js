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

/* =========================================================
   PAGE
========================================================= */

function plannerPage() {
  return `
    <div class="space-y-6">

      <!-- =====================================================
           HEADER
      ====================================================== -->
      <div
        class="
          flex flex-col
          md:flex-row
          md:items-center
          justify-between
          gap-4
        "
      >

        <div>

          <h1 class="text-2xl font-black">
            Production Planner
          </h1>

          <p class="text-sm text-zinc-500 mt-1">
            Buat dan hitung kebutuhan produksi crafting.
          </p>

        </div>

        <div class="flex items-center gap-2 text-xs text-zinc-500">

          <i
            data-lucide="calculator"
            class="w-4 h-4 text-red-500"
          ></i>

          Crafting Calculator

        </div>

      </div>


      <!-- =====================================================
           1. INFORMASI PEMESANAN
      ====================================================== -->
      <div class="card">

        <div class="flex items-center gap-3 mb-6">

          <div
            class="
              w-10 h-10
              rounded-xl
              bg-red-500/10
              border border-red-500/20
              flex items-center
              justify-center
            "
          >

            <i
              data-lucide="clipboard-pen-line"
              class="w-5 h-5 text-red-400"
            ></i>

          </div>

          <div>

            <h2 class="font-bold">
              Informasi Pemesanan
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Lengkapi data pemesan dan tanggal pemesanan.
            </p>

          </div>

        </div>


        <div class="grid md:grid-cols-2 gap-5">

          <!-- CUSTOMER -->
          <div>

            <label
              for="customerName"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Nama Pemesan
            </label>

            <div class="relative">

              <i
                data-lucide="user-round"
                class="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  w-4 h-4
                  text-zinc-500
                  pointer-events-none
                "
              ></i>

              <input
                id="customerName"
                type="text"
                class="input pl-11"
                placeholder="Contoh: BLACK LINE"
                autocomplete="off"
              >

            </div>

          </div>


          <!-- ORDER DATE -->
          <div>

            <label
              for="orderDate"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Tanggal Pemesanan
            </label>

            <div class="relative">

              <i
                data-lucide="calendar-days"
                class="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  w-4 h-4
                  text-zinc-500
                  pointer-events-none
                "
              ></i>

              <input
                id="orderDate"
                type="datetime-local"
                step="1"
                class="input pl-11"
              >

            </div>

          </div>

        </div>

      </div>


      <!-- =====================================================
           2. DAFTAR PRODUKSI
      ====================================================== -->
      <div class="card">

        <div class="flex items-center justify-between mb-6">

          <div class="flex items-center gap-3">

            <div
              class="
                w-10 h-10
                rounded-xl
                bg-red-500/10
                border border-red-500/20
                flex items-center
                justify-center
              "
            >

              <i
                data-lucide="clipboard-list"
                class="w-5 h-5 text-red-500"
              ></i>

            </div>

            <div>

              <h2 class="font-bold">
                Daftar Produksi
              </h2>

              <p class="text-xs text-zinc-500 mt-1">
                Pilih crafting dan jumlah yang ingin dibuat.
              </p>

            </div>

          </div>


          <div
            id="productionCount"
            class="
              text-xs
              text-zinc-500
              bg-zinc-800
              px-3 py-2
              rounded-lg
            "
          >
            0 Item
          </div>

        </div>


        <!-- COLUMN HEADER -->
        <div
          class="
            hidden
            md:grid
            md:grid-cols-[1fr_140px_110px]
            gap-3
            mb-2
            px-1
          "
        >

          <div
            class="
              text-[10px]
              uppercase
              tracking-widest
              text-zinc-600
            "
          >
            Crafting
          </div>

          <div
            class="
              text-[10px]
              uppercase
              tracking-widest
              text-zinc-600
            "
          >
            Quantity
          </div>

          <div></div>

        </div>


        <div id="plannerRows"></div>


        <button
          onclick="addPlannerRow()"
          class="
            btn
            mt-3
            flex
            items-center
            justify-center
            gap-2
          "
        >

          <i
            data-lucide="plus"
            class="w-4 h-4"
          ></i>

          Tambah Produksi

        </button>

      </div>


      <!-- =====================================================
           3. METODE PEMBAYARAN
      ====================================================== -->
      <div class="card">

        <div class="flex items-center gap-3 mb-6">

          <div
            class="
              w-10 h-10
              rounded-xl
              bg-yellow-500/10
              border border-yellow-500/20
              flex items-center
              justify-center
            "
          >

            <i
              data-lucide="wallet-cards"
              class="w-5 h-5 text-yellow-400"
            ></i>

          </div>

          <div>

            <h2 class="font-bold">
              Metode Pembayaran
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Tentukan metode pembayaran transaksi.
            </p>

          </div>

        </div>


        <div
          id="paymentMethod"
          class="
            grid
            sm:grid-cols-2
            xl:grid-cols-4
            gap-3
          "
        >

          ${paymentOption(
            "dirty",
            "banknote",
            "Full Dirty",
            "100% Dirty Money",
            "text-red-400",
          )}

          ${paymentOption(
            "clean",
            "badge-dollar-sign",
            "Full Clean",
            "100% Clean Money",
            "text-green-400",
          )}

          ${paymentOption(
            "hybrid50",
            "split",
            "Hybrid 50 / 50",
            "50% cash + 50% material",
            "text-yellow-400",
          )}

          ${paymentOption(
            "hybridCustom",
            "sliders-horizontal",
            "Hybrid Custom",
            "Atur persentase sendiri",
            "text-blue-400",
          )}

        </div>


        <!-- CUSTOM PERCENT -->
        <div
          id="customPercent"
          class="
            ${payment.method === "hybridCustom" ? "" : "hidden"}
            mt-5
            pt-5
            border-t
            border-zinc-800
          "
        >

          <div class="flex items-center justify-between mb-3">

            <label
              for="cashPercent"
              class="text-sm font-medium"
            >
              Persentase Cash
            </label>

            <strong
              id="cashPercentValue"
              class="text-red-400"
            >
              ${payment.cashPercent}%
            </strong>

          </div>


          <input
            id="cashPercent"
            type="range"
            min="0"
            max="100"
            step="1"
            value="${payment.cashPercent}"
            class="w-full accent-red-600"
            oninput="changeCashPercent(this.value)"
          >


          <div
            class="
              flex
              justify-between
              text-xs
              text-zinc-600
              mt-2
            "
          >

            <span>0%</span>

            <span>Cash</span>

            <span>100%</span>

          </div>

        </div>

      </div>


      <!-- =====================================================
           4. RINGKASAN PRODUKSI + TOTAL MATERIAL
      ====================================================== -->
      <div
        class="
          grid
          xl:grid-cols-2
          gap-6
          items-start
        "
      >

        <!-- PRODUCTION SUMMARY -->
        <div class="card">

          <div class="flex items-center gap-3 mb-6">

            <div
              class="
                w-10 h-10
                rounded-xl
                bg-green-500/10
                border border-green-500/20
                flex items-center
                justify-center
              "
            >

              <i
                data-lucide="receipt-text"
                class="w-5 h-5 text-green-400"
              ></i>

            </div>

            <div>

              <h2 class="font-bold">
                Ringkasan Produksi
              </h2>

              <p class="text-xs text-zinc-500 mt-1">
                Item yang akan diproduksi.
              </p>

            </div>

          </div>


          <div id="plannerSummary"></div>

        </div>


        <!-- MATERIAL -->
        <div class="card">

          <div class="flex items-center gap-3 mb-6">

            <div
              class="
                w-10 h-10
                rounded-xl
                bg-blue-500/10
                border border-blue-500/20
                flex items-center
                justify-center
              "
            >

              <i
                data-lucide="boxes"
                class="w-5 h-5 text-blue-400"
              ></i>

            </div>

            <div>

              <h2 class="font-bold">
                Total Material
              </h2>

              <p class="text-xs text-zinc-500 mt-1">
                Kebutuhan material seluruh produksi.
              </p>

            </div>

          </div>


          <div id="plannerResult"></div>

        </div>

      </div>


      <!-- =====================================================
           5. RINGKASAN TRANSAKSI
      ====================================================== -->
      <div class="card">

        <div class="flex items-center gap-3 mb-6">

          <div
            class="
              w-10 h-10
              rounded-xl
              bg-green-500/10
              border border-green-500/20
              flex items-center
              justify-center
            "
          >

            <i
              data-lucide="file-text"
              class="w-5 h-5 text-green-400"
            ></i>

          </div>

          <div>

            <h2 class="font-bold">
              Ringkasan Transaksi
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Periksa kembali pesanan dan pembayaran sebelum disimpan.
            </p>

          </div>

        </div>


        <div id="transactionSummary"></div>


        <div
          class="
            border-t
            border-zinc-800
            mt-6
            pt-6
          "
        >

          <button
            onclick="saveTransaction()"
            class="
              btn-red
              w-full
              flex
              items-center
              justify-center
              gap-2
            "
          >

            <i
              data-lucide="save"
              class="w-4 h-4"
            ></i>

            Simpan Transaksi

          </button>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   PAYMENT OPTION
========================================================= */

function paymentOption(
  value,
  icon,
  title,
  description,
  color = "text-red-400",
) {
  const active = payment.method === value;

  return `
    <label
      class="
        relative
        cursor-pointer
        rounded-xl
        border
        p-4
        transition-all
        ${
          active
            ? "border-red-500 bg-red-500/5"
            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
        }
      "
    >

      <input
        type="radio"
        name="payment"
        value="${value}"
        ${active ? "checked" : ""}
        onchange="changePaymentMethod('${value}')"
        class="absolute opacity-0 pointer-events-none"
      >

      <div class="flex items-start gap-3">

        <div
          class="
            w-9 h-9
            rounded-lg
            bg-zinc-800
            flex
            items-center
            justify-center
            shrink-0
          "
        >

          <i
            data-lucide="${icon}"
            class="w-4 h-4 ${color}"
          ></i>

        </div>

        <div class="min-w-0">

          <div class="font-semibold text-sm">
            ${title}
          </div>

          <div class="text-xs text-zinc-500 mt-1">
            ${description}
          </div>

        </div>

        ${
          active
            ? `
              <div class="ml-auto">

                <i
                  data-lucide="circle-check"
                  class="w-5 h-5 text-red-500"
                ></i>

              </div>
            `
            : ""
        }

      </div>

    </label>
  `;
}

/* =========================================================
   LOAD / REFRESH
========================================================= */

function refreshPlanner() {
  renderProductionSummary();
  calculatePlanner();
  renderTransactionSummary();
  updateProductionCount();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

async function loadPlanner() {
  setActiveMenu("menu-calculator");

  if (typeof setPageTitle === "function") {
    setPageTitle("Production Planner");
  }

  // Ambil data terbaru dari Supabase
  await fetchMaterialsFromSupabase();
  await fetchCraftingsFromSupabase();

  document.getElementById("app").innerHTML = plannerPage();

  const orderDateInput = document.getElementById("orderDate");

  if (orderDateInput) {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    orderDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  renderPlannerRows();
  refreshPlanner();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function updateProductionCount() {
  const element = document.getElementById("productionCount");

  if (!element) return;

  const total = productionItems.reduce((sum, item) => {
    if (!item.craftingId) return sum;

    return sum + (Number(item.qty) || 0);
  }, 0);

  element.textContent = `${total} Item`;
}

/* =========================================================
   PRODUCTION ROW
========================================================= */

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

function updatePlannerCrafting(index, value) {
  productionItems[index].craftingId = value;

  refreshPlanner();
}

function updatePlannerQty(index, value) {
  let qty = parseInt(value);

  if (isNaN(qty) || qty < 1) {
    qty = 1;
  }

  productionItems[index].qty = qty;

  refreshPlanner();
}

function renderPlannerRows() {
  const container = document.getElementById("plannerRows");

  if (!container) return;

  const craftings = supabaseCraftings;

  let html = "";

  productionItems.forEach((item, index) => {
    html += `
      <div
        class="
          grid
          md:grid-cols-[1fr_140px_110px]
          gap-3
          mb-3
        "
      >

        <select
          class="input"
          onchange="updatePlannerCrafting(${index}, this.value)"
        >

          <option value="">
            Pilih Crafting
          </option>

          ${craftings
            .map(
              (crafting) => `
                <option
                  value="${crafting.id}"
                  ${item.craftingId == crafting.id ? "selected" : ""}
                >
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
          oninput="updatePlannerQty(${index}, this.value)"
        >

        <button
          onclick="removePlannerRow(${index})"
          class="btn-delete flex items-center justify-center gap-2"
          title="Hapus"
        >

          <i
            data-lucide="trash-2"
            class="w-4 h-4"
          ></i>

          <span class="md:hidden">
            Hapus
          </span>

        </button>

      </div>
    `;
  });

  container.innerHTML = html;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   PRODUCTION SUMMARY
========================================================= */

function renderProductionSummary() {
  const container = document.getElementById("plannerSummary");

  if (!container) return;

  const craftings = supabaseCraftings;

  let totalQty = 0;
  let totalPrice = 0;

  const rows = [];

  productionItems.forEach((plan) => {
    if (!plan.craftingId) return;

    const crafting = craftings.find((item) => item.id == plan.craftingId);

    if (!crafting) return;

    const qty = Number(plan.qty) || 0;

    const subtotal = (Number(crafting.sellPrice) || 0) * qty;

    totalQty += qty;
    totalPrice += subtotal;

    rows.push(`
      <div
        class="
          flex
          items-center
          justify-between
          gap-4
          py-3
          border-b border-zinc-800
          last:border-0
        "
      >

        <div class="min-w-0">

          <div class="font-medium truncate">
            ${crafting.name}
          </div>

          <div class="text-xs text-zinc-500 mt-1">
            ${qty} item
          </div>

        </div>

        <strong class="text-sm text-green-400 shrink-0">

          Rp ${subtotal.toLocaleString("id-ID")}

        </strong>

      </div>
    `);
  });

  if (rows.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center">

        <div
          class="
            w-12 h-12
            mx-auto
            rounded-xl
            bg-zinc-800
            flex
            items-center
            justify-center
          "
        >

          <i
            data-lucide="package-open"
            class="w-5 h-5 text-zinc-600"
          ></i>

        </div>

        <div class="text-sm text-zinc-500 mt-3">
          Belum ada produksi.
        </div>

      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div>
      ${rows.join("")}
    </div>

    <div class="border-t border-zinc-700 mt-4 pt-4 space-y-3">

      <div class="flex justify-between text-sm">

        <span class="text-zinc-500">
          Total Item
        </span>

        <strong>
          ${totalQty}
        </strong>

      </div>

      <div class="flex justify-between items-end">

        <span class="text-sm text-zinc-500">
          Total Harga
        </span>

        <strong class="text-xl text-green-400">

          Rp ${totalPrice.toLocaleString("id-ID")}

        </strong>

      </div>

    </div>
  `;
}

/* =========================================================
   MATERIAL
========================================================= */

function calculatePlanner() {
  const container = document.getElementById("plannerResult");

  if (!container) return;

  const summary = getMaterialSummary();

  if (summary.materials.length === 0) {
    container.innerHTML = `
      <div class="py-10 text-center">

        <div
          class="
            w-12 h-12
            mx-auto
            rounded-xl
            bg-zinc-800
            flex
            items-center
            justify-center
          "
        >

          <i
            data-lucide="boxes"
            class="w-5 h-5 text-zinc-600"
          ></i>

        </div>

        <div class="text-sm text-zinc-500 mt-3">
          Pilih crafting untuk melihat material.
        </div>

      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="space-y-3">

      ${summary.materials
        .map(
          (material) => `
            <div
              class="
                flex
                items-center
                justify-between
                gap-4
                border border-zinc-800
                rounded-xl
                px-4 py-3
              "
            >

              <div class="min-w-0">

                <div class="font-semibold truncate">
                  ${material.name}
                </div>

                <div class="text-xs text-zinc-500 mt-1">

                  ${
                    material.currency === "Clean"
                      ? '<span class="text-green-400">Clean</span>'
                      : '<span class="text-red-400">Dirty</span>'
                  }

                  • Rp ${material.price.toLocaleString("id-ID")}

                </div>

              </div>

              <div class="text-right shrink-0">

                <div class="font-black">
                  ×${material.qty}
                </div>

                <div class="text-xs text-zinc-500 mt-1">

                  Rp ${material.subtotal.toLocaleString("id-ID")}

                </div>

              </div>

            </div>
          `,
        )
        .join("")}

    </div>
  `;
}

/* =========================================================
   PAYMENT
========================================================= */

function changePaymentMethod(method) {
  // Simpan nilai form sebelum halaman dirender ulang
  const oldCustomer = document.getElementById("customerName")?.value || "";

  const oldOrderDate = document.getElementById("orderDate")?.value || "";

  // Update metode pembayaran
  payment.method = method;

  // Render ulang Planner
  document.getElementById("app").innerHTML = plannerPage();

  // Render data produksi dan kalkulasi
  renderPlannerRows();
  refreshPlanner();

  // Kembalikan nama pemesan
  const customerInput = document.getElementById("customerName");

  if (customerInput) {
    customerInput.value = oldCustomer;
  }

  // Kembalikan tanggal pemesanan
  const orderDateInput = document.getElementById("orderDate");

  if (orderDateInput) {
    orderDateInput.value = oldOrderDate;
  }

  // Render ulang icon
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function changeCashPercent(value) {
  let percent = Number(value);

  if (isNaN(percent)) {
    percent = 0;
  }

  percent = Math.min(100, Math.max(0, percent));

  payment.cashPercent = percent;

  const valueElement = document.getElementById("cashPercentValue");

  if (valueElement) {
    valueElement.textContent = `${percent}%`;
  }

  renderTransactionSummary();
}

/* =========================================================
   TOTAL SELL PRICE
========================================================= */

function getTotalSellPrice() {
  const craftings = supabaseCraftings;

  let total = 0;

  productionItems.forEach((plan) => {
    if (!plan.craftingId) return;

    const crafting = craftings.find((item) => item.id == plan.craftingId);

    if (!crafting) return;

    total += (Number(crafting.sellPrice) || 0) * (Number(plan.qty) || 0);
  });

  return total;
}

/* =========================================================
   TOTAL MATERIAL
========================================================= */

function getTotalMaterials() {
  const craftings = supabaseCraftings;

  const materials = {};

  productionItems.forEach((plan) => {
    if (!plan.craftingId) return;

    const crafting = craftings.find((item) => item.id == plan.craftingId);

    if (!crafting) return;

    (crafting.materials || []).forEach((item) => {
      const qty = (Number(item.qty) || 0) * (Number(plan.qty) || 0);

      if (!materials[item.materialId]) {
        materials[item.materialId] = 0;
      }

      materials[item.materialId] += qty;
    });
  });

  return materials;
}

/* =========================================================
   MATERIAL SUMMARY
========================================================= */

function getMaterialSummary() {
  const totalMaterials = getTotalMaterials();

  const materials = supabaseMaterials || [];

  let cleanCost = 0;
  let dirtyCost = 0;

  const detail = [];

  Object.entries(totalMaterials).forEach(([id, qty]) => {
    const material = materials.find((item) => item.id == id);

    if (!material) return;

    const price = Number(material.price) || 0;

    const subtotal = qty * price;

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
      price,
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

/* =========================================================
   TRANSACTION RESULT
========================================================= */

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
        cashPercent,
        materialPercent: 50,
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

/* =========================================================
   TRANSACTION SUMMARY
========================================================= */

function renderTransactionSummary() {
  const container = document.getElementById("transactionSummary");

  if (!container) return;

  const transaction = getTransactionResult();

  switch (transaction.method) {
    case "dirty":
      container.innerHTML = renderDirtyTransaction(transaction);
      break;

    case "clean":
      container.innerHTML = renderCleanTransaction(transaction);
      break;

    case "hybrid50":
      container.innerHTML = renderHybrid50Transaction(transaction);
      break;

    case "hybridCustom":
      container.innerHTML = renderHybridCustomTransaction(transaction);
      break;

    default:
      container.innerHTML = `
        <p class="text-zinc-500">
          Metode belum dibuat.
        </p>
      `;
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   DIRTY TRANSACTION
========================================================= */

function renderDirtyTransaction(transaction) {
  return `
    <div class="space-y-4">

      <div
        class="
          flex
          items-center
          justify-between
          gap-4
          border border-zinc-800
          rounded-xl
          p-4
        "
      >

        <div>

          <div class="text-xs text-zinc-500">
            Metode
          </div>

          <div class="font-semibold mt-1">
            Full Dirty Money
          </div>

        </div>

        <div
          class="
            w-10 h-10
            rounded-xl
            bg-red-500/10
            flex
            items-center
            justify-center
          "
        >

          <i
            data-lucide="banknote"
            class="w-5 h-5 text-red-400"
          ></i>

        </div>

      </div>

      ${transactionTotalRow(
        "Dirty Money",
        transaction.dirtyMoney,
        "text-red-400",
      )}

    </div>
  `;
}

/* =========================================================
   CLEAN TRANSACTION
========================================================= */

function renderCleanTransaction(transaction) {
  return `
    <div class="space-y-4">

      <div
        class="
          flex
          items-center
          justify-between
          gap-4
          border border-zinc-800
          rounded-xl
          p-4
        "
      >

        <div>

          <div class="text-xs text-zinc-500">
            Metode
          </div>

          <div class="font-semibold mt-1">
            Full Clean Money
          </div>

        </div>

        <div class="text-right">

          <div class="text-xs text-zinc-500">
            Multiplier
          </div>

          <strong class="text-green-400">
            ×${transaction.cleanMultiplier}
          </strong>

        </div>

      </div>

      ${transactionTotalRow(
        "Clean Money",
        transaction.cleanMoney,
        "text-green-400",
      )}

    </div>
  `;
}

/* =========================================================
   HYBRID 50
========================================================= */

function renderHybrid50Transaction(transaction) {
  return `
    <div class="space-y-5">

      <div class="grid sm:grid-cols-2 gap-3">

        ${smallTransactionStat("Cash", `${transaction.cashPercent}%`)}

        ${smallTransactionStat("Material", `${transaction.materialPercent}%`)}

      </div>

      ${transactionTotalRow(
        "Dirty Money",
        transaction.dirtyMoney,
        "text-red-400",
      )}

      ${renderTransactionMaterials(transaction.materials)}

    </div>
  `;
}

/* =========================================================
   HYBRID CUSTOM
========================================================= */

function renderHybridCustomTransaction(transaction) {
  return `
    <div class="space-y-5">

      <!-- HYBRID CUSTOM INFO -->
      <div
        class="
          border border-blue-500/20
          bg-blue-500/5
          rounded-2xl
          p-5
        "
      >

        <div class="flex items-center gap-3 mb-4">

          <div
            class="
              w-9 h-9
              rounded-xl
              bg-blue-500/10
              flex items-center
              justify-center
            "
          >
            <i
              data-lucide="sliders-horizontal"
              class="w-4 h-4 text-blue-400"
            ></i>
          </div>

          <div>
            <div class="font-bold">
              Hybrid Custom
            </div>

            <div class="text-xs text-zinc-500 mt-1">
              Pembagian pembayaran transaksi
            </div>
          </div>

        </div>

        <div class="grid sm:grid-cols-2 gap-3">

          ${smallTransactionStat(
            "Cash / Dirty Money",
            `${transaction.cashPercent}%`,
          )}

          ${smallTransactionStat("Material", `${transaction.materialPercent}%`)}

        </div>

      </div>


      ${transactionTotalRow(
        "Dirty Money",
        transaction.dirtyMoney,
        "text-red-400",
      )}


      ${renderTransactionMaterials(transaction.materials)}

    </div>
  `;
}

/* =========================================================
   TRANSACTION COMPONENTS
========================================================= */

function smallTransactionStat(label, value) {
  return `
    <div
      class="
        border border-zinc-800
        bg-zinc-900
        rounded-xl
        p-4
      "
    >

      <div class="text-xs text-zinc-500">
        ${label}
      </div>

      <div class="text-xl font-black mt-1">
        ${value}
      </div>

    </div>
  `;
}

function transactionTotalRow(label, value, color) {
  return `
    <div
      class="
        flex
        items-center
        justify-between
        gap-5
        bg-zinc-900
        border border-zinc-800
        rounded-xl
        p-4
      "
    >

      <div class="text-sm text-zinc-400">
        ${label}
      </div>

      <strong class="text-xl ${color}">
        Rp ${Number(value || 0).toLocaleString("id-ID")}
      </strong>

    </div>
  `;
}

function renderTransactionMaterials(materials) {
  if (!materials || materials.length === 0) {
    return `
      <div
        class="
          border border-zinc-800
          rounded-xl
          p-4
          text-sm
          text-zinc-500
        "
      >
        Tidak ada material yang harus dibawa.
      </div>
    `;
  }

  return `
    <div>

      <div
        class="
          text-xs
          uppercase
          tracking-widest
          text-zinc-500
          mb-3
        "
      >
        Material yang harus dibawa
      </div>

      <div
        class="
          border border-zinc-800
          rounded-xl
          divide-y divide-zinc-800
        "
      >

        ${materials
          .map(
            (material) => `
              <div
                class="
                  flex
                  items-center
                  justify-between
                  gap-4
                  px-4 py-3
                "
              >

                <div>

                  <div class="text-sm font-medium">
                    ${material.name}
                  </div>

                  <div class="text-xs text-zinc-600 mt-1">
                    ${material.currency}
                  </div>

                </div>

                <strong>
                  ×${material.qty}
                </strong>

              </div>
            `,
          )
          .join("")}

      </div>

    </div>
  `;
}

/* =========================================================
   SAVE TRANSACTION
========================================================= */

async function saveTransaction() {
  const customerInput = document.getElementById("customerName");
  const orderDateInput = document.getElementById("orderDate");

  const customer = customerInput ? customerInput.value.trim() : "";
  const orderDate = orderDateInput ? orderDateInput.value : "";

  if (!customer) {
    alert("Masukkan nama pemesan.");
    return;
  }

  if (!orderDate) {
    alert("Pilih tanggal pemesanan.");
    return;
  }

  const orderDateISO = new Date(orderDate).toISOString();

  const craftings = supabaseCraftings;

  const items = productionItems
    .filter((item) => item.craftingId !== "" && Number(item.qty) > 0)
    .map((item) => {
      const crafting = craftings.find(
        (crafting) => crafting.id == item.craftingId,
      );

      if (!crafting) return null;

      return {
        id: crafting.id,
        name: crafting.name,
        qty: Number(item.qty),
        sellPrice: Number(crafting.sellPrice) || 0,
      };
    })
    .filter(Boolean);

  if (items.length === 0) {
    alert("Pilih minimal satu crafting terlebih dahulu.");
    return;
  }

  const transaction = getTransactionResult();

  const saveButton = document.querySelector(
    'button[onclick="saveTransaction()"]',
  );

  if (saveButton) {
    saveButton.disabled = true;
    saveButton.textContent = "Menyimpan...";
  }

  const { data: newTransaction, error } = await supabaseClient
    .from("transactions")
    .insert({
      customer: customer,
      order_date: orderDateISO,
      payment_method: transaction.method,
      total_sell_price: Math.round(transaction.totalSellPrice),
      dirty_money: Math.round(transaction.dirtyMoney),
      clean_money: Math.round(transaction.cleanMoney),
      cash_percent: transaction.cashPercent,
      material_percent: transaction.materialPercent,
      clean_multiplier: transaction.cleanMultiplier,
      status: "Menunggu",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Gagal menyimpan transaksi:", error);

    alert("Transaksi gagal disimpan.");

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Simpan Transaksi";
    }

    return;
  }

  console.log("Transaction berhasil dibuat:", newTransaction);

  // ==========================================
  // SIMPAN TRANSACTION ITEMS
  // ==========================================

  const transactionItems = items.map((item) => ({
    transaction_id: newTransaction.id,
    crafting_id: Number(item.id),
    qty: Number(item.qty),
    sell_price: Number(item.sellPrice),
    subtotal: Number(item.sellPrice) * Number(item.qty),
  }));

  const { error: itemsError } = await supabaseClient
    .from("transaction_items")
    .insert(transactionItems);

  if (itemsError) {
    console.error("Gagal menyimpan transaction items:", itemsError);

    alert("Transaksi berhasil dibuat, tetapi item transaksi gagal disimpan.");

    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Simpan Transaksi";
    }

    return;
  }

  console.log("Transaction items berhasil disimpan:", transactionItems);

  // ==========================================
  // SIMPAN TRANSACTION MATERIALS
  // ==========================================

  if (transaction.materials.length > 0) {
    const transactionMaterials = transaction.materials
      .map((item) => {
        const material = supabaseMaterials.find(
          (material) => material.id == item.id,
        );

        if (!material) {
          console.warn("Material tidak ditemukan:", item.id);

          return null;
        }

        const qty = Number(item.qty) || 0;
        const price = Number(material.price) || 0;

        return {
          transaction_id: newTransaction.id,
          material_id: Number(material.id),
          name: material.name,
          qty: qty,
          currency: material.currency,
          price: price,
          subtotal: qty * price,
        };
      })
      .filter(Boolean);

    if (transactionMaterials.length > 0) {
      const { error: materialsError } = await supabaseClient
        .from("transaction_materials")
        .insert(transactionMaterials);

      if (materialsError) {
        console.error("Gagal menyimpan transaction materials:", materialsError);

        alert(
          "Transaksi dan item berhasil dibuat, tetapi material transaksi gagal disimpan.",
        );

        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = "Simpan Transaksi";
        }

        return;
      }

      console.log(
        "Transaction materials berhasil disimpan:",
        transactionMaterials,
      );
    }
  }

  // ==========================================
  // TRANSAKSI SELESAI
  // ==========================================

  alert("Transaksi berhasil disimpan.");

  resetPlanner();

  // BELUM reset planner.
  // Berikutnya transaction_materials.

  // BELUM reset planner.
  // Step berikutnya kita akan insert transaction_items.
  // resetPlanner();
}

/* =========================================================
   RESET
========================================================= */

function resetPlanner() {
  productionItems = [
    {
      craftingId: "",
      qty: 1,
    },
  ];

  payment = {
    method: "dirty",
    cashPercent: 50,
    cleanMultiplier: 2,
  };

  loadPlanner();
}
