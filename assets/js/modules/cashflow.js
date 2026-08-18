let cashflowRecords = [];
let editingCashflowId = null;

function formatCashflowCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function escapeCashflowHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function fetchCashflows() {
  const { data, error } = await supabaseClient
    .from("cashflows")
    .select("id, transaction_date, type, money_type, amount, description, photo_url, photo_path, created_at")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gagal memuat catatan keuangan:", error);
    cashflowRecords = [];
    alert(`Gagal memuat keuangan. Pastikan tabel cashflows sudah dibuat.\n\n${error.message}`);
    return;
  }

  cashflowRecords = data || [];
}

function getCashflowBalance(moneyType) {
  return cashflowRecords.reduce((balance, record) => {
    if (record.money_type !== moneyType) return balance;

    const amount = Number(record.amount) || 0;
    return record.type === "income" ? balance + amount : balance - amount;
  }, 0);
}

function cashflowPage() {
  return `
    <div class="space-y-6">
      <div class="grid gap-4 md:grid-cols-2">
        ${cashflowBalanceCard("Uang Clean", "clean", "circle-dollar-sign", "text-emerald-400")}
        ${cashflowBalanceCard("Uang Dirty", "dirty", "badge-dollar-sign", "text-amber-400")}
      </div>

      <section class="card">
        <h3 id="cashflowFormTitle" class="text-lg font-bold mb-4">Catat Arus Uang</h3>

        <form id="cashflowForm" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label class="block">
            <span class="mb-2 block text-sm text-zinc-400">Tipe</span>
            <select id="cashflowType" class="input w-full" required>
              <option value="income">Depo / Uang Masuk</option>
              <option value="expense">WD / Uang Keluar</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-zinc-400">Jenis Uang</span>
            <select id="cashflowMoneyType" class="input w-full" required>
              <option value="clean">Clean</option>
              <option value="dirty">Dirty</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-zinc-400">Tanggal</span>
            <input id="cashflowDate" class="input w-full" type="date" required>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-zinc-400">Jumlah</span>
            <input id="cashflowAmount" class="input w-full" type="number" min="1" step="1" placeholder="0" required>
          </label>

          <label class="block md:col-span-2 xl:col-span-2">
            <span class="mb-2 block text-sm text-zinc-400">Keterangan</span>
            <input id="cashflowDescription" class="input w-full" type="text" maxlength="200" placeholder="Contoh: Pembelian material" required>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-zinc-400">Foto Bukti</span>
            <input id="cashflowPhoto" class="input w-full" type="file" accept="image/*">
          </label>

          <div class="flex items-end">
            <button id="saveCashflowButton" class="btn-red w-full flex items-center justify-center gap-2" type="submit">
              <i data-lucide="save" class="w-4 h-4"></i>
              Simpan Catatan
            </button>
          </div>

          <div id="cancelCashflowEditContainer" class="hidden flex items-end">
            <button class="btn w-full" type="button" onclick="cancelCashflowEdit()">Batal Edit</button>
          </div>
        </form>
      </section>

      <section class="card overflow-x-auto">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h3 class="text-lg font-bold">Riwayat Arus Uang</h3>
          <span class="text-sm text-zinc-500">${cashflowRecords.length} catatan</span>
        </div>
        <div id="cashflowHistory"></div>
      </section>
    </div>
  `;
}

function cashflowBalanceCard(title, moneyType, icon, colorClass) {
  const balance = getCashflowBalance(moneyType);

  return `
    <div class="card flex items-center gap-4">
      <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
        <i data-lucide="${icon}" class="w-5 h-5 ${colorClass}"></i>
      </div>
      <div>
        <div class="text-sm text-zinc-400">${title}</div>
        <div class="mt-1 text-2xl font-bold ${balance < 0 ? "text-red-400" : ""}">${formatCashflowCurrency(balance)}</div>
      </div>
    </div>
  `;
}

