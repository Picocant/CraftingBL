let supabaseOverviewTransactions = [];

let overviewMaterialCount = 0;
let overviewCraftingCount = 0;

let overviewMembers = [];
let overviewActivities = [];
let overviewContributions = [];

async function fetchOverviewTransactionsFromSupabase() {
  const { data, error } = await supabaseClient
    .from("transactions")
    .select(
      `
      id,
      created_at,
      customer,
      payment_method,
      total_sell_price,
      dirty_money,
      clean_money,
      status,
      transaction_items (
        id,
        crafting_id,
        qty,
        sell_price,
        subtotal,
        craftings (
          id,
          name,
          category
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  const { count: materialCount, error: materialCountError } =
    await supabaseClient.from("materials").select("*", {
      count: "exact",
      head: true,
    });

  if (materialCountError) {
    console.error("Gagal mengambil jumlah material:", materialCountError);

    overviewMaterialCount = 0;
  } else {
    overviewMaterialCount = materialCount || 0;
  }

  const { count: craftingCount, error: craftingCountError } =
    await supabaseClient.from("craftings").select("*", {
      count: "exact",
      head: true,
    });

  if (craftingCountError) {
    console.error("Gagal mengambil jumlah crafting:", craftingCountError);

    overviewCraftingCount = 0;
  } else {
    overviewCraftingCount = craftingCount || 0;
  }

  if (error) {
    console.error("Gagal mengambil data overview:", error);
    supabaseOverviewTransactions = [];
    return;
  }

  // Adapter Supabase -> format yang dipakai Overview lama
  supabaseOverviewTransactions = (data || []).map((transaction) => ({
    id: transaction.id,

    createdAt: transaction.created_at,

    customer: transaction.customer,

    status: transaction.status,

    transaction: {
      method: transaction.payment_method,
      totalSellPrice: Number(transaction.total_sell_price) || 0,
      dirtyMoney: Number(transaction.dirty_money) || 0,
      cleanMoney: Number(transaction.clean_money) || 0,
    },

    items: (transaction.transaction_items || []).map((item) => ({
      craftingId: item.crafting_id,

      name: item.craftings?.name || `Crafting #${item.crafting_id}`,

      category: item.craftings?.category || "",

      qty: Number(item.qty) || 0,

      sellPrice: Number(item.sell_price) || 0,

      subtotal: Number(item.subtotal) || 0,
    })),
  }));

  console.log(
    "Overview transactions loaded from Supabase:",
    supabaseOverviewTransactions,
  );
}

/* =========================================================
   FETCH GROUP OVERVIEW
========================================================= */

async function fetchOverviewGroupData() {
  /* =========================
     MEMBERS
  ========================= */

  const { data: members, error: membersError } = await supabaseClient
    .from("members")
    .select("id, name")
    .order("name", { ascending: true });

  if (membersError) {
    console.error("Gagal mengambil anggota overview:", membersError);

    overviewMembers = [];
  } else {
    overviewMembers = members || [];
  }

  /* =========================
     ACTIVITIES
  ========================= */

  const { data: activities, error: activitiesError } = await supabaseClient
    .from("activities")
    .select(
      `
        id,
        name,
        activity_date,
        leader_id,
        activity_attendances (
          member_id
        )
      `,
    )
    .order("activity_date", { ascending: false });

  if (activitiesError) {
    console.error("Gagal mengambil aktivitas overview:", activitiesError);

    overviewActivities = [];
  } else {
    overviewActivities = activities || [];
  }

  /* =========================
     CONTRIBUTIONS
  ========================= */

  const { data: contributions, error: contributionsError } =
    await supabaseClient
      .from("contributions")
      .select(
        `
        id,
        member_id,
        contribution_date,
        type,
        item_name,
        quantity,
        unit_price,
        total_value
      `,
      )
      .order("contribution_date", { ascending: false });

  if (contributionsError) {
    console.error("Gagal mengambil kontribusi overview:", contributionsError);

    overviewContributions = [];
  } else {
    overviewContributions = contributions || [];
  }

  console.log("Overview group data:", {
    members: overviewMembers,
    activities: overviewActivities,
    contributions: overviewContributions,
  });
}

/* =========================================================
   HERO
========================================================= */

