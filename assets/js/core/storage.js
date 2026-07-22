const STORAGE_KEY = "mafia_materials";

function getMaterials() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveMaterials(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const CRAFTING_KEY = "mafia_craftings";

function getCraftings() {
  return JSON.parse(localStorage.getItem(CRAFTING_KEY)) || [];
}

function saveCraftings(data) {
  localStorage.setItem(CRAFTING_KEY, JSON.stringify(data));
}

function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

function saveTransactions(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function getWebhooks() {
  const defaults = {};

  WEBHOOK_TYPES.forEach((type) => {
    defaults[type.key] = "";
  });

  const saved = JSON.parse(localStorage.getItem("discordWebhooks"));

  return {
    ...defaults,
    ...(saved || {}),
  };
}

function saveWebhooks(data) {
  localStorage.setItem("discordWebhooks", JSON.stringify(data));
}
