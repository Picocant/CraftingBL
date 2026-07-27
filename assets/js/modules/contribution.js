let supabaseContributions = [];
let contributionMembers = [];
let editingContributionId = null;

/* =========================================================
   FETCH MEMBERS
========================================================= */

async function fetchContributionMembers() {
  const { data, error } = await supabaseClient
    .from("members")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil anggota kontribusi:", error);

    contributionMembers = [];

    return;
  }

  contributionMembers = data || [];

  console.log("Contribution members loaded:", contributionMembers);
}
/* =========================================================
   FETCH CONTRIBUTIONS
========================================================= */

async function fetchContributionsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("contributions")
    .select(
      `
      id,
      member_id,
      contribution_date,
      type,
      item_name,
      quantity,
      unit_price,
      total_value,
      notes,
      created_at,
      members (
        id,
        name
      )
    `,
    )
    .order("contribution_date", { ascending: false });

  if (error) {
    console.error("Gagal mengambil kontribusi:", error);
    supabaseContributions = [];
    return;
  }

  supabaseContributions = data || [];

  console.log("Contributions loaded:", supabaseContributions);
}

/* =========================================================
   PAGE
========================================================= */

function contributionPage() {
  return `
    <div class="space-y-6">

      <!-- HEADER -->
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
            Kontribusi Kerja
          </h1>

          <p class="text-sm text-zinc-500 mt-1">
            Kelola setoran barang dan material anggota.
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs text-zinc-500">
          <i
            data-lucide="package-plus"
            class="w-4 h-4 text-red-500"
          ></i>

          Member Contribution
        </div>
      </div>


      <!-- FORM -->
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
              data-lucide="package-check"
              class="w-5 h-5 text-red-400"
            ></i>
          </div>

          <div>
            <h2 class="font-bold">
              Setoran Anggota
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Catat kontribusi barang atau material anggota.
            </p>
          </div>

        </div>


        <!-- MEMBER + DATE -->
        <div class="grid md:grid-cols-2 gap-5">

          <div>
            <label
              for="contributionMember"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Anggota
            </label>

            <select
              id="contributionMember"
              class="input"
            >
              <option value="">
                Pilih Anggota
              </option>

              ${contributionMembers
                .map(
                  (member) => `
                    <option value="${member.id}">
                      ${escapeContributionHTML(member.name)}
                    </option>
                  `,
                )
                .join("")}
            </select>
          </div>


          <div>
            <label
              for="contributionDate"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Tanggal Setoran
            </label>

            <input
              id="contributionDate"
              type="datetime-local"
              step="1"
              class="input"
            >
          </div>

        </div>


        <!-- TYPE + ITEM -->
        <div class="grid md:grid-cols-2 gap-5 mt-5">

          <div>
            <label
              for="contributionType"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Jenis Kontribusi
            </label>

            <select
              id="contributionType"
              class="input"
            >
              <option value="Material">
                Material
              </option>

              <option value="Barang">
                Barang
              </option>
            </select>
          </div>


          <div>
            <label
              for="contributionItem"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Nama Barang / Material
            </label>

            <input
              id="contributionItem"
              type="text"
              class="input"
              placeholder="Contoh: Iron"
              autocomplete="off"
            >
          </div>

        </div>


        <!-- QTY + PRICE -->
        <div class="grid md:grid-cols-2 gap-5 mt-5">

          <div>
            <label
              for="contributionQuantity"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Jumlah Setoran
            </label>

            <input
              id="contributionQuantity"
              type="number"
              min="1"
              step="1"
              class="input"
              placeholder="0"
              oninput="calculateContributionTotal()"
            >
          </div>


          <div>
            <label
              for="contributionPrice"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Harga Satuan
            </label>

            <input
              id="contributionPrice"
              type="number"
              min="0"
              step="1"
              class="input"
              placeholder="0"
              oninput="calculateContributionTotal()"
            >
          </div>

        </div>


        <!-- TOTAL -->
        <div
          class="
            mt-5
            p-5
            rounded-xl
            bg-zinc-950
            border
            border-zinc-800
          "
        >
          <div
            class="
              flex flex-col
              sm:flex-row
              sm:items-center
              justify-between
              gap-3
            "
          >
            <div>
              <div
                class="
                  text-xs
                  uppercase
                  tracking-widest
                  text-zinc-500
                "
              >
                Total Nilai Setoran
              </div>

              <p class="text-xs text-zinc-600 mt-1">
                Jumlah × harga satuan.
              </p>
            </div>

            <div
              id="contributionTotal"
              class="
                text-2xl
                font-black
                text-green-400
              "
            >
              Rp 0
            </div>
          </div>
        </div>


        <!-- NOTES -->
        <div class="mt-5">

          <label
            for="contributionNotes"
            class="
              block
              text-xs
              uppercase
              tracking-widest
              text-zinc-500
              mb-2
            "
          >
            Catatan
          </label>

          <textarea
            id="contributionNotes"
            rows="3"
            class="input resize-none"
            placeholder="Catatan tambahan (opsional)"
          ></textarea>

        </div>


        <!-- SAVE -->
        <div
          class="
            mt-6
            pt-6
            border-t
            border-zinc-800
          "
        >
          <button
            id="saveContributionBtn"
            type="button"
            onclick="saveContribution()"
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

            <span id="saveContributionText">
              Simpan Kontribusi
            </span>
          </button>
        </div>

      </div>
            <!-- =====================================================
     RIWAYAT SETORAN
====================================================== -->

<div class="card">

  <div
    class="
      flex flex-col
      md:flex-row
      md:items-center
      justify-between
      gap-4
      mb-6
    "
  >

    <div class="flex items-center gap-3">

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
          data-lucide="history"
          class="w-5 h-5 text-green-400"
        ></i>
      </div>

      <div>
        <h2 class="font-bold">
          Riwayat Setoran
        </h2>

        <p class="text-xs text-zinc-500 mt-1">
          Daftar kontribusi barang dan material anggota.
        </p>
      </div>

    </div>

    <div
      id="contributionCount"
      class="
        text-xs
        text-zinc-400
        bg-zinc-800
        px-3
        py-2
        rounded-lg
      "
    >
      0 Setoran
    </div>

  </div>


  <div class="mb-5">

    <input
      id="searchContribution"
      type="text"
      class="input"
      placeholder="Cari anggota atau barang..."
      autocomplete="off"
      oninput="renderContributionHistory()"
    >

  </div>


  <div id="contributionHistoryList"></div>

</div>
    </div>
  `;
}

