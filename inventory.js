const initialItems = [
  {id:1,name:"MacBook Pro 14” M3",serial:"MBP-2024-0081",category:"Elektronik",source:"Pembelian",date:"28 Okt 2026",status:"Tersedia",icon:"▣",stock:8,history:[{title:"Barang masuk",detail:"Diterima dari Pembelian · 28 Okt 2026"}]},
  {id:2,name:"Kursi Ergonomis Office",serial:"FUR-2024-0142",category:"Furniture",source:"Vendor",date:"27 Okt 2026",status:"Tersedia",icon:"▤",stock:15,history:[{title:"Barang masuk",detail:"Diterima dari Vendor · 27 Okt 2026"}]},
  {id:3,name:"Monitor LG UltraWide 29”",serial:"MON-2024-0036",category:"Elektronik",source:"Pembelian",date:"26 Okt 2026",status:"Perlu diperiksa",icon:"▣",stock:4,history:[{title:"Barang masuk",detail:"Diterima dari Pembelian · 26 Okt 2026"}]},
  {id:4,name:"Logitech MX Master 3S",serial:"ACC-2024-0217",category:"Aksesoris",source:"Transfer",date:"25 Okt 2026",status:"Tersedia",icon:"◉",stock:12,history:[{title:"Barang masuk",detail:"Diterima dari Transfer · 25 Okt 2026"}]},
  {id:5,name:"Meja Kerja Minimalis",serial:"FUR-2024-0098",category:"Furniture",source:"Vendor",date:"24 Okt 2026",status:"Dalam perbaikan",icon:"▤",stock:6,history:[{title:"Barang masuk",detail:"Diterima dari Vendor · 24 Okt 2026"}]},
  {id:6,name:"iPad Air 11”",serial:"TAB-2024-0055",category:"Elektronik",source:"Pembelian",date:"23 Okt 2026",status:"Dipinjam",icon:"▣",stock:5,clientId:1,history:[{title:"Dipinjam",detail:"Digunakan oleh PT Ruang Kreatif · 29 Okt 2026"},{title:"Barang masuk",detail:"Diterima dari Pembelian · 23 Okt 2026"}]},
  {id:7,name:"Headset Sony WH-1000XM5",serial:"AUD-2024-0029",category:"Aksesoris",source:"Vendor",date:"22 Okt 2026",status:"Tersedia",icon:"◉",stock:9,history:[{title:"Barang masuk",detail:"Diterima dari Vendor · 22 Okt 2026"}]},
  {id:8,name:"Proyektor Epson EB-E01",serial:"PRJ-2024-0012",category:"Elektronik",source:"Hibah",date:"20 Okt 2026",status:"Perlu diperiksa",icon:"▣",stock:2,history:[{title:"Barang masuk",detail:"Diterima dari Hibah · 20 Okt 2026"}]}
];
let items=[...initialItems];
let nextId=9;

function renderTables() {
  const search=($("#inventory-search").value||"").trim().toLowerCase();
  const category=$("#category-filter").value;
  const status=$("#status-filter").value;
  const filtered=items.filter(item=>(!search||`${item.name} ${item.serial} ${item.source}`.toLowerCase().includes(search))&&(!category||item.category===category)&&(!status||item.status===status));
  $("#inventory-table").innerHTML=filtered.length?filtered.map(item=>`<tr data-detail="${item.id}"><td class="item-cell">${itemCell(item)}</td><td>${escapeHtml(item.serial)}</td><td><span class="category-tag">${escapeHtml(item.category)}</span></td><td>${escapeHtml(item.source)}</td><td>${escapeHtml(item.date)}</td><td>${badge(item.status)}</td><td><button class="more-button" data-detail="${item.id}" aria-label="Lihat detail">···</button></td></tr>`).join(""):`<tr><td class="empty-table" colspan="7">Tidak ada barang yang sesuai dengan pencarian.</td></tr>`;
  $("#inventory-count").textContent=filtered.length;
  $("#inventory-result-count").textContent=`Menampilkan ${filtered.length} dari ${items.length} barang`;
  renderWarehouseTable();
  renderActivityTable();
  refreshStats();
  renderOpname();
}
function showDetails(id) {
  const item=items.find(entry=>entry.id===Number(id));if(!item)return;
  $("#detail-title").textContent=item.name;
  $("#detail-content").innerHTML=`<div class="detail-summary"><span class="item-thumb">${item.photo?`<img src="${escapeHtml(item.photo)}" alt="Foto ${escapeHtml(item.name)}">`:item.icon}</span><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.serial)}</p></div><span style="margin-left:auto">${badge(item.status)}</span></div><div class="detail-grid"><div class="detail-field"><small>Kategori</small><strong>${escapeHtml(item.category)}</strong></div><div class="detail-field"><small>Serial number</small><strong>${escapeHtml(item.serial)}</strong></div><div class="detail-field"><small>Sumber barang</small><strong>${escapeHtml(item.source)}</strong></div><div class="detail-field"><small>Tanggal masuk</small><strong>${escapeHtml(item.date)}</strong></div><div class="detail-field"><small>Stok sistem</small><strong>${item.stock} unit</strong></div><div class="detail-field"><small>Status barang</small><strong>${escapeHtml(item.status)}</strong></div></div><div class="history-title">Riwayat barang</div>${item.history.map(entry=>`<div class="history-item"><span class="history-dot"></span><span><strong>${escapeHtml(entry.title)}</strong><small>${escapeHtml(entry.detail)}</small></span></div>`).join("")}`;
  openModal("detail-modal");
}
function initializeInventory() {
  document.addEventListener("click",event=>{
    const detail=event.target.closest("[data-detail]");
    if(detail)showDetails(detail.dataset.detail);
  });
  $("#inventory-search").addEventListener("input",renderTables);
  $("#category-filter").addEventListener("change",renderTables);
  $("#status-filter").addEventListener("change",renderTables);
  $("#export-button").addEventListener("click",()=>{
    const rows=[["Nama barang","Serial number","Kategori","Sumber barang","Tanggal masuk","Status"],...items.map(item=>[item.name,item.serial,item.category,item.source,item.date,item.status])];
    const csv=rows.map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(",")).join("\r\n");
    const link=document.createElement("a");link.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));link.download="inventory-stockroom.csv";link.click();URL.revokeObjectURL(link.href);showToast("Data inventory berhasil diexport.");
  });
}
