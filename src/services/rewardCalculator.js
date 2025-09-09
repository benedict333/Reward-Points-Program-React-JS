// - 2 points for every whole dollar > $100
// - 1 point for every whole dollar between $50 and $100
export function calculatePoints(amount) {
  const dollars = Number(String(amount).split(".")[0] || "0");
  if (dollars <= 50) return 0;
  if (dollars <= 100) return dollars - 50;
  const over100 = dollars - 100;
  return 50 + over100 * 2;
}

// --- Month helpers (produce last three months including current) ---
function lastThreeMonthsNow() {
  const today = new Date();
  const months = [];
  // build [now-2, now-1, now] in chronological order
  for (let shift = 2; shift >= 0; shift--) {
    const d = new Date(today.getFullYear(), today.getMonth() - shift, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString(undefined, { month: "short" });
    months.push({ key, label });
  }
  return months;
}

export function summarizeAllCustomersByMonthLast3(transactions) {
  const months = lastThreeMonthsNow();
  const customerMap = {}; // name -> { monthPoints: {key: points}, total }

  for (const t of transactions || []) {
    const name = t.customerName || "Unknown";
    const monthKey = (t.purchaseDate || t.date || "").slice(0, 7);
    // Only include if it falls in the last three months
    const inWindow = months.find((m) => m.key === monthKey);
    if (!inWindow) continue;

    const pts = calculatePoints(t.amount);

    if (!customerMap[name]) {
      const monthPoints = {};
      for (const m of months) monthPoints[m.key] = 0;
      customerMap[name] = { customerName: name, monthPoints, total: 0 };
    }

    customerMap[name].monthPoints[monthKey] += pts;
    customerMap[name].total += pts;
  }

  // Extract customers list
  const customersArray = Object.values(customerMap);

  // Sort customers by name
  const sortedCustomers = customersArray.sort((a, b) =>
    a.customerName.localeCompare(b.customerName)
  );
  // Precompute each customer's byMonth
  const byMonthForEachCustomer = [];
  for (let k = 0; k < sortedCustomers.length; k++) {
    const c = sortedCustomers[k];

    const byMonthArray = [];
    for (let mIdx = 0; mIdx < months.length; mIdx++) {
      const m = months[mIdx];
      const monthLabel = m.key;
      const monthPoints = c.monthPoints[monthLabel];
      const byMonthEntry = { month: monthLabel, points: monthPoints };
      byMonthArray.push(byMonthEntry);
    }

    byMonthForEachCustomer.push(byMonthArray);
  }

  // Assemble final rows using the precomputed byMonth arrays
  const rows = [];
  for (let r = 0; r < sortedCustomers.length; r++) {
    const c = sortedCustomers[r];
    const byMonth = byMonthForEachCustomer[r];

    const row = {
      customerName: c.customerName,
      byMonth: byMonth,
      totalPoints: c.total,
    };
    rows.push(row);
  }

  return { months, rows };
}
