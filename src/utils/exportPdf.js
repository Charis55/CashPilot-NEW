<<<<<<< HEAD
/* ============================================================
   CashPilot — Professional PDF & CSV Exporter
   Uses jsPDF only (no html2canvas dependency)
   ============================================================ */
=======
/***************************************************
   CashPilot Modern PDF Exporter (Clean + Big Logo)
****************************************************/
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f

import jsPDF from "jspdf";

<<<<<<< HEAD
// ── Helpers ──────────────────────────────────────────────────

function fmt(n) {
  return "\u20A6" + Number(n).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function dateStr(t) {
  if (!t) return "N/A";
  const d = t.seconds ? new Date(t.seconds * 1000) : new Date(t);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function loadImageAsDataURL(path) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = path;
  });
}

// ── PDF Generator ────────────────────────────────────────────

export async function generateCashPilotPDF({ transactions, totals, monthlyIncome, budget }) {
=======
/* Format currency */
const formatCurrency = (amount) => {
  if (!amount) return "₦0.00";
  return "₦" + Number(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  });
};

export async function generateCashPilotPDF({
  transactions = [],
  totals = { income: 0, expense: 0, balance: 0 },
  monthlyIncome = 0,
  budget = 0,
  charts = {},
}) {
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f
  const doc = new jsPDF("p", "pt", "a4");
  const W = doc.internal.pageSize.getWidth();   // 595
  const H = doc.internal.pageSize.getHeight();  // 842
  const margin = 40;
  const contentW = W - margin * 2;

<<<<<<< HEAD
  // ── Colour palette ────────────────────────────────────────
  const GREEN_DARK = [5, 46, 22];   // #052e16
  const GREEN_MID = [22, 163, 74];  // #16a34a
  const GREEN_LIGHT = [34, 197, 94];  // #22c55e
  const WHITE = [255, 255, 255];
  const GRAY_BG = [245, 247, 250];
  const GRAY_BORDER = [220, 225, 230];
  const TEXT_DARK = [15, 23, 42];
  const TEXT_MID = [71, 85, 105];
  const RED = [220, 38, 38];

  // ── Page counter helper ───────────────────────────────────
  let currentPage = 1;
  const pages = [];
  const totalPages = () => pages.length;

  function addFooter() {
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...GREEN_DARK);
    doc.rect(0, pageH - 28, W, 28, "F");
    doc.setFontSize(9);
    doc.setTextColor(...[150, 200, 150]);
    doc.text("CashPilot — CharisCorp", margin, pageH - 10);
    doc.text(
      `Report generated: ${new Date().toLocaleString()}`,
      W - margin,
      pageH - 10,
      { align: "right" }
    );
=======
  /* ---------------- HEADER + BIG LOGO ---------------- */
  const logoPath = "/assets/cashpilot-logo.png";

  try {
    const img = await loadImage(logoPath);
    doc.addImage(img, "PNG", pageWidth / 2 - 60, y, 120, 120);
  } catch (e) {
    console.warn("⚠ Logo failed to load:", e);
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f
  }

  // ── COVER PAGE ───────────────────────────────────────────

  // Header band
  doc.setFillColor(...GREEN_DARK);
  doc.rect(0, 0, W, 220, "F");

  // Accent stripe
  doc.setFillColor(...GREEN_MID);
  doc.rect(0, 220, W, 6, "F");

  // Try to embed logo
  const logoData = await loadImageAsDataURL("/assets/cashpilot-logo.png");
  if (logoData) {
    doc.addImage(logoData, "PNG", W / 2 - 36, 32, 72, 72);
  }

  // App name
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...WHITE);
  doc.text("CashPilot", W / 2, 132, { align: "center" });

  // Report title
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...[180, 220, 200]);
  doc.text("Financial Report", W / 2, 154, { align: "center" });

  // Date
  doc.setFontSize(10);
  doc.setTextColor(...[120, 180, 150]);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
    W / 2,
    174,
    { align: "center" }
  );

  let y = 256;

  // ── SUMMARY CARDS ────────────────────────────────────────

<<<<<<< HEAD
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Summary Overview", margin, y);

  y += 18;
  doc.setDrawColor(...GRAY_BORDER);
  doc.setLineWidth(0.5);
  doc.line(margin, y, W - margin, y);
  y += 18;
