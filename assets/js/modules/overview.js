function overviewPage() {
  const transactions = getTransactions();

  const now = new Date();

  const totalTransactions = transactions.length;

  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.createdAt);

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const processing = transactions.filter(
    (transaction) => transaction.status === "Proses",
  ).length;

  const completed = transactions.filter(
    (transaction) => transaction.status === "Selesai",
  ).length;

  const latestTransactions = transactions
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // =========================
  // TOP CUSTOMER
  // =========================

  const customerStats = {};

  transactions.forEach((t) => {
    const name = t.customer || "Tanpa Nama";

    customerStats[name] = (customerStats[name] || 0) + 1;
  });

  const topCustomers = Object.entries(customerStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // =========================
  // TOP CRAFTING
  // =========================

  const craftingStats = {};

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      craftingStats[item.name] = (craftingStats[item.name] || 0) + item.qty;
    });
  });

  const topCraftings = Object.entries(craftingStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // =========================
  // PROGRESS
  // =========================

  const progress =
    totalTransactions === 0
      ? 0
      : Math.round((completed / totalTransactions) * 100);

  return `

<div class="space-y-8">
<div class="relative overflow-hidden rounded-3xl border border-red-900/40 bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950 px-8 py-6">

    <div class="absolute -top-20 -right-20 w-72 h-72 bg-red-600/10 rounded-full blur-3xl"></div>

    <div class="relative flex flex-col xl:flex-row justify-between xl:items-center gap-8">

        <div>

            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm">

                <i data-lucide="shield"></i>

                BLACK LINE

            </div>

            <h1 class="text-4xl font-black mt-5">

                Crafting Calculator Dashboard

            </h1>

            <p class="text-zinc-400 mt-4 max-w-2xl leading-7">

                Selamat datang kembali.

                Saat ini terdapat

                <span class="text-red-400 font-bold">

                    ${processing}

                </span>

                transaksi yang masih diproses dan

                <span class="text-green-400 font-bold">

                    ${completed}

                </span>

                transaksi telah selesai.

            </p>

            <div class="flex gap-3 mt-8">

                <button
                    onclick="loadPlanner()"
                    class="btn-red flex items-center gap-2">

                    <i data-lucide="plus"></i>

                    Buat Planner

                </button>

                <button
                    onclick="loadTransactions()"
                    class="btn flex items-center gap-2">

                    <i data-lucide="history"></i>

                    Riwayat

                </button>

            </div>

        </div>

        <div class="grid grid-cols-2 gap-4 min-w-[320px]">

            <div class="bg-black/20 rounded-2xl p-5 border border-zinc-800">

                <div class="text-zinc-500 text-sm">

                    Material

                </div>

                <div class="text-3xl font-black mt-2">

                    ${getMaterials().length}

                </div>

            </div>

            <div class="bg-black/20 rounded-2xl p-5 border border-zinc-800">

                <div class="text-zinc-500 text-sm">

                    Crafting

                </div>

                <div class="text-3xl font-black mt-2">

                    ${getCraftings().length}

                </div>

            </div>

            <div class="bg-black/20 rounded-2xl p-5 border border-zinc-800">

                <div class="text-zinc-500 text-sm">

                    Transaksi

                </div>

                <div class="text-3xl font-black mt-2">

                    ${totalTransactions}

                </div>

            </div>

            <div class="bg-black/20 rounded-2xl p-5 border border-zinc-800">

                <div class="text-zinc-500 text-sm">

                    Progress

                </div>

                <div class="text-3xl font-black text-green-400 mt-2">

                    ${progress}%

                </div>

            </div>

        </div>

    </div>

</div>
    <div>

        <div class="flex items-center justify-between">

                <div>

                    <h1 class="text-3xl font-bold">

                        Dashboard

                    </h1>

                    <p class="text-zinc-400 mt-2">

                        Ringkasan aktivitas crafting hari ini.

                    </p>

                </div>

            <div class="text-right">

                <div class="text-sm text-zinc-500">

                    ${new Date().toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}

                </div>

                <div class="text-lg font-semibold mt-1">

                        ${new Date().toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}

                </div>

            </div>

        </div>

    </div>

    <div class="grid grid-cols-2 xl:grid-cols-4 gap-5 mt-8">

        ${statCard("receipt-text", "Total Transaksi", totalTransactions, "text-red-500")}

        ${statCard("calendar-days", "Bulan Ini", monthlyTransactions, "text-blue-500")}

        ${statCard("clock-3", "Diproses", processing, "text-yellow-500")}

        ${statCard("badge-check", "Selesai", completed, "text-green-500")}

    </div>

    <div class="grid xl:grid-cols-12 gap-6">

        <div class="xl:col-span-8 space-y-6">

        <div class="card">

            <div class="flex items-center justify-between mb-6">

                <h2 class="text-xl font-bold flex items-center gap-3">

                    <i data-lucide="chart-column" class="text-red-500"></i>

                    Statistik Transaksi

                </h2>

            </div>

            <canvas id="overviewChart" height="110"></canvas>

        </div>

            <div class="card">

                <div class="flex items-center justify-between mb-6">

                    <h2 class="text-2xl font-bold flex items-center gap-3">

                        <i data-lucide="history" class="w-6 h-6 text-red-500"></i>

                        Aktivitas Terbaru

                    </h2>

                </div>

                ${
                  latestTransactions.length === 0
                    ? `
                            <div class="text-center py-16 text-zinc-500">

                                <i data-lucide="inbox" class="w-12 h-12 mx-auto space-y-4"></i>

                                Belum ada transaksi.

                            </div>
                        `
                    : latestTransactions
                        .map(
                          (item) => `
                        
                        <div class="group border border-zinc-800 rounded-2xl p-5 hover:border-red-500 hover:bg-zinc-900 transition-all duration-300">
                            <div class="flex justify-between gap-6">

                                <div class="flex-1">

                                    <div class="font-semibold text-red-400 flex items-center gap-2">

                                        <i data-lucide="user-round" class="w-4 h-4"></i>

                                        ${item.customer || "Tanpa Nama"}

                                    </div>

                                    <div class="space-y-2 mt-4">

                                        ${
                                          item.items && item.items.length
                                            ? item.items
                                                .map(
                                                  (c) => `
                                                    <div class="text-sm flex items-center text-zinc-300">

                                                        <i data-lucide="hammer" class="w-4 h-4 mr-2 text-zinc-500"></i>

                                                        ${c.name}

                                                        <span class="ml-2 text-zinc-500">

                                                            ×${c.qty}

                                                        </span>

                                                    </div>
                                                `,
                                                )
                                                .join("")
                                            : `
                                                    <div class="text-sm text-zinc-500">

                                                        Tidak ada crafting

                                                    </div>
                                                `
                                        }

                                    </div>

                                    <div class="text-sm text-zinc-500 flex items-center gap-2 mt-5">

                                        <i data-lucide="calendar"></i>

                                        ${new Date(item.createdAt).toLocaleString("id-ID")}

                                    </div>

                                </div>

                                <div class="text-right min-w-[180px]">

                                    <div class="text-3xl font-black text-green-400">

                                        Rp ${item.transaction.totalSellPrice.toLocaleString("id-ID")}

                                    </div>

                                    <div class="mt-5">

                                        ${
                                          item.status === "Selesai"
                                            ? `
                                                    <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                                                        Selesai
                                                    </span>
                                                `
                                            : `
                                                    <span class="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs">
                                                        Proses
                                                    </span>
                                                `
                                        }

                                    </div>

                                </div>

                            </div>

                        </div>

                    `,
                        )
                        .join("")
                }

            </div>

        </div>

            <div class="xl:col-span-4 space-y-6">
                <div class="card">
                <h2 class="text-xl font-bold flex items-center gap-3 mb-6">

                    <i data-lucide="layout-dashboard" class="text-red-500"></i>

                    Quick Summary

                </h2>

                <div class="space-y-5">

                    ${summaryItem("boxes", "Total Material", getMaterials().length)}

                    ${summaryItem("hammer", "Total Crafting", getCraftings().length)}

                    ${summaryItem("receipt-text", "Transaksi", totalTransactions)}

                    ${summaryItem("clock-3", "Diproses", processing, "text-yellow-400")}

                    ${summaryItem("badge-check", "Selesai", completed, "text-green-400")}

                </div>

                <div class="card mt-6">

    <h2 class="text-lg font-bold flex items-center gap-2 mb-5">

        <i data-lucide="crown" class="text-yellow-400"></i>

        Top Customer

    </h2>

    <div class="space-y-4">

        ${
          topCustomers.length
            ? topCustomers
                .map(
                  ([name, total], index) => `

                    <div class="flex justify-between items-center">

                        <div class="flex items-center gap-3">

                            <div class="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold">

                                ${name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}

                            </div>

                            <span>${name}</span>

                        </div>

                        <strong>${total}x</strong>

                    </div>

                `,
                )
                .join("")
            : `
                    <p class="text-zinc-500">

                        Belum ada data.

                    </p>
                `
        }

    </div>

</div>

<div class="card mt-6">

    <h2 class="text-lg font-bold flex items-center gap-2 mb-5">

        <i data-lucide="hammer" class="text-red-400"></i>

        Top Crafting

    </h2>

    <div class="space-y-4">

        ${
          topCraftings.length
            ? topCraftings
                .map(
                  ([name, total]) => `

                    <div class="flex justify-between">

                        <span>${name}</span>

                        <strong>${total}</strong>

                    </div>

                `,
                )
                .join("")
            : `
                    <p class="text-zinc-500">

                        Belum ada crafting.

                    </p>
                `
        }

    </div>

</div>

<div class="card mt-6">

    <h2 class="text-lg font-bold flex items-center gap-2 mb-5">

        <i data-lucide="chart-no-axes-column" class="text-green-400"></i>

        Progress Transaksi

    </h2>

    <div class="flex justify-between mb-3">

        <span>Selesai</span>

        <strong>${progress}%</strong>

    </div>

    <div class="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">

        <div
            class="bg-green-500 h-full rounded-full transition-all duration-700"
            style="width:${progress}%">
        </div>

    </div>

    <div class="mt-4 text-sm text-zinc-500">

        ${completed} dari ${totalTransactions} transaksi telah selesai.

    </div>

</div>

            </div>

        </div>

    </div>

</div>

`;
}

