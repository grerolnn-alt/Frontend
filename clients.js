let nextClientId = 4;
let clients = [
  {id:1,name:"PT Ruang Kreatif",email:"halo@ruangkreatif.id",phone:"+62 812-3456-7890",address:"Jakarta Selatan"},
  {id:2,name:"CV Teknologi Nusantara",email:"admin@teknusantara.id",phone:"+62 811-2233-4455",address:"Bandung"},
  {id:3,name:"Studio Karya Digital",email:"kontak@karyadigital.id",phone:"+62 813-9988-7766",address:"Yogyakarta"}
];

function renderClientItems(selectedIds=[], currentClientId=0) {
  const options=items.filter(item=>item.status==="Tersedia"||item.clientId===currentClientId);
  $("#client-item-options").innerHTML=options.length?options.map(item=>`<label class="check-option"><input type="checkbox" name="client-item" value="${item.id}" ${selectedIds.includes(item.id)?"checked":""}><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.serial)} · ${item.stock} unit</small></span></label>`).join(""):`<div class="empty-state compact-empty">Tidak ada barang tersedia untuk ditugaskan.</div>`;
}
function renderClients() {
  const search=($("#client-search")?.value||"").trim().toLowerCase();
  const filtered=clients.filter(client=>`${client.name} ${client.email} ${client.phone}`.toLowerCase().includes(search));
  $("#client-table").innerHTML=filtered.length?filtered.map(client=>{
    const itemCount=items.filter(item=>item.clientId===client.id).reduce((sum,item)=>sum+item.stock,0);
    const invoiceCount=invoices.filter(invoice=>invoice.clientId===client.id).length;
    return `<tr><td><div class="item-name"><span class="avatar client-avatar">${escapeHtml(client.name.slice(0,1).toUpperCase())}</span><span class="item-copy"><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.address||"Alamat belum diisi")}</small></span></div></td><td>${escapeHtml(client.email)}</td><td>${escapeHtml(client.phone||"—")}</td><td>${itemCount} unit</td><td>${invoiceCount} invoice</td><td><div class="row-actions"><button class="text-button" data-client-detail="${client.id}">Detail</button><button class="more-button" data-edit-client="${client.id}" aria-label="Edit ${escapeHtml(client.name)}">✎</button></div></td></tr>`;
  }).join(""):`<tr><td class="empty-table" colspan="6">Belum ada client yang sesuai dengan pencarian.</td></tr>`;
  $("#client-count").textContent=clients.length;
  $("#client-result-count").textContent=`Menampilkan ${filtered.length} dari ${clients.length} client`;
  const selected=$("#invoice-client").value;
  $("#invoice-client").innerHTML=`<option value="">Pilih client</option>${clients.map(client=>`<option value="${client.id}">${escapeHtml(client.name)}</option>`).join("")}`;
  if(clients.some(client=>String(client.id)===selected))$("#invoice-client").value=selected;
}
function openClientForm(clientId=0) {
  const client=clients.find(entry=>entry.id===Number(clientId));
  $("#client-form").reset();
  $("#client-id").value=client?client.id:"";
  $("#client-modal-title").textContent=client?"Edit client":"Tambah client";
  $("#client-name").value=client?.name||"";
  $("#client-email").value=client?.email||"";
  $("#client-phone").value=client?.phone||"";
  $("#client-address").value=client?.address||"";
  renderClientItems(client?items.filter(item=>item.clientId===client.id).map(item=>item.id):[],client?.id||0);
  openModal("client-modal");
}
function showClientDetails(clientId) {
  const client=clients.find(entry=>entry.id===Number(clientId));
  if(!client)return;
  const used=items.filter(item=>item.clientId===client.id);
  const clientInvoices=invoices.filter(invoice=>invoice.clientId===client.id);
  $("#client-detail-title").textContent=client.name;
  $("#client-detail-content").innerHTML=`<div class="detail-grid"><div class="detail-field"><small>Email</small><strong>${escapeHtml(client.email)}</strong></div><div class="detail-field"><small>Telepon</small><strong>${escapeHtml(client.phone||"—")}</strong></div><div class="detail-field full-detail-field"><small>Alamat</small><strong>${escapeHtml(client.address||"—")}</strong></div></div><div class="history-title">Barang yang digunakan (${used.reduce((sum,item)=>sum+item.stock,0)} unit)</div>${used.length?used.map(item=>`<div class="linked-row"><span class="item-thumb">${item.icon}</span><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.serial)} · ${item.stock} unit</small></span>${badge(item.status)}</div>`).join(""):`<div class="empty-state compact-empty">Client ini belum menggunakan barang.</div>`}<div class="history-title">Invoice (${clientInvoices.length})</div>${clientInvoices.length?clientInvoices.map(invoice=>`<button class="linked-row linked-button" data-invoice-detail="${invoice.id}"><span class="quick-icon quick-violet">▧</span><span><strong>${escapeHtml(invoice.number)}</strong><small>${formatCurrency(invoice.total)} · ${escapeHtml(invoice.status)}</small></span><b>→</b></button>`).join(""):`<div class="empty-state compact-empty">Belum ada invoice untuk client ini.</div>`}`;
  openModal("client-detail-modal");
}

function initializeClients() {
  document.addEventListener("click",event=>{
    const action=event.target.closest("[data-action]");
    if(action?.dataset.action==="open-client"){openClientForm();return;}
    const editClient=event.target.closest("[data-edit-client]");
    if(editClient){openClientForm(editClient.dataset.editClient);return;}
    const clientDetail=event.target.closest("[data-client-detail]");
    if(clientDetail)showClientDetails(clientDetail.dataset.clientDetail);
  });
  $("#client-search").addEventListener("input",renderClients);
  $("#client-form").addEventListener("submit",event=>{
  event.preventDefault();
  const clientId=Number($("#client-id").value)||0;
  const email=$("#client-email").value.trim().toLowerCase();
  if(clients.some(client=>client.id!==clientId&&client.email.toLowerCase()===email)){
    $("#client-email").setCustomValidity("Email sudah digunakan client lain.");
    $("#client-email").reportValidity();return;
  }
  $("#client-email").setCustomValidity("");
  const selectedIds=$$('input[name="client-item"]:checked').map(input=>Number(input.value));
  const client=clientId?clients.find(entry=>entry.id===clientId):{id:nextClientId++};
  if(!client)return;
  client.name=$("#client-name").value.trim();
  client.email=$("#client-email").value.trim();
  client.phone=$("#client-phone").value.trim();
  client.address=$("#client-address").value.trim();
  if(!clientId)clients.unshift(client);
  items.forEach(item=>{
    if(item.clientId===client.id&&!selectedIds.includes(item.id)){
      delete item.clientId;
      item.status="Tersedia";
      item.history.unshift({title:"Barang dikembalikan",detail:`Tidak lagi digunakan oleh ${client.name} · Hari ini`});
    }
    if(selectedIds.includes(item.id)){
      const newlyAssigned=item.clientId!==client.id;
      item.clientId=client.id;
      item.status="Dipinjam";
      if(newlyAssigned)item.history.unshift({title:"Barang digunakan",detail:`Digunakan oleh ${client.name} · Hari ini`});
    }
  });
  logActivity(clientId?"Client diperbarui":"Client ditambahkan",client.name,"Client","Data client");
  renderClients();renderTables();closeModals();showToast(clientId?"Data client berhasil diperbarui.":"Client berhasil ditambahkan.");
});
}
