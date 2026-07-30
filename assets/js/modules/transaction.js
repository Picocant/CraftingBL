let supabaseTransactions = [];

async function fetchTransactionsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("transactions")
    .select(
      `
      id,
      created_at,
      order_date,
      customer,
      payment_method,
      total_sell_price,
      dirty_money,
      clean_money,
      cash_percent,
      material_percent,
      clean_multiplier,
      status,
      transaction_items (
          id,
          crafting_id,
          qty,
          sell_price,
          subtotal,
          craftings (
            id,
            name,
            category
          )
        ),
      transaction_materials (
        id,
        material_id,
        name,
        qty,
        currency,
        price,
        subtotal
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal mengambil transactions:", error);
    supabaseTransactions = [];
    return;
  }

  supabaseTransactions = data || [];

  console.log("Transactions loaded from Supabase:", supabaseTransactions);
}

function transactionsPage() {
  return `
    <div class="card">

      <h2 class="text-2xl font-bold mb-6">
        📜 Riwayat Transaksi
      </h2>

      <div id="transactionsList"></div>

      <div
        id="transactionDetail"
        class="mt-6">
      </div>

    </div>
  `;
}

async function loadTransactions() {
  setActiveMenu("transactions");

  document.getElementById("pageTitle").textContent = "Transactions";

  document.getElementById("app").innerHTML = transactionsPage();

  document.getElementById("transactionsList").innerHTML = `
    <div class="text-center text-zinc-500 py-8">
      Memuat transaksi...
    </div>
  `;

  await fetchTransactionsFromSupabase();

  renderTransactions();
}

function renderTransactions() {
  const transactions = supabaseTransactions;

  let html = "";

  if (transactions.length === 0) {
    html = `
      <p class="text-gray-500">
        Belum ada transaksi.
      </p>
    `;
  } else {
    transactions.forEach((item) => {
      html += `
        <div
          class="card mb-4 cursor-pointer hover:border-red-500 transition"
          onclick="showTransaction(${item.id})">

          <div class="flex justify-between items-center">

            <div>

              <div class="font-semibold text-red-400">
                👤 ${item.customer}
              </div>

              <div class="font-bold text-lg mt-1">
                ${formatPaymentMethod(item.payment_method)}
              </div>

              <div class="text-sm text-zinc-400">
                ${new Date(item.order_date).toLocaleString("id-ID")}
              </div>

            </div>

            <div class="text-right">

              

              <div class="text-sm mt-2">
                ${formatTransactionStatus(item.status)}
              </div>

            </div>

          </div>

        </div>
      `;
    });
  }

  document.getElementById("transactionsList").innerHTML = html;
}

function formatPaymentMethod(method) {
  const methods = {
    dirty: "FULL DIRTY MONEY",
    clean: "FULL CLEAN MONEY",
    hybrid50: "HYBRID 50 / 50",
    hybridCustom: "HYBRID CUSTOM",
  };

  return methods[method] || String(method || "-").toUpperCase();
}

function formatTransactionStatus(status) {
  if (status === "Selesai") {
    return "✅ Selesai";
  }

  return "⏳ Menunggu";
}

function showTransaction(id) {
  const item = supabaseTransactions.find((transaction) => transaction.id == id);

  if (!item) {
    console.error("Transaksi tidak ditemukan:", id);
    return;
  }

  // ==========================================
  // MATERIAL TRANSAKSI
  // ==========================================

  let materialHTML = "";

  const materials = item.transaction_materials || [];

  if (materials.length > 0) {
    materials.forEach((material) => {
      materialHTML += `
        <div class="border-b border-zinc-800 py-3">

          <div class="flex justify-between">
            <span>${material.name}</span>

            <strong>
              ${Number(material.qty).toLocaleString("id-ID")}
            </strong>
          </div>

          <div class="flex justify-between text-sm text-zinc-500 mt-1">

            <span>
              ${material.currency}
              · Rp ${Number(material.price).toLocaleString("id-ID")}
            </span>

            <span>
              Rp ${Number(material.subtotal).toLocaleString("id-ID")}
            </span>

          </div>

        </div>
      `;
    });
  } else {
    materialHTML = `
      <p class="text-zinc-500">
        Tidak ada material.
      </p>
    `;
  }

  // ==========================================
  // ITEM CRAFTING
  // ==========================================

  let itemHTML = "";

  const transactionItems = item.transaction_items || [];

  if (transactionItems.length > 0) {
    transactionItems.forEach((transactionItem) => {
      itemHTML += `
        <div class="border-b border-zinc-800 py-3">

          <div class="flex justify-between">

            <span>
              ${transactionItem.craftings?.name || `Crafting #${transactionItem.crafting_id}`}
            </span>

            <strong>
              x${transactionItem.qty}
            </strong>

          </div>

          <div class="flex justify-between text-sm text-zinc-500 mt-1">

            <span>
              Rp ${Number(transactionItem.sell_price).toLocaleString("id-ID")} / item
            </span>

            <span>
              Rp ${Number(transactionItem.subtotal).toLocaleString("id-ID")}
            </span>

          </div>

        </div>
      `;
    });
  } else {
    itemHTML = `
      <p class="text-zinc-500">
        Tidak ada item crafting.
      </p>
    `;
  }

  // ==========================================
  // DETAIL
  // ==========================================

  document.getElementById("transactionDetail").innerHTML = `

    <div class="card border border-red-600">

      <div class="flex justify-between items-start mb-6">

        <div>

          <h3 class="text-xl font-bold">
            📄 Detail Transaksi
          </h3>

          <div class="text-sm text-zinc-500 mt-1">
            Transaction #${item.id}
          </div>

        </div>

        <div>
          ${formatTransactionStatus(item.status)}
        </div>

      </div>

      <div class="space-y-3">

        <div class="flex justify-between">
          <span>Pemesan</span>
          <strong>${item.customer}</strong>
        </div>

        <div class="flex justify-between">
          <span>Tanggal Pemesanan</span>

          <strong>
            ${new Date(item.order_date).toLocaleString("id-ID")}
          </strong>
        </div>

        <div class="flex justify-between">
          <span>Metode</span>

          <strong>
            ${formatPaymentMethod(item.payment_method)}
          </strong>
        </div>
        ${
          item.payment_method === "hybridCustom"
            ? `
      <div
        class="
          mt-3
          p-4
          rounded-xl
          border border-blue-500/20
          bg-blue-500/5
        "
      >
        <div class="text-xs text-zinc-500 mb-3">
          Pembagian Pembayaran
        </div>

        <div class="grid grid-cols-2 gap-3">

          <div>
            <div class="text-xs text-zinc-500">
              Cash / Dirty Money
            </div>

            <div class="font-bold text-red-400 mt-1">
              ${Number(item.cash_percent) || 0}%
            </div>
          </div>

          <div>
            <div class="text-xs text-zinc-500">
              Material
            </div>

            <div class="font-bold text-blue-400 mt-1">
              ${Number(item.material_percent) || 0}%
            </div>
          </div>

        </div>
      </div>
    `
            : ""
        }

      </div>

      <hr class="my-5 border-zinc-700">

      <h4 class="font-semibold mb-3">
        🛠 Item Crafting
      </h4>

      ${itemHTML}

      <hr class="my-5 border-zinc-700">

      <div class="space-y-3">

        <div class="flex justify-between">
          <span>Total Harga</span>

          <strong class="text-green-400">
            Rp ${Number(item.total_sell_price).toLocaleString("id-ID")}
          </strong>
        </div>

        <div class="flex justify-between">
          <span>Dirty Money</span>

          <strong>
            Rp ${Number(item.dirty_money).toLocaleString("id-ID")}
          </strong>
        </div>

        <div class="flex justify-between">
          <span>Clean Money</span>

          <strong>
            Rp ${Number(item.clean_money).toLocaleString("id-ID")}
          </strong>
        </div>

      </div>

      <hr class="my-5 border-zinc-700">

      <h4 class="font-semibold mb-3">
        📦 Material
      </h4>

      ${materialHTML}

      <hr class="my-5 border-zinc-700">

      <div class="flex gap-3">

  ${
    isAdmin()
      ? `
        <button
          onclick="deleteTransaction(${item.id})"
          class="btn-delete flex-1">

          🗑 Hapus

        </button>
      `
      : ""
  }

  <button
    onclick="sendTransactionDiscord(${item.id})"
    class="btn flex-1">

    📤 Discord

  </button>

  ${
    isAdmin() && item.status !== "Selesai"
      ? `
        <button
          onclick="finishTransaction(${item.id})"
          class="btn flex-1">

          ✅ Selesaikan

        </button>
      `
      : ""
  }

</div>

    </div>
  `;
}

async function deleteTransaction(id) {
  // ==========================================
  // ADMIN ONLY
  // ==========================================

  if (!isAdmin()) {
    alert("Akses ditolak. Hanya admin yang dapat menghapus transaksi.");
    return;
  }

  if (!confirm("Yakin ingin menghapus transaksi ini?")) {
    return;
  }

  const { error } = await supabaseClient
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Gagal menghapus transaksi:", error);

    alert("Transaksi gagal dihapus.");
    return;
  }

  await fetchTransactionsFromSupabase();

  renderTransactions();

  const detail = document.getElementById("transactionDetail");

  if (detail) {
    detail.innerHTML = "";
  }

  alert("Transaksi berhasil dihapus.");
}

async function finishTransaction(id) {
  if (!isAdmin()) {
    alert("Akses ditolak. Hanya admin yang dapat menyelesaikan transaksi.");
    return;
  }

  if (!confirm("Selesaikan transaksi ini?")) {
    return;
  }

  const { error } = await supabaseClient
    .from("transactions")
    .update({
      status: "Selesai",
    })
    .eq("id", id);

  if (error) {
    console.error("Gagal menyelesaikan transaksi:", error);

    alert("Transaksi gagal diselesaikan.");
    return;
  }

  // Refresh data dari Supabase
  await fetchTransactionsFromSupabase();

  renderTransactions();

  showTransaction(id);

  alert("Transaksi berhasil diselesaikan.");
}

async function sendTransactionDiscord(id) {
  const item = supabaseTransactions.find((transaction) => transaction.id == id);

  if (!item) {
    alert("Transaksi tidak ditemukan.");
    return;
  }

  const transaction = {
    customer: item.customer || "-",

    orderDate: item.order_date || null,

    method: item.payment_method,

    totalSellPrice: Number(item.total_sell_price) || 0,

    dirtyMoney: Number(item.dirty_money) || 0,

    cleanMoney: Number(item.clean_money) || 0,

    cashPercent: Number(item.cash_percent) || 0,

    materialPercent: Number(item.material_percent) || 0,

    cleanMultiplier: Number(item.clean_multiplier) || 0,

    items: (item.transaction_items || []).map((transactionItem) => ({
      id: transactionItem.crafting_id,
      name: transactionItem.craftings?.name || "Unknown Item",
      category: transactionItem.craftings?.category || "-",
      qty: Number(transactionItem.qty) || 0,
      sellPrice: Number(transactionItem.sell_price) || 0,
      subtotal: Number(transactionItem.subtotal) || 0,
    })),

    materials: (item.transaction_materials || []).map((material) => ({
      id: material.material_id,
      name: material.name,
      qty: Number(material.qty) || 0,
      currency: material.currency,
      price: Number(material.price) || 0,
      subtotal: Number(material.subtotal) || 0,
    })),
  };

  const payload = buildTransactionEmbed(transaction);

  const success = await sendDiscordWebhook("crafting", payload);

  if (success) {
    alert("Transaksi berhasil dikirim ke Discord.");
  }
}
