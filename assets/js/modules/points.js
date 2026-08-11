/* =========================================================
   POINT SYSTEM
========================================================= */

function escapePointHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let pointMembers = [];

/* =========================================================
   FETCH MEMBERS
========================================================= */

async function fetchPointMembers() {
  const { data, error } = await supabaseClient
    .from("members")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil member:", error);

    pointMembers = [];

    return;
  }

  pointMembers = data || [];

  console.log("Point members loaded:", pointMembers);
}

/* =========================================================
   ADD MANUAL POINT
========================================================= */

async function addManualPoint() {
  const memberId = Number(document.getElementById("pointMember")?.value);

  const points = Number(document.getElementById("pointAmount")?.value);

  const reason = document.getElementById("pointReason")?.value?.trim() || "";

  /* =========================
       VALIDATION
    ========================= */

  if (!memberId) {
    alert("Silakan pilih member.");
    return;
  }

  if (!points || points <= 0) {
    alert("Jumlah point harus lebih dari 0.");
    return;
  }

  if (!reason) {
    alert("Alasan wajib diisi.");
    return;
  }

  /* =========================
       MEMBER
    ========================= */

  const member = pointMembers.find((item) => Number(item.id) === memberId);

  if (!member) {
    alert("Member tidak ditemukan.");
    return;
  }

  /* =========================
       INSERT POINT
    ========================= */

  const { data, error } = await supabaseClient
    .from("point_transactions")
    .insert({
      member_id: memberId,
      points: points,
      source: "manual",
      activity_id: null,
      reason: reason,
    })
    .select()
    .single();

  /* =========================
       ERROR
    ========================= */

  if (error) {
    console.error("Gagal menambahkan point:", error);

    alert(`Gagal menambahkan point.\n\n${error.message || ""}`);

    return;
  }

  /* =========================
       SUCCESS
    ========================= */

  console.log("Manual point berhasil:", data);

  alert(`Berhasil menambahkan ${points} point untuk ${member.name}.`);

  /* =========================
       RESET FORM
    ========================= */

  const amountInput = document.getElementById("pointAmount");

  const reasonInput = document.getElementById("pointReason");

  if (amountInput) {
    amountInput.value = "";
  }

  if (reasonInput) {
    reasonInput.value = "";
  }

  /* =========================
       REFRESH REKAP
    ========================= */

  if (typeof loadPointRecap === "function") {
    await loadPointRecap();
  }
}

/* =========================================================
   LOAD POINT RECAP
========================================================= */

