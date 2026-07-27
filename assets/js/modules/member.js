let editingMemberId = null;
let supabaseMembers = [];

/* =========================================================
   FETCH MEMBERS
========================================================= */

async function fetchMembersFromSupabase() {
  const { data, error } = await supabaseClient
    .from("members")
    .select("id, name, created_at")
    .order("name", { ascending: true });

  if (error) {
    console.error("Gagal mengambil members:", error);
    supabaseMembers = [];
    return;
  }

  supabaseMembers = data || [];
}

/* =========================================================
   PAGE
========================================================= */

function memberPage() {
  return `
    <div class="space-y-6">

      <!-- FORM -->
      <div class="card">

        <div class="flex items-center justify-between gap-4 mb-6">

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
                data-lucide="users"
                class="w-5 h-5 text-red-400"
              ></i>
            </div>

            <div>
              <h2 class="text-xl font-bold">
                Data Anggota
              </h2>

              <p class="text-xs text-zinc-500 mt-1">
                Kelola daftar anggota BLACK LINE.
              </p>
            </div>

          </div>

          <span
            id="memberCount"
            class="
              px-3 py-1.5
              rounded-lg
              bg-zinc-800
              text-sm
              text-zinc-300
            "
          >
            0 Anggota
          </span>

        </div>

        <div class="flex flex-col md:flex-row gap-3">

          <div class="relative flex-1">

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
              id="memberName"
              type="text"
              placeholder="Nama Anggota"
              class="input pl-11"
              autocomplete="off"
              onkeydown="handleMemberEnter(event)"
            >

          </div>

          <button
            id="saveMemberBtn"
            onclick="saveMember()"
            class="
              btn-red
              flex
              items-center
              justify-center
              gap-2
              md:min-w-[170px]
            "
          >
            <i
              data-lucide="user-plus"
              class="w-4 h-4"
            ></i>

            <span id="saveMemberText">
              Tambah Anggota
            </span>
          </button>

          <button
            id="cancelMemberBtn"
            onclick="resetMemberForm()"
            class="
              btn
              hidden
              items-center
              justify-center
              gap-2
            "
          >
            <i
              data-lucide="x"
              class="w-4 h-4"
            ></i>

            Batal
          </button>

        </div>

      </div>


      <!-- MEMBER LIST -->
      <div class="card">

        <div class="flex items-center justify-between gap-4 mb-5">

          <div>
            <h2 class="font-bold">
              Daftar Anggota
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Anggota yang terdaftar di sistem.
            </p>
          </div>

        </div>

        <div class="relative mb-5">

          <i
            data-lucide="search"
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
            id="searchMember"
            type="text"
            placeholder="Cari anggota..."
            class="input pl-11"
            oninput="renderMembers()"
          >

        </div>

        <div id="memberList"></div>

      </div>

    </div>
  `;
}

/* =========================================================
   LOAD
========================================================= */