function renderCashflowHistory() {
  const history = document.getElementById("cashflowHistory");
  if (!history) return;

  if (cashflowRecords.length === 0) {
    history.innerHTML = `<p class="py-8 text-center text-zinc-500">Belum ada catatan arus uang.</p>`;
    return;
  }

  history.innerHTML = `
    <table class="w-full min-w-[760px] text-sm">
      <thead class="border-b border-zinc-800 text-left text-zinc-400">
        <tr>
          <th class="px-3 py-3 font-medium">Tanggal</th>
          <th class="px-3 py-3 font-medium">Keterangan</th>
          <th class="px-3 py-3 font-medium">Jenis Uang</th>
          <th class="px-3 py-3 font-medium">Arus</th>
          <th class="px-3 py-3 font-medium">Bukti</th>
          <th class="px-3 py-3 text-right font-medium">Jumlah</th>
          <th class="px-3 py-3"></th>
        </tr>
      </thead>
      <tbody>
        ${cashflowRecords
          .map((record) => {
            const isIncome = record.type === "income";
            return `
              <tr class="border-b border-zinc-800/70">
                <td class="px-3 py-3 text-zinc-400">${escapeCashflowHTML(record.transaction_date)}</td>
                <td class="px-3 py-3">${escapeCashflowHTML(record.description)}</td>
                <td class="px-3 py-3"><span class="rounded bg-zinc-800 px-2 py-1 text-xs font-medium ${record.money_type === "clean" ? "text-emerald-400" : "text-amber-400"}">${record.money_type === "clean" ? "Clean" : "Dirty"}</span></td>
                <td class="px-3 py-3 ${isIncome ? "text-emerald-400" : "text-red-400"}">${isIncome ? "Masuk" : "Keluar"}</td>
                <td class="px-3 py-3">${record.photo_url ? `<a href="${escapeCashflowHTML(record.photo_url)}" target="_blank" rel="noopener noreferrer" title="Lihat foto bukti"><img src="${escapeCashflowHTML(record.photo_url)}" alt="Foto bukti ${escapeCashflowHTML(record.description)}" class="h-10 w-10 rounded-lg border border-zinc-700 object-cover"></a>` : `<span class="text-zinc-600">-</span>`}</td>
                <td class="px-3 py-3 text-right font-semibold ${isIncome ? "text-emerald-400" : "text-red-400"}">${isIncome ? "+" : "-"}${formatCashflowCurrency(record.amount)}</td>
                <td class="px-3 py-3 text-right whitespace-nowrap"><button class="mr-3 text-zinc-500 transition hover:text-blue-400" type="button" onclick="editCashflow(${Number(record.id)})" title="Edit catatan"><i data-lucide="pencil" class="w-4 h-4"></i></button><button class="text-zinc-500 transition hover:text-red-400" type="button" onclick="deleteCashflow(${Number(record.id)})" title="Hapus catatan"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  lucide.createIcons();
}

function editCashflow(id) {
  const record = cashflowRecords.find((item) => Number(item.id) === Number(id));
  if (!record) return;

  editingCashflowId = Number(id);
  document.getElementById("cashflowType").value = record.type;
  document.getElementById("cashflowMoneyType").value = record.money_type;
  document.getElementById("cashflowDate").value = record.transaction_date;
  document.getElementById("cashflowAmount").value = record.amount;
  document.getElementById("cashflowDescription").value = record.description;
  document.getElementById("cashflowFormTitle").textContent = "Edit Arus Uang";
  document.getElementById("saveCashflowButton").innerHTML = `<i data-lucide="save" class="w-4 h-4"></i> Update Catatan`;
  document.getElementById("cancelCashflowEditContainer").classList.remove("hidden");
  document.getElementById("cashflowForm").scrollIntoView({ behavior: "smooth", block: "center" });
  lucide.createIcons();
}