/* =========================================================
   CALCULATE TOTAL
========================================================= */

function calculateContributionTotal() {
  const quantity =
    Number(document.getElementById("contributionQuantity")?.value) || 0;

  const price =
    Number(document.getElementById("contributionPrice")?.value) || 0;

  const total = quantity * price;

  const totalElement = document.getElementById("contributionTotal");

  if (totalElement) {
    totalElement.textContent = `Rp ${total.toLocaleString("id-ID")}`;
  }
}

/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultContributionDate() {
  const input = document.getElementById("contributionDate");

  if (!input) {
    return;
  }

  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");

  const minutes = String(now.getMinutes()).padStart(2, "0");

  const seconds = String(now.getSeconds()).padStart(2, "0");

  input.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/* =========================================================
   SAVE CONTRIBUTION
========================================================= */

async function saveContribution() {
  const memberInput = document.getElementById("contributionMember");
  const dateInput = document.getElementById("contributionDate");
  const typeInput = document.getElementById("contributionType");
  const itemInput = document.getElementById("contributionItem");
  const quantityInput = document.getElementById("contributionQuantity");
  const priceInput = document.getElementById("contributionPrice");
  const notesInput = document.getElementById("contributionNotes");

  const memberId = Number(memberInput?.value) || null;
  const contributionDate = dateInput?.value || "";
  const type = typeInput?.value || "";
  const itemName = itemInput?.value.trim() || "";
  const quantity = Number(quantityInput?.value) || 0;
  const unitPrice = Number(priceInput?.value) || 0;
  const notes = notesInput?.value.trim() || null;

  /* =========================
     VALIDATION
  ========================= */

  if (!memberId) {
    alert("Pilih anggota terlebih dahulu.");
    memberInput?.focus();
    return;
  }

  if (!contributionDate) {
    alert("Tanggal setoran wajib diisi.");
    dateInput?.focus();
    return;
  }

  if (!["Material", "Barang"].includes(type)) {
    alert("Jenis kontribusi tidak valid.");
    return;
  }

  if (!itemName) {
    alert("Nama barang / material wajib diisi.");
    itemInput?.focus();
    return;
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    alert("Jumlah setoran harus lebih dari 0.");
    quantityInput?.focus();
    return;
  }

  if (!Number.isFinite(unitPrice) || unitPrice < 0) {
    alert("Harga satuan tidak valid.");
    priceInput?.focus();
    return;
  }

  /* =========================
     BUTTON
  ========================= */

  const button = document.getElementById("saveContributionBtn");
  const buttonText = document.getElementById("saveContributionText");

  if (button) {
    button.disabled = true;
  }

  if (buttonText) {
    buttonText.textContent =
      editingContributionId === null ? "Menyimpan..." : "Mengupdate...";
  }

  /* =========================
     DATA
  ========================= */

  const contributionData = {
    member_id: memberId,
    contribution_date: contributionDate,
    type: type,
    item_name: itemName,
    quantity: quantity,
    unit_price: unitPrice,
    notes: notes,
  };

  let error = null;

  /* =========================
     CREATE
  ========================= */

  if (editingContributionId === null) {
    const result = await supabaseClient
      .from("contributions")
      .insert(contributionData);

    error = result.error;
  } else {
    /* =========================
     UPDATE
  ========================= */
    const result = await supabaseClient
      .from("contributions")
      .update(contributionData)
      .eq("id", editingContributionId);

    error = result.error;
  }

  /* =========================
     ERROR
  ========================= */

  if (error) {
    console.error(
      editingContributionId === null
        ? "Gagal menyimpan kontribusi:"
        : "Gagal mengupdate kontribusi:",
      error,
    );

    alert(
      `${
        editingContributionId === null
          ? "Kontribusi gagal disimpan."
          : "Kontribusi gagal diupdate."
      }\n\n${error.message || ""}`,
    );

    resetContributionSaveButton();

    return;
  }

  /* =========================
     SUCCESS
  ========================= */

  const wasEditing = editingContributionId !== null;

  alert(
    wasEditing
      ? "Kontribusi berhasil diupdate."
      : "Kontribusi berhasil disimpan.",
  );

  editingContributionId = null;

  await loadContributions();
}

/* =========================================================
   RESET BUTTON
========================================================= */

function resetContributionSaveButton() {
  const button = document.getElementById("saveContributionBtn");

  const buttonText = document.getElementById("saveContributionText");

  if (button) {
    button.disabled = false;
  }

  if (buttonText) {
    buttonText.textContent = "Simpan Kontribusi";
  }
}

/* =========================================================
   EDIT CONTRIBUTION
========================================================= */

function editContribution(id) {
  const contribution = supabaseContributions.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!contribution) {
    alert("Kontribusi tidak ditemukan.");
    return;
  }

  editingContributionId = Number(contribution.id);

  const memberInput = document.getElementById("contributionMember");
  const dateInput = document.getElementById("contributionDate");
  const typeInput = document.getElementById("contributionType");
  const itemInput = document.getElementById("contributionItem");
  const quantityInput = document.getElementById("contributionQuantity");
  const priceInput = document.getElementById("contributionPrice");
  const notesInput = document.getElementById("contributionNotes");

  if (memberInput) {
    memberInput.value = String(contribution.member_id);
  }

  if (dateInput) {
    dateInput.value = contributionDateToInput(contribution.contribution_date);
  }

  if (typeInput) {
    typeInput.value = contribution.type || "Material";
  }

  if (itemInput) {
    itemInput.value = contribution.item_name || "";
  }

  if (quantityInput) {
    quantityInput.value = Number(contribution.quantity) || 0;
  }

  if (priceInput) {
    priceInput.value = Number(contribution.unit_price) || 0;
  }

  if (notesInput) {
    notesInput.value = contribution.notes || "";
  }

  const buttonText = document.getElementById("saveContributionText");

  if (buttonText) {
    buttonText.textContent = "Update Kontribusi";
  }

  calculateContributionTotal();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =========================================================
   DELETE CONTRIBUTION
========================================================= */

async function deleteContribution(id) {
  const contribution = supabaseContributions.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!contribution) {
    alert("Kontribusi tidak ditemukan.");
    return;
  }

  const memberName = contribution.members?.name || "Anggota";

  const confirmed = confirm(
    `Hapus kontribusi ${memberName}?\n\n` +
      `${contribution.item_name} x ${contribution.quantity}`,
  );

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient
    .from("contributions")
    .delete()
    .eq("id", Number(id));

  if (error) {
    console.error("Gagal menghapus kontribusi:", error);

    alert(`Kontribusi gagal dihapus.\n\n${error.message || ""}`);

    return;
  }

  if (editingContributionId === Number(id)) {
    editingContributionId = null;
  }

  alert("Kontribusi berhasil dihapus.");

  await loadContributions();
}

