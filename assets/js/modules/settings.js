function settingsPage() {
  return `
        <div class="card">

            <h2 class="text-2xl font-bold mb-6">
                ⚙️ Settings
            </h2>

            <div class="space-y-6">

                <div>

                    <label class="block mb-2 font-semibold">

                        Discord Webhook

                    </label>

                    <input
                        id="webhookUrl"
                        type="text"
                        class="input"
                        placeholder="https://discord.com/api/webhooks/..."
                        value="${getWebhook()}">

                    <p class="text-sm text-zinc-500 mt-2">

                        Masukkan URL Discord Webhook.

                    </p>

                </div>

                <button
                    onclick="saveWebhookSetting()"
                    class="btn">

                    💾 Simpan

                </button>

            </div>

        </div>
    `;
}

function loadSettings() {
  setActiveMenu("menu-settings");

  document.getElementById("app").innerHTML = settingsPage();
}

function saveWebhookSetting() {
  const url = document.getElementById("webhookUrl").value.trim();

  saveWebhook(url);

  alert("Webhook berhasil disimpan.");
}
