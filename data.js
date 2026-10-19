// Edit this file (or use "Edit program data" on the page) to change the dashboard.
// trips: { transporterKey: [[vehicleFeet, numberOfVehicles], ...] }
// Transporter keys: salim, shahjoki, newjs   (add more in js/app.js -> TRANSPORTERS)
window.DEFAULT_PROGRAM = {
  depot: "CTG",
  date: "19-Oct-2026",
  handover: "20-Oct-2026",
  rows: [
    { date: "19-Oct-2026", depot: "CTG", buyer: "Buyer A", erp: "ERP-1001", cbm: 52.4, handover: "20-Oct-2026",
      merch: "Merchandiser 1", comm: "Commercial 1", trips: { salim: [[23, 2]], shahjoki: [[23, 1]] } },
    { date: "19-Oct-2026", depot: "CTG", buyer: "Buyer B", erp: "ERP-1002", cbm: 49.8, handover: "20-Oct-2026",
      merch: "Merchandiser 2", comm: "Commercial 1", trips: { salim: [[23, 2]], newjs: [[23, 1]] } },
    { date: "19-Oct-2026", depot: "CTG", buyer: "Buyer C", erp: "ERP-1003", cbm: 33.1, handover: "20-Oct-2026",
      merch: "Merchandiser 1", comm: "Commercial 2", trips: { salim: [[14, 1]], shahjoki: [[23, 2]] } },
    { date: "19-Oct-2026", depot: "CTG", buyer: "Buyer D", erp: "ERP-1004", cbm: 24.6, handover: "20-Oct-2026",
      merch: "Merchandiser 2", comm: "Commercial 2", trips: { salim: [[8, 1]], newjs: [[23, 1]] } }
  ]
};
