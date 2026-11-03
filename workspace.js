let activeWarehouseId="jakarta";
const warehouses=[
  {id:"jakarta",name:"Gudang Utama",location:"Surabaya, Jawa Timur",items,nextId,opnameRecords,recentActivities},
  {id:"jember",name:"Gudang Jember",location:"Jember, Jawa Timur",items:[],nextId:1,opnameRecords:[],recentActivities:[]},
  {id:"banyuwangi",name:"Gudang Banyuwangi",location:"Banyuwangi, Jawa Timur",items:[],nextId:1,opnameRecords:[],recentActivities:[]}
];

function saveActiveWarehouse() {
  const warehouse=warehouses.find(entry=>entry.id===activeWarehouseId);
  if(!warehouse)throw new Error(`Gudang aktif tidak ditemukan: ${activeWarehouseId}`);
  warehouse.items=items;
  warehouse.nextId=nextId;
  warehouse.opnameRecords=opnameRecords;
  warehouse.recentActivities=recentActivities;
}
function renderWorkspaceMenu() {
  const menu=$("#workspace-menu");
  menu.innerHTML=warehouses.map(warehouse=>`<button type="button" class="workspace-option${warehouse.id===activeWarehouseId?" selected":""}" role="menuitemradio" aria-checked="${warehouse.id===activeWarehouseId}" data-warehouse-id="${warehouse.id}"><span class="workspace-option-icon">⌂</span><span class="workspace-option-copy"><strong>${escapeHtml(warehouse.name)}</strong><small>${escapeHtml(warehouse.location)}</small></span>${warehouse.id===activeWarehouseId?'<span class="workspace-check">✓</span>':""}</button>`).join("");
}
function setWorkspaceMenuOpen(open) {
  const menu=$("#workspace-menu");
  const toggle=$("#workspace-toggle");
  menu.hidden=!open;
  toggle.setAttribute("aria-expanded",String(open));
}
function selectWarehouse(warehouseId) {
  if(warehouseId===activeWarehouseId)return;
  const nextWarehouse=warehouses.find(entry=>entry.id===warehouseId);
  if(!nextWarehouse)throw new Error(`Gudang tidak dikenal: ${warehouseId}`);
  saveActiveWarehouse();
  activeWarehouseId=nextWarehouse.id;
  items=nextWarehouse.items;
  nextId=nextWarehouse.nextId;
  opnameRecords=nextWarehouse.opnameRecords;
  recentActivities=nextWarehouse.recentActivities;
  $("#workspace-name").textContent=nextWarehouse.name;
  $("#workspace-location").textContent=nextWarehouse.location;
  $("#workspace-toggle").setAttribute("aria-label",`Gudang aktif: ${nextWarehouse.name}, ${nextWarehouse.location}`);
  $("#profile-workspace-name").textContent=`${nextWarehouse.name} — ${nextWarehouse.location}`;
  setWorkspaceMenuOpen(false);
  $("#inventory-search").value="";
  $("#category-filter").value="";
  $("#status-filter").value="";
  $("#warehouse-search").value="";
  $("#warehouse-status").value="";
  $("#client-search").value="";
  renderWorkspaceMenu();
  renderCategories();
  renderTables();
  renderClients();
  renderInvoices();
}
function initializeWorkspaceSwitcher() {
  const toggle=$("#workspace-toggle");
  const menu=$("#workspace-menu");
  toggle.setAttribute("aria-label","Gudang aktif: Gudang Utama, Surabaya, Jawa Timur");
  renderWorkspaceMenu();
  toggle.addEventListener("click",()=>setWorkspaceMenuOpen(menu.hidden));
  menu.addEventListener("click",event=>{
    const option=event.target.closest("[data-warehouse-id]");
    if(option)selectWarehouse(option.dataset.warehouseId);
  });
  document.addEventListener("click",event=>{
    if(event.target.closest('[data-action="open-workspace-picker"]')){
      setWorkspaceMenuOpen(menu.hidden);
      return;
    }
    if(!event.target.closest(".workspace-picker")){
      setWorkspaceMenuOpen(false);
    }
  });
  toggle.addEventListener("keydown",event=>{
    if(event.key==="ArrowDown"){
      event.preventDefault();
      setWorkspaceMenuOpen(true);
      menu.querySelector(".workspace-option")?.focus();
    }
  });
  menu.addEventListener("keydown",event=>{
    const options=[...menu.querySelectorAll(".workspace-option")];
    const index=options.indexOf(document.activeElement);
    if(event.key==="Escape"){
      setWorkspaceMenuOpen(false);
      toggle.focus();
    }else if(event.key==="ArrowDown"||event.key==="ArrowUp"){
      event.preventDefault();
      const direction=event.key==="ArrowDown"?1:-1;
      options[(index+direction+options.length)%options.length].focus();
    }
  });
}