/* =========================================================
   DATE TO INPUT
========================================================= */

function contributionDateToInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/* =========================================================
   RENDER CONTRIBUTION HISTORY
========================================================= */

function renderContributionHistory() {
  const container = document.getElementById("contributionHistoryList");

  const countElement = document.getElementById("contributionCount");

  if (!container) {
    return;
  }

  const keyword =
    document.getElementById("searchContribution")?.value.trim().toLowerCase() ||
    "";

  const filtered = supabaseContributions.filter((contribution) => {
    const memberName = contribution.members?.name?.toLowerCase() || "";

    const itemName = contribution.item_name?.toLowerCase() || "";

    const type = contribution.type?.toLowerCase() || "";

    return (
      memberName.includes(keyword) ||
      itemName.includes(keyword) ||
      type.includes(keyword)
    );
  });

  if (countElement) {
    countElement.textContent = `${supabaseContributions.length} Setoran`;
  }

  /* =========================
     EMPTY
  ========================= */

  if (filtered.length === 0) {
    container.innerHTML = `
      <div
        class="
          border
          border-dashed
          border-zinc-800
          rounded-xl
          py-12
          px-5
          text-center
        "
      >
        <i
          data-lucide="package-search"
          class="
            w-7 h-7
            text-zinc-600
            mx-auto
            mb-3
          "
        ></i>

        <div class="font-medium text-zinc-400">
          ${keyword ? "Setoran tidak ditemukan" : "Belum ada setoran"}
        </div>

        <div class="text-xs text-zinc-600 mt-2">
          ${
            keyword
              ? "Coba gunakan kata pencarian lainnya."
              : "Kontribusi anggota yang disimpan akan muncul di sini."
          }
        </div>
      </div>
    `;

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    return;
  }

  /* =========================
     LIST
  ========================= */

  container.innerHTML = `
    <div class="space-y-3">

      ${filtered
        .map((contribution) => {
          const memberName =
            contribution.members?.name || "Anggota tidak ditemukan";

          const quantity = Number(contribution.quantity) || 0;

          const unitPrice = Number(contribution.unit_price) || 0;

          const total =
            Number(contribution.total_value) || quantity * unitPrice;

          return `
            <div
              class="
                border
                border-zinc-800
                bg-zinc-900/40
                rounded-xl
                p-5
              "
            >

              <div
                class="
                  flex flex-col
                  lg:flex-row
                  lg:items-center
                  justify-between
                  gap-5
                "
              >

                <!-- LEFT -->
                <div class="min-w-0">

                  <div
                    class="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                      mb-2
                    "
                  >

                    <div class="font-bold">
                      ${escapeContributionHTML(memberName)}
                    </div>

                    <span
                      class="
                        px-2
                        py-1
                        rounded-md
                        text-[10px]
                        uppercase
                        tracking-wider
                        ${
                          contribution.type === "Material"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }
                      "
                    >
                      ${escapeContributionHTML(contribution.type)}
                    </span>

                  </div>


                  <div
                    class="
                      text-lg
                      font-semibold
                      text-zinc-200
                    "
                  >
                    ${escapeContributionHTML(contribution.item_name)}
                  </div>


                  <div
                    class="
                      flex
                      flex-wrap
                      items-center
                      gap-x-5
                      gap-y-2
                      text-xs
                      text-zinc-500
                      mt-3
                    "
                  >

                    <span>
                      Qty:
                      <strong class="text-zinc-300">
                        ${quantity.toLocaleString("id-ID")}
                      </strong>
                    </span>

                    <span>
                      Harga:
                      <strong class="text-zinc-300">
                        Rp ${unitPrice.toLocaleString("id-ID")}
                      </strong>
                    </span>

                    <span>
                      ${formatContributionDate(contribution.contribution_date)}
                    </span>

                  </div>

                </div>

                <!-- RIGHT -->
                        <div
                        class="
                            flex
                            lg:flex-col
                            items-center
                            lg:items-end
                            justify-between
                            gap-4
                            shrink-0
                        "
                        >

                        <div class="lg:text-right">

                            <div
                            class="
                                text-[10px]
                                uppercase
                                tracking-widest
                                text-zinc-600
                            "
                            >
                            Total Nilai
                            </div>

                            <div
                            class="
                                text-xl
                                font-black
                                text-green-400
                                mt-1
                            "
                            >
                            Rp ${total.toLocaleString("id-ID")}
                            </div>

                        </div>

                        <div class="flex items-center gap-2">

                            <button
                            type="button"
                            onclick="editContribution(${contribution.id})"
                            class="
                                w-9 h-9
                                rounded-lg
                                border
                                border-zinc-700
                                bg-zinc-800
                                flex
                                items-center
                                justify-center
                                hover:bg-zinc-700
                                transition
                            "
                            title="Edit kontribusi"
                            >
                            <i
                                data-lucide="pencil"
                                class="w-4 h-4"
                            ></i>
                            </button>

                            <button
                            type="button"
                            onclick="deleteContribution(${contribution.id})"
                            class="
                                w-9 h-9
                                rounded-lg
                                border
                                border-red-500/30
                                bg-red-500/10
                                text-red-400
                                flex
                                items-center
                                justify-center
                                hover:bg-red-500/20
                                transition
                            "
                            title="Hapus kontribusi"
                            >
                            <i
                                data-lucide="trash-2"
                                class="w-4 h-4"
                            ></i>
                            </button>

                        </div>

                        </div>

              </div>


              ${
                contribution.notes
                  ? `
                    <div
                      class="
                        mt-4
                        pt-4
                        border-t
                        border-zinc-800
                        text-xs
                        text-zinc-500
                      "
                    >
                      ${escapeContributionHTML(contribution.notes)}
                    </div>
                  `
                  : ""
              }

            </div>
          `;
        })
        .join("")}

    </div>
  `;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatContributionDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/* =========================================================
   LOAD
========================================================= */

async function loadContributions() {
  setActiveMenu("menu-contributions");

  if (typeof setPageTitle === "function") {
    setPageTitle("Kontribusi Kerja");
  }

  document.getElementById("app").innerHTML = `
    <div class="card">
      <div class="text-center text-zinc-500 py-10">
        Memuat data kontribusi...
      </div>
    </div>
  `;

  await fetchContributionMembers();

  await fetchContributionsFromSupabase();

  document.getElementById("app").innerHTML = contributionPage();

  setDefaultContributionDate();

  calculateContributionTotal();

  renderContributionHistory();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeContributionHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
