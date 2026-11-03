const readNotifications=new Set();

function getNotifications() {
  const pendingItems=items.filter(item=>item.status==="Perlu diperiksa").map(item=>({
    id:`${activeWarehouseId}-item-${item.id}`,view:"warehouse",title:"Barang perlu diperiksa",description:`${item.name} · ${item.serial}`
  }));
  const unpaidInvoices=invoices.filter(invoice=>invoice.status!=="Lunas").map(invoice=>({
    id:`${activeWarehouseId}-invoice-${invoice.id}`,view:"invoices",title:"Invoice belum dibayar",description:`${invoice.number} · ${formatCurrency(invoice.total)}`
  }));
  return [...pendingItems,...unpaidInvoices];
}
function updateNotificationCenter() {
  const notifications=getNotifications();
  const unread=notifications.filter(notification=>!readNotifications.has(notification.id));
  const indicator=$("#notification-toggle .notification-indicator");
  indicator.hidden=unread.length===0;
  $("#notification-toggle").setAttribute("aria-label",unread.length?`Notifikasi, ${unread.length} belum dibaca`:"Notifikasi");
  $("#notification-list").innerHTML=notifications.length?notifications.map(notification=>`<button type="button" class="notification-item" data-notification-view="${notification.view}" data-notification-id="${notification.id}"><span class="notification-item-mark"></span><span><strong>${escapeHtml(notification.title)}</strong><small>${escapeHtml(notification.description)}</small></span></button>`).join(""):`<div class="notification-empty"><span>✓</span><strong>Tidak ada notifikasi</strong><small>Semua aktivitas sudah ditangani.</small></div>`;
}
function initializeProfile() {
  document.addEventListener("click",event=>{
    if(event.target.closest('[data-action="open-profile"]')){
      $("#profile-workspace-name").textContent=`${$("#workspace-name").textContent} — ${$("#workspace-location").textContent}`;
      openModal("profile-modal");
      return;
    }
    const notification=event.target.closest("[data-notification-view]");
    if(notification){
      switchView(notification.dataset.notificationView);
      $("#notification-popover").hidden=true;
      $("#notification-toggle").setAttribute("aria-expanded","false");
      return;
    }
  });
  const toggle=$("#notification-toggle");
  const popover=$("#notification-popover");
  toggle.addEventListener("click",()=>{
    const opening=popover.hidden;
    if(opening){
      getNotifications().forEach(notification=>readNotifications.add(notification.id));
      updateNotificationCenter();
    }
    popover.hidden=!opening;
    toggle.setAttribute("aria-expanded",String(opening));
  });
  $("#notification-clear").addEventListener("click",()=>{
    getNotifications().forEach(notification=>readNotifications.add(notification.id));
    updateNotificationCenter();
  });
  document.addEventListener("click",event=>{
    if(!event.target.closest(".notification-area")){
      popover.hidden=true;
      toggle.setAttribute("aria-expanded","false");
    }
  });
  updateNotificationCenter();
}
