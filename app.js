"use strict";

const TRANSPORTERS = [
  { key: "salim",    label: "Salim Cargo", short: "Salim",    color: "#2563EB" },
  { key: "shahjoki", label: "Shahjoki",    short: "Shahjoki", color: "#D97706" },
  { key: "newjs",    label: "New JS",      short: "New JS",   color: "#059669" }
];
const STORE_KEY = "export-dashboard-program";
let programData = loadProgram();
let customLogoImg = null;

/* ---------- data helpers ---------- */
function loadProgram() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* storage unavailable: use defaults */ }
  return JSON.parse(JSON.stringify(window.DEFAULT_PROGRAM));
}
const feetTag = f => String(f).padStart(2, "0") + "'";
const sum = a => a.reduce((s, n) => s + n, 0);

function rowInfo(r) {
  const per = {};
  TRANSPORTERS.forEach(t => { per[t.key] = sum((r.trips?.[t.key] || []).map(v => v[1])); });
  const cargos = sum(Object.values(per));
  return { per, cargos, details: tripText(r.trips || {}) };
}
function tripText(trips) {
  return TRANSPORTERS.filter(t => (trips[t.key] || []).length)
    .map(t => `${t.short}: ` + trips[t.key].map(([f, n]) => `${n}×${feetTag(f)}`).join(" + "))
    .join(" | ");
}
function totals() {
  const merged = {}, fleet = {};
  let cbm = 0, cargos = 0;
  const per = Object.fromEntries(TRANSPORTERS.map(t => [t.key, 0]));
  programData.rows.forEach(r => {
    const i = rowInfo(r);
    cbm += Number(r.cbm) || 0; cargos += i.cargos;
    TRANSPORTERS.forEach(t => {
      per[t.key] += i.per[t.key];
      (r.trips?.[t.key] || []).forEach(([f, n]) => {
        (merged[t.key] ||= {})[f] = (merged[t.key][f] || 0) + n;
        fleet[f] = (fleet[f] || 0) + n;
      });
    });
  });
  const mergedTrips = {};
  Object.keys(merged).forEach(k => {
    mergedTrips[k] = Object.entries(merged[k]).map(([f, n]) => [Number(f), n]).sort((a, b) => b[0] - a[0]);
  });
  return { cbm, cargos, per, fleet, details: tripText(mergedTrips) };
}
const pct = (n, total) => total ? (n / total * 100).toFixed(1) + "%" : "0.0%";

