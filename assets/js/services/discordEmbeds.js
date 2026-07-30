function buildTransactionEmbed(transaction) {
  const fields = [];

  const formatRupiah = (value) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  // =========================================================
  // INFORMASI PEMESANAN
  // =========================================================

  fields.push({
    name: "👤 Pemesan",
    value: `**${transaction.customer || "-"}**`,
    inline: true,
  });

  fields.push({
    name: "📅 Tanggal Pemesanan",
    value: transaction.orderDate
      ? new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date(transaction.orderDate))
      : "-",
    inline: true,
  });

  // =========================================================
  // DAFTAR PRODUKSI
  // =========================================================

  let items = "Tidak ada item produksi.";

  if (transaction.items && transaction.items.length > 0) {
    items = transaction.items
      .map((item) => {
        return [
          `**${item.name}**`,
          `Jumlah: **${item.qty}x**`,
          `Harga: ${formatRupiah(item.sellPrice)}`,
          `Subtotal: **${formatRupiah(item.subtotal)}**`,
        ].join("\n");
      })
      .join("\n\n");
  }

  fields.push({
    name: "🛠️ Daftar Produksi",
    value: items,
    inline: false,
  });

  // =========================================================
  // METODE PEMBAYARAN
  // =========================================================

  const paymentLabels = {
    dirty: "FULL DIRTY MONEY",
    clean: "FULL CLEAN MONEY",
    hybrid50: "HYBRID 50 / 50",
    hybridCustom: "HYBRID CUSTOM",
  };

  const paymentMethod =
    paymentLabels[transaction.method] ||
    String(transaction.method || "-").toUpperCase();

  fields.push({
    name: "💳 Metode Pembayaran",
    value: `**${paymentMethod}**`,
    inline: false,
  });

  // =========================================================
  // HYBRID CUSTOM
  // =========================================================

  if (transaction.method === "hybridCustom") {
    fields.push({
      name: "📊 Pembagian Pembayaran",
      value:
        `🟥 Cash / Dirty Money: **${transaction.cashPercent}%**\n` +
        `📦 Material: **${transaction.materialPercent}%**`,
      inline: false,
    });
  }

  // =========================================================
  // RINGKASAN PEMBAYARAN
  // =========================================================

  fields.push({
    name: "💰 Total Harga",
    value: `**${formatRupiah(transaction.totalSellPrice)}**`,
    inline: true,
  });

  fields.push({
    name: "🟥 Dirty Money",
    value: `**${formatRupiah(transaction.dirtyMoney)}**`,
    inline: true,
  });

  fields.push({
    name: "⬜ Clean Money",
    value: `**${formatRupiah(transaction.cleanMoney)}**`,
    inline: true,
  });

  // =========================================================
  // MATERIAL
  // =========================================================

  let materials = "Tidak ada material.";

  if (transaction.materials && transaction.materials.length > 0) {
    materials = transaction.materials
      .map((material) => `• **${material.name}** x${material.qty}`)
      .join("\n");
  }

  fields.push({
    name: "📦 Material",
    value: materials,
    inline: false,
  });

  // =========================================================
  // EMBED
  // =========================================================

  return {
    embeds: [
      {
        title: "🛠️ BLACK LINE Crafting System",

        description: "```Crafting Transaction Report```",

        color: 0xdc2626,

        fields,

        footer: {
          text: "BLACK LINE Crafting Calculator",
        },

        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function buildInventoryEmbed(transaction) {
  const isDeposit = transaction.action === "deposit";

  return {
    embeds: [
      {
        title: "📦 BLACK LINE Inventory System",

        description: isDeposit
          ? "```🟢 INVENTORY DEPOSIT```"
          : "```🔴 INVENTORY WITHDRAW```",

        color: isDeposit ? 0x22c55e : 0xef4444,

        fields: [
          {
            name: "📦 ITEM",
            value: `**${transaction.materialName}**`,
            inline: false,
          },
          {
            name: "📊 STOCK",
            value:
              `**Before** : ${transaction.before}\n` +
              `${isDeposit ? "**Deposit**" : "**Withdraw**"} : ${
                isDeposit ? "+" : "-"
              }${transaction.quantity}\n` +
              `**After** : ${transaction.after}`,
            inline: false,
          },
        ],

        footer: {
          text: "BLACK LINE Inventory System",
        },

        timestamp: new Date().toISOString(),
      },
    ],
  };
}
