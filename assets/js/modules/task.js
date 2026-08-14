/* =========================================================
   BLACK LINE — TASK MODULE
   ========================================================= */

let allTasks = [];

async function loadTasks() {
  setPage("tasks", "Catatan Tugas");

  const app = document.getElementById("app");

  if (!app) {
    console.error("Task app container not found.");
    return;
  }

  app.innerHTML = `
    <div class="space-y-6">

      <!-- HEADER -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 class="text-2xl font-bold text-white">
                Catatan Tugas
                </h1>

                <p class="text-sm text-zinc-400 mt-1">
                Daftar tugas dan pekerjaan BLACK LINE.
                </p>
            </div>

            <button
                type="button"
                onclick="openTaskForm()"
                class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition"
            >
                <i data-lucide="plus" class="w-4 h-4"></i>
                Buat Tugas
            </button>
            </div>


              <!-- FILTER STATUS -->

                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div>
                        <div class="text-sm font-semibold text-zinc-200">
                          Filter Tugas
                        </div>

                        <div class="text-xs text-zinc-500 mt-1">
                          Tampilkan tugas berdasarkan status.
                        </div>
                      </div>

                      <select
                        id="taskStatusFilter"
                        class="
                          w-full sm:w-56
                          px-4 py-2.5
                          rounded-xl
                          border border-zinc-800
                          bg-zinc-900
                          text-sm
                          text-white
                          outline-none
                          focus:border-red-600
                          transition
                        "
                      >
                        <option value="all">
                          Semua Status
                        </option>

                        <option value="Belum Dikerjakan">
                          Belum Dikerjakan
                        </option>

                        <option value="Sedang Dikerjakan">
                          Sedang Dikerjakan
                        </option>

                        <option value="Selesai">
                          Selesai
                        </option>

                        <option value="Dibatalkan">
                          Dibatalkan
                        </option>
                      </select>

                    </div>

                    <!-- TASK LIST -->

                <div id="tasksList" class="space-y-4">
                  <div class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-center">
                    <div class="text-zinc-400">
                      Memuat tugas...
                    </div>
                  </div>
                </div>

          </div>
            `;

  try {
    /* =====================================================
       AMBIL TASKS
       ===================================================== */

    const { data: tasks, error: tasksError } = await supabaseClient
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        leader_id,
        deadline,
        status,
        created_at,
        updated_at
      `,
      )
      .order("created_at", {
        ascending: false,
      });

    if (tasksError) {
      console.error("Failed to load tasks:", tasksError);
      showTaskError("Gagal mengambil data tugas.");
      return;
    }

    /* =====================================================
       TIDAK ADA TUGAS
       ===================================================== */

    if (!tasks || tasks.length === 0) {
      renderTasks([]);
      return;
    }

    /* =====================================================
       AMBIL LEADER
       ===================================================== */

    const leaderIds = [
      ...new Set(
        tasks
          .map((task) => task.leader_id)
          .filter((id) => id !== null && id !== undefined),
      ),
    ];

    let members = [];

    if (leaderIds.length > 0) {
      const { data: memberData, error: memberError } = await supabaseClient
        .from("members")
        .select("id, name")
        .in("id", leaderIds);

      if (memberError) {
        console.error("Failed to load task leaders:", memberError);
      } else {
        members = memberData || [];
      }
    }

    /* =====================================================
       AMBIL PIC
       ===================================================== */

    const taskIds = tasks.map((task) => task.id);

    let taskPics = [];

    if (taskIds.length > 0) {
      const { data: picData, error: picError } = await supabaseClient
        .from("task_pics")
        .select("id, task_id, pic_role")
        .in("task_id", taskIds);

      if (picError) {
        console.error("Failed to load task PICs:", picError);
      } else {
        taskPics = picData || [];
      }
    }

    /* =====================================================
       GABUNGKAN DATA
       ===================================================== */

    const memberMap = new Map(
      members.map((member) => [Number(member.id), member.name]),
    );

    const picsMap = new Map();

    taskPics.forEach((pic) => {
      const taskId = Number(pic.task_id);

      if (!picsMap.has(taskId)) {
        picsMap.set(taskId, []);
      }

      picsMap.get(taskId).push(pic.pic_role);
    });

    const taskData = tasks.map((task) => ({
      ...task,

      leader_name: memberMap.get(Number(task.leader_id)) || "Tidak diketahui",

      pic_roles: picsMap.get(Number(task.id)) || [],
    }));

    allTasks = taskData;

    renderTasks(allTasks);
  } catch (error) {
    console.error("Unexpected task loading error:", error);
    showTaskError("Terjadi kesalahan saat memuat tugas.");
  }
}

/* =========================================================
   RENDER TASKS
   ========================================================= */

function renderTasks(tasks) {
  const container = document.getElementById("tasksList");

  if (!container) {
    return;
  }

  if (!tasks || tasks.length === 0) {
    container.innerHTML = `
      <div class="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-10 text-center">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
          <i data-lucide="clipboard-list" class="w-7 h-7 text-zinc-400"></i>
        </div>

        <h3 class="text-lg font-semibold text-white">
          Belum ada tugas
        </h3>

        <p class="text-sm text-zinc-500 mt-1">
          Belum ada catatan tugas yang dibuat.
        </p>
      </div>
    `;

    lucide.createIcons();
    return;
  }

  container.innerHTML = tasks.map((task) => buildTaskCard(task)).join("");

  lucide.createIcons();
}

/* =========================================================
   FILTER TASK STATUS
   ========================================================= */

function filterTasksByStatus(status) {
  if (status === "all") {
    renderTasks(allTasks);
    return;
  }

  const filteredTasks = allTasks.filter(
    (task) => (task.status || "Belum Dikerjakan") === status,
  );

  renderTasks(filteredTasks);
}
/* =========================================================
   TASK CARD
   ========================================================= */

function buildTaskCard(task) {
  const status = task.status || "Belum Dikerjakan";

  const statusConfig = getTaskStatusConfig(status);

  const deadline = formatTaskDeadline(task.deadline);

  const deadlineState = getTaskDeadlineState(task.deadline, status);

  const picNames = formatTaskPics(task.pic_roles);

  const description = task.description?.trim() || "Tidak ada deskripsi tugas.";

  return `
    <div
      class="rounded-2xl border border-zinc-800 bg-zinc-900/70 overflow-hidden hover:border-zinc-700 transition"
    >

      <!-- TOP -->
      <div class="p-5 sm:p-6">

        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

          <!-- TITLE -->
              <div class="min-w-0">

                <div class="flex flex-wrap items-center gap-2 mb-2">

                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.className}"
                  >
                    <i
                      data-lucide="${statusConfig.icon}"
                      class="w-3.5 h-3.5"
                    ></i>

                    ${escapeTaskHtml(status)}
                  </span>

                  ${
                    deadlineState.isLate
                      ? `
                        <span
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold"
                        >
                          <i
                            data-lucide="triangle-alert"
                            class="w-3.5 h-3.5"
                          ></i>
                          Terlambat
                        </span>
                      `
                      : ""
                  }

                </div>

                <h2 class="text-xl font-bold text-white break-words">
                  ${escapeTaskHtml(task.title)}
                </h2>

              </div>

              <!-- ACTION -->
              <div class="flex items-center gap-2 shrink-0">

                <button
                  type="button"
                  onclick="openEditTaskForm(${Number(task.id)})"
                  class="
                    inline-flex items-center justify-center
                    w-10 h-10
                    rounded-xl
                    border border-zinc-800
                    bg-zinc-900
                    hover:bg-zinc-800
                    text-zinc-400
                    hover:text-white
                    transition
                  "
                  title="Edit Tugas"
                >
                  <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>

              <button
                type="button"
                onclick="deleteTask(${Number(task.id)})"
                class="
                  inline-flex items-center justify-center
                  w-10 h-10
                  rounded-xl
                  border border-red-500/20
                  bg-red-500/5
                  hover:bg-red-500/10
                  text-red-400
                  hover:text-red-300
                  transition
                "
                title="Hapus Tugas"
              >
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>

              </div>

              

              </div>



        <!-- DESCRIPTION -->
        <div class="mt-5">
          <div class="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Deskripsi
          </div>

          <p class="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
            ${escapeTaskHtml(description)}
          </p>
        </div>

        <!-- INFO -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

          <!-- LEADER -->
          <div class="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">

            <div class="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <i data-lucide="crown" class="w-4 h-4"></i>
              Leader
            </div>

            <div class="text-sm font-semibold text-white">
              ${escapeTaskHtml(task.leader_name)}
            </div>

          </div>

          <!-- PIC -->
          <div class="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">

            <div class="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <i data-lucide="users" class="w-4 h-4"></i>
              PIC
            </div>

            <div class="flex flex-wrap gap-2">
              ${picNames}
            </div>

          </div>

          <!-- STATUS -->
              <div id="taskStatusWrapper" class="hidden">

                <label
                  for="taskStatus"
                  class="block text-sm font-semibold text-zinc-200 mb-2"
                >
                  Status Tugas
                </label>

                <select
                  id="taskStatus"
                  name="status"
                  class="
                    w-full
                    px-4 py-3
                    rounded-xl
                    border border-zinc-800
                    bg-zinc-900
                    text-white
                    outline-none
                    focus:border-red-600
                    transition
                  "
                >
                  <option value="Belum Dikerjakan">
                    Belum Dikerjakan
                  </option>

                  <option value="Sedang Dikerjakan">
                    Sedang Dikerjakan
                  </option>

                  <option value="Selesai">
                    Selesai
                  </option>

                  <option value="Dibatalkan">
                    Dibatalkan
                  </option>
                </select>

              </div>

          <!-- DEADLINE -->
          <div class="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">

            <div class="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <i data-lucide="calendar-clock" class="w-4 h-4"></i>
              Deadline
            </div>

            <div class="text-sm font-semibold ${
              deadlineState.isLate ? "text-red-400" : "text-white"
            }">
              ${deadline}
            </div>

          </div>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   STATUS CONFIG
   ========================================================= */

