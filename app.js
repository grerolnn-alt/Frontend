const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const categories = ["Elektronik","Furniture","Aksesoris","Peralatan","ATK","Lainnya"];
const iconColors = ["blue","violet","green","orange"];
let toastTimer;

function escapeHtml(value="") {
  return String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function badge(status) {
  const styles = {"Tersedia":"status-green","Perlu diperiksa":"status-orange","Dalam perbaikan":"status-red","Dipinjam":"status-blue"};
  return `<span class="status-pill ${styles[status] || "status-gray"}">${escapeHtml(status)}</span>`;
}
function itemCell(item) {
  return `<div class="item-name"><span class="item-thumb">${item.photo?`<img src="${escapeHtml(item.photo)}" alt="">`:item.icon}</span><span class="item-copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.category)}</small></span></div>`;
}
function switchView(name) {
  $$(".view").forEach(view => view.classList.toggle("active",view.id === `view-${name}`));
  $$(".nav-link").forEach(link => link.classList.toggle("active",link.dataset.view === name));
  const labels = {overview:"Ringkasan",warehouse:"Gudang",inventory:"Inventory",clients:"Client",invoices:"Invoice",stocktake:"Stock Opname"};
  $("#breadcrumb-current").textContent = labels[name] || labels.overview;
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
function openModal(id) {
  const modal = document.getElementById(id);
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");
  const focusable = modal.querySelector("input:not([type=file]),select");
  if(focusable) setTimeout(()=>focusable.focus(),30);
}
function closeModals() {
  $$(".modal-backdrop").forEach(modal=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true");});
}
function showToast(message) {
  const toast=$("#toast");toast.textContent=message;toast.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}
document.addEventListener("click",event=>{
  const viewLink=event.target.closest("[data-view], [data-view-link]");
  if(viewLink){switchView(viewLink.dataset.view||viewLink.dataset.viewLink);return;}
  if(event.target.closest('[data-action="close-modal"]')){closeModals();return;}
  if(event.target.classList.contains("modal-backdrop"))closeModals();
});
$("#mobile-menu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeModals();});
const wibDateTimeFormatter=new Intl.DateTimeFormat("id-ID",{
  weekday:"short",day:"numeric",month:"short",year:"numeric",
  hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"Asia/Jakarta"
});
let syncedWibEpoch;
let syncedWibAt;
let clockSyncTimer;
async function syncWibClock() {
  const label=$("#today-label");
  try {
    const response=await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia%2FJakarta",{cache:"no-store"});
    if(!response.ok)throw new Error(`Layanan waktu merespons HTTP ${response.status}.`);
    const data=await response.json();
    const epoch=Date.parse(data.dateTime);
    if(data.timeZone!=="Asia/Jakarta"||!Number.isFinite(epoch))throw new Error("Respons layanan waktu WIB tidak valid.");
    syncedWibEpoch=epoch;
    syncedWibAt=performance.now();
    label.dataset.syncStatus="synced";
    label.title="Waktu tersinkronisasi dari layanan waktu dunia (WIB)";
  } catch(error) {
    label.dataset.syncStatus="error";
    label.title="Waktu WIB tidak dapat disinkronkan. Periksa koneksi internet.";
    label.textContent="Waktu WIB tidak tersedia";
    console.error("Gagal menyinkronkan waktu WIB:",error);
    clearInterval(clockSyncTimer);
    clockSyncTimer=setInterval(syncWibClock,30000);
    return;
  }
  clearInterval(clockSyncTimer);
  clockSyncTimer=setInterval(syncWibClock,60000);
  renderWibClock();
}
function renderWibClock() {
  if(!Number.isFinite(syncedWibEpoch)||!Number.isFinite(syncedWibAt))return;
  const currentWibTime=new Date(syncedWibEpoch+performance.now()-syncedWibAt);
  $("#today-label").textContent=wibDateTimeFormatter.format(currentWibTime)+" WIB";
}
setInterval(renderWibClock,1000);
syncWibClock();
initializeWarehouse();
initializeInventory();
initializeStocktake();
initializeClients();
initializeInvoices();
initializeWorkspaceSwitcher();
initializeProfile();
renderCategories();
renderTables();
renderOpname();
renderClients();
renderInvoices();