function overviewHero(processing, completed, totalTransactions, progress) {
  return `
    <div class="relative overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/80 px-7 py-6">

      <!-- Background Decoration -->
      <div class="absolute -top-32 right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative grid xl:grid-cols-[1fr_360px] gap-8 items-center">

        <!-- LEFT -->
        <div>

          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">

            <i data-lucide="shield" class="w-3.5 h-3.5"></i>

            BLACK LINE

          </div>

          <h1 class="text-2xl xl:text-3xl font-black mt-4 tracking-tight">
            Crafting Calculator Dashboard
          </h1>

          <p class="text-zinc-400 text-sm mt-2 max-w-2xl leading-6">

            Selamat datang kembali. Saat ini terdapat

            <span class="text-yellow-400 font-semibold">
              ${processing} transaksi
            </span>

            yang masih Menunggu dan

            <span class="text-green-400 font-semibold">
              ${completed} transaksi
            </span>

            telah selesai.

          </p>

          <!-- ACTION -->
          <div class="flex flex-wrap gap-3 mt-5">

            <button
              onclick="loadPlanner()"
              class="btn-red flex items-center gap-2"
            >

              <i data-lucide="plus" class="w-4 h-4"></i>

              Buat Planner

            </button>

            <button
              onclick="loadTransactions()"
              class="btn flex items-center gap-2"
            >

              <i data-lucide="history" class="w-4 h-4"></i>

              Riwayat

            </button>

          </div>

        </div>

        <!-- RIGHT -->
        <div class="grid grid-cols-2 gap-3">

          ${heroMiniCard(
            "boxes",
            "Material",
            overviewMaterialCount,
            "text-red-400",
          )}

          ${heroMiniCard(
            "hammer",
            "Crafting",
            overviewCraftingCount,
            "text-blue-400",
          )}

          ${heroMiniCard(
            "receipt-text",
            "Transaksi",
            totalTransactions,
            "text-yellow-400",
          )}

          ${heroMiniCard(
            "chart-no-axes-column",
            "Progress",
            `${progress}%`,
            "text-green-400",
          )}

        </div>

      </div>

    </div>
  `;
}

function heroMiniCard(icon, title, value, color = "text-white") {
  return `
    <div class="group bg-black/20 hover:bg-black/30 border border-zinc-800 hover:border-red-900/60 rounded-2xl p-4 transition-all">

      <div class="flex items-center justify-between">

        <span class="text-[11px] uppercase tracking-widest text-zinc-500">
          ${title}
        </span>

        <div class="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center">

          <i
            data-lucide="${icon}"
            class="w-4 h-4 ${color}"
          ></i>

        </div>

      </div>

      <div class="text-2xl font-black mt-2 ${color}">
        ${value}
      </div>

    </div>
  `;
}

/* =========================================================
   OVERVIEW PAGE
========================================================= */

