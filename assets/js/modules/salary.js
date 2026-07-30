/* =========================================================
   SALARY MODULE
========================================================= */

let salaryMembers = [];
let currentSalaryCalculation = null;
let salaryActivities = [];
let salaryContributions = [];
let salaryPeriods = [];
let selectedSalaryPeriodId = null;
let selectedSalaryDetails = [];

let salaryHistoryFilter = {
    search: "",
    status: "",
};

let salaryRates = {
    attendance: 0,
    leader: 0,
};

/* =========================================================
   FETCH MEMBERS
========================================================= */

async function fetchSalaryMembers() {
    const { data, error } = await supabaseClient
        .from("members")
        .select("id, name")
        .order("name", { ascending: true });

    if (error) {
        console.error("Gagal mengambil anggota untuk gaji:", error);

        salaryMembers = [];
        return;
    }

    salaryMembers = data || [];

    console.log("Salary members loaded:", salaryMembers);
}

/* =========================================================
   FETCH ACTIVITIES
========================================================= */

async function fetchSalaryActivities() {
    const { data, error } = await supabaseClient
        .from("activities")
        .select(
            `
      id,
      activity_date,
      leader_id,
      activity_attendances (
        member_id
      )
    `,
        )
        .order("activity_date", { ascending: false });

    if (error) {
        console.error("Gagal mengambil aktivitas untuk gaji:", error);

        salaryActivities = [];
        return;
    }

    salaryActivities = data || [];

    console.log("Salary activities loaded:", salaryActivities);
}

/* =========================================================
   FETCH CONTRIBUTIONS
========================================================= */

async function fetchSalaryContributions() {
    const { data, error } = await supabaseClient
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

    if (error) {
        console.error("Gagal mengambil kontribusi untuk gaji:", error);

        salaryContributions = [];
        return;
    }

    salaryContributions = data || [];

    console.log("Salary contributions loaded:", salaryContributions);
}

/* =========================================================
   FETCH SALARY PERIODS
========================================================= */

async function fetchSalaryPeriods() {
    const { data, error } = await supabaseClient
        .from("salary_periods")
        .select(
            `
      id,
      start_date,
      end_date,
      attendance_rate,
      leader_rate,
      total_members,
      total_salary,
      status,
      created_at
    `,
        )
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Gagal mengambil riwayat penggajian:", error);

        salaryPeriods = [];
        return;
    }

    salaryPeriods = data || [];

    console.log("Salary periods loaded:", salaryPeriods);
}

/* =========================================================
   FETCH SALARY DETAILS
========================================================= */

async function fetchSalaryDetails(periodId) {
    const { data, error } = await supabaseClient
        .from("salary_details")
        .select(
            `
      id,
      salary_period_id,
      member_id,
      member_name,
      attendances,
      leader_count,
      attendance_salary,
      leader_salary,
      material_value,
      crafting_value,
      contribution_value,
      total_salary,
      contributions,
      created_at
    `,
        )
        .eq("salary_period_id", Number(periodId))
        .order("total_salary", { ascending: false });

    if (error) {
        console.error("Gagal mengambil detail penggajian:", error);

        selectedSalaryDetails = [];

        alert(`Detail penggajian gagal dimuat.\n\n${error.message || ""}`);

        return false;
    }

    selectedSalaryDetails = data || [];

    console.log("Salary details loaded:", selectedSalaryDetails);

    return true;
}

/* =========================================================
   FETCH SALARY PERIOD DETAILS
========================================================= */

async function fetchSalaryPeriodDetails(periodId) {
    const id = Number(periodId);

    if (!id) {
        console.error("Salary period ID tidak valid:", periodId);
        return [];
    }

    const { data, error } = await supabaseClient
        .from("salary_details")
        .select(
            `
        id,
        salary_period_id,
        member_id,
        member_name,

        attendances,
        leader_count,

        attendance_salary,
        leader_salary,

        material_count,
        material_quantity,
        material_value,

        crafting_count,
        crafting_quantity,
        crafting_value,

        contribution_value,
        total_salary,

        contributions,

        created_at
        `,
        )
        .eq("salary_period_id", id)
        .order("total_salary", { ascending: false });

    if (error) {
        console.error("Gagal mengambil detail penggajian:", error);

        alert(`Detail penggajian gagal dimuat.\n\n${error.message || ""}`);

        return [];
    }

    console.log(`Salary period ${id} details:`, data);

    return data || [];
}

async function showSalaryPeriodDetails(periodId) {
    console.log("Klik:", periodId);
    console.log("selected:", selectedSalaryPeriodId);
    const detailContainer = document.getElementById("salaryHistoryDetail");

    // Toggle
    if (selectedSalaryPeriodId === periodId) {
        selectedSalaryPeriodId = null;

        if (detailContainer) {
            detailContainer.innerHTML = "";
            detailContainer.classList.add("hidden");
        }

        return;
    }

    const period = salaryPeriods.find(
        (item) => Number(item.id) === Number(periodId),
    );

    if (!period) {
        alert("Periode penggajian tidak ditemukan.");
        return;
    }

    const details = await fetchSalaryPeriodDetails(periodId);

    selectedSalaryPeriodId = periodId;

    renderSalaryPeriodDetails(period, details);
}

async function markSalaryAsPaid(periodId) {
    const confirmed = confirm(
        "Yakin ingin menandai penggajian ini sebagai sudah dibayar?",
    );

    if (!confirmed) {
        return;
    }

    const { error } = await supabaseClient
        .from("salary_periods")
        .update({
            status: "Dibayar",
        })
        .eq("id", Number(periodId));

    if (error) {
        console.error("Gagal mengubah status:", error);

        alert(`Status gagal diubah.\n\n${error.message || ""}`);

        return;
    }

    alert("Status penggajian berhasil diubah menjadi Dibayar.");

    await fetchSalaryPeriods();

    renderSalaryHistory();

    if (selectedSalaryPeriodId === Number(periodId)) {
        const refreshedPeriod = salaryPeriods.find(
            (item) => Number(item.id) === Number(periodId),
        );

        const details = await fetchSalaryPeriodDetails(periodId);

        renderSalaryPeriodDetails(refreshedPeriod || period, details);
    }
}