function cancelCashflowEdit() {
  editingCashflowId = null;
  document.getElementById("cashflowForm").reset();
  document.getElementById("cashflowDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("cashflowFormTitle").textContent = "Catat Arus Uang";
  document.getElementById("saveCashflowButton").innerHTML = `<i data-lucide="save" class="w-4 h-4"></i> Simpan Catatan`;
  document.getElementById("cancelCashflowEditContainer").classList.add("hidden");
  lucide.createIcons();
}

async function loadCashflow() {
  setActiveMenu("cashflow");
  setPageTitle("Keuangan");

  document.getElementById("app").innerHTML = `<div class="py-8 text-center text-zinc-500">Memuat keuangan...</div>`;
  await fetchCashflows();

  document.getElementById("app").innerHTML = cashflowPage();
  document.getElementById("cashflowDate").value = new Date().toISOString().slice(0, 10);
  document.getElementById("cashflowForm").addEventListener("submit", saveCashflow);
  renderCashflowHistory();
  lucide.createIcons();
}

async function saveCashflow(event) {
  event.preventDefault();

  const type = document.getElementById("cashflowType").value;
  const moneyType = document.getElementById("cashflowMoneyType").value;
  const transactionDate = document.getElementById("cashflowDate").value;
  const amount = Number(document.getElementById("cashflowAmount").value);
  const description = document.getElementById("cashflowDescription").value.trim();
  const photo = document.getElementById("cashflowPhoto").files?.[0] || null;

  if (!transactionDate || !description || !Number.isFinite(amount) || amount <= 0) {
    alert("Lengkapi tanggal, jumlah, dan keterangan yang valid.");
    return;
  }

  let uploadedPhoto = null;
  const previousRecord = cashflowRecords.find(
    (item) => Number(item.id) === editingCashflowId,
  );

  try {
    uploadedPhoto = await uploadCashflowPhoto(photo);
  } catch (uploadError) {
    console.error("Gagal mengunggah foto bukti:", uploadError);
    alert(`Gagal mengunggah foto bukti.\n\n${uploadError.message || ""}`);
    return;
  }

  const values = {
    type,
    money_type: moneyType,
    transaction_date: transactionDate,
    amount,
    description,
  };

  if (uploadedPhoto) {
    values.photo_url = uploadedPhoto.url;
    values.photo_path = uploadedPhoto.path;
  }

  const isEditing = Boolean(editingCashflowId);
  const { data: savedCashflow, error } = isEditing
    ? await supabaseClient.from("cashflows").update(values).eq("id", editingCashflowId)
    : await supabaseClient.from("cashflows").insert(values).select().single();

  if (error) {
    if (uploadedPhoto?.path) {
      await supabaseClient.storage.from("cashflow-images").remove([uploadedPhoto.path]);
    }

    console.error("Gagal menyimpan catatan keuangan:", error);
    alert(`Gagal menyimpan catatan.\n\n${error.message}`);
    return;
  }

  if (uploadedPhoto && previousRecord?.photo_path) {
    const { error: storageError } = await supabaseClient.storage
      .from("cashflow-images")
      .remove([previousRecord.photo_path]);

    if (storageError) {
      console.error("Catatan terupdate, tetapi foto lama gagal dihapus:", storageError);
    }
  }

  if (!isEditing) {
    const amountChange = savedCashflow.type === "income"
      ? Number(savedCashflow.amount)
      : -Number(savedCashflow.amount);
    const cleanBalance = getCashflowBalance("clean") +
      (savedCashflow.money_type === "clean" ? amountChange : 0);
    const dirtyBalance = getCashflowBalance("dirty") +
      (savedCashflow.money_type === "dirty" ? amountChange : 0);
    const payload = buildCashflowEmbed({
      ...savedCashflow,
      clean_balance: cleanBalance,
      dirty_balance: dirtyBalance,
    });

    await sendDiscordWebhook("cashflow", payload);
  }

  editingCashflowId = null;
  await loadCashflow();
}

async function uploadCashflowPhoto(file) {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ukuran foto maksimal 5 MB.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabaseClient.storage
    .from("cashflow-images")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabaseClient.storage
    .from("cashflow-images")
    .getPublicUrl(path);

  return { path, url: data.publicUrl };
}

async function deleteCashflow(id) {
  if (!confirm("Hapus catatan keuangan ini?")) return;

  const record = cashflowRecords.find((item) => Number(item.id) === Number(id));

  const { error } = await supabaseClient.from("cashflows").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus catatan keuangan:", error);
    alert(`Gagal menghapus catatan.\n\n${error.message}`);
    return;
  }

  if (record?.photo_path) {
    const { error: storageError } = await supabaseClient.storage
      .from("cashflow-images")
      .remove([record.photo_path]);

    if (storageError) {
      console.error("Catatan terhapus, tetapi foto bukti gagal dihapus:", storageError);
    }
  }

  await loadCashflow();
}