=======
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CashPilot Financial Report", pageWidth / 2, y, { align: "center" });

  y += 20;

  const today = new Date().toLocaleString();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Generated on: ${today}`, pageWidth / 2, y, { align: "center" });

  y += 40;

  /* ---------------- SUMMARY ---------------- */
  doc.setFontSize(16);
  doc.text("Summary Overview", 40, y);
  y += 20;

  doc.setFontSize(12);
  doc.text(`Total Income:    ${formatCurrency(totals.income)}`, 40, y);
  y += 18;
  doc.text(`Total Expenses:  ${formatCurrency(totals.expense)}`, 40, y);
  y += 18;
  doc.text(`Balance:         ${formatCurrency(totals.balance)}`, 40, y);
  y += 18;
  doc.text(`Monthly Income:  ${formatCurrency(monthlyIncome)}`, 40, y);
  y += 18;
  doc.text(`Budget:          ${formatCurrency(budget)}`, 40, y);
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f

  const summaryItems = [
    { label: "Total Income", value: fmt(totals.income), color: GREEN_LIGHT },
    { label: "Total Expenses", value: fmt(totals.expense), color: RED },
    { label: "Net Balance", value: fmt(totals.balance), color: totals.balance >= 0 ? GREEN_LIGHT : RED },
    { label: "Monthly Budget", value: fmt(budget), color: GREEN_MID },
    { label: "Monthly Income", value: fmt(monthlyIncome), color: GREEN_MID },
  ];

<<<<<<< HEAD
  const cardW = (contentW - 8 * 4) / 3;  // 3 per row, 4pt gap
  let cx = margin;
  let cardRow = 0;

  summaryItems.forEach((item, i) => {
    if (i > 0 && i % 3 === 0) {
      cx = margin;
      y += 76;
      cardRow++;
    }

    // Card background
    doc.setFillColor(...GRAY_BG);
    doc.roundedRect(cx, y, cardW, 66, 6, 6, "F");

    // Colour accent top
    doc.setFillColor(...item.color);
    doc.roundedRect(cx, y, cardW, 5, 3, 3, "F");

    // Label
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MID);
    doc.text(item.label.toUpperCase(), cx + 12, y + 22);

    // Value
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...item.color);
    doc.text(item.value, cx + 12, y + 46);

    cx += cardW + 4;
  });

  y += 86 + 32;

  // ── Budget bar ───────────────────────────────────────────
  if (budget > 0) {
    const pct = Math.min((totals.expense / budget) * 100, 100);
    const barW = contentW;
    const fillW = (barW * pct) / 100;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_DARK);
    doc.text("Budget Utilisation", margin, y);
=======
  /* ---------------- CHARTS ---------------- */
  if (charts?.pieChartRef?.current) {
    doc.setFontSize(14);
    doc.text("Expense Breakdown", 40, y);
    const pieImg = await convertToImage(charts.pieChartRef.current);
    y += 10;
    doc.addImage(pieImg, "PNG", 40, y, 220, 200);
  }

  if (charts?.barChartRef?.current) {
    doc.setFontSize(14);
    doc.text("Income vs Expense", 300, y - 10);
    const barImg = await convertToImage(charts.barChartRef.current);
    doc.addImage(barImg, "PNG", 300, y, 220, 200);
  }

  y += 240;

  /* ---------------- TRANSACTIONS TABLE ---------------- */
  doc.setFontSize(16);
  doc.text("Transactions", 40, y);
  y += 15;

  doc.line(40, y, pageWidth - 40, y);
  y += 15;

  const headers = [
    "Created At",
    "Type",
    "Category",
    "Label",
    "Amount",
    "Note"
  ];
  const colX = [40, 140, 240, 340, 440, 500];

  doc.setFontSize(11);
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  y += 14;

  for (const t of transactions) {
    if (y > 770) {
      doc.addPage();
      y = 40;
    }

    const date = t.createdAt?.seconds
      ? new Date(t.createdAt.seconds * 1000).toLocaleString()
      : "N/A";

    doc.text(String(date), colX[0], y);
    doc.text(t.type || "-", colX[1], y);
    doc.text(t.category || "-", colX[2], y);
    doc.text(t.label || "-", colX[3], y);
    doc.text(formatCurrency(t.amount), colX[4], y);
    doc.text(t.note || "-", colX[5], y);

    y += 18;
  }

  doc.save(`CashPilot-${new Date().toISOString().split("T")[0]}.pdf`);
}

/* ---------------- HELPERS ---------------- */
function loadImage(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT_MID);
    doc.text(`${Math.round(pct)}% used`, W - margin, y, { align: "right" });

<<<<<<< HEAD
    y += 12;

    doc.setFillColor(...GRAY_BG);
    doc.roundedRect(margin, y, barW, 12, 4, 4, "F");

    doc.setFillColor(...(pct >= 100 ? RED : GREEN_MID));
    if (fillW > 0) doc.roundedRect(margin, y, fillW, 12, 4, 4, "F");

    y += 32;
  }

  // ── TRANSACTIONS TABLE ───────────────────────────────────

  const sorted = [...transactions].sort((a, b) => {
    const ta = a.createdAt?.seconds ?? 0;
    const tb = b.createdAt?.seconds ?? 0;
    return tb - ta;
  });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_DARK);
  doc.text("Transaction Log", margin, y);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_MID);
  doc.text(`${sorted.length} record${sorted.length !== 1 ? "s" : ""}`, W - margin, y, { align: "right" });

  y += 14;
  doc.setDrawColor(...GRAY_BORDER);
  doc.line(margin, y, W - margin, y);
  y += 14;

  // Column definitions
  const cols = [
    { label: "Date", x: margin, w: 90 },
    { label: "Label", x: margin + 90, w: 120 },
    { label: "Category", x: margin + 210, w: 100 },
    { label: "Type", x: margin + 310, w: 70 },
    { label: "Amount", x: margin + 380, w: 135 },
  ];

  // Header row
  doc.setFillColor(...GREEN_DARK);
  doc.rect(margin, y - 12, contentW, 22, "F");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  cols.forEach(c => doc.text(c.label.toUpperCase(), c.x + 4, y + 3));
  y += 22;

  const ROW_H = 20;

  sorted.forEach((t, idx) => {
    // New page if needed (leave room for footer)
    if (y + ROW_H > H - 50) {
      addFooter();
      doc.addPage();
      pages.push(doc.internal.getCurrentPageInfo().pageNumber);
      y = 48;

      // Repeat column headers on new page
      doc.setFillColor(...GREEN_DARK);
      doc.rect(margin, y - 12, contentW, 22, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...WHITE);
      cols.forEach(c => doc.text(c.label.toUpperCase(), c.x + 4, y + 3));
      y += 22;
    }

    // Alternating row colour
    if (idx % 2 === 0) {
      doc.setFillColor(250, 252, 250);
      doc.rect(margin, y - 13, contentW, ROW_H, "F");
    }

    const isIncome = t.type === "income";

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    doc.text(dateStr(t.createdAt || t.date), cols[0].x + 4, y);
    doc.text((t.label || "-").slice(0, 20), cols[1].x + 4, y);
    doc.text((t.category || "-").slice(0, 16), cols[2].x + 4, y);

    // Type badge colour
    doc.setTextColor(...(isIncome ? GREEN_MID : RED));
    doc.setFont("Helvetica", "bold");
    doc.text(t.type.toUpperCase(), cols[3].x + 4, y);

    doc.setFont("Helvetica", "bold");
    doc.setTextColor(...(isIncome ? GREEN_MID : RED));
    const amtText = `${isIncome ? "+" : "-"}${fmt(t.amount)}`;
    doc.text(amtText, cols[4].x + cols[4].w - 4, y, { align: "right" });

    // Row divider
    doc.setDrawColor(...GRAY_BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 6, W - margin, y + 6);

    y += ROW_H;
  });

  addFooter();

  // ── Save ─────────────────────────────────────────────────
  const fileName = `CashPilot-Report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