async function resyncSalaryPeriod(periodId) {
    const period = salaryPeriods.find(
        (item) => Number(item.id) === Number(periodId),
    );

    if (!period) {
        alert("Periode penggajian tidak ditemukan.");
        return;
    }

    const confirmed = confirm(
        "Re-sync akan menghitung ulang detail gaji periode ini dari data aktivitas dan kontribusi terbaru. Lanjutkan?",
    );

    if (!confirmed) {
        return;
    }

    if (!salaryMembers.length) {
        await fetchSalaryMembers();
    }

    if (!salaryActivities.length) {
        await fetchSalaryActivities();
    }

    if (!salaryContributions.length) {
        await fetchSalaryContributions();
    }

    const attendanceRate = Number(period.attendance_rate) || 0;
    const leaderRate = Number(period.leader_rate) || 0;

    const start = parseSalaryDateForRange(period.start_date, false);
    const end = parseSalaryDateForRange(period.end_date, true);

    if (!start || !end) {
        alert("Periode memiliki format tanggal yang tidak valid.");
        return;
    }

    const salaryStats = {};

    salaryMembers.forEach((member) => {
        salaryStats[Number(member.id)] = {
            id: Number(member.id),
            name: member.name,

            attendances: 0,
            leaderCount: 0,

            attendanceSalary: 0,
            leaderSalary: 0,

            contributionCount: 0,
            contributionQuantity: 0,
            contributionValue: 0,

            materialCount: 0,
            materialQuantity: 0,
            materialValue: 0,

            craftingCount: 0,
            craftingQuantity: 0,
            craftingValue: 0,

            contributions: [],

            totalSalary: 0,
        };
    });

    salaryActivities.forEach((activity) => {
        if (!activity.activity_date) {
            return;
        }

        const activityDate = parseSalaryDateForRange(activity.activity_date, true);

        if (!activityDate || activityDate < start || activityDate > end) {
            return;
        }

        (activity.activity_attendances || []).forEach((attendance) => {
            const memberId = Number(attendance.member_id);

            if (!salaryStats[memberId]) {
                return;
            }

            salaryStats[memberId].attendances += 1;
        });

        const leaderId = Number(activity.leader_id);

        if (leaderId && salaryStats[leaderId]) {
            salaryStats[leaderId].leaderCount += 1;
        }
    });

    salaryContributions.forEach((contribution) => {
        if (!contribution.contribution_date) {
            return;
        }

        const contributionDate = parseSalaryDateForRange(
            contribution.contribution_date,
            true,
        );

        if (!contributionDate ||
            contributionDate < start ||
            contributionDate > end
        ) {
            return;
        }

        const memberId = Number(contribution.member_id);

        if (!salaryStats[memberId]) {
            return;
        }

        const quantity = Number(contribution.quantity) || 0;
        const unitPrice = Number(contribution.unit_price) || 0;
        const totalValue = Number(contribution.total_value) || quantity * unitPrice;

        const type = contribution.type || "";
        const normalizedType = String(type).trim().toLowerCase();

        salaryStats[memberId].contributionCount += 1;
        salaryStats[memberId].contributionQuantity += quantity;
        salaryStats[memberId].contributionValue += totalValue;

        if (normalizedType === "material" || normalizedType === "setoran") {
            salaryStats[memberId].materialCount += 1;
            salaryStats[memberId].materialQuantity += quantity;
            salaryStats[memberId].materialValue += totalValue;
        }

        if (normalizedType === "crafting") {
            salaryStats[memberId].craftingCount += 1;
            salaryStats[memberId].craftingQuantity += quantity;
            salaryStats[memberId].craftingValue += totalValue;
        }

        salaryStats[memberId].contributions.push({
            id: contribution.id,
            type: type,
            itemName: contribution.item_name || "-",
            quantity: quantity,
            unitPrice: unitPrice,
            totalValue: totalValue,
            date: contribution.contribution_date,
        });
    });

    const salaryResults = Object.values(salaryStats).map((member) => {
        member.attendanceSalary = member.attendances * attendanceRate;
        member.leaderSalary = member.leaderCount * leaderRate;
        member.totalSalary =
            member.attendanceSalary + member.leaderSalary + member.contributionValue;

        return member;
    });

    salaryResults.sort((a, b) => {
        if (b.totalSalary !== a.totalSalary) {
            return b.totalSalary - a.totalSalary;
        }

        return a.name.localeCompare(b.name, "id");
    });

    const salaryDetailsData = salaryResults.map((member) => ({
        salary_period_id: Number(period.id),

        member_id: member.id || null,
        member_name: member.name || "-",

        attendances: Number(member.attendances) || 0,
        leader_count: Number(member.leaderCount) || 0,

        attendance_salary: Number(member.attendanceSalary) || 0,
        leader_salary: Number(member.leaderSalary) || 0,

        material_count: Number(member.materialCount) || 0,
        material_quantity: Number(member.materialQuantity) || 0,
        material_value: Number(member.materialValue) || 0,

        crafting_count: Number(member.craftingCount) || 0,
        crafting_quantity: Number(member.craftingQuantity) || 0,
        crafting_value: Number(member.craftingValue) || 0,

        contribution_value: Number(member.contributionValue) || 0,

        total_salary: Number(member.totalSalary) || 0,

        contributions: member.contributions || [],
    }));

    const { error: deleteError } = await supabaseClient
        .from("salary_details")
        .delete()
        .eq("salary_period_id", Number(period.id));

    if (deleteError) {
        console.error("Gagal menghapus detail lama untuk re-sync:", deleteError);
        alert(
            `Re-sync gagal saat menghapus detail lama.\n\n${deleteError.message || ""}`,
        );
        return;
    }

    const { error: insertError } = await supabaseClient
        .from("salary_details")
        .insert(salaryDetailsData);

    if (insertError) {
        console.error("Gagal menyimpan detail baru hasil re-sync:", insertError);
        alert(
            `Re-sync gagal saat menyimpan detail baru.\n\n${insertError.message || ""}`,
        );
        return;
    }

    const totalSalary = salaryResults.reduce((sum, item) => {
        return sum + (Number(item.totalSalary) || 0);
    }, 0);

    const { error: updatePeriodError } = await supabaseClient
        .from("salary_periods")
        .update({
            total_members: salaryResults.length,
            total_salary: totalSalary,
        })
        .eq("id", Number(period.id));

    if (updatePeriodError) {
        console.error(
            "Detail berhasil di-sync, tetapi total periode gagal diperbarui:",
            updatePeriodError,
        );
        alert(
            `Detail berhasil di-sync, tetapi total periode gagal diperbarui.\n\n${
        updatePeriodError.message || ""
      }`,
        );
    } else {
        alert("Re-sync berhasil. Detail periode sudah diperbarui.");
    }

    await fetchSalaryPeriods();

    const refreshedPeriod = salaryPeriods.find(
        (item) => Number(item.id) === Number(period.id),
    );

    const details = await fetchSalaryPeriodDetails(period.id);

    renderSalaryHistory();
    renderSalaryPeriodDetails(refreshedPeriod || period, details);
}

