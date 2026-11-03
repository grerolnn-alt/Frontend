let nextInvoiceId = 1;
let invoices = [];

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
}
function renderInvoiceItems() {
  $("#invoice-item-options").innerHTML=items.length?items.map(item=>`<div class="invoice-item-option"><label><input type="checkbox" name="invoice-item" value="${item.id}"><span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.serial)} · stok ${item.stock}</small></span></label><div class="invoice-item-inputs"><input type="number" min="1" max="${item.stock}" value="1" aria-label="Jumlah ${escapeHtml(item.name)}" data-quantity-for="${item.id}" disabled><input type="number" min="0" step="1000" value="100000" aria-label="Harga ${escapeHtml(item.name)}" data-price-for="${item.id}" disabled></div></div>`).join(""):`<div class="empty-state compact-empty">Tambahkan barang ke inventory sebelum membuat invoice.</div>`;
  updateInvoiceTotal();
}
function updateInvoiceTotal() {
  const total=$$('#invoice-item-options input[name="invoice-item"]:checked').reduce((sum,checkbox)=>{
    const quantity=Number($(`[data-quantity-for="${checkbox.value}"]`).value)||0;
    const price=Number($(`[data-price-for="${checkbox.value}"]`).value)||0;
    return sum+quantity*price;
  },0);
  $("#invoice-form-total").textContent=formatCurrency(total);
}
function renderInvoices() {
  const status=$("#invoice-status-filter").value;
  const filtered=invoices.filter(invoice=>!status||invoice.status===status);
  $("#invoice-table").innerHTML=filtered.length?filtered.map(invoice=>{
    const client=clients.find(entry=>entry.id===invoice.clientId);
    return `<tr><td><strong>${escapeHtml(invoice.number)}</strong></td><td>${escapeHtml(client?.name||"Client tidak ditemukan")}</td><td>${escapeHtml(invoice.dateLabel)}</td><td>${escapeHtml(invoice.dueLabel)}</td><td>${formatCurrency(invoice.total)}</td><td><span class="status-pill ${invoice.status==="Lunas"?"status-green":"status-orange"}">${escapeHtml(invoice.status)}</span></td><td><button class="text-button" data-invoice-detail="${invoice.id}">Detail →</button></td></tr>`;
  }).join(""):`<tr><td class="empty-table" colspan="7">Belum ada invoice. Gunakan tombol “Tambah invoice” untuk membuat invoice baru.</td></tr>`;
  $("#invoice-result-count").textContent=`Menampilkan ${filtered.length} dari ${invoices.length} invoice`;
  $("#invoice-total").textContent=`${invoices.length} invoice`;
  $("#invoice-paid").textContent=`${invoices.filter(invoice=>invoice.status==="Lunas").length} invoice`;
  $("#invoice-unpaid").textContent=`${invoices.filter(invoice=>invoice.status!=="Lunas").length} invoice`;
  renderClients();
  updateNotificationCenter();
}
function dateLabel(value) {
  return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(`${value}T00:00:00`));
}
function dateInputValue(value) {
  return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,"0")}-${String(value.getDate()).padStart(2,"0")}`;
}
function showInvoiceDetails(invoiceId) {
  const invoice=invoices.find(entry=>entry.id===Number(invoiceId));
  if(!invoice)return;
  const client=clients.find(entry=>entry.id===invoice.clientId);
  $("#invoice-detail-title").textContent=invoice.number;
  $("#invoice-detail-content").innerHTML=`<div class="detail-grid"><div class="detail-field"><small>Client</small><strong>${escapeHtml(client?.name||"Client tidak ditemukan")}</strong></div><div class="detail-field"><small>Status</small><strong>${escapeHtml(invoice.status)}</strong></div><div class="detail-field"><small>Tanggal invoice</small><strong>${escapeHtml(invoice.dateLabel)}</strong></div><div class="detail-field"><small>Jatuh tempo</small><strong>${escapeHtml(invoice.dueLabel)}</strong></div></div><div class="history-title">Barang pada invoice</div>${invoice.lines.map(line=>`<div class="linked-row"><span class="item-thumb">${line.icon||"▤"}</span><span><strong>${escapeHtml(line.name)}</strong><small>${line.quantity} × ${formatCurrency(line.price)}</small></span><strong>${formatCurrency(line.quantity*line.price)}</strong></div>`).join("")}${invoice.notes?`<div class="detail-field invoice-notes"><small>Catatan</small><strong>${escapeHtml(invoice.notes)}</strong></div>`:""}<div class="invoice-detail-total"><span>Total</span><strong>${formatCurrency(invoice.total)}</strong></div>${invoice.status!=="Lunas"?`<div class="modal-actions"><button class="button button-primary" data-mark-paid="${invoice.id}">Tandai lunas</button></div>`:""}`;
  openModal("invoice-detail-modal");
}
function openInvoiceForm() {
  if(!clients.length){showToast("Tambahkan client terlebih dahulu sebelum membuat invoice.");return;}
  $("#invoice-form").reset();
  renderClients();
  renderInvoiceItems();
  const today=new Date();
  const due=new Date(today);due.setDate(due.getDate()+14);
  $("#invoice-date").value=dateInputValue(today);
  $("#invoice-due-date").value=dateInputValue(due);
  openModal("invoice-modal");
}

function initializeInvoices() {
  document.addEventListener("click",event=>{
    const action=event.target.closest("[data-action]");
    if(action?.dataset.action==="open-invoice"){openInvoiceForm();return;}
    const invoiceDetail=event.target.closest("[data-invoice-detail]");
    if(invoiceDetail){closeModals();showInvoiceDetails(invoiceDetail.dataset.invoiceDetail);return;}
    const markPaid=event.target.closest("[data-mark-paid]");
    if(markPaid){
      const invoice=invoices.find(entry=>entry.id===Number(markPaid.dataset.markPaid));
      if(invoice){invoice.status="Lunas";renderInvoices();showInvoiceDetails(invoice.id);showToast("Invoice ditandai lunas.");}
    }
  });
  $("#invoice-status-filter").addEventListener("change",renderInvoices);
  $("#invoice-item-options").addEventListener("change",event=>{
  const checkbox=event.target.closest('input[name="invoice-item"]');
  if(checkbox){
    $(`[data-quantity-for="${checkbox.value}"]`).disabled=!checkbox.checked;
    $(`[data-price-for="${checkbox.value}"]`).disabled=!checkbox.checked;
  }
  updateInvoiceTotal();
  });
  $("#invoice-item-options").addEventListener("input",updateInvoiceTotal);
  $("#invoice-form").addEventListener("submit",event=>{
  event.preventDefault();
  const selectedItems=$$('input[name="invoice-item"]:checked');
  if(!selectedItems.length){showToast("Pilih setidaknya satu barang untuk invoice.");return;}
  const lines=selectedItems.map(checkbox=>{
    const item=items.find(entry=>entry.id===Number(checkbox.value));
    if(!item)return null;
    const quantity=Number($(`[data-quantity-for="${item.id}"]`).value);
    const price=Number($(`[data-price-for="${item.id}"]`).value);
    if(!Number.isInteger(quantity)||quantity<1||quantity>item.stock||!Number.isFinite(price)||price<0)return null;
    return {itemId:item.id,name:item.name,icon:item.icon,quantity,price};
  });
  if(lines.some(line=>line===null)){showToast("Periksa kembali jumlah dan harga setiap barang pada invoice.");return;}
  const dueDate=$("#invoice-due-date").value,date=$("#invoice-date").value;
  if(dueDate<date){$("#invoice-due-date").setCustomValidity("Tanggal jatuh tempo tidak boleh sebelum tanggal invoice.");$("#invoice-due-date").reportValidity();return;}
  $("#invoice-due-date").setCustomValidity("");
  const clientId=Number($("#invoice-client").value);
  const number=`INV-${new Date(`${date}T00:00:00`).getFullYear()}-${String(nextInvoiceId++).padStart(3,"0")}`;
  const invoice={id:Date.now()+nextInvoiceId,number,clientId,date,dueDate,dateLabel:dateLabel(date),dueLabel:dateLabel(dueDate),lines,total:lines.reduce((sum,line)=>sum+line.quantity*line.price,0),status:"Belum dibayar",notes:$("#invoice-notes").value.trim()};
  invoices.unshift(invoice);
  const client=clients.find(entry=>entry.id===clientId);
  logActivity("Invoice dibuat",client?.name||"Client","Invoice",number);
  renderInvoices();renderTables();event.target.reset();closeModals();showToast("Invoice berhasil dibuat.");
});
}