async function loadMembers() {
  setActiveMenu("menu-members");

  if (typeof setPageTitle === "function") {
    setPageTitle("Members");
  }

  document.getElementById("app").innerHTML = `
    <div class="card">
      <div class="text-center text-zinc-500 py-10">
        Memuat data anggota...
      </div>
    </div>
  `;

  await fetchMembersFromSupabase();

  document.getElementById("app").innerHTML = memberPage();

  renderMembers();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   RENDER
========================================================= */

function renderMembers() {
  const container = document.getElementById("memberList");

  if (!container) {
    return;
  }

  const search =
    document.getElementById("searchMember")?.value.trim().toLowerCase() || "";

  const members = supabaseMembers.filter((member) =>
    String(member.name || "")
      .toLowerCase()
      .includes(search),
  );

  const countElement = document.getElementById("memberCount");

  if (countElement) {
    countElement.textContent = `${supabaseMembers.length} Anggota`;
  }

  if (members.length === 0) {
    container.innerHTML = `
      <div
        class="
          border
          border-dashed
          border-zinc-800
          rounded-2xl
          py-12
          px-5
          text-center
        "
      >

        <div
          class="
            w-12 h-12
            rounded-xl
            bg-zinc-800
            flex
            items-center
            justify-center
            mx-auto
            mb-4
          "
        >
          <i
            data-lucide="users"
            class="w-5 h-5 text-zinc-500"
          ></i>
        </div>

        <div class="font-semibold text-zinc-300">
          ${search ? "Anggota tidak ditemukan" : "Belum ada anggota"}
        </div>

        <div class="text-xs text-zinc-500 mt-2">
          ${
            search
              ? "Coba gunakan kata pencarian lain."
              : "Tambahkan anggota pertama melalui form di atas."
          }
        </div>

      </div>
    `;

    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    return;
  }

  container.innerHTML = `
    <div class="space-y-2">

      ${members
        .map(
          (member, index) => `
            <div
              class="
                flex
                items-center
                justify-between
                gap-4
                p-4
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/40
                hover:border-zinc-700
                transition
              "
            >

              <div class="flex items-center gap-4 min-w-0">

                <div
                  class="
                    w-10 h-10
                    rounded-xl
                    bg-red-500/10
                    text-red-400
                    flex
                    items-center
                    justify-center
                    font-bold
                    shrink-0
                  "
                >
                  ${index + 1}
                </div>

                <div class="min-w-0">

                  <div class="font-semibold truncate">
                    ${escapeMemberHTML(member.name)}
                  </div>

                  <div class="text-xs text-zinc-500 mt-1">
                    Anggota BLACK LINE
                  </div>

                </div>

              </div>

              <div class="flex items-center gap-2 shrink-0">

                <button
                  onclick="editMember(${member.id})"
                  class="
                    w-9 h-9
                    rounded-lg
                    border border-zinc-700
                    bg-zinc-800
                    hover:bg-zinc-700
                    flex
                    items-center
                    justify-center
                    transition
                  "
                  title="Edit Anggota"
                >
                  <i
                    data-lucide="pencil"
                    class="w-4 h-4"
                  ></i>
                </button>

                <button
                  onclick="deleteMember(${member.id})"
                  class="
                    w-9 h-9
                    rounded-lg
                    border border-red-500/20
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500/20
                    flex
                    items-center
                    justify-center
                    transition
                  "
                  title="Hapus Anggota"
                >
                  <i
                    data-lucide="trash-2"
                    class="w-4 h-4"
                  ></i>
                </button>

              </div>

            </div>
          `,
        )
        .join("")}

    </div>
  `;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   SAVE
========================================================= */

async function saveMember() {
  const input = document.getElementById("memberName");

  const name = input ? input.value.trim() : "";

  if (!name) {
    alert("Nama anggota wajib diisi.");
    return;
  }

  // Cek nama duplicate
  const exists = supabaseMembers.find(
    (member) =>
      member.name.toLowerCase() === name.toLowerCase() &&
      Number(member.id) !== Number(editingMemberId),
  );

  if (exists) {
    alert("Nama anggota sudah terdaftar.");
    return;
  }

  const button = document.getElementById("saveMemberBtn");
  const text = document.getElementById("saveMemberText");

  if (button) {
    button.disabled = true;
  }

  if (text) {
    text.textContent =
      editingMemberId === null ? "Menyimpan..." : "Mengupdate...";
  }

  let error;

  // =====================================================
  // CREATE
  // =====================================================

  if (editingMemberId === null) {
    const result = await supabaseClient.from("members").insert({
      name: name,
    });

    error = result.error;
  }

  // =====================================================
  // UPDATE
  // =====================================================
  else {
    const result = await supabaseClient
      .from("members")
      .update({
        name: name,
      })
      .eq("id", editingMemberId);

    error = result.error;
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    console.error("Gagal menyimpan anggota:", error);

    console.error("DETAIL ERROR MEMBERS:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    alert(
      `Gagal menyimpan anggota.\n\n` +
        `Code: ${error.code || "-"}\n` +
        `Message: ${error.message || "-"}`,
    );

    if (button) {
      button.disabled = false;
    }

    if (text) {
      text.textContent =
        editingMemberId === null ? "Tambah Anggota" : "Update Anggota";
    }

    return;
  }

  // =====================================================
  // SUCCESS
  // =====================================================

  alert(
    editingMemberId === null
      ? "Anggota berhasil ditambahkan."
      : "Anggota berhasil diupdate.",
  );

  await fetchMembersFromSupabase();

  resetMemberForm();

  renderMembers();
}
/* =========================================================
   EDIT
========================================================= */

function editMember(id) {
  const member = supabaseMembers.find((item) => Number(item.id) === Number(id));

  if (!member) {
    alert("Anggota tidak ditemukan.");
    return;
  }

  editingMemberId = Number(id);

  const input = document.getElementById("memberName");
  const text = document.getElementById("saveMemberText");
  const cancelButton = document.getElementById("cancelMemberBtn");

  if (input) {
    input.value = member.name;
    input.focus();
  }

  if (text) {
    text.textContent = "Update Anggota";
  }

  if (cancelButton) {
    cancelButton.classList.remove("hidden");
    cancelButton.classList.add("flex");
  }
}

/* =========================================================
   DELETE
========================================================= */

async function deleteMember(id) {
  const member = supabaseMembers.find((item) => Number(item.id) === Number(id));

  if (!member) {
    alert("Anggota tidak ditemukan.");
    return;
  }

  const confirmed = confirm(`Hapus anggota "${member.name}"?`);

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient.from("members").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus anggota:", error);
    alert("Anggota gagal dihapus.");
    return;
  }

  if (Number(editingMemberId) === Number(id)) {
    editingMemberId = null;
  }

  await fetchMembersFromSupabase();

  resetMemberForm();

  renderMembers();

  alert("Anggota berhasil dihapus.");
}

/* =========================================================
   RESET
========================================================= */

function resetMemberForm() {
  editingMemberId = null;

  const input = document.getElementById("memberName");
  const text = document.getElementById("saveMemberText");
  const button = document.getElementById("saveMemberBtn");
  const cancelButton = document.getElementById("cancelMemberBtn");

  if (input) {
    input.value = "";
  }

  if (text) {
    text.textContent = "Tambah Anggota";
  }

  if (button) {
    button.disabled = false;
  }

  if (cancelButton) {
    cancelButton.classList.add("hidden");
    cancelButton.classList.remove("flex");
  }

  if (input) {
    input.focus();
  }

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   ENTER
========================================================= */

function handleMemberEnter(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    saveMember();
  }
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeMemberHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