async function loadPointRecap() {
  const startDate = document.getElementById("pointStartDate")?.value || "";

  const endDate = document.getElementById("pointEndDate")?.value || "";

  /* =========================
       VALIDATION
    ========================= */

  if (!startDate) {
    alert("Tanggal mulai wajib dipilih.");
    return;
  }

  if (!endDate) {
    alert("Tanggal selesai wajib dipilih.");
    return;
  }

  if (startDate > endDate) {
    alert("Tanggal mulai tidak boleh melebihi tanggal selesai.");
    return;
  }

  /* =========================
       DATE RANGE
    ========================= */

  const startDateTime = `${startDate}T00:00:00`;

  const endDateTime = `${endDate}T23:59:59.999`;

  /* =========================
       FETCH POINT TRANSACTIONS
    ========================= */

  const { data, error } = await supabaseClient
    .from("point_transactions")
    .select(
      `
            id,
            member_id,
            points,
            source,
            activity_id,
            reason,
            created_at,
            members (name),
            activities (leader_id)`,
    )
    .gte("created_at", startDateTime)
    .lte("created_at", endDateTime)
    .order("created_at", {
      ascending: false,
    });

  /* =========================
       ERROR
    ========================= */

  if (error) {
    console.error("Gagal mengambil rekap point:", error);

    alert(`Gagal mengambil rekap point.\n\n${error.message || ""}`);

    return;
  }

  /* =========================
       EMPTY
    ========================= */

  if (!data || !data.length) {
    renderPointRecap([], startDate, endDate);
    return;
  }

  /* =========================
       GROUP MEMBER
    ========================= */

  const recap = {};

  data.forEach((transaction) => {
    const memberId = Number(transaction.member_id);

    if (!recap[memberId]) {
      recap[memberId] = {
        member_id: memberId,

        member_name: transaction.members?.name || "Member Tidak Ditemukan",

        total_points: 0,

        activity_points: 0,

        manual_points: 0,

        transaction_count: 0,
      };
    }

    let points = Number(transaction.points) || 0;

    /*
     * POINT AKTIVITAS
     *
     * Anggota biasa hadir  = 1 point
     * Leader / Ketua hadir = 2 point
     */
    if (transaction.source === "activity") {
      const leaderId = Number(transaction.activities?.leader_id);
      const memberId = Number(transaction.member_id);

      points = memberId === leaderId ? 2 : 1;
    }

    recap[memberId].total_points += points;

    recap[memberId].transaction_count += 1;

    if (transaction.source === "activity") {
      recap[memberId].activity_points += points;
    }

    if (transaction.source === "manual") {
      recap[memberId].manual_points += points;
    }
  });

  /* =========================
       SORT
    ========================= */

  const results = Object.values(recap).sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }

    return a.member_name.localeCompare(b.member_name, "id");
  });

  /* =========================
       RENDER
    ========================= */

  renderPointRecap(results, startDate, endDate);
}

/* =========================================================
   RENDER POINT RECAP
========================================================= */

