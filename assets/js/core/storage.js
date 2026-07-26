/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE_KEY = "mafia_materials";
const CRAFTING_KEY = "mafia_craftings";
const TRANSACTION_KEY = "transactions";


/* =========================================================
   SAFE STORAGE
========================================================= */

function safeGetStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);

    if (raw === null) {
      return defaultValue;
    }

    return JSON.parse(raw);
  } catch (error) {
    console.warn(`[BLACK LINE] Gagal membaca localStorage "${key}".`, error);

    return defaultValue;
  }
}

function safeSaveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));

    return true;
  } catch (error) {
    console.error(`[BLACK LINE] Gagal menyimpan localStorage "${key}".`, error);

    return false;
  }
}

/* =========================================================
   MATERIALS
========================================================= */

function getMaterials() {
  const data = safeGetStorage(STORAGE_KEY, []);

  return Array.isArray(data) ? data : [];
}

function saveMaterials(data) {
  return safeSaveStorage(STORAGE_KEY, Array.isArray(data) ? data : []);
}

/* =========================================================
   CRAFTINGS
========================================================= */

function getCraftings() {
  const data = safeGetStorage(CRAFTING_KEY, []);

  return Array.isArray(data) ? data : [];
}

function saveCraftings(data) {
  return safeSaveStorage(CRAFTING_KEY, Array.isArray(data) ? data : []);
}

/* =========================================================
   TRANSACTIONS
========================================================= */

function getTransactions() {
  const data = safeGetStorage(TRANSACTION_KEY, []);

  return Array.isArray(data) ? data : [];
}

function saveTransactions(transactions) {
  return safeSaveStorage(
    TRANSACTION_KEY,
    Array.isArray(transactions) ? transactions : [],
  );
}


/* =========================================================
   BACKUP
========================================================= */

function createBackupData() {
  return {
    app: "BLACK LINE",
    version: "1.0.0",
    exportedAt: new Date().toISOString(),

    data: {
      materials: getMaterials(),
      craftings: getCraftings(),
      transactions: getTransactions(),
    },
  };
}

function exportBackup() {
  try {
    const backup = createBackupData();

    const json = JSON.stringify(backup, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    const now = new Date();

    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    link.href = url;

    link.download = `black-line-backup-${date}.json`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(
      "[BLACK LINE] Gagal membuat backup.",
      error,
    );

    alert("Backup gagal dibuat.");
  }
}

/* =========================================================
   RESTORE
========================================================= */

function importBackupFile(file) {
  if (!file) {
    alert("Pilih file backup terlebih dahulu.");
    return;
  }

  if (!file.name.toLowerCase().endsWith(".json")) {
    alert("File backup harus berformat JSON.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const backup = JSON.parse(event.target.result);

      if (
        !backup ||
        backup.app !== "BLACK LINE" ||
        !backup.data
      ) {
        throw new Error(
          "Format backup BLACK LINE tidak valid.",
        );
      }

      const materials = backup.data.materials;
      const craftings = backup.data.craftings;
      const transactions = backup.data.transactions;

      if (
        !Array.isArray(materials) ||
        !Array.isArray(craftings) ||
        !Array.isArray(transactions)
      ) {
        throw new Error(
          "Struktur data backup tidak valid.",
        );
      }

      const confirmed = confirm(
        "Import backup akan mengganti data BLACK LINE saat ini.\n\nLanjutkan restore?",
      );

      if (!confirmed) {
        return;
      }

      const materialSaved =
        saveMaterials(materials);

      const craftingSaved =
        saveCraftings(craftings);

      const transactionSaved =
        saveTransactions(transactions);

      if (
        !materialSaved ||
        !craftingSaved ||
        !transactionSaved
      ) {
        throw new Error(
          "Sebagian data gagal disimpan.",
        );
      }

      alert(
        "Backup berhasil direstore.",
      );

      location.reload();
    } catch (error) {
      console.error(
        "[BLACK LINE] Restore gagal.",
        error,
      );

      alert(
        "File backup tidak valid atau rusak.",
      );
    }
  };

  reader.onerror = function () {
    alert("File backup gagal dibaca.");
  };

  reader.readAsText(file);
}