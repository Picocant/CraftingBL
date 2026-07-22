function settingsPage() {
  const webhooks = getWebhooks();

  let html = `
        <div class="card">

            <h2 class="text-2xl font-bold mb-6">
                ⚙️ Discord Settings
            </h2>

            <div class="space-y-5">
    `;

  WEBHOOK_TYPES.forEach((type) => {
    html += `
            <div>

                <label class="block mb-2 font-semibold">

                    ${type.label}

                </label>

                <input
                    id="webhook-${type.key}"
                    type="text"
                    class="input"
                    placeholder="https://discord.com/api/webhooks/..."
                    value="${webhooks[type.key] || ""}">

            </div>
        `;
  });

  html += `

                <button
                    class="btn"
                    onclick="saveWebhookSettings()">

                    💾 Simpan Settings

                </button>

            </div>

        </div>
    `;

  return html;
}

function loadSettings() {
  setActiveMenu("menu-settings");

  document.getElementById("app").innerHTML = settingsPage();
}

function saveWebhookSettings() {
  const data = {};

  WEBHOOK_TYPES.forEach((type) => {
    data[type.key] = document
      .getElementById(`webhook-${type.key}`)
      .value.trim();
  });

  saveWebhooks(data);

  alert("Discord Webhook berhasil disimpan.");
}