// ── CSV Exporter ─────────────────────────────────────────────

export function generateCashPilotCSV(transactions) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility

  const headers = ["Date", "Label", "Type", "Category", "Amount (NGN)", "Note"];

  const rows = transactions
    .slice()
    .sort((a, b) => {
      const ta = a.createdAt?.seconds ?? 0;
      const tb = b.createdAt?.seconds ?? 0;
      return tb - ta;
    })
    .map(t => [
      t.createdAt
        ? new Date(t.createdAt.seconds * 1000).toLocaleDateString("en-GB")
        : (t.date || "N/A"),
      t.label || "",
      (t.type || "").toUpperCase(),
      t.category || "",
      Number(t.amount).toFixed(2),
      t.note || "",
    ]);

  const escape = field => `"${String(field).replace(/"/g, '""')}"`;

  const csv = BOM + [headers, ...rows]
    .map(row => row.map(escape).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CashPilot-Transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
=======
/* ------------ CSV EXPORT (NO DATE COLUMN) ------------ */
export function exportCSV(transactions) {
  const today = new Date().toISOString().split("T")[0];

  const headers = [
    "Label",
    "Type",
    "Category",
    "Amount (₦)",
    "Note",
    "Created At"
  ];

  const rows = transactions.map((t) => [
    t.label || "",
    t.type || "",
    t.category || "",
    t.amount,
    t.note || "",
    t.createdAt?.seconds
      ? new Date(t.createdAt.seconds * 1000).toLocaleString()
      : ""
  ]);

  const csvContent = [headers, ...rows]
    .map(r => r.map(field => `"${field}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `CashPilot-${today}.csv`;
>>>>>>> d00d81699a16cd22837bda9c07dd0f897d27f92f
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
