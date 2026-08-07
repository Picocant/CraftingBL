let supabaseActivities = [];
let activityMembers = [];

/* =========================================================
   STATE
========================================================= */

let selectedActivityMembers = [];

let editingActivityId = null;

let selectedActivityImages = [];
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
                  id="activityImages"
                  type="file"
                  multiple
                  accept="image/*"
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

              <input
                  id="activityImages"
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onchange="previewActivityImages()"
              />

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

function previewActivityImages() {
  const input = document.getElementById("activityImage");

  const preview = document.getElementById("activityPreview");

  const wrapper = document.getElementById("activityImagePreview");

  if (!input.files.length) {
    wrapper.classList.add("hidden");
    return;
  }

  preview.src = URL.createObjectURL(input.files[0]);

  wrapper.classList.remove("hidden");
}
/* =========================================================
   SAVE
========================================================= */

async function saveActivity() {
  const nameInput = document.getElementById("activityName");

  const dateInput = document.getElementById("activityDate");

  const leaderInput = document.getElementById("activityLeader");

  const name = nameInput?.value.trim() || "";

  const activityDate = dateInput?.value || "";

  const leaderId = Number(leaderInput?.value) || null;

  const description = document
    .getElementById("activityDescription")
    .value.trim();

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

    activityError = error;

    if (data) {
      savedActivityId = data.id;
    }

    if (savedActivityId) {
      const uploadedImages = await uploadActivityImages(savedActivityId);

      if (uploadedImages.length > 0) {
        const { error } = await supabaseClient.from("activity_images").insert(
          uploadedImages.map((url) => ({
            activity_id: savedActivityId,
            image_url: url,
          })),
        );

        console.log("INSERT IMAGE", error);
      }
    } else {
      /* =========================
     UPDATE
  ========================= */

      const { error } = await supabaseClient
        .from("activities")
        .update({
          name: name,
          description: description,
          activity_date: activityDate,
          leader_id: leaderId,
        })
        .eq("id", editingActivityId);

      activityError = error;
      savedActivityId = editingActivityId;
    }

    /* =========================
     ERROR ACTIVITY
  ========================= */

    if (activityError) {
      console.error(
        editingActivityId === null
          ? "Gagal menyimpan aktivitas:"
          : "Gagal mengupdate aktivitas:",
        activityError,
      );

      alert(
        `${editingActivityId === null ? "Aktivitas gagal disimpan." : "Aktivitas gagal diupdate."}\n\n` +
          `${activityError.message || ""}`,
      );

      resetActivitySaveButton();

      return;
    }

    /* =========================
     UPDATE ATTENDANCE
  ========================= */

    // Kalau sedang edit, hapus data kehadiran lama terlebih dahulu.
    if (editingActivityId !== null) {
      const { error: deleteAttendanceError } = await supabaseClient
        .from("activity_attendances")
        .delete()
        .eq("activity_id", savedActivityId);
      if (deleteAttendanceError) {
        console.error("Gagal menghapus kehadiran lama:", deleteAttendanceError);
        alert(
          `Kehadiran gagal diperbarui.\n\n` +
            `${deleteAttendanceError.message || ""}`,
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

    const { error: attendanceError } = await supabaseClient
      .from("activity_attendances")
      .insert(attendanceRows);

    if (attendanceError) {
      console.error(
        editingActivityId === null
          ? "Gagal menyimpan kehadiran:"
          : "Gagal memperbarui kehadiran:",
        attendanceError,
      );
    }
    /*
     Kalau CREATE gagal pada attendance,
     hapus activity yang baru dibuat.

     Kalau EDIT gagal, activity jangan dihapus.
    */
    if (editingActivityId === null) {
      await supabaseClient
        .from("activities")
        .delete()
        .eq("id", savedActivityId);
    }

    alert(
      `${editingActivityId === null ? "Kehadiran gagal disimpan." : "Kehadiran gagal diperbarui."}\n\n` +
        `${attendanceError.message || ""}`,
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

  editingActivityId = null;
  selectedActivityMembers = [];

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

function showActivityDetail(id) {
  const activity = supabaseActivities.find(
    (item) => Number(item.id) === Number(id),
  );

  if (!activity) {
    alert("Aktivitas tidak ditemukan.");
    return;
  }

  const container = document.getElementById(`activityDetail-${activity.id}`);

  if (!container) {
    return;
  }

  // Klik Detail lagi = tutup
  if (!container.classList.contains("hidden")) {
    container.classList.add("hidden");
    container.innerHTML = "";
    return;
  }

  const attendances = activity.activity_attendances || [];

  const leaderId = Number(activity.leader_id);

  container.innerHTML = `
    <div
      class="
        mt-5
        pt-5
        border-t
        border-zinc-800
      "
    >
      <div class="mb-6">

        <div class="
            text-xs
            uppercase
            tracking-widest
            text-zinc-500
            mb-3
        ">
            Laporan Aktivitas
        </div>

        <div class="
            rounded-xl
            border
            border-zinc-800
            bg-zinc-950
            p-4
            text-sm
            leading-7
            whitespace-pre-wrap
            text-zinc-300
        ">
            ${
              activity.description
                ? escapeActivityHTML(activity.description)
                : '<span class="text-zinc-600 italic">Belum ada laporan aktivitas.</span>'
            }
        </div>

</div>
      <div
        class="
          text-xs
          uppercase
          tracking-widest
          text-zinc-500
          mb-3
        "
      >
        Anggota Hadir
      </div>

      ${
        attendances.length === 0
          ? `
            <div class="text-sm text-zinc-600">
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
                            w-4 h-4
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
  `;

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

function editActivity(id) {
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
    .getElementById("activityImage")
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

  selectedActivityImages = [...input.files];

  const container = document.getElementById("activityImagePreview");
  const info = document.getElementById("activityImageInfo");

  container.innerHTML = "";

  if (selectedActivityImages.length === 0) {
    info.textContent = "Belum ada foto dipilih.";
    return;
  }

  info.textContent = `${selectedActivityImages.length} foto dipilih.`;

  selectedActivityImages.forEach((file) => {
    const url = URL.createObjectURL(file);

    container.innerHTML += `
      <div class="relative">
        <img
          src="${url}"
          class="w-full h-36 object-cover rounded-xl border border-zinc-800"
        >
      </div>
    `;
  });
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

    const extension = file.name.split(".").pop();
    const fileName = `${activityId}/${crypto.randomUUID()}.${extension}`;

    console.log("Storage Path:", fileName);

    const { data, error } = await supabaseClient.storage
      .from("activity-images")
      .upload(fileName, file);

    console.log("UPLOAD RESULT");
    console.log(data);
    console.log(error);

    if (error) {
      console.error(error);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabaseClient.storage.from("activity-images").getPublicUrl(fileName);

    console.log("PUBLIC URL:");
    console.log(publicUrl);

    uploadedImages.push(publicUrl);
  }

  console.log("UPLOAD SELESAI");
  console.log(uploadedImages);

  return uploadedImages;
}