function renderPointRecap(results, startDate, endDate) {
  const container = document.getElementById("pointRecap");

  if (!container) {
    console.error("Element #pointRecap tidak ditemukan.");
    return;
  }

  if (!results || !results.length) {
    container.innerHTML = `
      <div class="card">
        <div class="text-center text-zinc-500 py-10">
          Tidak ada transaksi point
          pada range tanggal
          <span class="text-zinc-300 font-semibold">
            ${escapePointHTML(startDate)}
          </span>
          sampai
          <span class="text-zinc-300 font-semibold">
            ${escapePointHTML(endDate)}
          </span>.
        </div>
      </div>
    `;

    return;
  }

  const totalPoints = results.reduce(
    (sum, item) => sum + Number(item.total_points || 0),
    0,
  );

  const totalTransactions = results.reduce(
    (sum, item) => sum + Number(item.transaction_count || 0),
    0,
  );

  container.innerHTML = `
    <div class="card">

      <!-- HEADER -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>
          <h2 class="text-lg font-bold">
            Rekap Point
          </h2>

          <p class="text-xs text-zinc-500 mt-1">
            ${escapePointHTML(startDate)}
            -
            ${escapePointHTML(endDate)}
          </p>
        </div>

        <div class="flex items-center gap-4">

          <div class="text-right">
            <div class="text-xs text-zinc-500">
              Total Point
            </div>

            <div class="text-xl font-black text-red-400">
              ${totalPoints}
            </div>
          </div>

          <div class="text-right">
            <div class="text-xs text-zinc-500">
              Transaksi
            </div>

            <div class="text-xl font-black text-white">
              ${totalTransactions}
            </div>
          </div>

        </div>

      </div>

      <!-- TABLE -->
      <div class="overflow-x-auto">

        <table class="w-full text-sm">

          <thead>
            <tr class="border-b border-zinc-800 text-zinc-500">

              <th class="text-left py-3 px-3">
                #
              </th>

              <th class="text-left py-3 px-3">
                Member
              </th>

              <th class="text-center py-3 px-3">
                Aktivitas
              </th>

              <th class="text-center py-3 px-3">
                Manual
              </th>

              <th class="text-center py-3 px-3">
                Transaksi
              </th>

              <th class="text-right py-3 px-3">
                Total Point
              </th>

            </tr>
          </thead>

          <tbody>

            ${results
              .map(
                (item, index) => `
                  <tr class="border-b border-zinc-800/70 hover:bg-zinc-900/60 transition">

                    <td class="py-4 px-3 text-zinc-500">
                      ${index + 1}
                    </td>

                    <td class="py-4 px-3">
                      <div class="font-semibold text-white">
                        ${escapePointHTML(item.member_name)}
                      </div>

                      <div class="text-xs text-zinc-600 mt-1">
                        ID: ${item.member_id}
                      </div>
                    </td>

                    <td class="py-4 px-3 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400">
                        ${Number(item.activity_points || 0)}
                      </span>
                    </td>

                    <td class="py-4 px-3 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400">
                        ${Number(item.manual_points || 0)}
                      </span>
                    </td>

                    <td class="py-4 px-3 text-center text-zinc-400">
                      ${Number(item.transaction_count || 0)}
                    </td>

                    <td class="py-4 px-3 text-right">
                      <span class="text-lg font-black text-green-400">
                        ${Number(item.total_points || 0)}
                      </span>
                    </td>

                  </tr>
                `,
              )
              .join("")}

          </tbody>

        </table>

      </div>

    </div>
  `;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   POINT PAGE
========================================================= */

function pointsPage() {
  return `
        <div class="space-y-6">

            <!-- HEADER -->
            <div
                class="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                "
            >

                <div>

                    <h1 class="text-2xl font-black">
                        Point Anggota
                    </h1>

                    <p class="text-sm text-zinc-500 mt-1">
                        Rekap point anggota berdasarkan range tanggal.
                    </p>

                </div>

                <div
                    class="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-zinc-500
                    "
                >

                    <i
                        data-lucide="trophy"
                        class="w-4 h-4 text-red-500"
                    ></i>

                    Member Point

                </div>

            </div>


            <!-- FILTER RANGE -->
            <div class="card">

                <div class="flex items-center gap-3 mb-6">

                    <div
                        class="
                            w-10
                            h-10
                            rounded-xl
                            bg-red-500/10
                            border
                            border-red-500/20
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <i
                            data-lucide="calendar-range"
                            class="w-5 h-5 text-red-400"
                        ></i>

                    </div>

                    <div>

                        <h2 class="font-bold">
                            Periode Rekap
                        </h2>

                        <p class="text-xs text-zinc-500 mt-1">
                            Pilih tanggal untuk melihat total point.
                        </p>

                    </div>

                </div>


                <div
                    class="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-4
                    "
                >

                    <!-- TANGGAL MULAI -->

                    <div>

                        <label
                            class="
                                block
                                text-xs
                                text-zinc-500
                                mb-2
                            "
                        >
                            Tanggal Mulai
                        </label>

                        <input
                            id="pointStartDate"
                            type="date"
                            class="input w-full"
                        >

                    </div>


                    <!-- TANGGAL SELESAI -->

                    <div>

                        <label
                            class="
                                block
                                text-xs
                                text-zinc-500
                                mb-2
                            "
                        >
                            Tanggal Selesai
                        </label>

                        <input
                            id="pointEndDate"
                            type="date"
                            class="input w-full"
                        >

                    </div>

                </div>


                <!-- ACTION -->

                <div
                    class="
                        mt-5
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-3
                    "
                >

                    <div class="text-xs text-zinc-500">
                        Point dihitung berdasarkan waktu transaksi.
                    </div>


                    <button
                        type="button"
                        onclick="loadPointRecap()"
                        class="
                            btn-red
                            flex
                            items-center
                            justify-center
                            gap-2
                            md:min-w-[200px]
                        "
                    >

                        <i
                            data-lucide="calculator"
                            class="w-4 h-4"
                        ></i>

                        Tampilkan Rekap

                    </button>

                </div>

            </div>


            <!-- POINT MANUAL -->

            <div class="card">

                <div class="flex items-center gap-3 mb-6">

                    <div
                        class="
                            w-10
                            h-10
                            rounded-xl
                            bg-purple-500/10
                            border
                            border-purple-500/20
                            flex
                            items-center
                            justify-center
                        "
                    >

                        <i
                            data-lucide="plus"
                            class="w-5 h-5 text-purple-400"
                        ></i>

                    </div>

                    <div>

                        <h2 class="font-bold">
                            Tambah Point Manual
                        </h2>

                        <p class="text-xs text-zinc-500 mt-1">
                            Tambahkan point tanpa melalui aktivitas.
                        </p>

                    </div>

                </div>


                <div
                    class="
                        grid
                        grid-cols-1
                        md:grid-cols-3
                        gap-4
                    "
                >

                    <!-- MEMBER -->

                    <div>

                        <label
                            class="
                                block
                                text-xs
                                text-zinc-500
                                mb-2
                            "
                        >
                            Member
                        </label>

                        <select
                            id="pointMember"
                            class="input w-full"
                        >

                            <option value="">
                                Pilih Member
                            </option>

                            ${pointMembers
                              .map(
                                (member) => `
                                        <option
                                            value="${member.id}"
                                        >
                                            ${escapePointHTML(member.name)}
                                        </option>
                                    `,
                              )
                              .join("")}

                        </select>

                    </div>


                    <!-- POINT -->

                    <div>

                        <label
                            class="
                                block
                                text-xs
                                text-zinc-500
                                mb-2
                            "
                        >
                            Jumlah Point
                        </label>

                        <input
                            id="pointAmount"
                            type="number"
                            min="1"
                            step="1"
                            class="input w-full"
                            placeholder="Contoh: 5"
                        >

                    </div>


                    <!-- ALASAN -->

                    <div>

                        <label
                            class="
                                block
                                text-xs
                                text-zinc-500
                                mb-2
                            "
                        >
                            Alasan
                        </label>

                        <input
                            id="pointReason"
                            type="text"
                            class="input w-full"
                            placeholder="Contoh: Membantu kegiatan"
                        >

                    </div>

                </div>


                <div class="mt-5 flex justify-end">

                    <button
                        type="button"
                        onclick="addManualPoint()"
                        class="
                            btn
                            flex
                            items-center
                            justify-center
                            gap-2
                        "
                    >

                        <i
                            data-lucide="plus-circle"
                            class="w-4 h-4"
                        ></i>

                        Tambah Point

                    </button>

                </div>

            </div>


            <!-- REKAP -->

            <div id="pointRecap">

                <div class="card">

                    <div
                        class="
                            text-center
                            text-zinc-500
                            py-10
                        "
                    >

                        Pilih range tanggal
                        untuk melihat rekap point.

                    </div>

                </div>

            </div>

        </div>
    `;
}

/* =========================================================
   LOAD POINT PAGE
========================================================= */

async function loadPoints() {
  setActiveMenu("points");

  if (typeof setPageTitle === "function") {
    setPageTitle("Point Anggota");
  }

  /* =========================
       LOADING
    ========================= */

  document.getElementById("app").innerHTML = `
        <div class="card">

            <div
                class="
                    text-center
                    text-zinc-500
                    py-10
                "
            >
                Memuat sistem point...
            </div>

        </div>
    `;

  /* =========================
       LOAD MEMBERS
    ========================= */

  await fetchPointMembers();

  /* =========================
       RENDER
    ========================= */

  document.getElementById("app").innerHTML = pointsPage();

  /* =========================
       DEFAULT DATE
    ========================= */

  const today = new Date().toISOString().split("T")[0];

  const startInput = document.getElementById("pointStartDate");

  const endInput = document.getElementById("pointEndDate");

  if (startInput) {
    startInput.value = today;
  }

  if (endInput) {
    endInput.value = today;
  }

  /* =========================
       ICON
    ========================= */

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}