function statCard(icon, title, value, color = "text-red-500") {
  return `

        <div class="card">

            <div class="flex items-center justify-between">

                <div>

                    <p class="uppercase tracking-[0.2em] text-xs text-zinc-500">

                        ${title}

                    </p>

                    <h2 class="text-4xl font-black mt-3">

                        ${value}

                    </h2>

                </div>

                <div class="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">

                    <i data-lucide="${icon}" class="w-7 h-7 ${color}"></i>

                </div>

            </div>

        </div>

    `;
}

function summaryItem(icon, title, value, color = "") {
  return `

        <div class="flex items-center justify-between py-3 border-b border-zinc-800 last:border-none">

            <div class="flex items-center gap-3">

                <i data-lucide="${icon}" class="w-5 h-5 text-zinc-500"></i>

                <span>${title}</span>

            </div>

            <strong class="${color}">

                ${value}

            </strong>

        </div>

    `;
}

function renderOverviewChart() {
  const transactions = getTransactions();

  const monthly = {};

  transactions.forEach((item) => {
    const d = new Date(item.createdAt);

    const key = d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });

    monthly[key] = (monthly[key] || 0) + 1;
  });

  const ctx = document.getElementById("overviewChart");

  if (!ctx) return;

  new Chart(ctx, {
    type: "line",

    data: {
      labels: Object.keys(monthly),

      datasets: [
        {
          label: "Transaksi",

          data: Object.values(monthly),

          borderColor: "#dc2626",

          backgroundColor: "rgba(220,38,38,.15)",

          tension: 0.35,

          fill: true,
        },
      ],
    },

    options: {
      plugins: {
        legend: {
          display: false,
        },
      },

      responsive: true,

      scales: {
        x: {
          ticks: {
            color: "#a1a1aa",
          },
          grid: {
            color: "#27272a",
          },
        },

        y: {
          ticks: {
            color: "#a1a1aa",
          },
          grid: {
            color: "#27272a",
          },
        },
      },
    },
  });
}

function loadOverview() {
  setActiveMenu("menu-overview");

  setPageTitle("Overview");

  document.getElementById("app").innerHTML = overviewPage();

  lucide.createIcons();
  renderOverviewChart();
}
