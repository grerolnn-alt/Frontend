let opnameRecords=[];
let opnamePhotoUrl="";

function updateDifference() {
  const item=items.find(entry=>entry.id===Number($("#opname-item").value));
  const quantity=$("#physical-stock").value;
  const box=$("#difference-box");
  box.classList.remove("positive-diff","negative-diff");
  if(!item){$("#system-stock").textContent="—";$("#stock-difference").textContent="—";$("#difference-label").textContent="Pilih barang";return;}
  $("#system-stock").textContent=item.stock;
  if(quantity===""){ $("#stock-difference").textContent="—";$("#difference-label").textContent="Isi stok fisik";return; }
  const difference=Number(quantity)-item.stock;
  $("#stock-difference").textContent=difference>0?`+${difference}`:difference;
  $("#difference-label").textContent=difference===0?"Sesuai stok":difference>0?"Stok lebih":"Stok kurang";
  if(difference>0)box.classList.add("positive-diff");
  if(difference<0)box.classList.add("negative-diff");
}
function renderOpname() {
  const itemId=Number($("#opname-item").value);
  $("#opname-item").innerHTML=`<option value="">Pilih barang yang akan diperiksa</option>${items.map(item=>`<option value="${item.id}">${escapeHtml(item.name)} — ${escapeHtml(item.serial)}</option>`).join("")}`;
  if(itemId)$("#opname-item").value=String(itemId);
  const total=Math.max(items.length,12),checked=new Set(opnameRecords.map(record=>record.itemId)).size,match=opnameRecords.filter(record=>record.difference===0).length;
  $("#checked-progress").textContent=`${checked} / ${total}`;
  $("#progress-bar").style.width=`${Math.min(checked/total*100,100)}%`;
  $("#match-count").textContent=`${match} barang`;
  $("#mismatch-count").textContent=`${opnameRecords.length-match} barang`;
  $("#unchecked-count").textContent=`${Math.max(total-checked,0)} barang`;
  $("#opname-history").innerHTML=opnameRecords.length?[...opnameRecords].reverse().slice(0,5).map(record=>`<div class="opname-record"><span class="record-icon">☷</span><span class="record-copy"><strong>${escapeHtml(record.name)}</strong><small>${record.time} · Sistem ${record.system} · Fisik ${record.physical}</small>${record.notes?`<small>Catatan: ${escapeHtml(record.notes)}</small>`:""}</span><span class="record-diff ${record.difference===0?"match":"mismatch"}">${record.difference>0?"+":""}${record.difference}</span>${record.photo?`<img class="opname-record-photo" src="${escapeHtml(record.photo)}" alt="Dokumentasi ${escapeHtml(record.name)}">`:""}</div>`).join(""):`<div class="empty-state"><span>☷</span><strong>Belum ada pemeriksaan</strong><small>Hasil pemeriksaan akan muncul di sini.</small></div>`;
  updateDifference();
}
function setPhotoPreview(input,preview) {
  const file=input.files?.[0];
  if(!file){preview.replaceChildren();return "";}
  if(!file.type.startsWith("image/")){showToast("Pilih file gambar untuk dokumentasi.");input.value="";preview.replaceChildren();return "";}
  if(file.size>10*1024*1024){showToast("Ukuran foto maksimal 10 MB.");input.value="";preview.replaceChildren();return "";}
  const image=document.createElement("img");image.alt="Pratinjau foto";image.src=URL.createObjectURL(file);
  preview.replaceChildren(image);
  return image.src;
}
function initializeStocktake() {
  $("#opname-item").addEventListener("change",updateDifference);
  $("#physical-stock").addEventListener("input",updateDifference);
  $("#opname-photo").addEventListener("change",event=>{opnamePhotoUrl=setPhotoPreview(event.target,$("#opname-preview"))||"";});
  $("#stocktake-form").addEventListener("submit",event=>{
    event.preventDefault();
    const item=items.find(entry=>entry.id===Number($("#opname-item").value));
    if(!item){showToast("Pilih barang yang akan diperiksa.");return;}
    const physical=Number($("#physical-stock").value),difference=physical-item.stock,now=new Date();
    opnameRecords=opnameRecords.filter(record=>record.itemId!==item.id);
    const notes=$("#inspection-notes").value.trim();
    opnameRecords.push({itemId:item.id,name:item.name,system:item.stock,physical,difference,notes,photo:opnamePhotoUrl,time:new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit"}).format(now)});
    item.history.unshift({title:"Stock opname",detail:`Stok sistem ${item.stock} · Fisik ${physical} · Selisih ${difference>0?"+":""}${difference}${notes?` · ${notes}`:""} · Hari ini`});
    renderOpname();$("#inspection-notes").value="";$("#physical-stock").value="";$("#opname-photo").value="";$("#opname-preview").replaceChildren();opnamePhotoUrl="";updateDifference();showToast("Hasil stock opname berhasil disimpan.");
  });
  $("#reset-opname").addEventListener("click",()=>setTimeout(()=>{updateDifference();$("#opname-preview").replaceChildren();opnamePhotoUrl="";},0));
}
