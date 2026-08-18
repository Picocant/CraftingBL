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

function buildCashflowEmbed(cashflow) {
  const isDeposit = cashflow.type === "income";
  const formattedAmount = `Rp ${Number(cashflow.amount || 0).toLocaleString("id-ID")}`;
  const formattedCleanBalance = `Rp ${Number(cashflow.clean_balance || 0).toLocaleString("id-ID")}`;
  const formattedDirtyBalance = `Rp ${Number(cashflow.dirty_balance || 0).toLocaleString("id-ID")}`;

  return {
    embeds: [
      {
        title: "BLACK LINE Keuangan",
        description: isDeposit ? "```DEPOSIT```" : "```WITHDRAW```",
        color: isDeposit ? 0x22c55e : 0xef4444,
        fields: [
          {
            name: "Arus Uang",
            value: isDeposit ? "Deposit / Uang Masuk" : "WD / Uang Keluar",
            inline: true,
          },
          {
            name: "Jenis Uang",
            value: cashflow.money_type === "clean" ? "Clean" : "Dirty",
            inline: true,
          },
          {
            name: "Jumlah",
            value: `**${formattedAmount}**`,
            inline: true,
          },
          {
            name: "Total Clean",
            value: `**${formattedCleanBalance}**`,
            inline: true,
          },
          {
            name: "Total Dirty",
            value: `**${formattedDirtyBalance}**`,
            inline: true,
          },
          {
            name: "Tanggal",
            value: cashflow.transaction_date || "-",
            inline: true,
          },
          {
            name: "Keterangan",
            value: cashflow.description || "-",
            inline: false,
          },
        ],
        ...(cashflow.photo_url ? { image: { url: cashflow.photo_url } } : {}),
        footer: {
          text: "BLACK LINE ",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function buildContributionEmbed(contribution) {
  const quantity = Number(contribution.quantity) || 0;
  const unitPrice = Number(contribution.unit_price) || 0;
  const totalValue = Number(contribution.total_value) || quantity * unitPrice;
  const contributionDate = contribution.contribution_date
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(new Date(contribution.contribution_date))
    : "-";

  return {
    embeds: [
      {
        title: "📦 BLACK LINE Contribution System",
        description: "```NEW CONTRIBUTION REPORT```",
        color: 0x22c55e,
        fields: [
          {
            name: "👤 Anggota",
            value: `**${contribution.member_name || "-"}**`,
            inline: true,
          },
          {
            name: "📅 Tanggal Setoran",
            value: contributionDate,
            inline: true,
          },
          {
            name: "📦 Jenis",
            value: contribution.type || "-",
            inline: true,
          },
          {
            name: "🧱 Item",
            value: `**${contribution.item_name || "-"}**`,
            inline: false,
          },
          {
            name: "📊 Rincian",
            value:
              `Jumlah: **${quantity.toLocaleString("id-ID")}x**\n` +
              `Harga satuan: **Rp ${unitPrice.toLocaleString("id-ID")}**\n` +
              `Total nilai: **Rp ${totalValue.toLocaleString("id-ID")}**`,
            inline: false,
          },
          {
            name: "📝 Catatan",
            value: contribution.notes?.trim() || "-",
            inline: false,
          },
        ],
        ...(contribution.photo_url
          ? { image: { url: contribution.photo_url } }
          : {}),
        footer: {
          text: "BLACK LINE Contribution System",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/* =========================================================
   ACTIVITY DISCORD EMBED
========================================================= */

/* =========================================================
ACTIVITY DISCORD EMBED
========================================================= */

function buildActivityEmbed(activity, images = []) {
  const attendances = activity.activity_attendances || [];

  const leaderId = Number(activity.leader_id);

  /* =======================================================
  LEADER
  ======================================================= */

  const leaderAttendance = attendances.find(
    (attendance) => Number(attendance.member_id) === leaderId,
  );

  const leaderName =
    leaderAttendance?.member?.name ||
    activity.leader?.name ||
    "Tidak diketahui";

  /* =======================================================
  TANGGAL & JAM
  ======================================================= */

  let formattedDate = "-";

  if (activity.activity_date) {
    const date = new Date(activity.activity_date);

    if (!Number.isNaN(date.getTime())) {
      formattedDate = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(date);
    }
  }

  /* =======================================================
  ANGGOTA HADIR
  ======================================================= */

  let members = "Tidak ada data kehadiran.";

  if (attendances.length > 0) {
    members = attendances
      .map((attendance) => {
        const memberName = attendance.member?.name || "Unknown Member";

        const isLeader = Number(attendance.member_id) === leaderId;

        return isLeader ? `👑 **${memberName}** — Leader` : `• ${memberName}`;
      })
      .join("\n");
  }

  /* =======================================================
  CERITA AKTIVITAS
  ======================================================= */

  const description =
    activity.description?.trim() || "Belum ada laporan aktivitas.";

  /* =======================================================
  JUMLAH FOTO
  ======================================================= */

  const imageCount = Array.isArray(images) ? images.length : 0;

  /* =======================================================
  EMBED UTAMA
  ======================================================= */

  const mainEmbed = {
    title: "📋 BLACK LINE Activity System",

    description: "```ACTIVITY REPORT```",

    color: 0xdc2626,

    fields: [
      {
        name: "📋 Nama Aktivitas",
        value: `**${activity.name || "-"}**`,
        inline: false,
      },

      {
        name: "📅 Tanggal & Jam",
        value: formattedDate,
        inline: true,
      },

      {
        name: "👑 Leader",
        value: `**${leaderName}**`,
        inline: true,
      },

      {
        name: "📝 Cerita Aktivitas",
        value: description.substring(0, 1024),
        inline: false,
      },

      {
        name: `👥 Anggota Hadir (${attendances.length})`,
        value: members.substring(0, 1024),
        inline: false,
      },

      {
        name: "📸 Dokumentasi",
        value:
          imageCount > 0
            ? `**${imageCount} foto**`
            : "Tidak ada foto dokumentasi.",
        inline: false,
      },
    ],

    footer: {
      text: "BLACK LINE Activity System",
    },

    timestamp: new Date().toISOString(),
  };

  /* =======================================================
  FOTO DOKUMENTASI
  ======================================================= */

  const imageEmbeds = Array.isArray(images)
    ? images
        .filter((image) => image?.image_url)
        .map((image, index) => {
          return {
            title: `📸 Dokumentasi ${index + 1}`,

            color: 0xdc2626,

            image: {
              url: image.image_url,
            },

            footer: {
              text: "BLACK LINE Activity System",
            },
          };
        })
    : [];

  /* =======================================================
  RETURN DISCORD PAYLOAD
  ======================================================= */

  return {
    embeds: [mainEmbed, ...imageEmbeds],
  };
}

/* =========================================================
   TASK DISCORD EMBED
   ========================================================= */

function buildTaskEmbed(task) {
  const formatDate = (value) => {
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
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const formatDeadline = (value) => {
    if (!value) {
      return "Tidak ada deadline";
    }

    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "Tidak ada deadline";
    }

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  /* =======================================================
     PIC
     ======================================================= */

  const picLabels = {
    pj_activity: "PJ Activity",
    pj_bendahara: "PJ Bendahara",
    sekretaris: "Sekretaris",
    pj_brankas: "PJ Brankas",
  };

  let picText = "Tidak ada PIC.";

  if (Array.isArray(task.pic_roles) && task.pic_roles.length > 0) {
    picText = task.pic_roles
      .map((role) => {
        return `• **${picLabels[role] || role}**`;
      })
      .join("\n");
  }

  /* =======================================================
     DESKRIPSI
     ======================================================= */

  const description = task.description?.trim() || "Tidak ada deskripsi tugas.";

  /* =======================================================
     EMBED
     
     STATUS SENGAJA TIDAK DIMASUKKAN
     ======================================================= */

  return {
    embeds: [
      {
        title: "📋 BLACK LINE Task System",

        description: "```NEW TASK REPORT```",

        color: 0xdc2626,

        fields: [
          {
            name: "📋 Judul Tugas",
            value: `**${task.title || "-"}**`,
            inline: false,
          },

          {
            name: "👑 Leader",
            value: `**${task.leader_name || "Tidak diketahui"}**`,
            inline: true,
          },

          {
            name: "📅 Deadline",
            value: formatDeadline(task.deadline),
            inline: true,
          },

          {
            name: "📝 Deskripsi",
            value: description.substring(0, 1024),
            inline: false,
          },

          {
            name: "👥 PIC",
            value: picText.substring(0, 1024),
            inline: false,
          },

          {
            name: "🕐 Dibuat",
            value: formatDate(task.created_at || new Date().toISOString()),
            inline: false,
          },
        ],

        footer: {
          text: "BLACK LINE Task System",
        },

        timestamp: new Date().toISOString(),
      },
    ],
  };
}