function getTaskStatusConfig(status) {
  switch (status) {
    case "Sedang Dikerjakan":
      return {
        icon: "loader-circle",
        className:
          "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      };

    case "Selesai":
      return {
        icon: "circle-check",
        className: "bg-green-500/10 text-green-400 border border-green-500/20",
      };

    case "Dibatalkan":
      return {
        icon: "circle-x",
        className: "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20",
      };

    case "Belum Dikerjakan":
    default:
      return {
        icon: "clock-3",
        className: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      };
  }
}

/* =========================================================
   DEADLINE
   ========================================================= */

function formatTaskDeadline(deadline) {
  if (!deadline) {
    return "Tidak ada deadline";
  }

  const date = new Date(`${deadline}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Tidak ada deadline";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getTaskDeadlineState(deadline, status) {
  if (!deadline || status === "Selesai" || status === "Dibatalkan") {
    return {
      isLate: false,
    };
  }

  const deadlineDate = new Date(`${deadline}T23:59:59`);

  if (Number.isNaN(deadlineDate.getTime())) {
    return {
      isLate: false,
    };
  }

  return {
    isLate: new Date() > deadlineDate,
  };
}

/* =========================================================
   PIC FORMAT
   ========================================================= */

function formatTaskPics(picRoles) {
  if (!picRoles || picRoles.length === 0) {
    return `
      <span class="text-sm text-zinc-500">
        Tidak ada PIC
      </span>
    `;
  }

  const labels = {
    pj_activity: "PJ Activity",
    pj_bendahara: "PJ Bendahara",
    sekretaris: "Sekretaris",
    pj_brankas: "PJ Brankas",
  };

  return picRoles
    .map((role) => {
      const label = labels[role] || role;

      return `
        <span
          class="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"
        >
          ${escapeTaskHtml(label)}
        </span>
      `;
    })
    .join("");
}

/* =========================================================
   ERROR
   ========================================================= */

function showTaskError(message) {
  const container = document.getElementById("tasksList");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">

      <div class="w-12 h-12 mx-auto rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
        <i data-lucide="triangle-alert" class="w-6 h-6 text-red-400"></i>
      </div>

      <h3 class="text-lg font-semibold text-white">
        Gagal memuat tugas
      </h3>

      <p class="text-sm text-zinc-400 mt-1">
        ${escapeTaskHtml(message)}
      </p>

    </div>
  `;

  lucide.createIcons();
}

/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeTaskHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   TASK FORM
   ========================================================= */

function openTaskForm() {
  const oldModal = document.getElementById("taskFormModal");

  if (oldModal) {
    oldModal.remove();
  }

  const modal = document.createElement("div");

  modal.id = "taskFormModal";

  modal.className = `
    fixed inset-0 z-50
    flex items-center justify-center
    p-4
    bg-black/70
    backdrop-blur-sm
  `;

  modal.innerHTML = `
    <div
      class="
        w-full max-w-2xl
        max-h-[90vh]
        overflow-y-auto
        rounded-2xl
        border border-zinc-800
        bg-zinc-950
        shadow-2xl
      "
    >

      <!-- HEADER -->
      <div
        class="
          sticky top-0 z-10
          flex items-center justify-between
          gap-4
          px-6 py-5
          border-b border-zinc-800
          bg-zinc-950
        "
      >

        <div>
          <h2 class="text-xl font-bold text-white">
            Buat Tugas
          </h2>

          <p class="text-sm text-zinc-500 mt-1">
            Tambahkan catatan tugas baru.
          </p>
        </div>

        <button
          type="button"
          onclick="closeTaskForm()"
          class="
            w-9 h-9
            rounded-xl
            border border-zinc-800
            bg-zinc-900
            hover:bg-zinc-800
            flex items-center justify-center
            transition
          "
          title="Tutup"
        >
          <i
            data-lucide="x"
            class="w-5 h-5 text-zinc-400"
          ></i>
        </button>

      </div>

      <!-- FORM -->
      <form
        id="taskForm"
        onsubmit="return handleTaskFormSubmit(event)"
        class="p-6 space-y-6"
      >

        <!-- JUDUL -->
        <div>

          <label
            for="taskTitle"
            class="block text-sm font-semibold text-zinc-200 mb-2"
          >
            Judul Tugas
            <span class="text-red-500">*</span>
          </label>

          <input
            type="text"
            id="taskTitle"
            name="title"
            required
            maxlength="150"
            placeholder="Contoh: Persiapan Event BLACK LINE"
            class="
              w-full
              px-4 py-3
              rounded-xl
              border border-zinc-800
              bg-zinc-900
              text-white
              placeholder:text-zinc-600
              outline-none
              focus:border-red-600
              transition
            "
          />

        </div>

        <!-- DESKRIPSI -->
        <div>

          <label
            for="taskDescription"
            class="block text-sm font-semibold text-zinc-200 mb-2"
          >
            Deskripsi
          </label>

          <textarea
            id="taskDescription"
            name="description"
            rows="5"
            maxlength="5000"
            placeholder="Tuliskan detail atau catatan tugas..."
            class="
              w-full
              px-4 py-3
              rounded-xl
              border border-zinc-800
              bg-zinc-900
              text-white
              placeholder:text-zinc-600
              outline-none
              focus:border-red-600
              transition
              resize-y
            "
          ></textarea>

          <p class="text-xs text-zinc-600 mt-2">
            Deskripsi bersifat opsional.
          </p>

        </div>

        <!-- LEADER -->
        <div>

          <label
            for="taskLeader"
            class="block text-sm font-semibold text-zinc-200 mb-2"
          >
            Leader
            <span class="text-red-500">*</span>
          </label>

          <select
            id="taskLeader"
            name="leader_id"
            required
            disabled
            class="
              w-full
              px-4 py-3
              rounded-xl
              border border-zinc-800
              bg-zinc-900
              text-white
              outline-none
              focus:border-red-600
              transition
            "
          >
            <option value="">
              Akan dimuat...
            </option>
          </select>

          <p class="text-xs text-zinc-600 mt-2">
            Leader dipilih dari daftar Member.
          </p>

        </div>

        <!-- PIC -->
        <div>

          <label
            class="block text-sm font-semibold text-zinc-200 mb-2"
          >
            PIC
            <span class="text-red-500">*</span>
          </label>

          <div
            id="taskPicOptions"
            class="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-3
            "
          >

            <div
              class="
                rounded-xl
                border border-zinc-800
                bg-zinc-900
                p-4
                text-sm text-zinc-500
              "
            >
              Pilihan PIC akan dimuat...
            </div>

          </div>

          <p class="text-xs text-zinc-600 mt-2">
            Kamu dapat memilih lebih dari satu PIC.
          </p>

        </div>

        <!-- DEADLINE -->
        <div>

          <label
            for="taskDeadline"
            class="block text-sm font-semibold text-zinc-200 mb-2"
          >
            Deadline
          </label>

          <input
            type="date"
            id="taskDeadline"
            name="deadline"
            class="
              w-full
              px-4 py-3
              rounded-xl
              border border-zinc-800
              bg-zinc-900
              text-white
              outline-none
              focus:border-red-600
              transition
            "
          />

          <p class="text-xs text-zinc-600 mt-2">
            Deadline boleh dikosongkan.
          </p>

        </div>

        <!-- STATUS INFO -->
        <div
          class="
            rounded-xl
            border border-blue-500/20
            bg-blue-500/5
            p-4
          "
        >

          <div class="flex items-start gap-3">

            <i
              data-lucide="info"
              class="w-5 h-5 text-blue-400 shrink-0 mt-0.5"
            ></i>

            <div>

              <div class="text-sm font-semibold text-blue-300">
                Status Awal
              </div>

              <div class="text-sm text-zinc-400 mt-1">
                Tugas baru akan otomatis memiliki status
                <strong class="text-zinc-200">
                  Belum Dikerjakan
                </strong>.
              </div>

            </div>

          </div>

        </div>

        <!-- ACTION -->
        <div
          class="
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            gap-3
            pt-2
          "
        >

          <button
            type="button"
            onclick="closeTaskForm()"
            class="
              px-5 py-3
              rounded-xl
              border border-zinc-800
              bg-zinc-900
              hover:bg-zinc-800
              text-zinc-300
              font-semibold
              transition
            "
          >
            Batal
          </button>

          <button
            type="submit"
            class="
              px-5 py-3
              rounded-xl
              bg-red-600
              hover:bg-red-700
              text-white
              font-semibold
              transition
              inline-flex
              items-center
              justify-center
              gap-2
            "
          >
            <i
              data-lucide="save"
              class="w-4 h-4"
            ></i>

            Simpan Tugas
          </button>

        </div>

      </form>

    </div>
  `;

  document.body.appendChild(modal);

  lucide.createIcons();

  document.getElementById("taskTitle")?.focus();

  loadTaskFormOptions();
}

/* =========================================================
   CLOSE TASK FORM
   ========================================================= */

function closeTaskForm() {
  const modal = document.getElementById("taskFormModal");

  if (modal) {
    modal.remove();
  }
}

/* =========================================================
   TASK FORM SUBMIT
   ========================================================= */

async function handleTaskFormSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("taskForm");

  if (!form) {
    return false;
  }

  const formMode = form?.dataset.mode || "create";
  const editingTaskId = form?.dataset.taskId || null;

  const titleInput = document.getElementById("taskTitle");
  const descriptionInput = document.getElementById("taskDescription");
  const leaderInput = document.getElementById("taskLeader");
  const deadlineInput = document.getElementById("taskDeadline");

  const title = titleInput?.value.trim() || "";
  const description = descriptionInput?.value.trim() || "";
  const leaderId = leaderInput?.value || "";
  const deadline = deadlineInput?.value || null;

  const statusInput = document.getElementById("editTaskStatus");

  const status = statusInput?.value || "Belum Dikerjakan";

  console.log("TASK EDIT DEBUG:", {
    formMode,
    editingTaskId,
    statusElement: statusInput,
    statusValue: statusInput?.value,
  });

  /* =====================================================
     VALIDASI JUDUL
     ===================================================== */

  if (!title) {
    showToast("Judul tugas wajib diisi.", "error");
    titleInput?.focus();
    return false;
  }

  /* =====================================================
     VALIDASI LEADER
     ===================================================== */

  if (!leaderId) {
    showToast("Silakan pilih Leader.", "error");
    leaderInput?.focus();
    return false;
  }

  /* =====================================================
     AMBIL PIC
     ===================================================== */

  const selectedPicInputs = document.querySelectorAll(
    'input[name="task_pic"]:checked',
  );

  const selectedPicRoles = Array.from(selectedPicInputs).map(
    (input) => input.value,
  );

  /* =====================================================
     VALIDASI PIC
     ===================================================== */

  if (selectedPicRoles.length === 0) {
    showToast("Minimal pilih satu PIC.", "error");
    return false;
  }

  /* =====================================================
     TOMBOL SUBMIT
     ===================================================== */

  const submitButton = form.querySelector('button[type="submit"]');

  const originalButtonHtml = submitButton?.innerHTML;

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.innerHTML = `
      <i
        data-lucide="loader-circle"
        class="w-4 h-4 animate-spin"
      ></i>

      Menyimpan...
    `;

    lucide.createIcons();
  }

  try {
    /* =====================================================
   CREATE / UPDATE TASK
   ===================================================== */

    let task;
    let taskError;

    if (formMode === "edit") {
      /* ===================================================
     UPDATE
     =================================================== */

      if (!editingTaskId) {
        showToast("ID tugas untuk edit tidak ditemukan.", "error");
        return false;
      }

      const result = await supabaseClient
        .from("tasks")
        .update({
          title: title,
          description: description || null,
          leader_id: Number(leaderId),
          deadline: deadline || null,
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", Number(editingTaskId))
        .select("id, created_at")
        .single();

      task = result.data;
      taskError = result.error;
    } else {
      /* ===================================================
     INSERT
     =================================================== */

      const result = await supabaseClient
        .from("tasks")
        .insert({
          title: title,
          description: description || null,
          leader_id: Number(leaderId),
          deadline: deadline || null,
          status: "Belum Dikerjakan",
        })
        .select("id, created_at")
        .single();

      task = result.data;
      taskError = result.error;
    }

    /* =====================================================
   CREATE / UPDATE TASK PICS
   ===================================================== */

    if (formMode === "edit") {
      /* ===================================================
     HAPUS PIC LAMA
     =================================================== */

      const { error: deletePicError } = await supabaseClient
        .from("task_pics")
        .delete()
        .eq("task_id", task.id);

      if (deletePicError) {
        console.error("Failed to delete old task PICs:", deletePicError);

        showToast(
          "Tugas diperbarui, tetapi PIC lama gagal diperbarui.",
          "error",
        );

        return false;
      }
    }

    /* =====================================================
   INSERT PIC BARU
   ===================================================== */

    const picRows = selectedPicRoles.map((picRole) => ({
      task_id: task.id,
      pic_role: picRole,
    }));

    const { error: picError } = await supabaseClient
      .from("task_pics")
      .insert(picRows);

    if (picError) {
      console.error("Failed to save task PICs:", picError);

      showToast(
        formMode === "edit"
          ? "Tugas diperbarui, tetapi PIC gagal diperbarui."
          : "Tugas tersimpan, tetapi PIC gagal disimpan.",
        "error",
      );

      return false;
    }

    /* =====================================================
   DISCORD — NEW TASK
   ===================================================== */

    if (formMode === "create") {
      const leaderName =
        leaderInput?.selectedOptions?.[0]?.textContent?.trim() ||
        "Tidak diketahui";

      const taskForDiscord = {
        id: task.id,

        title: title,

        description: description || null,

        leader_name: leaderName,

        pic_roles: selectedPicRoles,

        deadline: deadline || null,

        created_at: task.created_at || new Date().toISOString(),
      };

      const discordPayload = buildTaskEmbed(taskForDiscord);

      const discordSuccess = await sendDiscordWebhook("task", discordPayload);

      if (!discordSuccess) {
        console.warn(
          "Task berhasil disimpan, tetapi laporan Discord gagal dikirim.",
        );
      }
    }

    /* =====================================================
       BERHASIL
       ===================================================== */

    showToast(
      formMode === "edit"
        ? "Tugas berhasil diperbarui."
        : "Tugas berhasil dibuat.",
    );

    closeTaskForm();

    await loadTasks();

    return true;
  } catch (error) {
    console.error("Unexpected task creation error:", error);

    showToast("Terjadi kesalahan saat menyimpan tugas.", "error");

    return false;
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      if (originalButtonHtml) {
        submitButton.innerHTML = originalButtonHtml;
        lucide.createIcons();
      }
    }
  }
}

/* =========================================================
   LOAD TASK FORM OPTIONS
   ========================================================= */

async function loadTaskFormOptions() {
  await loadTaskLeaders();
  renderTaskPicOptions();
}

/* =========================================================
   LOAD LEADER OPTIONS
   ========================================================= */

async function loadTaskLeaders() {
  const select = document.getElementById("taskLeader");

  if (!select) {
    return;
  }

  try {
    const { data: members, error } = await supabaseClient
      .from("members")
      .select("id, name")
      .order("name", {
        ascending: true,
      });

    if (error) {
      console.error("Failed to load task leaders:", error);

      select.innerHTML = `
        <option value="">
          Gagal memuat Member
        </option>
      `;

      return;
    }

    if (!members || members.length === 0) {
      select.innerHTML = `
        <option value="">
          Belum ada Member
        </option>
      `;

      return;
    }

    select.innerHTML = `
      <option value="">
        Pilih Leader
      </option>

      ${members
        .map(
          (member) => `
            <option value="${member.id}">
              ${escapeTaskHtml(member.name)}
            </option>
          `,
        )
        .join("")}
    `;

    select.disabled = false;
  } catch (error) {
    console.error("Unexpected leader loading error:", error);

    select.innerHTML = `
      <option value="">
        Gagal memuat Member
      </option>
    `;
  }
}

/* =========================================================
   PIC OPTIONS
   ========================================================= */

function renderTaskPicOptions() {
  const container = document.getElementById("taskPicOptions");

  if (!container) {
    return;
  }

  const picRoles = [
    {
      value: "pj_activity",
      label: "PJ Activity",
    },
    {
      value: "pj_bendahara",
      label: "PJ Bendahara",
    },
    {
      value: "sekretaris",
      label: "Sekretaris",
    },
    {
      value: "pj_brankas",
      label: "PJ Brankas",
    },
  ];

  container.innerHTML = picRoles
    .map(
      (pic) => `
        <label
          class="
            flex items-center gap-3
            rounded-xl
            border border-zinc-800
            bg-zinc-900
            p-4
            cursor-pointer
            hover:border-zinc-700
            transition
          "
        >

          <input
            type="checkbox"
            name="task_pic"
            value="${pic.value}"
            class="
              w-4 h-4
              rounded
              border-zinc-700
              bg-zinc-900
              text-red-600
              focus:ring-red-600
            "
          />

          <span class="text-sm font-medium text-zinc-200">
            ${pic.label}
          </span>

        </label>
      `,
    )
    .join("");
}

/* =========================================================
   EDIT TASK FORM
   ========================================================= */

async function openEditTaskForm(taskId) {
  if (!taskId) {
    showToast("ID tugas tidak ditemukan.", "error");
    return;
  }

  try {
    const { data: task, error: taskError } = await supabaseClient
      .from("tasks")
      .select(
        `
        id,
        title,
        description,
        leader_id,
        deadline,
        status
      `,
      )
      .eq("id", taskId)
      .single();

    if (taskError) {
      console.error("Failed to load task for edit:", taskError);

      showToast(taskError.message || "Gagal mengambil data tugas.", "error");

      return;
    }

    if (!task) {
      showToast("Data tugas tidak ditemukan.", "error");
      return;
    }

    const { data: taskPics, error: picError } = await supabaseClient
      .from("task_pics")
      .select("pic_role")
      .eq("task_id", taskId);

    if (picError) {
      console.error("Failed to load task PICs for edit:", picError);

      showToast(picError.message || "Gagal mengambil data PIC tugas.", "error");

      return;
    }

    /* =====================================================
       BUKA FORM
       ===================================================== */

    openTaskForm();

    /* =====================================================
       LOAD OPTIONS TERLEBIH DAHULU
       ===================================================== */

    await loadTaskFormOptions();

    /* =====================================================
       ISI DATA LAMA
       ===================================================== */

    const titleInput = document.getElementById("taskTitle");
    const descriptionInput = document.getElementById("taskDescription");
    const leaderInput = document.getElementById("taskLeader");
    const deadlineInput = document.getElementById("taskDeadline");

    if (titleInput) {
      titleInput.value = task.title || "";
    }

    if (descriptionInput) {
      descriptionInput.value = task.description || "";
    }

    if (leaderInput) {
      leaderInput.value = task.leader_id || "";
    }

    if (deadlineInput) {
      deadlineInput.value = task.deadline || "";
    }

    /* =====================================================
       SET PIC
       ===================================================== */

    const picRoles = (taskPics || []).map((pic) => pic.pic_role);

    document.querySelectorAll('input[name="task_pic"]').forEach((input) => {
      input.checked = picRoles.includes(input.value);
    });

    /* =====================================================
       UBAH JUDUL MODAL
       ===================================================== */

    const modalTitle = document.querySelector("#taskFormModal h2");

    if (modalTitle) {
      modalTitle.textContent = "Edit Tugas";
    }

    const modalDescription = document.querySelector("#taskFormModal h2 + p");

    if (modalDescription) {
      modalDescription.textContent = "Perbarui informasi tugas.";
    }

    /* =====================================================
       UBAH TOMBOL
       ===================================================== */

    const submitButton = document.querySelector(
      '#taskFormModal button[type="submit"]',
    );

    if (submitButton) {
      submitButton.innerHTML = `
        <i data-lucide="save" class="w-4 h-4"></i>
        Simpan Perubahan
      `;

      lucide.createIcons();
    }

    /* =====================================================
       SIMPAN MODE EDIT
       ===================================================== */

    const form = document.getElementById("taskForm");

    if (form) {
      form.dataset.mode = "edit";
      form.dataset.taskId = String(task.id);
    }

    /* =====================================================
        STATUS EDIT
        ===================================================== */

    const statusInfo = document.querySelector(
      "#taskFormModal .border-blue-500\\/20",
    );

    if (statusInfo) {
      statusInfo.innerHTML = `
          <label
            for="taskStatus"
            class="block text-sm font-semibold text-blue-300 mb-2"
          >
            Status Tugas
          </label>

          <select
            id="editTaskStatus"
            name="status"
            class="
              w-full
              px-4 py-3
              rounded-xl
              border border-zinc-800
              bg-zinc-900
              text-white
              outline-none
              focus:border-red-600
              transition
            "
          >
            <option value="Belum Dikerjakan">
              Belum Dikerjakan
            </option>

            <option value="Sedang Dikerjakan">
              Sedang Dikerjakan
            </option>

            <option value="Selesai">
              Selesai
            </option>

            <option value="Dibatalkan">
              Dibatalkan
            </option>
          </select>
        `;

      const statusInput = document.getElementById("editTaskStatus");

      if (statusInput) {
        statusInput.value = task.status || "Belum Dikerjakan";
      }

      lucide.createIcons();
    }
  } catch (error) {
    console.error("Unexpected edit task error:", error);

    showToast("Terjadi kesalahan saat membuka tugas.", "error");
  }
}

/* =========================================================
   DELETE TASK
   ========================================================= */

async function deleteTask(taskId) {
  if (!taskId) {
    showToast("ID tugas tidak ditemukan.", "error");
    return false;
  }

  const confirmed = confirm("Apakah kamu yakin ingin menghapus tugas ini?");

  if (!confirmed) {
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from("tasks")
      .delete()
      .eq("id", Number(taskId));

    if (error) {
      console.error("Failed to delete task:", error);

      showToast(error.message || "Gagal menghapus tugas.", "error");

      return false;
    }

    showToast("Tugas berhasil dihapus.");

    await loadTasks();

    return true;
  } catch (error) {
    console.error("Unexpected delete task error:", error);

    showToast("Terjadi kesalahan saat menghapus tugas.", "error");

    return false;
  }
}
