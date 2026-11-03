let incomingPhotoUrl="";

function renderCategories() {
  const categoryFilter=$("#category-filter").value;
  const counts=categories.map(category=>[category,items.filter(item=>item.category===category).length]);
  $("#category-grid").innerHTML=counts.map(([name,count],index)=>`<div class="category-card"><span class="category-symbol ${iconColors[index%4]}">${["▣","▤","◉","⌁","▧","◈"][index]}</span><span><strong>${escapeHtml(name)}</strong><small>${count?count+" barang":"Belum ada barang"}</small></span></div>`).join("");
  $("#item-category").innerHTML=`<option value="">Pilih kategori</option>${categories.map(category=>`<option>${escapeHtml(category)}</option>`).join("")}`;
  $("#category-filter").innerHTML=`<option value="">Semua kategori</option>${categories.map(category=>`<option>${escapeHtml(category)}</option>`).join("")}`;
  $("#category-filter").value=categoryFilter;
}
function renderWarehouseTable() {
  const search=($("#warehouse-search").value||"").trim().toLowerCase();
  const status=$("#warehouse-status").value;
  const incoming=items.filter(item=>(!search||`${item.name} ${item.serial}`.toLowerCase().includes(search))&&(!status||item.status===status));
  $("#warehouse-table").innerHTML=incoming.length?incoming.map(item=>`<tr data-detail="${item.id}"><td class="item-cell">${itemCell(item)}</td><td>${escapeHtml(item.serial)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.source)}</td><td>${escapeHtml(item.date)}</td><td>${badge(item.status)}</td></tr>`).join(""):`<tr><td class="empty-table" colspan="6">Tidak ada barang yang sesuai.</td></tr>`;
  $("#warehouse-result-count").textContent=`Menampilkan ${incoming.length} barang`;
}
function initializeWarehouse() {
  document.addEventListener("click",event=>{
    if(event.target.closest('[data-action="open-incoming"]'))openModal("incoming-modal");
  });
  $("#warehouse-search").addEventListener("input",renderWarehouseTable);
  $("#warehouse-status").addEventListener("change",renderWarehouseTable);
  $("#incoming-photo").addEventListener("change",event=>{
    const file=event.target.files?.[0];
    if(!file)return;
    if(!file.type.startsWith("image/")){showToast("Pilih file gambar untuk foto barang.");event.target.value="";return;}
    if(file.size>10*1024*1024){showToast("Ukuran foto maksimal 10 MB.");event.target.value="";return;}
    if(incomingPhotoUrl)URL.revokeObjectURL(incomingPhotoUrl);
    incomingPhotoUrl=URL.createObjectURL(file);
    $("#incoming-photo-label").textContent=file.name;
    $("#incoming-photo-preview").innerHTML=`<img src="${incomingPhotoUrl}" alt="Pratinjau foto barang">`;
  });
  $("#incoming-form").addEventListener("submit",event=>{
    event.preventDefault();
    const name=$("#item-name").value.trim(),serial=$("#item-serial").value.trim();
    if(items.some(item=>item.serial.toLowerCase()===serial.toLowerCase())){$("#item-serial").setCustomValidity("Serial number sudah digunakan.");$("#item-serial").reportValidity();return;}
    $("#item-serial").setCustomValidity("");
    const category=$("#item-category").value,source=$("#item-source").value.trim();
    const item={id:nextId++,name,serial,category,source,date:new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date()),status:$("#item-status").value,icon:category==="Furniture"?"▤":category==="Aksesoris"?"◉":"▣",photo:incomingPhotoUrl,stock:1,history:[{title:"Barang masuk",detail:`Diterima dari ${source} · Hari ini`}]};
    items.unshift(item);
    logActivity("Barang masuk",item.name,item.category,item.status);
    renderCategories();renderTables();renderClients();renderInvoiceItems();
    event.target.reset();$("#incoming-photo-label").textContent="Pilih foto barang";$("#incoming-photo-preview").replaceChildren();
    incomingPhotoUrl="";closeModals();showToast("Barang berhasil ditambahkan ke inventory.");
  });
}
