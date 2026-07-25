function settingsPage() {
  const webhooks = getWebhooks();

  let webhookFields = "";

  WEBHOOK_TYPES.forEach((type) => {
    webhookFields += `
      <div>

        <label
          class="block mb-2 text-sm font-semibold text-zinc-300"
        >
          ${type.label}
        </label>

        <input
          id="webhook-${type.key}"
          type="text"
          class="input"
          placeholder="https://discord.com/api/webhooks/..."
          value="${webhooks[type.key] || ""}"
        >

      </div>
    `;
  });

  return `
    <div class="space-y-6">

      <!-- DISCORD SETTINGS -->
      <div class="card">

        <div class="flex items-center gap-3 mb-6">

          <div
            class="
              w-10 h-10
              rounded-xl
              bg-indigo-500/10
              border border-indigo-500/20
              flex items-center justify-center
            "
          >
            <i
              data-lucide="message-circle"
              class="w-5 h-5 text-indigo-400"
            ></i>
          </div>

          <div>

            <h2 class="text-xl font-bold">
              Discord Settings
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Konfigurasi webhook Discord BLACK LINE.
            </p>

          </div>

        </div>

        <div class="space-y-5">

          ${webhookFields}

          <div class="pt-2">

            <button
              class="btn flex items-center justify-center gap-2"
              onclick="saveWebhookSettings()"
            >
              <i
                data-lucide="save"
                class="w-4 h-4"
              ></i>

              Simpan Settings
            </button>

          </div>

        </div>

      </div>

      <!-- BACKUP & RESTORE -->
      <div class="card">

        <div class="flex items-center gap-3 mb-6">

          <div
            class="
              w-10 h-10
              rounded-xl
              bg-green-500/10
              border border-green-500/20
              flex items-center justify-center
            "
          >
            <i
              data-lucide="database-backup"
              class="w-5 h-5 text-green-400"
            ></i>
          </div>

          <div>

            <h2 class="text-xl font-bold">
              Backup & Restore
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Backup seluruh data BLACK LINE ke file JSON.
            </p>

          </div>

        </div>

        <div class="grid xl:grid-cols-2 gap-5">

          <!-- EXPORT -->
          <div
            class="
              border border-zinc-800
              rounded-2xl
              p-5
              bg-zinc-950/40
            "
          >

            <div class="flex items-start gap-4">

              <div
                class="
                  w-10 h-10
                  rounded-xl
                  bg-blue-500/10
                  flex items-center justify-center
                  shrink-0
                "
              >
                <i
                  data-lucide="download"
                  class="w-5 h-5 text-blue-400"
                ></i>
              </div>

              <div>

                <h3 class="font-bold text-zinc-200">
                  Export Backup
                </h3>

                <p class="text-sm text-zinc-500 mt-2">
                  Simpan Materials, Craftings, Transactions,
                  dan Discord Webhooks ke satu file backup.
                </p>

              </div>

            </div>

            <button
              onclick="exportBackup()"
              class="
                btn
                w-full
                mt-5
                flex items-center
                justify-center
                gap-2
              "
            >
              <i
                data-lucide="download"
                class="w-4 h-4"
              ></i>

              Export Backup
            </button>

          </div>

          <!-- IMPORT -->
          <div
            class="
              border border-zinc-800
              rounded-2xl
              p-5
              bg-zinc-950/40
            "
          >

            <div class="flex items-start gap-4">

              <div
                class="
                  w-10 h-10
                  rounded-xl
                  bg-yellow-500/10
                  flex items-center justify-center
                  shrink-0
                "
              >
                <i
                  data-lucide="upload"
                  class="w-5 h-5 text-yellow-400"
                ></i>
              </div>

              <div>

                <h3 class="font-bold text-zinc-200">
                  Restore Backup
                </h3>

                <p class="text-sm text-zinc-500 mt-2">
                  Restore data BLACK LINE dari file backup
                  JSON yang sebelumnya diexport.
                </p>

              </div>

            </div>

            <div class="mt-5">

              <input
                id="backupFile"
                type="file"
                accept=".json,application/json"
                class="hidden"
                onchange="handleBackupFileChange(this)"
              >

              <button
                onclick="document.getElementById('backupFile').click()"
                class="
                  btn
                  w-full
                  flex items-center
                  justify-center
                  gap-2
                "
              >
                <i
                  data-lucide="file-json"
                  class="w-4 h-4"
                ></i>

                Pilih File Backup
              </button>

              <div
                id="backupFileName"
                class="
                  text-xs
                  text-zinc-500
                  mt-3
                  text-center
                  truncate
                "
              >
                Belum ada file dipilih
              </div>

              <button
                id="restoreBackupButton"
                onclick="restoreSelectedBackup()"
                class="
                  btn-red
                  w-full
                  mt-3
                  flex items-center
                  justify-center
                  gap-2
                  opacity-50
                  cursor-not-allowed
                "
                disabled
              >
                <i
                  data-lucide="database-backup"
                  class="w-4 h-4"
                ></i>

                Restore Backup
              </button>

            </div>

          </div>

        </div>

        <!-- INFO -->
        <div
          class="
            mt-5
            border border-zinc-800
            bg-zinc-950/40
            rounded-xl
            px-4 py-3
            flex items-start
            gap-3
          "
        >

          <i
            data-lucide="info"
            class="
              w-4 h-4
              text-zinc-500
              mt-0.5
              shrink-0
            "
          ></i>

          <p class="text-xs text-zinc-500">
            Restore akan mengganti data BLACK LINE yang
            tersimpan pada browser ini. Sebaiknya export
            backup terlebih dahulu sebelum melakukan restore.
          </p>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings() {
  setActiveMenu("menu-settings");

  if (typeof setPageTitle === "function") {
    setPageTitle("Settings");
  }

  document.getElementById("app").innerHTML = settingsPage();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   SAVE DISCORD SETTINGS
========================================================= */

function saveWebhookSettings() {
  const data = {};

  WEBHOOK_TYPES.forEach((type) => {
    const input = document.getElementById(`webhook-${type.key}`);

    data[type.key] = input ? input.value.trim() : "";
  });

  const success = saveWebhooks(data);

  if (!success) {
    alert("Discord Webhook gagal disimpan.");
    return;
  }

  alert("Discord Webhook berhasil disimpan.");
}

/* =========================================================
   BACKUP FILE
========================================================= */

function handleBackupFileChange(input) {
  const file = input.files && input.files.length > 0 ? input.files[0] : null;

  const fileName = document.getElementById("backupFileName");

  const restoreButton = document.getElementById("restoreBackupButton");

  if (!file) {
    if (fileName) {
      fileName.textContent = "Belum ada file dipilih";
    }

    if (restoreButton) {
      restoreButton.disabled = true;

      restoreButton.classList.add("opacity-50", "cursor-not-allowed");
    }

    return;
  }

  if (fileName) {
    fileName.textContent = file.name;
  }

  if (restoreButton) {
    restoreButton.disabled = false;

    restoreButton.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

/* =========================================================
   RESTORE SELECTED BACKUP
========================================================= */

function restoreSelectedBackup() {
  const input = document.getElementById("backupFile");

  if (!input || !input.files || input.files.length === 0) {
    alert("Pilih file backup terlebih dahulu.");

    return;
  }

  const file = input.files[0];

  importBackupFile(file);
}
