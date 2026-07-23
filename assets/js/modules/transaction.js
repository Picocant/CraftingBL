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

function loadTransactions() {
  setActiveMenu("menu-transactions");

  document.getElementById("app").innerHTML = transactionsPage();

  renderTransactions();
}

function renderTransactions() {
  const transactions = getTransactions();

  let html = "";

  if (transactions.length === 0) {
    html = `
            <p class="text-gray-500">
                Belum ada transaksi.
            </p>
        `;
  } else {
    transactions
      .slice()
      .reverse()
      .forEach((item, index) => {
        html += `
                    <div class="card mb-4 cursor-pointer hover:border-red-500 transition" onclick="showTransaction(${item.id})">

                        <div class="flex justify-between items-center">

                            <div>

                                <div class="font-semibold text-red-400">

                                    👤 ${item.customer}

                                </div>

                                <div class="font-bold text-lg mt-1">

                                    ${item.transaction.method.toUpperCase()}

                                </div>

                                <div class="text-sm text-zinc-400">

                                    ${new Date(item.createdAt).toLocaleString("id-ID")}

                                </div>

                            </div>

                            <div class="text-right">

                                  <div class="text-green-400 font-bold">

                                      Rp ${item.transaction.totalSellPrice.toLocaleString("id-ID")}

                                  </div>

                                  <div class="text-sm mt-2">

                                      ${item.status === "Selesai" ? "✅ Selesai" : "⏳ Proses"}

                                  </div>

                              </div>

                        </div>

                    </div>
                `;
      });
  }

  document.getElementById("transactionsList").innerHTML = html;
}

function showTransaction(id) {
  const transactions = getTransactions();

  const item = transactions.find((t) => t.id == id);

  if (!item) return;

  const trx = item.transaction;

  let materialHTML = "";

  if (trx.materials.length > 0) {
    trx.materials.forEach((material) => {
      materialHTML += `
        <div class="flex justify-between border-b border-zinc-800 py-2">

          <span>${material.name}</span>

          <strong>${material.qty}</strong>

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

  document.getElementById("transactionDetail").innerHTML = `
  
    <div class="card border border-red-600">

      <h3 class="text-xl font-bold mb-5">
        📄 Detail Transaksi
      </h3>

              <div class="space-y-3 mb-6">

            <div class="flex justify-between">

                <span>Pemesan</span>

                <strong>${item.customer}</strong>

            </div>

            <div class="flex justify-between">

                <span>Status</span>

                <strong>

                    ${item.status === "Selesai" ? "✅ Selesai" : "⏳ Proses"}

                </strong>

            </div>

        </div>

        <hr class="my-5 border-zinc-700">

      <div class="space-y-3">

        <div class="flex justify-between">
          <span>Metode</span>
          <strong>${trx.method.toUpperCase()}</strong>
        </div>

        <div class="flex justify-between">
          <span>Total Harga</span>
          <strong>
            Rp ${trx.totalSellPrice.toLocaleString("id-ID")}
          </strong>
        </div>

        <div class="flex justify-between">
          <span>Dirty Money</span>
          <strong>
            Rp ${trx.dirtyMoney.toLocaleString("id-ID")}
          </strong>
        </div>

        <div class="flex justify-between">
          <span>Clean Money</span>
          <strong>
            Rp ${trx.cleanMoney.toLocaleString("id-ID")}
          </strong>
        </div>

      </div>

      <hr class="my-5 border-zinc-700">

      <h4 class="font-semibold mb-3">
        Material
      </h4>

      ${materialHTML}

        <hr class="my-5 border-zinc-700">

<div class="flex gap-3">

    <button
        onclick="deleteTransaction(${item.id})"
        class="btn-delete flex-1">

        🗑 Hapus

    </button>

    <button
        onclick="sendTransactionDiscord(${item.id})"
        class="btn flex-1">

        📤 Discord

    </button>

    ${
      item.status === "Proses"
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

function deleteTransaction(id) {
  if (!confirm("Yakin ingin menghapus transaksi ini?")) {
    return;
  }

  const transactions = getTransactions();

  const result = transactions.filter((transaction) => transaction.id != id);

  saveTransactions(result);

  renderTransactions();

  document.getElementById("transactionDetail").innerHTML = "";

  alert("Transaksi berhasil dihapus.");
}

function finishTransaction(id) {
  const transactions = getTransactions();

  const index = transactions.findIndex((x) => x.id == id);

  if (index === -1) return;

  transactions[index].status = "Selesai";

  saveTransactions(transactions);

  renderTransactions();

  showTransaction(id);

  alert("Transaksi berhasil diselesaikan.");
}

async function sendTransactionDiscord(id) {
  const transactions = getTransactions();

  const item = transactions.find((transaction) => transaction.id == id);

  if (!item) {
    alert("Transaksi tidak ditemukan.");
    return;
  }

  const payload = buildTransactionEmbed(item.transaction);

  const success = await sendDiscordWebhook("crafting", payload);

  if (success) {
    alert("Transaksi berhasil dikirim ke Discord.");
  }
}

function getWebhook() {
  return localStorage.getItem("discordWebhook") || "";
}

function saveWebhook(url) {
  localStorage.setItem("discordWebhook", url);
}