/* ---------- canvas ---------- */
function drawDashboard() {
  const canvas = document.getElementById("dashboardCanvas");
  const ctx = canvas.getContext("2d");
  const T = totals();
  const rows = programData.rows;

  canvas.width = 1600;
  canvas.height = 800 + Math.max(0, rows.length - 4) * 64;

  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (customLogoImg) ctx.drawImage(customLogoImg, 1512, 14, 58, 58);

  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("DAILY EXPORT PROGRAM EXECUTIVE DASHBOARD", 30, 42);
  ctx.fillStyle = "#475569";
  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`Depot: ${programData.depot}   |   Program Date: ${programData.date}   |   Handover Date: ${programData.handover}`, 30, 72);
  ctx.fillStyle = "#2563EB";
  ctx.fillRect(30, 86, 1540, 4);

  ctx.fillStyle = "#1E3A8A";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("1. EXPORT SCHEDULE & TRANSPORTER ALLOCATION", 30, 116);

  let startY = 130;
  // Wide last column so cargo details such as "New JS: 2×23'" are fully visible
  const colWidths = [105, 55, 80, 105, 90, 60, 105, 140, 140, 75, 75, 70, 440];
  const colX = colWidths.map((_, i) => 30 + sum(colWidths.slice(0, i)));
  const headers = ["Prog Date", "Depot", "Buyer", "ERP / Unit", "Vol (CBM)", "Cargos", "Handover", "Merchandiser", "Commercial", "Salim", "Shahjoki", "New JS", "Cargo Details (Vehicle Size)"];

  ctx.fillStyle = "#1E3A8A";
  ctx.fillRect(30, startY, 1540, 38);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 13px sans-serif";
  headers.forEach((h, i) => ctx.fillText(h, colX[i] + 5, startY + 24));
  startY += 38;

  rows.forEach((r, idx) => {
    const info = rowInfo(r);
    ctx.fillStyle = idx % 2 === 0 ? "#FFFFFF" : "#F1F5F9";
    ctx.fillRect(30, startY, 1540, 34);
    ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 1;
    ctx.strokeRect(30, startY, 1540, 34);
    const vals = [r.date, r.depot, r.buyer, r.erp, (Number(r.cbm) || 0).toFixed(2), info.cargos, r.handover, r.merch, r.comm,
      info.per.salim, info.per.shahjoki, info.per.newjs, info.details];
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 12.5px sans-serif";
    vals.forEach((v, i) => ctx.fillText(String(v ?? ""), colX[i] + 5, startY + 22));
    startY += 34;
  });

  // Grand total row
  ctx.fillStyle = "#DBEAFE";
  ctx.fillRect(30, startY, 1540, 36);
  ctx.strokeStyle = "#2563EB";
  ctx.strokeRect(30, startY, 1540, 36);
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 12.5px sans-serif";
  const gt = [[0, "Grand Total"], [3, `${rows.length} Units`], [4, T.cbm.toFixed(2)], [5, String(T.cargos)],
    [9, `${T.per.salim} (${pct(T.per.salim, T.cargos)})`], [10, `${T.per.shahjoki} (${pct(T.per.shahjoki, T.cargos)})`],
    [11, `${T.per.newjs} (${pct(T.per.newjs, T.cargos)})`], [12, T.details]];
  gt.forEach(([i, txt]) => ctx.fillText(txt, colX[i] + 8, startY + 23));

  // Section 2
  startY += 58;
  ctx.fillStyle = "#1E3A8A";
  ctx.font = "bold 18px sans-serif";
  ctx.fillText("2. SUMMARY BREAKDOWN & TRANSPORTER CARGO ALLOCATION", 30, startY);
  startY += 15;
  const colWidths2 = [260, 130, 110];
  ctx.fillStyle = "#2563EB";
  ctx.fillRect(30, startY, 500, 34);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 13.5px sans-serif";
  ["Buyer / ERP", "Volume (CBM)", "Cargos"].forEach((h, i) => ctx.fillText(h, 30 + sum(colWidths2.slice(0, i)) + 10, startY + 22));
  startY += 34;
  rows.forEach(r => {
    const info = rowInfo(r);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(30, startY, 500, 32);
    ctx.strokeStyle = "#CBD5E1";
    ctx.strokeRect(30, startY, 500, 32);
    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 13.5px sans-serif";
    [`${r.buyer} - ${r.erp}`, `${(Number(r.cbm) || 0).toFixed(2)} CBM`, `${info.cargos} Cargos`]
      .forEach((v, i) => ctx.fillText(v, 30 + sum(colWidths2.slice(0, i)) + 10, startY + 21));
    startY += 30;
  });
  ctx.fillStyle = "#DBEAFE";
  ctx.fillRect(30, startY, 500, 34);
  ctx.strokeStyle = "#2563EB";
  ctx.strokeRect(30, startY, 500, 34);
  ctx.fillStyle = "#0F172A";
  ctx.font = "bold 13.5px sans-serif";
  ctx.fillText("Grand Total", 40, startY + 22);
  ctx.fillText(`${T.cbm.toFixed(2)} CBM`, 298, startY + 22);
  ctx.fillText(`${T.cargos} Cargos`, 428, startY + 22);

  // Donut: transporter share
  const pieX = 730, pieY = startY - 70, outerR = 88, innerR = 48;
  const slices = TRANSPORTERS.map(t => ({
    label: `${t.label}: ${T.per[t.key]} (${pct(T.per[t.key], T.cargos)})`, count: T.per[t.key], color: t.color
  }));
  let ang = -0.5 * Math.PI;
  slices.forEach(d => {
    if (!d.count || !T.cargos) return;
    const sa = d.count / T.cargos * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(pieX, pieY, outerR, ang, ang + sa);
    ctx.arc(pieX, pieY, innerR, ang + sa, ang, true);
    ctx.closePath();
    ctx.fillStyle = d.color; ctx.fill();
    ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3; ctx.stroke();
    ang += sa;
  });
  ctx.fillStyle = "#1E3A8A";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("Transporter Cargo Share (%)", pieX - 100, pieY - outerR - 15);
  let ly = pieY - 32;
  slices.forEach(d => {
    ctx.fillStyle = d.color; ctx.fillRect(pieX + 115, ly, 18, 18);
    ctx.fillStyle = "#0F172A"; ctx.font = "bold 13.5px sans-serif";
    ctx.fillText(d.label, pieX + 142, ly + 14);
    ly += 30;
  });

  // Fleet bar chart
  const barX = 1180, barY = pieY - outerR + 20, chartW = 380, chartH = 160;
  ctx.strokeStyle = "#CBD5E1"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(barX, barY); ctx.lineTo(barX, barY + chartH); ctx.lineTo(barX + chartW, barY + chartH); ctx.stroke();
  ctx.fillStyle = "#1E3A8A"; ctx.font = "bold 15px sans-serif";
  ctx.fillText("Vehicle Fleet Distribution", barX + 90, barY - 15);
  const fleet = Object.entries(T.fleet).map(([f, n]) => ({ f: Number(f), n })).sort((a, b) => b.f - a.f);
  const totalVeh = sum(fleet.map(x => x.n)) || 1;
  const maxN = Math.max(1, ...fleet.map(x => x.n));
  const step = Math.min(110, (chartW - 40) / Math.max(1, fleet.length)), bw = Math.min(60, step - 20);
  fleet.forEach((x, i) => {
    const bh = Math.floor(x.n / maxN * (chartH - 30));
    const bx = barX + 40 + i * step, by = barY + chartH - bh;
    ctx.fillStyle = "#3B82F6"; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = "#1E3A8A"; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = "#0F172A"; ctx.font = "bold 13px sans-serif";
    ctx.fillText(`${x.n} (${pct(x.n, totalVeh)})`, bx - 5, by - 8);
    ctx.fillText(`${String(x.f).padStart(2, "0")} Feet`, bx + 5, barY + chartH + 22);
  });
}