function renderSalaryPeriodDetails(period, details) {
    const container = document.getElementById("salaryHistoryDetail");

    if (!container) {
        return;
    }

    container.classList.remove("hidden");

    container.innerHTML = `
    <div class="card">

      <div class="flex items-center justify-between mb-6">

        <div>

            <h2 class="font-bold text-xl">
            Detail Penggajian
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
            ${formatSalaryDate(period.start_date)}
            -
            ${formatSalaryDate(period.end_date)}
            </p>

        </div>

        <div class="text-right">

  <div
    class="
      inline-flex
      px-3
      py-1
      rounded-lg
      text-xs
      font-semibold
      ${
        period.status === "Dibayar"
          ? "bg-green-500/10 text-green-400 border border-green-500/20"
          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
      }
    "
  >
            ${escapeSalaryHTML(period.status)}
        </div>

        <div class="text-xs text-zinc-500 mt-2">
            ${details.length} Anggota
        </div>

        <button
          type="button"
          onclick="resyncSalaryPeriod(${period.id})"
          class="btn mt-3 text-xs"
        >
          <i data-lucide="refresh-cw" class="w-4 h-4"></i>
          Re-Sync Data
        </button>

        ${
          period.status !== "Dibayar"
            ? `
                <button
                type="button"
                onclick="markSalaryAsPaid(${period.id})"
                class="btn-red mt-3 text-xs"
                >
                <i data-lucide="badge-check" class="w-4 h-4"></i>
                Tandai Sudah Dibayar
                </button>
            `
            : ""
        }

        </div>

        </div>

      <div class="space-y-4">

        ${details
          .map(
            (member, index) => `
              <div
                class="
                  border
                  border-zinc-800
                  rounded-xl
                  p-5
                  bg-zinc-900/40
                "
              >

                <div class="flex justify-between items-center">

                  <div>

                    <div
                        class="
                            font-bold
                            text-zinc-100
                            truncate
                        "
                        >
                        ${escapeSalaryHTML(member.member_name)}
                        </div>

                        <div class="text-xs text-zinc-500 mt-1">
                        ${member.attendances} Kehadiran
                        |
                        ${member.leader_count} Leader
                        |
                        ${Number(member.material_count || 0)} Setoran
                        |
                        ${Number(member.crafting_count || 0)} Crafting
                        </div>

                  </div>

                  <div class="sm:text-right">

                        <div
                            class="
                            text-[10px]
                            uppercase
                            tracking-widest
                            text-zinc-500
                            "
                        >
                            Total Gaji
                        </div>

                        <div
                            class="
                            text-xl
                            font-black
                            text-green-400
                            mt-1
                            "
                        >
                      Rp ${Number(member.total_salary).toLocaleString("id-ID")}
                    </div>

                  </div>

                </div>

                <div class="mt-5">

                  <div
                    class="
                      grid
                      md:grid-cols-2
                      xl:grid-cols-4
                      gap-3
                    "
                  >

                    <!-- KEHADIRAN -->
                    <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">

                      <div class="text-xs text-zinc-500">
                        Kehadiran
                      </div>

                      <div class="mt-3 font-bold text-zinc-200">
                        ${member.attendances}x
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        Rp ${Number(member.attendance_salary || 0).toLocaleString("id-ID")}
                      </div>

                    </div>


                    <!-- LEADER -->
                    <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">

                      <div class="text-xs text-zinc-500">
                        Leader
                      </div>

                      <div class="mt-3 font-bold text-zinc-200">
                        ${member.leader_count}x
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        Rp ${Number(member.leader_salary || 0).toLocaleString("id-ID")}
                      </div>

                    </div>


                    <!-- SETORAN -->
                    <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">

                      <div class="text-xs text-zinc-500">
                        Setoran
                      </div>

                      <div class="mt-3 font-bold text-zinc-200">
                        ${Number(member.material_quantity || 0).toLocaleString("id-ID")} pcs
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        ${member.material_count} Setoran
                      </div>

                      <div class="text-sm font-bold text-purple-400 mt-3">
                        Rp ${Number(member.material_value || 0).toLocaleString("id-ID")}
                      </div>

                    </div>


                    <!-- CRAFTING -->
                    <div class="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">

                      <div class="text-xs text-zinc-500">
                        Crafting
                      </div>

                      <div class="mt-3 font-bold text-zinc-200">
                        ${Number(member.crafting_quantity || 0).toLocaleString("id-ID")} pcs
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        ${member.crafting_count} Crafting
                      </div>

                      <div class="text-sm font-bold text-orange-400 mt-3">
                        Rp ${Number(member.crafting_value || 0).toLocaleString("id-ID")}
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            `,
          )
          .join("")}

      </div>

    </div>
  `;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   PAGE
========================================================= */

function salaryPage() {
  return `
    <div class="space-y-6">

      <!-- HEADER -->
      <div
        class="
          flex flex-col
          md:flex-row
          md:items-center
          justify-between
          gap-4
        "
      >

        <div>

          <h1 class="text-2xl font-black">
            Gaji Anggota
          </h1>

          <p class="text-sm text-zinc-500 mt-1">
            Hitung gaji anggota berdasarkan aktivitas dan kontribusi kerja.
          </p>

        </div>

        <div class="flex items-center gap-2 text-xs text-zinc-500">

          <i
            data-lucide="wallet-cards"
            class="w-4 h-4 text-red-500"
          ></i>

          Member Salary

        </div>

      </div>


            <!-- =====================================================
           SALARY CALCULATOR
      ====================================================== -->

      <div class="card">

        <div class="flex items-center gap-3 mb-6">

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
              data-lucide="calculator"
              class="w-5 h-5 text-red-400"
            ></i>
          </div>

          <div>
            <h2 class="font-bold">
              Perhitungan Gaji
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Tentukan periode dan nominal perhitungan gaji anggota.
            </p>
          </div>

        </div>


        <!-- PERIOD -->

        <div class="mb-7">

          <div class="flex items-center gap-2 mb-4">

            <i
              data-lucide="calendar-range"
              class="w-4 h-4 text-red-400"
            ></i>

            <h3 class="text-sm font-bold">
              Periode Gaji
            </h3>

          </div>

          <div class="grid md:grid-cols-2 gap-5">

            <div>

              <label
                for="salaryStartDate"
                class="
                  block
                  text-xs
                  uppercase
                  tracking-widest
                  text-zinc-500
                  mb-2
                "
              >
                Tanggal Mulai
              </label>

              <input
                id="salaryStartDate"
                type="date"
                class="input"
              >

            </div>


            <div>

              <label
                for="salaryEndDate"
                class="
                  block
                  text-xs
                  uppercase
                  tracking-widest
                  text-zinc-500
                  mb-2
                "
              >
                Tanggal Selesai
              </label>

              <input
                id="salaryEndDate"
                type="date"
                class="input"
              >

            </div>

          </div>

        </div>


        <!-- RATES -->

        <div
          class="
            pt-6
            border-t
            border-zinc-800
          "
        >

          <div class="flex items-center gap-2 mb-4">

            <i
              data-lucide="badge-dollar-sign"
              class="w-4 h-4 text-green-400"
            ></i>

            <h3 class="text-sm font-bold">
              Nominal Gaji
            </h3>

          </div>


          <div
            class="
              grid
              md:grid-cols-2
              gap-5
            "
          >

            <!-- ATTENDANCE -->

            <div>

              <label
                for="salaryAttendanceRate"
                class="
                  block
                  text-xs
                  uppercase
                  tracking-widest
                  text-zinc-500
                  mb-2
                "
              >
                Per Kehadiran
              </label>

              <div class="relative">

                <span
                  class="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    font-semibold
                    text-zinc-500
                  "
                >
                  Rp
                </span>

                <input
                  id="salaryAttendanceRate"
                  type="number"
                  min="0"
                  step="1"
                  class="input pl-11"
                  placeholder="0"
                >

              </div>

            </div>


            <!-- LEADER -->

            <div>

              <label
                for="salaryLeaderRate"
                class="
                  block
                  text-xs
                  uppercase
                  tracking-widest
                  text-zinc-500
                  mb-2
                "
              >
                Per Leader
              </label>

              <div class="relative">

                <span
                  class="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    font-semibold
                    text-yellow-500
                  "
                >
                  Rp
                </span>

                <input
                  id="salaryLeaderRate"
                  type="number"
                  min="0"
                  step="1"
                  class="input pl-11"
                  placeholder="0"
                >

              </div>

            </div>

          </div>

        </div>


        <!-- FORMULA -->

        <div
          class="
            mt-6
            p-4
            rounded-xl
            border
            border-zinc-800
            bg-zinc-950/50
          "
        >

          <div class="flex items-start gap-3">

            <i
              data-lucide="info"
              class="
                w-4 h-4
                text-blue-400
                mt-0.5
                shrink-0
              "
            ></i>

            <div>

              <div class="text-xs font-semibold text-zinc-300">
                Rumus Perhitungan
              </div>

              <div class="text-xs text-zinc-500 mt-1">
                Total Gaji =
                    (Kehadiran × Nominal Kehadiran)
                    +
                    (Leader × Nominal Leader)
                    +
                    Total Nilai Setoran
              </div>

            </div>

          </div>

        </div>


        <!-- ACTION -->

        <div
          class="
            mt-6
            pt-6
            border-t
            border-zinc-800
            flex
            flex-col
            md:flex-row
            md:items-center
            justify-between
            gap-4
          "
        >

          <div>

            <div class="font-semibold">
              ${salaryMembers.length} Anggota
            </div>

            <div class="text-xs text-zinc-500 mt-1">
              Siap dihitung berdasarkan periode yang dipilih.
            </div>

          </div>


          <button
            type="button"
            onclick="calculateSalary()"
            class="
              btn-red
              flex
              items-center
              justify-center
              gap-2
              md:min-w-[200px]
            "
          >

            <i
              data-lucide="calculator"
              class="w-4 h-4"
            ></i>

            Hitung Gaji

          </button>

        </div>

      </div>


      <!-- RESULT -->

      <div
        id="salaryResult"
        class="hidden"
        ></div>

        <!-- SALARY HISTORY -->
        <div id="salaryHistory"></div>

            <div
                id="salaryHistoryDetail"
                class="mt-6 hidden"
            ></div>

    </div>
  `;
}

/* =========================================================
   RENDER SALARY HISTORY
========================================================= */

function renderSalaryHistory() {
  const container = document.getElementById("salaryHistory");

  if (!container) {
    return;
  }

  const search = salaryHistoryFilter.search.toLowerCase();
  const status = salaryHistoryFilter.status;

  const filteredPeriods = salaryPeriods.filter((period) => {
    const dateText =
      `${formatSalaryDate(period.start_date)} ${formatSalaryDate(period.end_date)}`.toLowerCase();

    const matchSearch = !search || dateText.includes(search);

    const matchStatus = !status || period.status === status;

    return matchSearch && matchStatus;
  });
  console.log("salaryPeriods:", salaryPeriods);
  console.log("filteredPeriods:", filteredPeriods);
  if (!salaryPeriods.length) {
    container.innerHTML = `
      <div class="card">

        <div class="flex items-center gap-3">

          <div
            class="
              w-10 h-10
              rounded-xl
              bg-zinc-800
              flex items-center
              justify-center
            "
          >
            <i
              data-lucide="history"
              class="w-5 h-5 text-zinc-500"
            ></i>
          </div>

          <div>
            <h2 class="font-bold">
              Riwayat Penggajian
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Belum ada periode penggajian yang tersimpan.
            </p>
          </div>

        </div>

      </div>
    `;

    return;
  }

  container.innerHTML = `
    <div class="card">

      <div
        class="
          flex flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
          mb-5
        "
      >

        <div class="flex items-center gap-3">

          <div
            class="
              w-10 h-10
              rounded-xl
              bg-red-500/10
              border
              border-red-500/20
              flex items-center
              justify-center
            "
          >
            <i
              data-lucide="history"
              class="w-5 h-5 text-red-400"
            ></i>
          </div>

          <div>

            <h2 class="font-bold">
              Riwayat Penggajian
            </h2>

            <p class="text-xs text-zinc-500 mt-1">
              Daftar periode penggajian yang telah disimpan.
            </p>

          </div>

        </div>

        <div
          class="
            px-3
            py-1.5
            rounded-lg
            bg-zinc-800
            text-xs
            text-zinc-400
          "
        >
          ${filteredPeriods.length} Periode
        </div>

      </div>

                <div class="flex flex-col md:flex-row gap-3 mb-5">

                <input
                id="salaryHistorySearch"
                type="text"
                class="input flex-1"
                placeholder="Cari tanggal..."
                value="${salaryHistoryFilter.search}"
                >

                <select
                    id="salaryHistoryStatus"
                    class="input md:w-56"
                    onchange="
                        salaryHistoryFilter.status = this.value;
                        renderSalaryHistory();
                    "
                >
                    <option value="" ${salaryHistoryFilter.status === "" ? "selected" : ""}>
                    Semua Status
                    </option>
                    <option value="Belum Dibayar" ${salaryHistoryFilter.status === "Belum Dibayar" ? "selected" : ""}>
                    Belum Dibayar
                    </option>
                    <option value="Dibayar" ${salaryHistoryFilter.status === "Dibayar" ? "selected" : ""}>
                    Dibayar
                    </option>
                </select>

                </div>

        <div class="space-y-3">

  ${
    filteredPeriods.length
      ? filteredPeriods
          .map(
            (period) => `
              <div
                
                class="
                  border
                  border-zinc-800
                  bg-zinc-900/40
                  hover:bg-zinc-800/60
                  hover:border-zinc-700
                  rounded-xl
                  p-4
                  cursor-pointer
                  transition
                "
              >

                <div
                  class="
                    flex flex-col
                    md:flex-row
                    md:items-center
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <div class="font-bold text-zinc-100">
                      ${formatSalaryDate(period.start_date)}
                      -
                      ${formatSalaryDate(period.end_date)}
                    </div>

                    <div class="text-xs text-zinc-500 mt-1">
                      ${Number(period.total_members || 0).toLocaleString("id-ID")}
                      Anggota
                    </div>

                  </div>

                  <div class="text-right">

                    <div
                      class="
                        text-[10px]
                        uppercase
                        tracking-widest
                        text-zinc-500
                      "
                    >
                      Total Gaji
                    </div>

                    <div class="font-black text-green-400 mt-1">
                      Rp ${Number(period.total_salary || 0).toLocaleString("id-ID")}
                    </div>

                  </div>

                  <div
                    class="
                      px-3
                      py-1.5
                      rounded-lg
                      text-xs
                      font-semibold
                      ${
                        period.status === "Dibayar"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }
                    "
                  >
                    ${escapeSalaryHTML(period.status || "Belum Dibayar")}
                  </div>

                  <button
                    onclick="event.stopPropagation(); showSalaryPeriodDetails(${period.id})"
                    class="btn text-xs"
                  >
                    <i
                      data-lucide="eye"
                      class="w-4 h-4"
                    ></i>

                    Lihat Detail
                  </button>

                </div>

              </div>
            `,
          )
          .join("")
      : `
                    <div
                    class="
                        border
                        border-dashed
                        border-zinc-700
                        rounded-xl
                        py-12
                        text-center
                    "
                    >

                    <i
                        data-lucide="sFFFearch-x"
                        class="w-10 h-10 mx-auto text-zinc-500"
                    ></i>

                    <div class="mt-4 font-semibold">
                        Tidak ada data yang cocok
                    </div>

                    <div class="text-sm text-zinc-500 mt-2">
                        Coba ubah pencarian atau filter status.
                    </div>

                    </div>
                `
  }

            </div>

    </div>
  `;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
  const searchInput = document.getElementById("salaryHistorySearch");

  if (searchInput) {
    searchInput.focus();
    searchInput.selectionStart = searchInput.value.length;
    searchInput.selectionEnd = searchInput.value.length;

    searchInput.oninput = function () {
      salaryHistoryFilter.search = this.value;
      renderSalaryHistory();
    };
  }
}

/* =========================================================
   CALCULATE SALARY
========================================================= */

function calculateSalary() {
  const startDate = document.getElementById("salaryStartDate")?.value || "";
  const endDate = document.getElementById("salaryEndDate")?.value || "";

  const attendanceRate =
    Number(document.getElementById("salaryAttendanceRate")?.value) || 0;

  const leaderRate =
    Number(document.getElementById("salaryLeaderRate")?.value) || 0;

  /* =========================
     VALIDATION
  ========================= */

  if (!startDate) {
    alert("Tanggal mulai wajib dipilih.");
    return;
  }

  if (!endDate) {
    alert("Tanggal selesai wajib dipilih.");
    return;
  }

  if (startDate > endDate) {
    alert("Tanggal mulai tidak boleh melebihi tanggal selesai.");
    return;
  }

  if (attendanceRate < 0 || leaderRate < 0) {
    alert("Nominal gaji tidak boleh kurang dari 0.");
    return;
  }

  /* =========================
     SAVE CURRENT RATES
  ========================= */

  salaryRates = {
    attendance: attendanceRate,
    leader: leaderRate,
  };

  /* =========================
     DATE RANGE
  ========================= */

  const start = parseSalaryDateForRange(startDate, false);
  const end = parseSalaryDateForRange(endDate, true);

  if (!start || !end) {
    alert("Format tanggal tidak valid.");
    return;
  }

  /* =========================
     INITIALIZE MEMBER STATS
  ========================= */

  const salaryStats = {};

  salaryMembers.forEach((member) => {
    salaryStats[Number(member.id)] = {
      id: Number(member.id),
      name: member.name,

      attendances: 0,
      leaderCount: 0,

      attendanceSalary: 0,
      leaderSalary: 0,

      contributionCount: 0,
      contributionQuantity: 0,
      contributionValue: 0,

      materialCount: 0,
      materialQuantity: 0,
      materialValue: 0,

      craftingCount: 0,
      craftingQuantity: 0,
      craftingValue: 0,

      contributions: [],

      totalSalary: 0,
    };
  });

  /* =========================
     ACTIVITIES
  ========================= */

  salaryActivities.forEach((activity) => {
    if (!activity.activity_date) {
      return;
    }

    const activityDate = parseSalaryDateForRange(activity.activity_date, true);

    if (!activityDate || activityDate < start || activityDate > end) {
      return;
    }

    /* =========================
       ATTENDANCE
    ========================= */

    (activity.activity_attendances || []).forEach((attendance) => {
      const memberId = Number(attendance.member_id);

      if (!salaryStats[memberId]) {
        return;
      }

      salaryStats[memberId].attendances += 1;
    });

    /* =========================
       LEADER
    ========================= */

    const leaderId = Number(activity.leader_id);

    if (leaderId && salaryStats[leaderId]) {
      salaryStats[leaderId].leaderCount += 1;
    }
  });

  /* =========================
     CONTRIBUTIONS
  ========================= */

  salaryContributions.forEach((contribution) => {
    if (!contribution.contribution_date) {
      return;
    }

    const contributionDate = parseSalaryDateForRange(
      contribution.contribution_date,
      true,
    );

    if (
      !contributionDate ||
      contributionDate < start ||
      contributionDate > end
    ) {
      return;
    }

    const memberId = Number(contribution.member_id);

    if (!salaryStats[memberId]) {
      return;
    }

    const quantity = Number(contribution.quantity) || 0;
    const unitPrice = Number(contribution.unit_price) || 0;

    const totalValue = Number(contribution.total_value) || quantity * unitPrice;

    const type = contribution.type || "";
    const normalizedType = String(type).trim().toLowerCase();

    /* =========================
       GENERAL CONTRIBUTION
    ========================= */

    salaryStats[memberId].contributionCount += 1;
    salaryStats[memberId].contributionQuantity += quantity;
    salaryStats[memberId].contributionValue += totalValue;

    /* =========================
       SETORAN / MATERIAL
     ========================= */

    if (normalizedType === "material" || normalizedType === "setoran") {
      salaryStats[memberId].materialCount += 1;
      salaryStats[memberId].materialQuantity += quantity;
      salaryStats[memberId].materialValue += totalValue;
    }

    /* =========================
       CRAFTING
    ========================= */

    if (normalizedType === "crafting") {
      salaryStats[memberId].craftingCount += 1;
      salaryStats[memberId].craftingQuantity += quantity;
      salaryStats[memberId].craftingValue += totalValue;
    }

    /* =========================
       DETAIL
    ========================= */

    salaryStats[memberId].contributions.push({
      id: contribution.id,
      type: type,
      itemName: contribution.item_name || "-",
      quantity: quantity,
      unitPrice: unitPrice,
      totalValue: totalValue,
      date: contribution.contribution_date,
    });
  });

  /* =========================
     CALCULATE SALARY
  ========================= */

  const salaryResults = Object.values(salaryStats).map((member) => {
    member.attendanceSalary = member.attendances * salaryRates.attendance;

    member.leaderSalary = member.leaderCount * salaryRates.leader;

    member.totalSalary =
      member.attendanceSalary + member.leaderSalary + member.contributionValue;

    return member;
  });

  /* =========================
     SORT
  ========================= */

  salaryResults.sort((a, b) => {
    if (b.totalSalary !== a.totalSalary) {
      return b.totalSalary - a.totalSalary;
    }

    return a.name.localeCompare(b.name, "id");
  });

  console.log("Salary Results:", salaryResults);

  /* =========================
   SAVE CURRENT CALCULATION
========================= */

  currentSalaryCalculation = {
    startDate: startDate,
    endDate: endDate,

    attendanceRate: attendanceRate,
    leaderRate: leaderRate,

    totalMembers: salaryResults.length,

    totalSalary: salaryResults.reduce((total, member) => {
      return total + (Number(member.totalSalary) || 0);
    }, 0),

    members: salaryResults,
  };

  console.log("Current Salary Calculation:", currentSalaryCalculation);

  /* =========================
     TEMP RESULT
  ========================= */

  const result = document.getElementById("salaryResult");

  if (!result) {
    return;
  }

  result.classList.remove("hidden");

  result.innerHTML = `
  <div class="card">

    <!-- HEADER -->
    <div
      class="
        flex flex-col
        sm:flex-row
        sm:items-center
        justify-between
        gap-4
      "
    >

      <div>

        <h2 class="font-bold">
          Hasil Perhitungan Gaji
        </h2>

        <p class="text-xs text-zinc-500 mt-1">
          ${formatSalaryDate(startDate)}
          sampai
          ${formatSalaryDate(endDate)}
        </p>

      </div>

      <div
  class="
    flex
    flex-col
    sm:flex-row
    sm:items-center
    gap-2
  "
>

  <div
    class="
      px-3
      py-1.5
      rounded-lg
      bg-zinc-800
      text-xs
      text-zinc-400
      text-center
    "
  >
    ${salaryResults.length} Anggota
  </div>

        <button
            id="saveSalaryBtn"
            type="button"
            onclick="saveSalaryPeriod()"
            class="
            btn-red
            flex
            items-center
            justify-center
            gap-2
            "
        >
            <i
            data-lucide="save"
            class="w-4 h-4"
            ></i>

            <span id="saveSalaryText">
            Simpan Penggajian
            </span>
        </button>

    </div>

    </div>


    <!-- RESULTS -->
    <div class="mt-6 space-y-4">

      ${salaryResults
        .map((member, index) => {
          const activitySalary =
            Number(member.attendanceSalary || 0) +
            Number(member.leaderSalary || 0);

          return `
            <div
              class="
                border
                border-zinc-800
                bg-zinc-900/40
                rounded-xl
                overflow-hidden
              "
            >

              <!-- MEMBER HEADER -->
              <div
                class="
                  flex flex-col
                  sm:flex-row
                  sm:items-center
                  justify-between
                  gap-4
                  p-5
                  border-b
                  border-zinc-800
                "
              >

                <div class="flex items-center gap-3 min-w-0">

                  <div
                    class="
                      w-10 h-10
                      rounded-xl
                      bg-red-500/10
                      border
                      border-red-500/20
                      flex
                      items-center
                      justify-center
                      text-red-400
                      font-black
                      shrink-0
                    "
                  >
                    ${index + 1}
                  </div>

                  <div class="min-w-0">

                    <div
                      class="
                        font-bold
                        text-zinc-100
                        truncate
                      "
                    >
                      ${escapeSalaryHTML(member.name)}
                    </div>

                    <div class="text-xs text-zinc-500 mt-1">
                      ${member.attendances} Kehadiran
                      •
                      ${member.leaderCount} Leader
                      •
                      ${member.contributionCount} Setoran
                    </div>

                  </div>

                </div>


                <div class="sm:text-right">

                  <div
                    class="
                      text-[10px]
                      uppercase
                      tracking-widest
                      text-zinc-500
                    "
                  >
                    Total Gaji
                  </div>

                  <div
                    class="
                      text-xl
                      font-black
                      text-green-400
                      mt-1
                    "
                  >
                    Rp ${Number(member.totalSalary || 0).toLocaleString("id-ID")}
                  </div>

                </div>

              </div>


              <!-- BREAKDOWN -->
              <div class="p-5">

                <div
                  class="
                    grid
                    md:grid-cols-2
                    xl:grid-cols-4
                    gap-3
                  "
                >

                  <!-- ATTENDANCE -->
                  <div
                    class="
                      rounded-xl
                      border
                      border-zinc-800
                      bg-zinc-950/60
                      p-4
                    "
                  >

                    <div
                      class="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-zinc-500
                      "
                    >
                      <i
                        data-lucide="calendar-check-2"
                        class="w-4 h-4 text-blue-400"
                      ></i>

                      Kehadiran
                    </div>

                    <div class="mt-3">

                      <div class="font-bold text-zinc-200">
                        ${member.attendances}x
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        Rp ${Number(salaryRates.attendance || 0).toLocaleString("id-ID")} / hadir
                      </div>

                      <div class="text-sm font-bold text-blue-400 mt-3">
                        Rp ${Number(member.attendanceSalary || 0).toLocaleString("id-ID")}
                      </div>

                    </div>

                  </div>


                  <!-- LEADER -->
                  <div
                    class="
                      rounded-xl
                      border
                      border-zinc-800
                      bg-zinc-950/60
                      p-4
                    "
                  >

                    <div
                      class="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-zinc-500
                      "
                    >
                      <i
                        data-lucide="crown"
                        class="w-4 h-4 text-yellow-400"
                      ></i>

                      Leader
                    </div>

                    <div class="mt-3">

                      <div class="font-bold text-zinc-200">
                        ${member.leaderCount}x
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        Rp ${Number(salaryRates.leader || 0).toLocaleString("id-ID")} / leader
                      </div>

                      <div class="text-sm font-bold text-yellow-400 mt-3">
                        Rp ${Number(member.leaderSalary || 0).toLocaleString("id-ID")}
                      </div>

                    </div>

                  </div>


                  <!-- MATERIAL -->
                  <div
                    class="
                      rounded-xl
                      border
                      border-zinc-800
                      bg-zinc-950/60
                      p-4
                    "
                  >

                    <div
                      class="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-zinc-500
                      "
                    >
                      <i
                        data-lucide="boxes"
                        class="w-4 h-4 text-purple-400"
                      ></i>

                      Material
                    </div>

                    <div class="mt-3">

                      <div class="font-bold text-zinc-200">
                        ${Number(member.materialQuantity || 0).toLocaleString("id-ID")} pcs
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        ${member.materialCount} Setoran
                      </div>

                      <div class="text-sm font-bold text-purple-400 mt-3">
                        Rp ${Number(member.materialValue || 0).toLocaleString("id-ID")}
                      </div>

                    </div>

                  </div>


                  <!-- CRAFTING -->
                  <div
                    class="
                      rounded-xl
                      border
                      border-zinc-800
                      bg-zinc-950/60
                      p-4
                    "
                  >

                    <div
                      class="
                        flex
                        items-center
                        gap-2
                        text-xs
                        text-zinc-500
                      "
                    >
                      <i
                        data-lucide="hammer"
                        class="w-4 h-4 text-orange-400"
                      ></i>

                      Crafting
                    </div>

                    <div class="mt-3">

                      <div class="font-bold text-zinc-200">
                        ${Number(member.craftingQuantity || 0).toLocaleString("id-ID")} pcs
                      </div>

                      <div class="text-xs text-zinc-500 mt-1">
                        ${member.craftingCount} Setoran
                      </div>

                      <div class="text-sm font-bold text-orange-400 mt-3">
                        Rp ${Number(member.craftingValue || 0).toLocaleString("id-ID")}
                      </div>

                    </div>

                  </div>

                </div>


                <!-- SUMMARY -->
                <div
                  class="
                    mt-4
                    grid
                    sm:grid-cols-3
                    gap-3
                  "
                >

                  <div
                    class="
                      p-4
                      rounded-xl
                      border
                      border-zinc-800
                    "
                  >
                    <div class="text-xs text-zinc-500">
                      Gaji Aktivitas
                    </div>

                    <div class="font-bold mt-1">
                      Rp ${activitySalary.toLocaleString("id-ID")}
                    </div>
                  </div>


                  <div
                    class="
                      p-4
                      rounded-xl
                      border
                      border-zinc-800
                    "
                  >
                    <div class="text-xs text-zinc-500">
                      Total Nilai Setoran
                    </div>

                    <div class="font-bold text-green-400 mt-1">
                      Rp ${Number(member.contributionValue || 0).toLocaleString("id-ID")}
                    </div>
                  </div>


                  <div
                    class="
                      p-4
                      rounded-xl
                      border
                      border-green-500/20
                      bg-green-500/5
                    "
                  >
                    <div class="text-xs text-green-500">
                      Total Gaji
                    </div>

                    <div class="font-black text-green-400 mt-1">
                      Rp ${Number(member.totalSalary || 0).toLocaleString("id-ID")}
                    </div>
                  </div>

                </div>


                <!-- CONTRIBUTION DETAIL -->
                ${
                  member.contributions.length > 0
                    ? `
                      <div
                        class="
                          mt-4
                          pt-4
                          border-t
                          border-zinc-800
                        "
                      >

                        <div
                          class="
                            text-xs
                            uppercase
                            tracking-widest
                            text-zinc-500
                            mb-3
                          "
                        >
                          Detail Setoran
                        </div>

                        <div class="space-y-2">

                          ${member.contributions
                            .map(
                              (contribution) => `
                                <div
                                  class="
                                    flex flex-col
                                    sm:flex-row
                                    sm:items-center
                                    justify-between
                                    gap-3
                                    p-3
                                    rounded-lg
                                    bg-zinc-950/60
                                    border
                                    border-zinc-800
                                  "
                                >

                                  <div>

                                    <div class="font-semibold text-sm">
                                      ${escapeSalaryHTML(contribution.itemName)}
                                    </div>

                                    <div class="text-xs text-zinc-500 mt-1">
                                      ${escapeSalaryHTML(contribution.type)}
                                      •
                                      ${Number(contribution.quantity || 0).toLocaleString("id-ID")} pcs
                                      ×
                                      Rp ${Number(contribution.unitPrice || 0).toLocaleString("id-ID")}
                                    </div>

                                  </div>

                                  <div
                                    class="
                                      font-bold
                                      text-green-400
                                      shrink-0
                                    "
                                  >
                                    Rp ${Number(contribution.totalValue || 0).toLocaleString("id-ID")}
                                  </div>

                                </div>
                              `,
                            )
                            .join("")}

                        </div>

                      </div>
                    `
                    : ""
                }

              </div>

            </div>
          `;
        })
        .join("")}

    </div>

  </div>
`;

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/* =========================================================
   SAVE SALARY PERIOD
========================================================= */

async function saveSalaryPeriod() {
  if (!currentSalaryCalculation) {
    alert("Hitung gaji terlebih dahulu.");
    return;
  }

  const button = document.getElementById("saveSalaryBtn");
  const buttonText = document.getElementById("saveSalaryText");

  if (button) {
    button.disabled = true;
  }

  if (buttonText) {
    buttonText.textContent = "Menyimpan...";
  }

  const salaryPeriodData = {
    start_date: currentSalaryCalculation.startDate,
    end_date: currentSalaryCalculation.endDate,

    attendance_rate: currentSalaryCalculation.attendanceRate,
    leader_rate: currentSalaryCalculation.leaderRate,

    total_members: currentSalaryCalculation.totalMembers,
    total_salary: currentSalaryCalculation.totalSalary,

    status: "Belum Dibayar",
  };

  const { data, error } = await supabaseClient
    .from("salary_periods")
    .insert(salaryPeriodData)
    .select()
    .single();

  if (error) {
    console.error("Gagal menyimpan periode penggajian:", error);

    alert(`Penggajian gagal disimpan.\n\n${error.message || ""}`);

    if (button) {
      button.disabled = false;
    }

    if (buttonText) {
      buttonText.textContent = "Simpan Penggajian";
    }

    return;
  }

  console.log("Salary period saved:", data);

  /* =========================
   SAVE SALARY DETAILS
========================= */

  const salaryDetailsData = currentSalaryCalculation.members.map((member) => ({
    salary_period_id: data.id,

    member_id: member.id || null,
    member_name: member.name || "-",

    attendances: Number(member.attendances) || 0,
    leader_count: Number(member.leaderCount) || 0,

    attendance_salary: Number(member.attendanceSalary) || 0,
    leader_salary: Number(member.leaderSalary) || 0,

    material_count: Number(member.materialCount) || 0,
    material_quantity: Number(member.materialQuantity) || 0,
    material_value: Number(member.materialValue) || 0,

    crafting_count: Number(member.craftingCount) || 0,
    crafting_quantity: Number(member.craftingQuantity) || 0,
    crafting_value: Number(member.craftingValue) || 0,

    contribution_value: Number(member.contributionValue) || 0,

    total_salary: Number(member.totalSalary) || 0,

    contributions: member.contributions || [],
  }));

  console.log("Salary details to save:", salaryDetailsData);

  const { data: salaryDetails, error: salaryDetailsError } =
    await supabaseClient
      .from("salary_details")
      .insert(salaryDetailsData)
      .select();

  if (salaryDetailsError) {
    console.error("Gagal menyimpan detail penggajian:", salaryDetailsError);

    alert(
      `Periode berhasil dibuat, tetapi detail gaji gagal disimpan.\n\n${
        salaryDetailsError.message || ""
      }`,
    );

    if (button) {
      button.disabled = false;
    }

    if (buttonText) {
      buttonText.textContent = "Simpan Penggajian";
    }

    return;
  }

  console.log("Salary details saved:", salaryDetails);

  alert("Penggajian berhasil disimpan.");

  if (buttonText) {
    buttonText.textContent = "Tersimpan";
  }
}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeSalaryHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   FORMAT DATE
========================================================= */

function formatSalaryDate(value) {
  if (!value) {
    return "-";
  }

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

function parseSalaryDateForRange(value, endOfDay = false) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();

  // Date-only values (YYYY-MM-DD) are parsed as local time to avoid timezone shifts.
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(`${raw}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  }

  const parsed = new Date(raw);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

/* =========================================================
   LOAD
========================================================= */

async function loadSalary() {
  setActiveMenu("salary");

  if (typeof setPageTitle === "function") {
    setPageTitle("Gaji Anggota");
  }

  document.getElementById("app").innerHTML = `
    <div class="card">
      <div class="text-center text-zinc-500 py-10">
        Memuat data gaji...
      </div>
    </div>
  `;

  await fetchSalaryMembers();
  await fetchSalaryActivities();
  await fetchSalaryContributions();
  await fetchSalaryPeriods();

  console.log("Salary data:", {
    members: salaryMembers,
    activities: salaryActivities,
    contributions: salaryContributions,
    periods: salaryPeriods,
  });

  document.getElementById("app").innerHTML = salaryPage();

  renderSalaryHistory();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}