let supabaseActivities = [];
let activityMembers = [];

/* =========================================================
   STATE
========================================================= */

let selectedActivityMembers = [];

let editingActivityId = null;

let selectedActivityImages = [];

let existingActivityImages = [];

/* =========================================================
   FETCH MEMBERS
========================================================= */

async function fetchActivityMembers() {
  const { data, error } = await supabaseClient
    .from("members")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil anggota:", error);
    activityMembers = [];
    return;
  }

  activityMembers = data || [];
}

/* =========================================================
   FETCH ACTIVITIES
========================================================= */

async function fetchActivitiesFromSupabase() {
  const { data, error } = await supabaseClient
    .from("activities")
    .select(
      `
    id,
    name,
    description,
    activity_date,
    leader_id,
    created_at,

    leader:members!activities_leader_id_fkey (
        id,
        name
    ),

    activity_attendances (
        id,
        member_id,
        member:members (
            id,
            name
        )
    )
`,
    )
    .order("activity_date", { ascending: false });

  if (error) {
    console.error("Gagal mengambil riwayat aktivitas:", error);

    supabaseActivities = [];
    return;
  }

  supabaseActivities = data || [];

  console.log("Activities loaded:", supabaseActivities);
}

/* =========================================================
   PAGE
========================================================= */

function activityPage() {
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
            Aktivitas Kelompok
          </h1>

          <p class="text-sm text-zinc-500 mt-1">
            Kelola aktivitas, leader, dan kehadiran anggota BLACK LINE.
          </p>

        </div>

        <div class="flex items-center gap-2 text-xs text-zinc-500">

          <i
            data-lucide="calendar-check-2"
            class="w-4 h-4 text-red-500"
          ></i>

          Group Activity

        </div>

      </div>


      <!-- =====================================================
           INFORMASI AKTIVITAS
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
              Informasi Aktivitas
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Lengkapi informasi aktivitas kelompok.
            </p>

          </div>

        </div>


        <div class="grid md:grid-cols-2 gap-5">

          <!-- NAME -->

          <div>

            <label
              for="activityName"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Nama Aktivitas
            </label>

            <div class="relative">

              <i
                data-lucide="flag"
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
                id="activityName"
                type="text"
                class="input pl-11"
                placeholder="Contoh: Paleto Merdeka"
                autocomplete="off"
              >

            </div>

          </div>


          <!-- DATE -->

          <div>

            <label
              for="activityDate"
              class="
                block
                text-xs
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Tanggal & Jam
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
                id="activityDate"
                type="datetime-local"
                step="1"
                class="input pl-11"
              >

            </div>

          </div>

        </div>


        <!-- LEADER -->

        <div class="mt-5">

          <label
            for="activityLeader"
            class="
              block
              text-xs
              uppercase
              tracking-widest
              text-zinc-500
              mb-2
            "
          >
            Leader Aktivitas
          </label>

          <div class="relative">

            <i
              data-lucide="crown"
              class="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                w-4 h-4
                text-yellow-400
                pointer-events-none
              "
            ></i>

            <select
              id="activityLeader"
              class="input pl-11"
              onchange="changeActivityLeader(this.value)"
            >

              <option value="">
                Pilih Leader
              </option>

              ${activityMembers
                .map(
                  (member) => `
                    <option value="${member.id}">
                      ${escapeActivityHTML(member.name)}
                    </option>
                  `,
                )
                .join("")}

            </select>

          </div>

          <p class="text-xs text-zinc-600 mt-2">
            Leader otomatis dihitung sebagai anggota yang hadir.
          </p>

        </div>

      </div>

        <div class="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mt-6">

            <div class="mb-4">
                <h3 class="text-lg font-semibold">
                    Laporan Aktivitas
                </h3>

                <p class="text-sm text-zinc-500">
                    Tuliskan kronologi atau alur cerita aktivitas.
                </p>
            </div>

            <textarea
                id="activityDescription"
                rows="6"
                placeholder="Ceritakan jalannya aktivitas..."
                class="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 resize-none outline-none focus:border-red-500"
            ></textarea>

            <div class="mt-6">

              <label class="
                  block
                  text-xs
                  uppercase
                  tracking-widest
                  text-zinc-500
                  mb-3
              ">
                  Dokumentasi Aktivitas
              </label>

              <input
                  type="file"
                  id="activityImages"
                  accept="image/*"
                  multiple
                  class="hidden"
              >

              <button
                  type="button"
                  onclick="document.getElementById('activityImages').click()"
                  class="btn"
              >
                  <i data-lucide="image-plus" class="w-4 h-4"></i>

                  Tambah Foto
              </button>

              <div
                  id="activityImageInfo"
                  class="mt-4 text-sm text-zinc-400"
              >
                  Belum ada foto dipilih.
              </div>

              <div
                  id="activityImagePreview"
                  class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4"
              ></div>

          </div>

        </div>


      <!-- =====================================================
           KEHADIRAN
      ====================================================== -->

      <div class="card">

        <div
          class="
            flex flex-col
            sm:flex-row
            sm:items-center
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
                data-lucide="users-round"
                class="w-5 h-5 text-green-400"
              ></i>

            </div>

            <div>

              <h2 class="font-bold">
                Kehadiran Anggota
              </h2>

              <p class="text-xs text-zinc-500 mt-1">
                Pilih anggota yang mengikuti aktivitas.
              </p>

            </div>

          </div>


          <div class="flex items-center gap-2">

            <span
              id="activityAttendanceCount"
              class="
                px-3
                py-1.5
                rounded-lg
                bg-zinc-800
                text-xs
                text-zinc-400
              "
            >
              0 Hadir
            </span>

            <button
              type="button"
              onclick="selectAllActivityMembers()"
              class="btn"
            >
              Pilih Semua
            </button>

          </div>

        </div>


        <div id="activityMemberList"></div>

      </div>


      <!-- =====================================================
           SAVE
      ====================================================== -->

      <div class="card">

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

            <h3 class="font-semibold">
              Simpan Aktivitas
            </h3>

            <p class="text-xs text-zinc-500 mt-1">
              Pastikan informasi aktivitas dan kehadiran sudah benar.
            </p>

          </div>


          <button
            id="saveActivityBtn"
            onclick="saveActivity()"
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
              data-lucide="save"
              class="w-4 h-4"
            ></i>

            <span id="saveActivityText">
              Simpan Aktivitas
            </span>

          </button>

        </div>

      </div>

            <!-- =====================================================
           RIWAYAT AKTIVITAS
      ====================================================== -->

      <div class="card">

        <div
          class="
            flex flex-col
            sm:flex-row
            sm:items-center
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
                bg-blue-500/10
                border border-blue-500/20
                flex items-center
                justify-center
              "
            >

              <i
                data-lucide="history"
                class="w-5 h-5 text-blue-400"
              ></i>

            </div>

            <div>

              <h2 class="font-bold">
                Riwayat Aktivitas
              </h2>

              <p class="text-xs text-zinc-500 mt-1">
                Daftar aktivitas kelompok yang telah disimpan.
              </p>

            </div>

          </div>

          <span
            id="activityHistoryCount"
            class="
              px-3
              py-1.5
              rounded-lg
              bg-zinc-800
              text-xs
              text-zinc-400
            "
          >
            ${supabaseActivities.length} Aktivitas
          </span>

        </div>

        <div id="activityHistoryList"></div>

      </div>          

    </div>
  `;
}

/* =========================================================
   MEMBER LIST
========================================================= */

function renderActivityMembers() {
  const container = document.getElementById("activityMemberList");

  if (!container) {
    return;
  }

  if (activityMembers.length === 0) {
    container.innerHTML = `
      <div
        class="
          border
          border-dashed
          border-zinc-800
          rounded-xl
          py-10
          px-5
          text-center
        "
      >

        <i
          data-lucide="users"
          class="
            w-6 h-6
            text-zinc-600
            mx-auto
            mb-3
          "
        ></i>

        <div class="font-medium text-zinc-400">
          Belum ada anggota
        </div>

        <div class="text-xs text-zinc-600 mt-2">
          Tambahkan anggota melalui menu Members terlebih dahulu.
        </div>

      </div>
    `;

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    return;
  }

  const leaderId =
    Number(document.getElementById("activityLeader")?.value) || null;

  container.innerHTML = `
    <div
      class="
        grid
        sm:grid-cols-2
        xl:grid-cols-3
        gap-3
      "
    >

      ${activityMembers
        .map((member) => {
          const memberId = Number(member.id);

          const selected = selectedActivityMembers.includes(memberId);

          const isLeader = leaderId === memberId;

          return `
            <label
              class="
                flex
                items-center
                justify-between
                gap-4
                p-4
                rounded-xl
                border
                ${
                  selected
                    ? "border-red-500/40 bg-red-500/5"
                    : "border-zinc-800 bg-zinc-900/40"
                }
                cursor-pointer
                hover:border-zinc-700
                transition
              "
            >

              <div class="flex items-center gap-3 min-w-0">

                <input
                  type="checkbox"
                  value="${memberId}"
                  ${selected ? "checked" : ""}
                  ${isLeader ? "disabled" : ""}
                  onchange="toggleActivityMember(${memberId}, this.checked)"
                  class="
                    w-4 h-4
                    accent-red-600
                    shrink-0
                  "
                >

                <div class="min-w-0">

                  <div class="font-semibold truncate">
                    ${escapeActivityHTML(member.name)}
                  </div>

                  ${
                    isLeader
                      ? `
                        <div
                          class="
                            flex
                            items-center
                            gap-1
                            text-xs
                            text-yellow-400
                            mt-1
                          "
                        >
                          <i
                            data-lucide="crown"
                            class="w-3 h-3"
                          ></i>

                          Leader
                        </div>
                      `
                      : `
                        <div
                          class="
                            text-xs
                            text-zinc-600
                            mt-1
                          "
                        >
                          Anggota
                        </div>
                      `
                  }

                </div>

              </div>

              ${
                selected
                  ? `
                    <i
                      data-lucide="check-circle-2"
                      class="
                        w-5 h-5
                        text-green-400
                        shrink-0
                      "
                    ></i>
                  `
                  : ""
              }

            </label>
          `;
        })
        .join("")}

    </div>
  `;

  updateActivityAttendanceCount();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   TOGGLE MEMBER
========================================================= */

function toggleActivityMember(memberId, checked) {
  memberId = Number(memberId);

  if (checked) {
    if (!selectedActivityMembers.includes(memberId)) {
      selectedActivityMembers.push(memberId);
    }
  } else {
    selectedActivityMembers = selectedActivityMembers.filter(
      (id) => Number(id) !== memberId,
    );
  }

  renderActivityMembers();
}

/* =========================================================
   LEADER
========================================================= */

function changeActivityLeader(value) {
  const leaderId = Number(value);

  if (leaderId) {
    if (!selectedActivityMembers.includes(leaderId)) {
      selectedActivityMembers.push(leaderId);
    }
  }

  renderActivityMembers();
}

/* =========================================================
   SELECT ALL
========================================================= */

function selectAllActivityMembers() {
  if (selectedActivityMembers.length === activityMembers.length) {
    const leaderId =
      Number(document.getElementById("activityLeader")?.value) || null;

    selectedActivityMembers = leaderId ? [leaderId] : [];
  } else {
    selectedActivityMembers = activityMembers.map((member) =>
      Number(member.id),
    );
  }

  renderActivityMembers();
}

/* =========================================================
   COUNT
========================================================= */

function updateActivityAttendanceCount() {
  const element = document.getElementById("activityAttendanceCount");

  if (!element) {
    return;
  }

  element.textContent = `${selectedActivityMembers.length} Hadir`;
}

/* =========================================================
   DEFAULT DATE
========================================================= */

function setDefaultActivityDate() {
  const input = document.getElementById("activityDate");

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
   SAVE
========================================================= */

async function saveActivity() {
  const nameInput = document.getElementById("activityName");
  const dateInput = document.getElementById("activityDate");
  const leaderInput = document.getElementById("activityLeader");
  const descriptionInput = document.getElementById("activityDescription");

  const name = nameInput?.value.trim() || "";
  const activityDate = dateInput?.value || "";
  const leaderId = Number(leaderInput?.value) || null;
  const description = descriptionInput?.value.trim() || "";

  /* =========================
     VALIDATION
  ========================= */

  if (!name) {
    alert("Nama aktivitas wajib diisi.");
    nameInput?.focus();
    return;
  }

  if (!activityDate) {
    alert("Tanggal aktivitas wajib diisi.");
    dateInput?.focus();
    return;
  }

  if (!leaderId) {
    alert("Pilih leader aktivitas.");
    leaderInput?.focus();
    return;
  }

  // Leader otomatis dianggap hadir
  if (!selectedActivityMembers.includes(leaderId)) {
    selectedActivityMembers.push(leaderId);
  }

  if (selectedActivityMembers.length === 0) {
    alert("Pilih minimal satu anggota yang hadir.");
    return;
  }

  /* =========================
     BUTTON
  ========================= */

  const button = document.getElementById("saveActivityBtn");
  const buttonText = document.getElementById("saveActivityText");

  if (button) {
    button.disabled = true;
  }

  if (buttonText) {
    buttonText.textContent = "Menyimpan...";
  }

  /* =========================
     SAVE ACTIVITY
  ========================= */

  let savedActivityId = null;
  let activityError = null;

  /* =========================
     CREATE
  ========================= */

  if (editingActivityId === null) {
    const { data, error } = await supabaseClient
      .from("activities")
      .insert({
        name: name,
        description: description,
        activity_date: activityDate,
        leader_id: leaderId,
      })
      .select("id")
      .single();

    console.log("CREATE ACTIVITY DATA:", data);
    console.log("CREATE ACTIVITY ERROR:", error);

    activityError = error;

    if (data) {
      savedActivityId = Number(data.id);
    }
  } else {
    /* =========================
     UPDATE
  ========================= */
    const { data, error } = await supabaseClient
      .from("activities")
      .update({
        name: name,
        description: description,
        activity_date: activityDate,
        leader_id: leaderId,
      })
      .eq("id", editingActivityId)
      .select("id")
      .single();

    console.log("UPDATE ACTIVITY DATA:", data);
    console.log("UPDATE ACTIVITY ERROR:", error);

    activityError = error;

    if (data) {
      savedActivityId = Number(data.id);
    } else {
      savedActivityId = Number(editingActivityId);
    }
  }

  /* =========================
     VALIDATE ACTIVITY ID
  ========================= */

  console.log("FINAL SAVED ACTIVITY ID:", savedActivityId);

  if (activityError) {
    console.error(
      editingActivityId === null
        ? "Gagal menyimpan aktivitas:"
        : "Gagal mengupdate aktivitas:",
      activityError,
    );

    alert(
      `${
        editingActivityId === null
          ? "Aktivitas gagal disimpan."
          : "Aktivitas gagal diupdate."
      }\n\n${activityError.message || ""}`,
    );

    resetActivitySaveButton();
    return;
  }

  if (!savedActivityId) {
    console.error("Activity ID tidak ditemukan.");

    alert("Aktivitas gagal disimpan karena ID aktivitas tidak ditemukan.");

    resetActivitySaveButton();
    return;
  }

  /* =========================
     UPLOAD FOTO BARU
  ========================= */

  if (
    typeof selectedActivityImages !== "undefined" &&
    selectedActivityImages.length > 0
  ) {
    console.log("Upload foto untuk activity:", savedActivityId);

    const uploadedImages = await uploadActivityImages(savedActivityId);

    console.log("Uploaded Images:", uploadedImages);
  }

  /* =========================
     UPDATE ATTENDANCE
  ========================= */

  // Kalau sedang edit,
  // hapus data kehadiran lama terlebih dahulu.
  if (editingActivityId !== null) {
    const { error: deleteAttendanceError } = await supabaseClient
      .from("activity_attendances")
      .delete()
      .eq("activity_id", savedActivityId);

    if (deleteAttendanceError) {
      console.error("Gagal menghapus kehadiran lama:", deleteAttendanceError);

      alert(
        `Kehadiran gagal diperbarui.\n\n${deleteAttendanceError.message || ""}`,
      );

      resetActivitySaveButton();
      return;
    }
  }

  /* =========================
     INSERT ATTENDANCE
  ========================= */

  const attendanceRows = selectedActivityMembers.map((memberId) => ({
    activity_id: savedActivityId,
    member_id: Number(memberId),
  }));

  console.log("ATTENDANCE ROWS:", attendanceRows);

  console.log("SAVED ACTIVITY ID:", savedActivityId);

  const { error: attendanceError } = await supabaseClient
    .from("activity_attendances")
    .insert(attendanceRows);

  /* =========================
     ATTENDANCE ERROR
  ========================= */

  if (attendanceError) {
    console.error(
      editingActivityId === null
        ? "Gagal menyimpan kehadiran:"
        : "Gagal memperbarui kehadiran:",
      attendanceError,
    );

    /*
     * Kalau CREATE gagal pada attendance,
     * hapus activity yang baru dibuat.
     */
    if (editingActivityId === null) {
      await supabaseClient
        .from("activities")
        .delete()
        .eq("id", savedActivityId);
    }

    alert(
      `${
        editingActivityId === null
          ? "Kehadiran gagal disimpan."
          : "Kehadiran gagal diperbarui."
      }\n\n${attendanceError.message || ""}`,
    );

    resetActivitySaveButton();
    return;
  }

  /* =========================
     SUCCESS
  ========================= */

  const wasEditing = editingActivityId !== null;

  alert(
    wasEditing
      ? "Aktivitas berhasil diupdate."
      : "Aktivitas berhasil disimpan.",
  );

  /* =========================
     RESET STATE
  ========================= */

  editingActivityId = null;
  selectedActivityMembers = [];
  selectedActivityImages = [];

  /* =========================
     RESET FORM BUTTON
  ========================= */

  resetActivitySaveButton();

  /* =========================
     RELOAD DATA
  ========================= */

  await loadActivities();
}

/* =========================================================
   RESET SAVE BUTTON
========================================================= */

function resetActivitySaveButton() {
  const button = document.getElementById("saveActivityBtn");

  const buttonText = document.getElementById("saveActivityText");

  if (button) {
    button.disabled = false;
  }

  if (buttonText) {
    buttonText.textContent = "Simpan Aktivitas";
  }
}

/* =========================================================
   ACTIVITY HISTORY
========================================================= */

function renderActivityHistory() {
  const container = document.getElementById("activityHistoryList");

  if (!container) {
    return;
  }

  if (supabaseActivities.length === 0) {
    container.innerHTML = `
      <div
        class="
          border
          border-dashed
          border-zinc-800
          rounded-xl
          py-10
          px-5
          text-center
        "
      >

        <i
          data-lucide="calendar-x-2"
          class="
            w-7 h-7
            text-zinc-600
            mx-auto
            mb-3
          "
        ></i>

        <div class="font-medium text-zinc-400">
          Belum ada riwayat aktivitas
        </div>

        <div class="text-xs text-zinc-600 mt-2">
          Aktivitas yang disimpan akan muncul di sini.
        </div>

      </div>
    `;

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    return;
  }

  container.innerHTML = `
    <div class="space-y-3">

      ${supabaseActivities
        .map((activity) => {
          const attendanceCount = activity.activity_attendances?.length || 0;

          const leaderName = activity.leader?.name || "-";

          return `
            <div
              class="
                border
                border-zinc-800
                rounded-xl
                bg-zinc-900/40
                p-4
              "
            >

              <div
                class="
                  flex flex-col
                  lg:flex-row
                  lg:items-center
                  justify-between
                  gap-4
                "
              >

                <div class="min-w-0">

                  <div
                    class="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >

                    <h3
                      class="
                        font-bold
                        text-base
                        truncate
                      "
                    >
                      ${escapeActivityHTML(activity.name)}
                    </h3>

                    <span
                      class="
                        px-2
                        py-1
                        rounded-md
                        bg-yellow-500/10
                        text-yellow-400
                        text-[10px]
                        uppercase
                        tracking-wider
                      "
                    >
                      ${attendanceCount} Hadir
                    </span>

                  </div>

                  <div
                    class="
                      flex
                      flex-wrap
                      items-center
                      gap-x-5
                      gap-y-2
                      mt-3
                      text-xs
                      text-zinc-500
                    "
                  >

                    <div class="flex items-center gap-2">

                      <i
                        data-lucide="calendar-days"
                        class="w-3.5 h-3.5"
                      ></i>

                      ${formatActivityDate(activity.activity_date)}

                    </div>

                    <div class="flex items-center gap-2">

                      <i
                        data-lucide="crown"
                        class="w-3.5 h-3.5 text-yellow-400"
                      ></i>

                      Leader:
                      <span class="text-zinc-300">
                        ${escapeActivityHTML(leaderName)}
                      </span>

                    </div>

                  </div>

                </div>

                <div class="flex items-center gap-2 shrink-0">

                    <button
                        type="button"
                        onclick="showActivityDetail(${activity.id})"
                        class="
                        btn
                        flex
                        items-center
                        justify-center
                        gap-2
                        "
                    >
                        <i
                        data-lucide="eye"
                        class="w-4 h-4"
                        ></i>

                        Detail
                    </button>

                    <button
                        type="button"
                        onclick="editActivity(${activity.id})"
                        class="
                        btn
                        flex
                        items-center
                        justify-center
                        gap-2
                        "
                    >
                        <i
                        data-lucide="pencil"
                        class="w-4 h-4"
                        ></i>

                        Edit
                    </button>

                    <button
                        type="button"
                        onclick="deleteActivity(${activity.id})"
                        class="
                        px-4
                        py-2
                        rounded-lg
                        bg-red-500/10
                        border
                        border-red-500/20
                        text-red-400
                        hover:bg-red-500/20
                        transition
                        flex
                        items-center
                        justify-center
                        gap-2
                        "
                    >
                        <i
                        data-lucide="trash-2"
                        class="w-4 h-4"
                        ></i>

                        Hapus
                    </button>

                    </div>

              </div>

              <div
                id="activityDetail-${activity.id}"
                class="hidden"
              ></div>

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
   ACTIVITY DETAIL
========================================================= */

async function showActivityDetail(id) {
  const activity = supabaseActivities.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!activity) {
    alert("Aktivitas tidak ditemukan.");
    return;
  }

  const container = document.getElementById(`activityDetail-${activity.id}`);

  if (!container) {
    console.error(
      "Container detail tidak ditemukan:",
      `activityDetail-${activity.id}`,
    );
    return;
  }

  // Klik Detail lagi = tutup
  if (!container.classList.contains("hidden")) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }

  /* =========================================================
     DATA ACTIVITY
  ========================================================= */

  const attendances = activity.activity_attendances || [];

  const leaderId = Number(activity.leader_id);

  const leaderAttendance = attendances.find(
    (attendance) => Number(attendance.member_id) === leaderId,
  );

  const leaderName =
    leaderAttendance?.member?.name || activity.leader?.name || "Unknown Leader";

  /* =========================================================
     AMBIL FOTO ACTIVITY
  ========================================================= */

  let activityImages = [];
  let imageError = null;

  const { data: imageData, error: imageFetchError } = await supabaseClient
    .from("activity_images")
    .select("id, activity_id, image_url, created_at")
    .eq("activity_id", activity.id)
    .order("created_at", {
      ascending: true,
    });

  activityImages = imageData || [];
  imageError = imageFetchError;

  console.log("DETAIL ACTIVITY IMAGES:", activityImages);

  console.log("DETAIL IMAGE ERROR:", imageError);

  /* =========================================================
     FORMAT TANGGAL
  ========================================================= */

  let formattedDate = "-";

  if (activity.activity_date) {
    const date = new Date(activity.activity_date);

    if (!Number.isNaN(date.getTime())) {
      formattedDate = date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  /* =========================================================
     RENDER DETAIL
  ========================================================= */

  container.innerHTML = `
    <div
      class="
        mt-5
        pt-5
        border-t
        border-zinc-800
        space-y-6
      "
    >

      <div class="flex justify-end mb-5">
        <button
          type="button"
          onclick="sendActivityToDiscord(${activity.id})"
          class="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-lg
            bg-[#5865F2]
            hover:bg-[#4752C4]
            text-white
            text-sm
            font-medium
            transition
          "
        >
          <i
            data-lucide="send"
            class="w-4 h-4"
          ></i>

          Kirim ke Discord
        </button>
      </div>

    <div class="flex items-center justify-between gap-3 mb-6">

        <div>
          <div class="text-xs uppercase tracking-widest text-zinc-500">
            Detail Aktivitas
          </div>

          <div class="text-sm text-zinc-500 mt-1">
            Informasi lengkap aktivitas
          </div>
        </div>

        <button
          type="button"
          onclick="exportActivityToWord(${activity.id})"
          class="
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            bg-red-600
            hover:bg-red-500
            text-white
            text-sm
            font-semibold
            transition
          "
        >
          <i
            data-lucide="file-text"
            class="w-4 h-4"
          ></i>

          Export Word
        </button>

      </div>

      <!-- =================================================
           INFORMASI AKTIVITAS
      ================================================== -->

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
          Informasi Aktivitas
        </div>

        <div
          class="
            grid
            sm:grid-cols-2
            xl:grid-cols-3
            gap-3
          "
        >

          <!-- NAMA -->

          <div
            class="
              rounded-xl
              border
              border-zinc-800
              bg-zinc-950
              p-4
            "
          >

            <div
              class="
                text-[10px]
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Nama Aktivitas
            </div>

            <div
              class="
                text-sm
                font-semibold
                text-white
              "
            >
              ${escapeActivityHTML(activity.name || "-")}
            </div>

          </div>


          <!-- TANGGAL -->

          <div
            class="
              rounded-xl
              border
              border-zinc-800
              bg-zinc-950
              p-4
            "
          >

            <div
              class="
                text-[10px]
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Tanggal & Jam
            </div>

            <div
              class="
                text-sm
                font-semibold
                text-white
              "
            >
              ${escapeActivityHTML(formattedDate)}
            </div>

          </div>


          <!-- LEADER -->

          <div
            class="
              rounded-xl
              border
              border-zinc-800
              bg-zinc-950
              p-4
            "
          >

            <div
              class="
                text-[10px]
                uppercase
                tracking-widest
                text-zinc-500
                mb-2
              "
            >
              Leader Aktivitas
            </div>

            <div
              class="
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-white
              "
            >

              <i
                data-lucide="crown"
                class="
                  w-4
                  h-4
                  text-yellow-400
                "
              ></i>

              ${escapeActivityHTML(leaderName)}

            </div>

          </div>

        </div>

      </div>


      <!-- =================================================
           LAPORAN
      ================================================== -->

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
          Laporan Aktivitas
        </div>

        <div
          class="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-950
            p-4
            text-sm
            leading-7
            whitespace-pre-wrap
            text-zinc-300
          "
        >
          ${
            activity.description
              ? escapeActivityHTML(activity.description)
              : `
                <span
                  class="
                    text-zinc-600
                    italic
                  "
                >
                  Belum ada laporan aktivitas.
                </span>
              `
          }
        </div>

      </div>


      <!-- =================================================
           DOKUMENTASI
      ================================================== -->

      <div>

        <div
          class="
            flex
            items-center
            justify-between
            gap-3
            mb-3
          "
        >

          <div
            class="
              text-xs
              uppercase
              tracking-widest
              text-zinc-500
            "
          >
            Dokumentasi Aktivitas
          </div>

          <div
            class="
              text-xs
              text-zinc-500
            "
          >
            ${activityImages.length} foto
          </div>

        </div>


        ${
          imageError
            ? `
              <div
                class="
                  rounded-xl
                  border
                  border-red-900
                  bg-red-950/20
                  p-4
                  text-sm
                  text-red-400
                "
              >
                Gagal mengambil dokumentasi aktivitas.
              </div>
            `
            : activityImages.length === 0
              ? `
                <div
                  class="
                    rounded-xl
                    border
                    border-zinc-800
                    bg-zinc-950
                    p-6
                    text-center
                    text-sm
                    text-zinc-600
                  "
                >
                  Belum ada foto dokumentasi.
                </div>
              `
              : `
                <div
                  class="
                    grid
                    grid-cols-2
                    md:grid-cols-3
                    xl:grid-cols-4
                    gap-3
                  "
                >

                  ${activityImages
                    .map(
                      (image) => `
                        <div
                          class="
                            group
                            relative
                            overflow-hidden
                            rounded-xl
                            border
                            border-zinc-800
                            bg-zinc-950
                          "
                        >

                          <img
                            src="${escapeActivityHTML(image.image_url)}"
                            alt="Dokumentasi aktivitas"
                            class="
                              w-full
                              h-48
                              object-cover
                              transition
                              duration-300
                              group-hover:scale-105
                            "
                            loading="lazy"
                          >

                          <div
                            class="
                              absolute
                              inset-x-0
                              bottom-0
                              p-2
                              bg-gradient-to-t
                              from-black/80
                              to-transparent
                              opacity-0
                              group-hover:opacity-100
                              transition
                            "
                          >
                            <div
                              class="
                                text-[10px]
                                text-zinc-300
                              "
                            >
                              Dokumentasi
                            </div>
                          </div>

                        </div>
                      `,
                    )
                    .join("")}

                </div>
              `
        }

      </div>


      <!-- =================================================
           KEHADIRAN
      ================================================== -->

      <div>

        <div
          class="
            flex
            items-center
            justify-between
            gap-3
            mb-3
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
              Anggota Hadir
            </div>

            <div
              class="
                text-xs
                text-zinc-600
                mt-1
              "
            >
              Daftar anggota yang mengikuti aktivitas.
            </div>

          </div>


          <div
            class="
              shrink-0
              rounded-lg
              bg-green-500/10
              border
              border-green-500/20
              px-3
              py-2
              text-xs
              font-semibold
              text-green-400
            "
          >
            ${attendances.length} Hadir
          </div>

        </div>


        ${
          attendances.length === 0
            ? `
              <div
                class="
                  rounded-xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  p-6
                  text-center
                  text-sm
                  text-zinc-600
                "
              >
                Tidak ada data kehadiran.
              </div>
            `
            : `
              <div
                class="
                  grid
                  sm:grid-cols-2
                  xl:grid-cols-3
                  gap-2
                "
              >

                ${attendances
                  .map((attendance) => {
                    const member = attendance.member;

                    const isLeader = Number(attendance.member_id) === leaderId;

                    return `
                      <div
                        class="
                          flex
                          items-center
                          justify-between
                          gap-3
                          px-3
                          py-3
                          rounded-lg
                          bg-zinc-950
                          border
                          border-zinc-800
                        "
                      >

                        <div
                          class="
                            flex
                            items-center
                            gap-2
                            min-w-0
                          "
                        >

                          <i
                            data-lucide="user-check"
                            class="
                              w-4
                              h-4
                              text-green-400
                              shrink-0
                            "
                          ></i>

                          <span
                            class="
                              text-sm
                              truncate
                            "
                          >
                            ${escapeActivityHTML(
                              member?.name || "Unknown Member",
                            )}
                          </span>

                        </div>


                        ${
                          isLeader
                            ? `
                              <span
                                class="
                                  flex
                                  items-center
                                  gap-1
                                  text-[10px]
                                  text-yellow-400
                                  shrink-0
                                "
                              >

                                <i
                                  data-lucide="crown"
                                  class="w-3 h-3"
                                ></i>

                                Leader

                              </span>
                            `
                            : ""
                        }

                      </div>
                    `;
                  })
                  .join("")}

              </div>
            `
        }

      </div>

    </div>
  `;

  /* =========================================================
     TAMPILKAN
  ========================================================= */

  container.classList.remove("hidden");

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatActivityDate(value) {
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
   EDIT ACTIVITY
========================================================= */

async function editActivity(id) {
  const activity = supabaseActivities.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!activity) {
    alert("Aktivitas tidak ditemukan.");
    return;
  }

  editingActivityId = Number(activity.id);

  /* =========================
     ATTENDANCE
  ========================= */

  selectedActivityMembers = (activity.activity_attendances || []).map(
    (attendance) => Number(attendance.member_id),
  );

  const leaderId = Number(activity.leader_id);

  if (leaderId && !selectedActivityMembers.includes(leaderId)) {
    selectedActivityMembers.push(leaderId);
  }

  /* =========================
     LOAD EXISTING IMAGES
  ========================= */

  const { data: imageData, error: imageError } = await supabaseClient
    .from("activity_images")
    .select("id, image_url")
    .eq("activity_id", activity.id)
    .order("created_at", { ascending: true });

  console.log("EXISTING ACTIVITY IMAGES:", imageData);
  console.log("EXISTING IMAGE ERROR:", imageError);

  if (imageError) {
    console.error("Gagal mengambil foto aktivitas:", imageError);

    existingActivityImages = [];

    alert(`Foto aktivitas gagal dimuat.\n\n${imageError.message || ""}`);
  } else {
    existingActivityImages = (imageData || []).map((image) => ({
      id: image.id,
      image_url: image.image_url,
    }));
  }

  // Foto baru dikosongkan ketika mulai edit
  selectedActivityImages = [];

  /* =========================
     FORM
  ========================= */

  const nameInput = document.getElementById("activityName");

  const dateInput = document.getElementById("activityDate");

  const leaderInput = document.getElementById("activityLeader");

  const descriptionInput = document.getElementById("activityDescription");

  if (descriptionInput) {
    descriptionInput.value = activity.description || "";
  }

  if (nameInput) {
    nameInput.value = activity.name || "";
  }

  if (dateInput) {
    dateInput.value = activityDateToInput(activity.activity_date);
  }

  if (leaderInput) {
    leaderInput.value = String(activity.leader_id);
  }

  /* =========================
     IMAGE PREVIEW
  ========================= */

  renderActivityImages();

  /* =========================
     BUTTON
  ========================= */

  const buttonText = document.getElementById("saveActivityText");

  if (buttonText) {
    buttonText.textContent = "Update Aktivitas";
  }

  renderActivityMembers();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =========================================================
   ACTIVITY DATE TO INPUT
========================================================= */

function activityDateToInput(value) {
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
   DELETE ACTIVITY
========================================================= */

async function deleteActivity(id) {
  const activity = supabaseActivities.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!activity) {
    alert("Aktivitas tidak ditemukan.");
    return;
  }

  const confirmed = confirm(
    `Yakin ingin menghapus aktivitas "${activity.name}"?\n\n` +
      `Data kehadiran aktivitas ini juga akan dihapus.`,
  );

  if (!confirmed) {
    return;
  }

  /* =========================
     DELETE ATTENDANCE
  ========================= */

  const { error: attendanceError } = await supabaseClient
    .from("activity_attendances")
    .delete()
    .eq("activity_id", id);

  if (attendanceError) {
    console.error("Gagal menghapus kehadiran aktivitas:", attendanceError);

    alert(
      `Gagal menghapus data kehadiran.\n\n` +
        `${attendanceError.message || ""}`,
    );

    return;
  }

  /* =========================
     DELETE ACTIVITY
  ========================= */

  const { error: activityError } = await supabaseClient
    .from("activities")
    .delete()
    .eq("id", id);

  if (activityError) {
    console.error("Gagal menghapus aktivitas:", activityError);

    alert(`Aktivitas gagal dihapus.\n\n` + `${activityError.message || ""}`);

    return;
  }

  /* =========================
     RESET EDIT STATE
  ========================= */

  if (Number(editingActivityId) === Number(id)) {
    editingActivityId = null;
    selectedActivityMembers = [];
  }

  alert("Aktivitas berhasil dihapus.");

  await loadActivities();
}

/* =========================================================
   LOAD
========================================================= */

async function loadActivities() {
  setActiveMenu("activities");

  if (typeof setPageTitle === "function") {
    setPageTitle("Aktivitas Kelompok");
  }

  document.getElementById("app").innerHTML = `
    <div class="card">
      <div class="text-center text-zinc-500 py-10">
        Memuat aktivitas...
      </div>
    </div>
  `;

  await fetchActivityMembers();

  await fetchActivitiesFromSupabase();

  document.getElementById("app").innerHTML = activityPage();

  setDefaultActivityDate();

  document
    .getElementById("activityImages")
    ?.addEventListener("change", previewActivityImages);

  renderActivityMembers();

  renderActivityHistory();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeActivityHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function previewActivityImages() {
  const input = document.getElementById("activityImages");

  const container = document.getElementById("activityImagePreview");
  const info = document.getElementById("activityImageInfo");

  if (!input || !container || !info) {
    return;
  }

  // Foto baru yang dipilih dari komputer
  selectedActivityImages = [...input.files];

  // Render ulang preview
  renderActivityImages();
}

function renderActivityImages() {
  const container = document.getElementById("activityImagePreview");

  const info = document.getElementById("activityImageInfo");

  if (!container || !info) {
    return;
  }

  container.innerHTML = "";

  const totalImages =
    existingActivityImages.length + selectedActivityImages.length;

  if (totalImages === 0) {
    info.textContent = "Belum ada foto dipilih.";
    return;
  }

  info.textContent = `${totalImages} foto.`;

  /* =========================
     FOTO LAMA
  ========================= */

  existingActivityImages.forEach((image) => {
    container.innerHTML += `
      <div
        class="relative group"
      >

        <img
          src="${image.image_url}"
          class="
            w-full
            h-36
            object-cover
            rounded-xl
            border
            border-zinc-800
          "
          alt="Dokumentasi aktivitas"
        >

        <!-- LABEL TERSIMPAN -->

        <span
          class="
            absolute
            top-2
            left-2
            px-2
            py-1
            text-xs
            rounded-lg
            bg-black/70
            text-white
          "
        >
          Tersimpan
        </span>

        <!-- TOMBOL HAPUS -->

        <button
          type="button"
          onclick="deleteActivityImage(${image.id})"
          class="
            absolute
            top-2
            right-2
            w-8
            h-8
            flex
            items-center
            justify-center
            rounded-lg
            bg-red-600
            hover:bg-red-500
            text-white
            transition
          "
          title="Hapus foto"
        >
          <i
            data-lucide="trash-2"
            class="w-4 h-4"
          ></i>
        </button>

      </div>
    `;
  });

  /* =========================
     FOTO BARU
  ========================= */

  selectedActivityImages.forEach((file, index) => {
    const url = URL.createObjectURL(file);

    container.innerHTML += `
        <div
          class="relative group"
        >

          <img
            src="${url}"
            class="
              w-full
              h-36
              object-cover
              rounded-xl
              border
              border-red-500/50
            "
            alt="${file.name}"
          >

          <!-- LABEL BARU -->

          <span
            class="
              absolute
              top-2
              left-2
              px-2
              py-1
              text-xs
              rounded-lg
              bg-red-600/80
              text-white
            "
          >
            Baru
          </span>

        </div>
      `;
  });

  /* =========================
     ICON
  ========================= */

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

async function deleteActivityImage(imageId) {
  console.log("========== DELETE ACTIVITY IMAGE ==========");
  console.log("Image ID:", imageId);

  const image = existingActivityImages.find(
    (item) => Number(item.id) === Number(imageId),
  );

  if (!image) {
    console.error("Foto tidak ditemukan:", imageId);
    alert("Foto tidak ditemukan.");
    return;
  }

  const confirmed = confirm(
    "Apakah kamu yakin ingin menghapus foto ini?\n\nFoto akan dihapus secara permanen.",
  );

  if (!confirmed) {
    return;
  }

  /* =========================
     1. AMBIL STORAGE PATH
  ========================= */

  let storagePath = null;

  try {
    const url = new URL(image.image_url);

    const marker = "/storage/v1/object/public/activity-images/";

    const index = url.pathname.indexOf(marker);

    if (index !== -1) {
      storagePath = decodeURIComponent(
        url.pathname.substring(index + marker.length),
      );
    }
  } catch (error) {
    console.error("Gagal membaca URL foto:", error);
  }

  console.log("Storage Path:", storagePath);

  /* =========================
     2. HAPUS DATABASE
  ========================= */

  const { error: databaseError } = await supabaseClient
    .from("activity_images")
    .delete()
    .eq("id", imageId);

  console.log("DATABASE DELETE ERROR:", databaseError);

  if (databaseError) {
    console.error("Gagal menghapus foto dari database:", databaseError);

    alert(
      `Foto gagal dihapus dari database.\n\n${databaseError.message || ""}`,
    );

    return;
  }

  /* =========================
     3. HAPUS STORAGE
  ========================= */

  if (storagePath) {
    const { data: storageData, error: storageError } =
      await supabaseClient.storage
        .from("activity-images")
        .remove([storagePath]);

    console.log("STORAGE DELETE RESULT:", storageData);

    console.log("STORAGE DELETE ERROR:", storageError);

    if (storageError) {
      console.error(
        "Database berhasil dihapus, tetapi file Storage gagal dihapus:",
        storageError,
      );

      alert(
        "Data foto berhasil dihapus, tetapi file fisik di Storage gagal dihapus.",
      );
    }
  }

  /* =========================
     4. HAPUS DARI ARRAY
  ========================= */

  existingActivityImages = existingActivityImages.filter(
    (item) => Number(item.id) !== Number(imageId),
  );

  /* =========================
     5. RENDER ULANG
  ========================= */

  renderActivityImages();

  console.log("FOTO BERHASIL DIHAPUS:", imageId);
}

async function uploadActivityImages(activityId) {
  console.log("========== UPLOAD IMAGE ==========");
  console.log("Activity ID:", activityId);

  if (selectedActivityImages.length === 0) {
    console.log("Tidak ada gambar dipilih");
    return [];
  }

  console.log("Jumlah gambar:", selectedActivityImages.length);
  console.log(selectedActivityImages);

  const uploadedImages = [];

  for (const file of selectedActivityImages) {
    console.log("Uploading:", file.name);

    // =========================
    // 1. BUAT PATH STORAGE
    // =========================
    const extension = file.name.split(".").pop();
    const fileName = `${activityId}/${crypto.randomUUID()}.${extension}`;

    console.log("Storage Path:", fileName);

    // =========================
    // 2. UPLOAD KE STORAGE
    // =========================
    const { data: uploadData, error: uploadError } =
      await supabaseClient.storage
        .from("activity-images")
        .upload(fileName, file);

    console.log("UPLOAD RESULT");
    console.log(uploadData);
    console.log(uploadError);

    if (uploadError) {
      console.error("UPLOAD ERROR:", uploadError);
      continue;
    }

    // =========================
    // 3. AMBIL PUBLIC URL
    // =========================
    const { data: publicData } = supabaseClient.storage
      .from("activity-images")
      .getPublicUrl(fileName);

    const publicUrl = publicData.publicUrl;

    console.log("PUBLIC URL:");
    console.log(publicUrl);

    // =========================
    // 4. SIMPAN URL KE DATABASE
    // =========================
    const { data: imageData, error: imageError } = await supabaseClient
      .from("activity_images")
      .insert({
        activity_id: activityId,
        image_url: publicUrl,
      })
      .select();

    console.log("DATABASE INSERT RESULT:");
    console.log(imageData);
    console.log(imageError);

    if (imageError) {
      console.error("DATABASE INSERT ERROR:", imageError);

      // Kalau database gagal, hapus file dari Storage
      await supabaseClient.storage.from("activity-images").remove([fileName]);

      continue;
    }

    // =========================
    // 5. MASUKKAN KE ARRAY
    // =========================
    uploadedImages.push(publicUrl);

    console.log("IMAGE BERHASIL DISIMPAN:", publicUrl);
  }

  console.log("========== UPLOAD SELESAI ==========");
  console.log("Uploaded Images:", uploadedImages);

  return uploadedImages;
}

/* =========================================================
 * EXPORT ACTIVITY TO WORD
 * ========================================================= */

async function exportActivityToWord(activityId) {
  try {
    console.log("=================================");
    console.log("EXPORT ACTIVITY TO WORD");
    console.log("Activity ID:", activityId);
    console.log("=================================");

    if (typeof docx === "undefined") {
      alert("Library Word belum tersedia.");
      return;
    }

    const activity = supabaseActivities.find(
      (item) => Number(item.id) === Number(activityId),
    );

    if (!activity) {
      alert("Aktivitas tidak ditemukan.");
      return;
    }

    /* =====================================================
     * LOADING
     * ===================================================== */

    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Membuat Word...",
        text: "Sedang mengambil data dan foto aktivitas.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
    }

    /* =====================================================
     * DATA AKTIVITAS
     * ===================================================== */

    const activityName = activity.name || "Tanpa Nama Aktivitas";

    const activityDescription =
      activity.description || "Belum ada laporan aktivitas.";

    const leaderId = Number(activity.leader_id);

    /* =====================================================
     * TANGGAL & JAM
     * ===================================================== */

    const activityDate = new Date(activity.activity_date);

    const formattedDate = activityDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const formattedTime = activityDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    /* =====================================================
     * LEADER
     * ===================================================== */

    let leaderName = "Tidak diketahui";

    const leaderAttendance = (activity.activity_attendances || []).find(
      (attendance) => Number(attendance.member_id) === leaderId,
    );

    if (leaderAttendance?.member?.name) {
      leaderName = leaderAttendance.member.name;
    } else if (activity.leader?.name) {
      leaderName = activity.leader.name;
    }

    /* =====================================================
     * ANGGOTA HADIR
     * ===================================================== */

    const attendances = activity.activity_attendances || [];

    /* =====================================================
     * AMBIL FOTO DARI DATABASE
     * ===================================================== */

    const { data: imageData, error: imageError } = await supabaseClient
      .from("activity_images")
      .select("id, image_url")
      .eq("activity_id", activity.id)
      .order("created_at", {
        ascending: true,
      });

    if (imageError) {
      console.error("Gagal mengambil foto untuk Word:", imageError);
    }

    const activityImages = imageData || [];

    console.log("FOTO UNTUK EXPORT:", activityImages);

    /* =====================================================
     * WORD DOCUMENT
     * ===================================================== */

    const children = [];

    /* =====================================================
     * HEADER
     * ===================================================== */

    children.push(
      new docx.Paragraph({
        text: "BLACK LINE",
        heading: docx.HeadingLevel.TITLE,
        alignment: docx.AlignmentType.CENTER,
      }),
    );

    children.push(
      new docx.Paragraph({
        text: "LAPORAN AKTIVITAS",
        heading: docx.HeadingLevel.HEADING_1,
        alignment: docx.AlignmentType.CENTER,
      }),
    );

    children.push(
      new docx.Paragraph({
        text: "",
      }),
    );

    /* =====================================================
     * JUDUL
     * ===================================================== */

    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: activityName,
            bold: true,
            size: 30,
          }),
        ],
        alignment: docx.AlignmentType.CENTER,
        spacing: {
          after: 300,
        },
      }),
    );

    /* =====================================================
     * INFORMASI
     * ===================================================== */

    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: "Tanggal : ",
            bold: true,
          }),
          new docx.TextRun({
            text: formattedDate,
          }),
        ],
      }),
    );

    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: "Jam     : ",
            bold: true,
          }),
          new docx.TextRun({
            text: formattedTime,
          }),
        ],
      }),
    );

    children.push(
      new docx.Paragraph({
        children: [
          new docx.TextRun({
            text: "Leader  : ",
            bold: true,
          }),
          new docx.TextRun({
            text: leaderName,
          }),
        ],
      }),
    );

    children.push(
      new docx.Paragraph({
        text: "",
      }),
    );

    /* =====================================================
     * CERITA AKTIVITAS
     * ===================================================== */

    children.push(
      new docx.Paragraph({
        text: "CERITA AKTIVITAS",
        heading: docx.HeadingLevel.HEADING_2,
      }),
    );

    const descriptionLines = String(activityDescription).split("\n");

    descriptionLines.forEach((line) => {
      children.push(
        new docx.Paragraph({
          text: line || " ",
          spacing: {
            after: 100,
          },
        }),
      );
    });

    children.push(
      new docx.Paragraph({
        text: "",
      }),
    );

    /* =====================================================
     * ANGGOTA HADIR
     * ===================================================== */

    children.push(
      new docx.Paragraph({
        text: "ANGGOTA HADIR",
        heading: docx.HeadingLevel.HEADING_2,
      }),
    );

    if (attendances.length === 0) {
      children.push(
        new docx.Paragraph({
          text: "Tidak ada data kehadiran.",
        }),
      );
    } else {
      attendances.forEach((attendance) => {
        const memberName = attendance.member?.name || "Unknown Member";

        const isLeader = Number(attendance.member_id) === leaderId;

        children.push(
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: `✓ ${memberName}`,
                bold: isLeader,
              }),
              ...(isLeader
                ? [
                    new docx.TextRun({
                      text: " — Leader",
                      bold: true,
                    }),
                  ]
                : []),
            ],
            bullet: {
              level: 0,
            },
          }),
        );
      });
    }

    children.push(
      new docx.Paragraph({
        text: "",
      }),
    );

    /* =====================================================
     * DOKUMENTASI
     * ===================================================== */

    children.push(
      new docx.Paragraph({
        text: "DOKUMENTASI AKTIVITAS",
        heading: docx.HeadingLevel.HEADING_2,
      }),
    );

    if (activityImages.length === 0) {
      children.push(
        new docx.Paragraph({
          text: "Tidak ada foto dokumentasi.",
        }),
      );
    } else {
      for (let i = 0; i < activityImages.length; i++) {
        const image = activityImages[i];

        try {
          console.log(`Mengambil foto ${i + 1}:`, image.image_url);

          const response = await fetch(image.image_url);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();

          const imageDataBuffer = new Uint8Array(arrayBuffer);

          children.push(
            new docx.Paragraph({
              text: `Foto ${i + 1}`,
              alignment: docx.AlignmentType.CENTER,
              spacing: {
                before: 300,
                after: 100,
              },
            }),
          );

          children.push(
            new docx.Paragraph({
              children: [
                new docx.ImageRun({
                  data: imageDataBuffer,
                  transformation: {
                    width: 550,
                    height: 350,
                  },
                }),
              ],
              alignment: docx.AlignmentType.CENTER,
              spacing: {
                after: 300,
              },
            }),
          );
        } catch (photoError) {
          console.error(`Gagal memasukkan foto ${i + 1}:`, photoError);

          children.push(
            new docx.Paragraph({
              text: `Foto ${i + 1} gagal dimasukkan.`,
            }),
          );
        }
      }
    }

    /* =====================================================
     * CREATE DOCUMENT
     * ===================================================== */

    const wordDocument = new docx.Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    /* =====================================================
     * GENERATE DOCX
     * ===================================================== */

    const blob = await docx.Packer.toBlob(wordDocument);

    /* =====================================================
     * DOWNLOAD
     * ===================================================== */

    const safeName = activityName
      .replace(/[<>:"/\\|?*]+/g, "")
      .replace(/\s+/g, "_")
      .substring(0, 80);

    const fileName = `BLACK_LINE_${safeName}.docx`;

    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(downloadUrl);

    /* =====================================================
     * SUCCESS
     * ===================================================== */

    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Laporan Word berhasil dibuat.",
        timer: 1800,
        showConfirmButton: false,
      });
    } else {
      alert("Laporan Word berhasil dibuat.");
    }

    console.log("WORD EXPORT BERHASIL:", fileName);
  } catch (error) {
    console.error("WORD EXPORT ERROR:", error);

    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "Export gagal",
        text: error?.message || "Terjadi kesalahan saat membuat Word.",
      });
    } else {
      alert(`Export Word gagal.\n\n${error?.message || ""}`);
    }
  }
}

/* =========================================================
   SEND ACTIVITY TO DISCORD
========================================================= */

async function sendActivityDiscord(activity) {
  try {
    // =========================
    // LOAD FOTO ACTIVITY
    // =========================

    const { data: images, error } = await supabaseClient
      .from("activity_images")
      .select("id, image_url")
      .eq("activity_id", activity.id)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Gagal mengambil foto activity:", error);

      throw error;
    }

    // =========================
    // BUILD EMBED
    // =========================

    const payload = buildActivityEmbed(activity, images || []);

    // =========================
    // SEND DISCORD
    // =========================

    return await sendDiscordWebhook("activity", payload);
  } catch (error) {
    console.error("Activity Discord error:", error);

    alert(error?.message || "Gagal menyiapkan laporan aktivitas.");

    return false;
  }
}

async function sendActivityToDiscord(id) {
  const activity = supabaseActivities.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!activity) {
    alert("Aktivitas tidak ditemukan.");
    return;
  }

  const confirmed = await Swal.fire({
    title: "Kirim ke Discord?",
    text: "Laporan aktivitas akan dikirim ke channel Discord.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Kirim",
    cancelButtonText: "Batal",
    confirmButtonColor: "#5865F2",
  });

  if (!confirmed.isConfirmed) {
    return;
  }

  try {
    Swal.fire({
      title: "Mengirim...",
      text: "Sedang mengirim laporan aktivitas ke Discord.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const success = await sendActivityDiscord(activity);

    if (!success) {
      return;
    }

    await Swal.fire({
      title: "Berhasil!",
      text: "Laporan aktivitas berhasil dikirim ke Discord.",
      icon: "success",
      confirmButtonColor: "#5865F2",
    });
  } catch (error) {
    console.error("Activity Discord error:", error);

    await Swal.fire({
      title: "Gagal",
      text: error?.message || "Gagal mengirim laporan aktivitas ke Discord.",
      icon: "error",
    });
  }
}
