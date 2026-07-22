function buildTransactionEmbed(transaction) {
  const fields = [];

  fields.push({
    name: "💳 Payment Method",
    value: `**${transaction.method.toUpperCase()}**`,
    inline: false,
  });

  fields.push({
    name: "💰 Total Price",
    value: `Rp ${transaction.totalSellPrice.toLocaleString("id-ID")}`,
    inline: true,
  });

  fields.push({
    name: "🟥 Dirty Money",
    value: `Rp ${transaction.dirtyMoney.toLocaleString("id-ID")}`,
    inline: true,
  });

  fields.push({
    name: "⬜ Clean Money",
    value: `Rp ${transaction.cleanMoney.toLocaleString("id-ID")}`,
    inline: true,
  });

  let materials = "Tidak ada";

  if (transaction.materials.length > 0) {
    materials = transaction.materials
      .map((material) => `• ${material.name} x${material.qty}`)
      .join("\n");
  }

  fields.push({
    name: "📦 Material",
    value: materials,
  });

  return {
    embeds: [
      {
        title: "🛠 BLACK LINE Crafting System",

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