/* ---------- downloads ---------- */
function fileStem() { return `Daily_Export_Program_Executive_Dashboard_${programData.date}`; }

function downloadImage() {
  const canvas = document.getElementById("dashboardCanvas");
  const link = document.createElement("a");
  link.download = fileStem() + ".jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.click();
}

function downloadExcel() {
  if (typeof XLSX === "undefined") { alert("Excel library did not load. Check your internet connection and reload."); return; }
  const T = totals(), rows = programData.rows;
  const wsData = [
    ["DAILY EXPORT PROGRAM EXECUTIVE DASHBOARD"],
    [`Depot: ${programData.depot}`, `Program Date: ${programData.date}`, `Handover Date: ${programData.handover}`],
    [],
    ["1. EXPORT SCHEDULE & TRANSPORTER ALLOCATION"],
    ["Program Date", "Depot", "Buyer", "ERP / Unit", "Volume (CBM)", "Cargos", "Handover Date", "Merchandiser", "Commercial", "Salim Cargo", "Shahjoki", "New JS", "Cargo Details (Vehicle Size)"],
    ...rows.map(r => { const i = rowInfo(r);
      return [r.date, r.depot, r.buyer, r.erp, Number(r.cbm) || 0, i.cargos, r.handover, r.merch, r.comm, i.per.salim, i.per.shahjoki, i.per.newjs, i.details]; }),
    ["Grand Total", "", "", `${rows.length} Units`, T.cbm, T.cargos, "", "", "",
      `${T.per.salim} (${pct(T.per.salim, T.cargos)})`, `${T.per.shahjoki} (${pct(T.per.shahjoki, T.cargos)})`, `${T.per.newjs} (${pct(T.per.newjs, T.cargos)})`, T.details],
    [],
    ["2. SUMMARY BREAKDOWN & TRANSPORTER CARGO ALLOCATION"],
    ["Buyer / ERP Line", "Volume (CBM)", "Cargos"],
    ...rows.map(r => [`${r.buyer} - ${r.erp}`, Number(r.cbm) || 0, rowInfo(r).cargos]),
    ["Grand Total", T.cbm, T.cargos]
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [15, 12, 14, 16, 15, 12, 16, 22, 22, 14, 14, 14, 80].map(wch => ({ wch }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Executive Dashboard");
  XLSX.writeFile(wb, fileStem() + ".xlsx");
}

/* ---------- editor ---------- */
function setupEditor() {
  const box = document.getElementById("jsonBox"), msg = document.getElementById("editMsg");
  const show = () => { box.value = JSON.stringify(programData, null, 2); };
  show();
  document.getElementById("applyBtn").onclick = () => {
    try {
      const next = JSON.parse(box.value);
      if (!Array.isArray(next.rows)) throw new Error('"rows" must be a list');
      programData = next;
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
      msg.textContent = ""; drawDashboard();
    } catch (e) { msg.textContent = "Cannot apply: " + e.message; }
  };
  document.getElementById("resetBtn").onclick = () => {
    try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
    programData = JSON.parse(JSON.stringify(window.DEFAULT_PROGRAM));
    show(); msg.textContent = ""; drawDashboard();
  };
}

/* ---------- boot ---------- */
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("jpgBtn").onclick = downloadImage;
  document.getElementById("xlsxBtn").onclick = downloadExcel;
  setupEditor();
  drawDashboard();
  const img = new Image();
  img.onload = () => { customLogoImg = img; drawDashboard(); };
  img.src = "icons/logo-192.png";
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