function overviewPage() {
  const transactions = supabaseOverviewTransactions;

  const now = new Date();

  /* =====================================================
   GROUP SUMMARY
===================================================== */

  const totalMembers = overviewMembers.length;

  const totalActivities = overviewActivities.length;

  const totalContributions = overviewContributions.length;

  const totalAttendances = overviewActivities.reduce((total, activity) => {
    return total + (activity.activity_attendances?.length || 0);
  }, 0);

  const totalContributionValue = overviewContributions.reduce(
    (total, contribution) => {
      const quantity = Number(contribution.quantity) || 0;
      const unitPrice = Number(contribution.unit_price) || 0;

      const value = Number(contribution.total_value) || quantity * unitPrice;

      return total + value;
    },
    0,
  );

  const totalTransactions = transactions.length;

  const totalRevenue = transactions.reduce((total, item) => {
    return total + (Number(item.transaction?.totalSellPrice) || 0);
  }, 0);

  /* =====================================================
     BULAN INI
  ===================================================== */

  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.createdAt);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const monthlyRevenue = transactions
    .filter((transaction) => {
      const date = new Date(transaction.createdAt);
      const now = new Date();

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((total, transaction) => {
      return total + (Number(transaction.transaction?.totalSellPrice) || 0);
    }, 0);
  /* =====================================================
     STATUS
  ===================================================== */

  const processing = transactions.filter(
    (transaction) => transaction.status === "Menunggu",
  ).length;

  const completed = transactions.filter(
    (transaction) => transaction.status === "Selesai",
  ).length;

  /* =====================================================
     TRANSAKSI TERBARU
  ===================================================== */

  const latestTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  /* =====================================================
   TOP CUSTOMER
===================================================== */

  const customerStats = {};

  transactions.forEach((transaction) => {
    const name = transaction.customer || "Tanpa Nama";

    if (!customerStats[name]) {
      customerStats[name] = {
        transactions: 0,
        revenue: 0,
      };
    }

    customerStats[name].transactions += 1;

    customerStats[name].revenue +=
      Number(transaction.transaction?.totalSellPrice) || 0;
  });

  const topCustomers = Object.entries(customerStats)
    .map(([name, stats]) => ({
      name,
      transactions: stats.transactions,
      revenue: stats.revenue,
    }))
    .sort((a, b) => {
      if (b.transactions !== a.transactions) {
        return b.transactions - a.transactions;
      }

      return b.revenue - a.revenue;
    })
    .slice(0, 5);

  /* =====================================================
   TOP CRAFTING
===================================================== */

  const craftingStats = {};

  transactions.forEach((transaction) => {
    (transaction.items || []).forEach((item) => {
      const name = item.name || "Unknown Crafting";
      const qty = Number(item.qty) || 0;
      const subtotal = Number(item.subtotal) || 0;

      if (!craftingStats[name]) {
        craftingStats[name] = {
          qty: 0,
          revenue: 0,
        };
      }

      craftingStats[name].qty += qty;
      craftingStats[name].revenue += subtotal;
    });
  });

  const topCraftings = Object.entries(craftingStats)
    .map(([name, stats]) => ({
      name,
      qty: stats.qty,
      revenue: stats.revenue,
    }))
    .sort((a, b) => {
      if (b.qty !== a.qty) {
        return b.qty - a.qty;
      }

      return b.revenue - a.revenue;
    })
    .slice(0, 5);
  /* =====================================================
     PROGRESS
  ===================================================== */

  const progress =
    totalTransactions === 0
      ? 0
      : Math.round((completed / totalTransactions) * 100);

  /* =====================================================
     HTML
  ===================================================== */

  return `
    <div class="space-y-8">

      <!-- HERO -->
      ${overviewHero(processing, completed, totalTransactions, progress)}

      <!-- DASHBOARD HEADER -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">

  <!-- LEFT -->
  <div class="flex items-center gap-4">

    <div class="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">

      <i
        data-lucide="layout-dashboard"
        class="w-5 h-5 text-red-500"
      ></i>

    </div>

    <div>

      <h2 class="text-xl font-bold">
        Dashboard Overview
      </h2>

      <p class="text-sm text-zinc-500 mt-1">
        Ringkasan aktivitas crafting hari ini.
      </p>

    </div>

  </div>

  <!-- RIGHT -->
  <div class="flex items-center gap-3">

    <!-- DATE -->
    <div class="hidden lg:flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800">

      <i
        data-lucide="calendar-days"
        class="w-4 h-4 text-zinc-500"
      ></i>

      <div>

        <div class="text-[10px] uppercase tracking-widest text-zinc-600">
          Tanggal
        </div>

        <div class="text-sm font-semibold mt-0.5">

          ${now.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}

        </div>

      </div>

    </div>

    <!-- TIME -->
    <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800">

      <i
        data-lucide="clock-3"
        class="w-4 h-4 text-red-500"
      ></i>

      <div>

        <div class="text-[10px] uppercase tracking-widest text-zinc-600">
          Waktu
        </div>

        <div class="text-sm font-bold mt-0.5">

          ${now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}

        </div>

      </div>

    </div>

  </div>

</div>

      <!-- STAT CARDS -->
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                ${statCard(
                  "receipt-text",
                  "Total Transaksi",
                  totalTransactions,
                  "text-red-500",
                )}

                ${statCard(
                  "banknote",
                  "Total Omzet",
                  `Rp ${totalRevenue.toLocaleString("id-ID")}`,
                  "text-green-500",
                )}

                ${statCard("clock-3", "Menunggu", processing, "text-yellow-500")}

                ${statCard("badge-check", "Selesai", completed, "text-green-500")}

            </div>

            <!-- MONTHLY PERFORMANCE -->
<div
  class="
    rounded-2xl
    border border-zinc-800
    bg-zinc-900
    p-5
  "
>
  <div
    class="
      flex flex-col
      lg:flex-row
      lg:items-center
      justify-between
      gap-5
    "
  >

    <div class="flex items-center gap-3">

      <div
        class="
          w-10 h-10
          rounded-xl
          bg-blue-500/10
          border border-blue-500/20
          flex items-center
          justify-center
        "
      >
        <i
          data-lucide="calendar-range"
          class="w-5 h-5 text-blue-400"
        ></i>
      </div>

      <div>
        <div class="font-bold">
          Performa Bulan Ini
        </div>

        <div class="text-xs text-zinc-500 mt-1">
          Ringkasan transaksi bulan berjalan.
        </div>
      </div>

    </div>


    <div
      class="
        grid grid-cols-2
        gap-8
        lg:min-w-[420px]
      "
    >

      <div>
        <div
          class="
            text-[10px]
            uppercase
            tracking-widest
            text-zinc-500
          "
        >
          Transaksi Bulan Ini
        </div>

        <div class="text-xl font-black mt-2">
          ${monthlyTransactions}
        </div>
      </div>


      <div>
        <div
          class="
            text-[10px]
            uppercase
            tracking-widest
            text-zinc-500
          "
        >
          Omzet Bulan Ini
        </div>

        <div
          class="
            text-xl
            font-black
            text-green-400
            mt-2
          "
        >
          Rp ${monthlyRevenue.toLocaleString("id-ID")}
        </div>
      </div>

    </div>

  </div>
</div>
            

        <!-- GROUP SUMMARY -->
        <div class="space-y-4">

          <div class="flex items-center justify-between gap-4">

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
                  data-lucide="users-round"
                  class="w-5 h-5 text-red-400"
                ></i>
              </div>

              <div>
                <h2 class="text-lg font-bold">
                  Ringkasan Kelompok
                </h2>

                <p class="text-xs text-zinc-500 mt-1">
                  Statistik anggota, aktivitas, dan kontribusi BLACK LINE.
                </p>
              </div>

            </div>

          </div>


          <div
            class="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-5
              gap-4
            "
          >

            ${statCard("users", "Total Anggota", totalMembers, "text-blue-400")}

            ${statCard(
              "calendar-check-2",
              "Total Aktivitas",
              totalActivities,
              "text-yellow-400",
            )}

            ${statCard(
              "user-check",
              "Total Kehadiran",
              totalAttendances,
              "text-purple-400",
            )}

            ${statCard(
              "package-plus",
              "Total Setoran",
              totalContributions,
              "text-orange-400",
            )}

            ${statCard(
              "banknote",
              "Nilai Setoran",
              `Rp ${totalContributionValue.toLocaleString("id-ID")}`,
              "text-green-400",
            )}

          </div>

        </div>            

      <!-- MAIN GRID -->
      <div class="grid xl:grid-cols-12 gap-6 items-start">

        <!-- LEFT -->
        <div class="xl:col-span-8 space-y-6">

          <!-- AKTIVITAS TERBARU -->
          <div class="card">

            <div class="flex items-center justify-between mb-6">

              <h2 class="text-xl font-bold flex items-center gap-3">

                <i
                  data-lucide="history"
                  class="w-5 h-5 text-red-500"
                ></i>

                Aktivitas Terbaru

              </h2>

              ${
                transactions.length > 5
                  ? `
                    <button
                      onclick="loadTransactions()"
                      class="text-sm text-red-400 hover:text-red-300"
                    >
                      Lihat Semua
                    </button>
                  `
                  : ""
              }

            </div>

            ${
              latestTransactions.length === 0
                ? emptyTransactionState()
                : latestTransactions
                    .map((item) => transactionActivityItem(item))
                    .join("")
            }

          </div>

        </div>

        <!-- RIGHT -->
        <div class="xl:col-span-4 space-y-6">

          ${topCustomerCard(topCustomers)}

          ${topCraftingCard(topCraftings)}

          ${progressCard(progress, completed, processing, totalTransactions)}

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   STAT CARD
========================================================= */

function statCard(icon, title, value, color = "text-red-500") {
  return `
    <div
      class="
        group
        relative
        overflow-hidden
        rounded-2xl
        border border-zinc-800
        bg-zinc-900
        px-5 py-4
        transition-all duration-300
        hover:border-zinc-700
        hover:bg-zinc-900/80
      "
    >

      <!-- ACCENT -->
      <div
        class="
          absolute
          left-0 top-4 bottom-4
          w-[3px]
          rounded-r-full
          ${color} opacity-0 group-hover:opacity-100 transition-opacity
        "
      ></div>

      <div class="flex items-center justify-between gap-4">

        <!-- INFO -->
        <div>

          <p
            class="
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-zinc-500
            "
          >
            ${title}
          </p>

          <h2
            class="
              mt-2
              text-3xl
              font-black
              tracking-tight
              text-white
            "
          >
            ${value}
          </h2>

        </div>

        <!-- ICON -->
        <div
          class="
            flex
            h-12 w-12
            shrink-0
            items-center justify-center
            rounded-xl
            border border-zinc-700/70
            bg-zinc-800/70
            transition-all duration-300
            group-hover:scale-105
          "
        >

          <i
            data-lucide="${icon}"
            class="h-5 w-5 ${color}"
          ></i>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   TOP CUSTOMER
========================================================= */

function topCustomerCard(topCustomers) {
  return `
    <div class="card">

      <h2 class="text-lg font-bold flex items-center gap-3 mb-6">

        <i
          data-lucide="crown"
          class="w-5 h-5 text-yellow-400"
        ></i>

        Top Customer

      </h2>

      ${
        topCustomers.length === 0
          ? `
            <div class="text-zinc-500 text-sm py-4">
              Belum ada data customer.
            </div>
          `
          : `
            <div class="space-y-3">

              ${topCustomers
                .map(
                  (customer, index) => `
                    <div
                      class="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-zinc-800
                        last:border-none
                        pb-3
                        last:pb-0
                      "
                    >

                      <!-- LEFT -->
                      <div class="flex items-center gap-3 min-w-0">

                        <!-- RANK -->
                        <div
                          class="
                            w-9 h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            font-bold
                            shrink-0
                            ${
                              index === 0
                                ? "bg-yellow-500/10 text-yellow-400"
                                : index === 1
                                  ? "bg-zinc-500/10 text-zinc-300"
                                  : index === 2
                                    ? "bg-orange-500/10 text-orange-400"
                                    : "bg-red-500/10 text-red-400"
                            }
                          "
                        >
                          ${index + 1}
                        </div>

                        <!-- CUSTOMER INFO -->
                        <div class="min-w-0">

                          <div class="font-semibold truncate">
                            ${customer.name}
                          </div>

                          <div
                            class="
                              flex
                              flex-wrap
                              items-center
                              gap-x-3
                              gap-y-1
                              mt-1
                            "
                          >

                            <span class="text-xs text-zinc-500">
                              ${customer.transactions} Transaksi
                            </span>

                            <span class="text-xs text-green-400 font-semibold">
                              Rp ${customer.revenue.toLocaleString("id-ID")}
                            </span>

                          </div>

                        </div>

                      </div>

                      <!-- TOTAL TRANSACTIONS -->
                      <div class="text-right shrink-0">

                        <div
                          class="
                            text-lg
                            font-black
                            text-zinc-200
                          "
                        >
                          ${customer.transactions}x
                        </div>

                        <div
                          class="
                            text-[10px]
                            uppercase
                            tracking-widest
                            text-zinc-600
                            mt-1
                          "
                        >
                          Order
                        </div>

                      </div>

                    </div>
                  `,
                )
                .join("")}

            </div>
          `
      }

    </div>
  `;
}

/* =========================================================
   TOP CRAFTING
========================================================= */

function topCraftingCard(topCraftings) {
  return `
    <div class="card">

      <h2 class="text-lg font-bold flex items-center gap-3 mb-6">

        <i
          data-lucide="hammer"
          class="w-5 h-5 text-red-400"
        ></i>

        Top Crafting

      </h2>

      ${
        topCraftings.length === 0
          ? `
            <div class="text-zinc-500 text-sm py-4">
              Belum ada crafting.
            </div>
          `
          : `
            <div class="space-y-3">

              ${topCraftings
                .map(
                  (crafting, index) => `
                    <div
                      class="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-zinc-800
                        last:border-none
                        pb-3
                        last:pb-0
                      "
                    >

                      <!-- LEFT -->
                      <div class="flex items-center gap-3 min-w-0">

                        <!-- RANK -->
                        <div
                          class="
                            w-9 h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            font-bold
                            shrink-0
                            ${
                              index === 0
                                ? "bg-yellow-500/10 text-yellow-400"
                                : index === 1
                                  ? "bg-zinc-500/10 text-zinc-300"
                                  : index === 2
                                    ? "bg-orange-500/10 text-orange-400"
                                    : "bg-red-500/10 text-red-400"
                            }
                          "
                        >
                          ${index + 1}
                        </div>

                        <!-- CRAFTING INFO -->
                        <div class="min-w-0">

                          <div class="font-semibold truncate">
                            ${crafting.name}
                          </div>

                          <div
                            class="
                              flex
                              flex-wrap
                              items-center
                              gap-x-3
                              gap-y-1
                              mt-1
                            "
                          >

                            <span class="text-xs text-zinc-500">
                              ${crafting.qty} Terjual
                            </span>

                            <span class="text-xs text-green-400 font-semibold">
                              Rp ${crafting.revenue.toLocaleString("id-ID")}
                            </span>

                          </div>

                        </div>

                      </div>

                      <!-- TOTAL QTY -->
                      <div class="text-right shrink-0">

                        <div
                          class="
                            text-lg
                            font-black
                            text-red-400
                          "
                        >
                          ${crafting.qty}x
                        </div>

                        <div
                          class="
                            text-[10px]
                            uppercase
                            tracking-widest
                            text-zinc-600
                            mt-1
                          "
                        >
                          Item
                        </div>

                      </div>

                    </div>
                  `,
                )
                .join("")}

            </div>
          `
      }

    </div>
  `;
}

/* =========================================================
   PROGRESS
========================================================= */

function progressCard(progress, completed, processing, totalTransactions) {
  return `
    <div class="card">

      <h2 class="text-lg font-bold flex items-center gap-3 mb-6">

        <i
          data-lucide="chart-no-axes-column"
          class="w-5 h-5 text-green-400"
        ></i>

        Progress Transaksi

      </h2>

      <div class="flex items-end justify-between">

        <div>

          <div class="text-sm text-zinc-500">
            Penyelesaian
          </div>

          <div class="text-3xl font-black mt-1">
            ${progress}%
          </div>

        </div>

        <div class="text-right">

          <div class="text-green-400 font-semibold">
            ${completed} selesai
          </div>

          <div class="text-yellow-400 text-sm mt-1">
            ${processing} menunggu
          </div>

        </div>

      </div>

      <div class="w-full bg-zinc-800 rounded-full h-3 overflow-hidden mt-6">

        <div
          class="bg-green-500 h-full rounded-full transition-all duration-700"
          style="width: ${progress}%"
        ></div>

      </div>

      <div class="mt-4 text-sm text-zinc-500">
        ${completed} dari ${totalTransactions} transaksi telah selesai.
      </div>

    </div>
  `;
}

/* =========================================================
   ACTIVITY ITEM
========================================================= */

function transactionActivityItem(item) {
  const transaction = item.transaction || {};

  const totalSellPrice = Number(transaction.totalSellPrice) || 0;

  const isCompleted = item.status === "Selesai";

  const createdAt = new Date(item.createdAt);

  const formattedDate = Number.isNaN(createdAt.getTime())
    ? "-"
    : createdAt.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  const formattedTime = Number.isNaN(createdAt.getTime())
    ? "-"
    : createdAt.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

  return `
    <div
      class="
        group
        border-b border-zinc-800
        last:border-b-0
        py-5
        first:pt-0
        last:pb-0
      "
    >

      <div
        class="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          justify-between
          gap-5
        "
      >

        <!-- LEFT -->
        <div class="flex items-start gap-4 min-w-0 flex-1">

          <!-- CUSTOMER ICON -->
          <div
            class="
              w-10 h-10
              rounded-xl
              bg-red-500/10
              border border-red-500/20
              flex
              items-center
              justify-center
              shrink-0
            "
          >

            <i
              data-lucide="user-round"
              class="w-5 h-5 text-red-400"
            ></i>

          </div>

          <!-- INFORMATION -->
          <div class="min-w-0 flex-1">

            <!-- CUSTOMER -->
            <div class="flex flex-wrap items-center gap-3">

              <h3
                class="
                  font-bold
                  text-zinc-100
                  truncate
                "
              >
                ${item.customer || "Tanpa Nama"}
              </h3>

              ${
                isCompleted
                  ? `
                    <span
                      class="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5 py-1
                        rounded-full
                        text-[11px]
                        font-semibold
                        bg-green-500/10
                        border border-green-500/20
                        text-green-400
                      "
                    >

                      <i
                        data-lucide="check"
                        class="w-3 h-3"
                      ></i>

                      Selesai

                    </span>
                  `
                  : `
                    <span
                      class="
                        inline-flex
                        items-center
                        gap-1.5
                        px-2.5 py-1
                        rounded-full
                        text-[11px]
                        font-semibold
                        bg-yellow-500/10
                        border border-yellow-500/20
                        text-yellow-400
                      "
                    >

                      <i
                        data-lucide="clock-3"
                        class="w-3 h-3"
                      ></i>

                      Proses

                    </span>
                  `
              }

            </div>

            <!-- CRAFTING -->
            <div
              class="
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
                mt-2
              "
            >

              ${
                item.items && item.items.length
                  ? item.items
                      .map(
                        (crafting) => `
                          <div
                            class="
                              inline-flex
                              items-center
                              gap-1.5
                              text-sm
                              text-zinc-400
                            "
                          >

                            <i
                              data-lucide="hammer"
                              class="w-3.5 h-3.5 text-zinc-600"
                            ></i>

                            <span>
                              ${crafting.name}
                            </span>

                            <span class="text-zinc-600">
                              ×${crafting.qty}
                            </span>

                          </div>
                        `,
                      )
                      .join("")
                  : `
                    <span class="text-sm text-zinc-600">
                      Tidak ada crafting
                    </span>
                  `
              }

            </div>

            <!-- DATE -->
            <div
              class="
                flex
                flex-wrap
                items-center
                gap-2
                mt-3
                text-xs
                text-zinc-600
              "
            >

              <i
                data-lucide="calendar-days"
                class="w-3.5 h-3.5"
              ></i>

              <span>
                ${formattedDate}
              </span>

              <span>
                •
              </span>

              <i
                data-lucide="clock"
                class="w-3.5 h-3.5"
              ></i>

              <span>
                ${formattedTime}
              </span>

            </div>

          </div>

        </div>

        <!-- RIGHT -->
        <div
          class="
            lg:text-right
            lg:min-w-[180px]
            lg:pl-6
          "
        >

          <div
            class="
              text-[10px]
              uppercase
              tracking-[0.16em]
              text-zinc-600
            "
          >
            Total
          </div>

          <div
            class="
              text-xl
              font-black
              text-green-400
              mt-1
            "
          >
            Rp ${totalSellPrice.toLocaleString("id-ID")}
          </div>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   EMPTY STATE
========================================================= */

function emptyTransactionState() {
  return `
    <div class="h-[150px] flex flex-col items-center justify-center text-center">

      <div class="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">

        <i
          data-lucide="inbox"
          class="w-6 h-6 text-zinc-500"
        ></i>

      </div>

      <div class="font-semibold mt-4">
        Belum ada transaksi
      </div>

      <div class="text-xs text-zinc-500 mt-2">
        Transaksi terbaru akan tampil di sini.
      </div>

    </div>
  `;
}

/* =========================================================
   LOAD OVERVIEW
========================================================= */

async function loadOverview() {
  setActiveMenu("menu-overview");

  setPageTitle("Overview");

  // Loading sementara
  document.getElementById("app").innerHTML = `
    <div class="card">
      <div class="text-center text-zinc-500 py-10">
        Memuat overview...
      </div>
    </div>
  `;

  // Ambil transaksi terbaru dari Supabase
  await fetchOverviewTransactionsFromSupabase();

  // Ambil data kelompok
  await fetchOverviewGroupData();

  // Render dashboard setelah data selesai
  document.getElementById("app").innerHTML = overviewPage();

  lucide.createIcons();
}
