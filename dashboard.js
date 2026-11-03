let recentActivities=[];

function todayDate() {
  return new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"short",year:"numeric"}).format(new Date());
}
function logActivity(title, itemName, category, label) {
  recentActivities.unshift({title,itemName,category,label,date:todayDate()});
  recentActivities=recentActivities.slice(0,12);
}

function renderInventoryChart(totalUnits) {
  const statuses=[["Tersedia","green"],["Dipinjam","blue"],["Perlu diperiksa","orange"],["Dalam perbaikan","red"]];
  $("#chart-total").textContent=`${totalUnits.toLocaleString("id-ID")} unit`;
  $("#inventory-chart").innerHTML=statuses.map(([status,color])=>{
    const count=items.filter(item=>item.status===status).reduce((sum,item)=>sum+item.stock,0);
    const width=totalUnits?Math.max(count/totalUnits*100,count?3:0):0;
    return `<div class="chart-row"><span>${escapeHtml(status)}</span><div class="chart-track"><span class="chart-bar ${color}" style="width:${width}%"></span></div><strong>${count.toLocaleString("id-ID")}</strong></div>`;
  }).join("");
}
function renderActivityTable() {
  const activities = recentActivities.length ? recentActivities.slice(0,4) : [...items].slice(0,4).map(item=>({itemId:item.id,itemName:item.name,category:item.category,title:"Barang masuk",date:item.date,status:item.status}));
  $("#activity-table").innerHTML = activities.map(activity => {
    const item=items.find(entry=>entry.id===activity.itemId);
    return `<tr ${item?`data-detail="${item.id}"`:""}><td class="item-cell">${item?itemCell(item):`<div class="item-name"><span class="item-thumb">${activity.icon||"•"}</span><span class="item-copy"><strong>${escapeHtml(activity.itemName||activity.title)}</strong><small>${escapeHtml(activity.subtitle||"Aktivitas terbaru")}</small></span></div>`}</td><td><span class="category-tag">${escapeHtml(activity.category||"—")}</span></td><td>${escapeHtml(activity.title)}</td><td>${escapeHtml(activity.date)}</td><td>${activity.status?badge(activity.status):`<span class="category-tag">${escapeHtml(activity.label||"Aktivitas")}</span>`}</td></tr>`;
  }).join("");
}
function refreshStats() {
  const needsCheck = items.filter(item => item.status === "Perlu diperiksa").length;
  const totalUnits=items.reduce((sum,item)=>sum+item.stock,0);
  const availableUnits=items.filter(item=>item.status==="Tersedia").reduce((sum,item)=>sum+item.stock,0);
  const usedUnits=items.filter(item=>item.status==="Dipinjam").reduce((sum,item)=>sum+item.stock,0);
  $("#stat-clients").textContent=clients.length.toLocaleString("id-ID");
  $("#stat-items").textContent=totalUnits.toLocaleString("id-ID");
  $("#stat-available").textContent=availableUnits.toLocaleString("id-ID");
  $("#stat-used").textContent=usedUnits.toLocaleString("id-ID");
  $("#warehouse-total").textContent = `${items.length} barang`;
  $("#warehouse-pending").textContent = `${needsCheck} barang`;
  $("#warehouse-category-total").textContent = `${new Set(items.map(item=>item.category)).size} kategori`;
  $("#inventory-total").textContent = totalUnits.toLocaleString("id-ID");
  $("#inventory-available").textContent = availableUnits.toLocaleString("id-ID");
  $("#inventory-review").textContent = needsCheck;
  $("#inventory-repair").textContent = items.filter(item => item.status === "Dalam perbaikan").reduce((sum,item)=>sum+item.stock,0);
  $("#incoming-count").textContent = needsCheck;
  renderInventoryChart(totalUnits);
  updateNotificationCenter();
}
