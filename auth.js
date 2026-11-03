const accountStorageKey="stockroom.accounts";
const sessionStorageKey="stockroom.session";
const passwordIterations=210000;

function readAccounts() {
  const saved=localStorage.getItem(accountStorageKey);
  if(!saved)return [];
  const accounts=JSON.parse(saved);
  if(!Array.isArray(accounts))throw new Error("Data akun tidak valid. Hapus data akun lokal lalu buat akun baru.");
  return accounts;
}
function encodeHex(bytes) {
  return [...new Uint8Array(bytes)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
}
async function hashPassword(password,salt,iterations=passwordIterations) {
  if(!globalThis.crypto?.subtle)throw new Error("Fitur akun memerlukan browser modern dan koneksi aman (HTTPS atau localhost).");
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  return encodeHex(await crypto.subtle.deriveBits({name:"PBKDF2",salt:Uint8Array.from(salt.match(/.{2}/g),byte=>parseInt(byte,16)),iterations,hash:"SHA-256"},key,256));
}
function showAuthMessage(message) {
  const alert=document.querySelector("#auth-message");
  alert.textContent=message;
  alert.hidden=!message;
}
function setAuthMode(register) {
  document.querySelector("#login-form").hidden=register;
  document.querySelector("#register-form").hidden=!register;
  document.querySelector("#auth-title").textContent=register?"Buat akun Stockroom":"Masuk ke Stockroom";
  document.querySelector("#auth-description").textContent=register?"Buat akun untuk mulai mengelola gudang Anda.":"Masuk untuk melanjutkan mengelola gudang Anda.";
  document.querySelector("#auth-switch").textContent=register?"Sudah punya akun? Masuk":"Belum punya akun? Buat akun";
  showAuthMessage("");
}
function setUserDisplay(account) {
  const name=account.name.trim()||account.email.split("@")[0];
  const initials=name.split(/\s+/).slice(0,2).map(part=>part.charAt(0)).join("").toUpperCase();
  document.querySelectorAll("[data-user-name]").forEach(element=>element.textContent=name);
  document.querySelectorAll("[data-user-initials]").forEach(element=>element.textContent=initials||"U");
  document.querySelector("#profile-user-email").textContent=account.email;
}
function startSession(account) {
  sessionStorage.setItem(sessionStorageKey,account.email);
  setUserDisplay(account);
  document.querySelector("#auth-screen").hidden=true;
  document.querySelector("#app-shell").hidden=false;
}
function showLogin() {
  document.querySelector("#app-shell").hidden=true;
  document.querySelector("#auth-screen").hidden=false;
  setAuthMode(false);
}

document.querySelector("#auth-switch").addEventListener("click",()=>{
  setAuthMode(!document.querySelector("#login-form").hidden);
});
document.querySelector("#login-form").addEventListener("submit",async event=>{
  event.preventDefault();
  showAuthMessage("");
  const button=event.currentTarget.querySelector("button[type=submit]");
  button.disabled=true;
  try {
    const email=document.querySelector("#login-email").value.trim().toLowerCase();
    const password=document.querySelector("#login-password").value;
    const account=readAccounts().find(candidate=>candidate.email===email);
    if(!account)throw new Error("Email atau kata sandi tidak sesuai.");
    const passwordHash=await hashPassword(password,account.salt,account.iterations);
    if(passwordHash!==account.passwordHash)throw new Error("Email atau kata sandi tidak sesuai.");
    startSession(account);
  } catch(error) {
    showAuthMessage(error.message||"Tidak dapat masuk. Silakan coba lagi.");
  } finally {
    button.disabled=false;
  }
});
document.querySelector("#register-form").addEventListener("submit",async event=>{
  event.preventDefault();
  showAuthMessage("");
  const button=event.currentTarget.querySelector("button[type=submit]");
  button.disabled=true;
  try {
    const name=document.querySelector("#register-name").value.trim();
    const email=document.querySelector("#register-email").value.trim().toLowerCase();
    const password=document.querySelector("#register-password").value;
    const confirmation=document.querySelector("#register-password-confirm").value;
    if(!name)throw new Error("Nama wajib diisi.");
    if(password!==confirmation)throw new Error("Konfirmasi kata sandi tidak sama.");
    const accounts=readAccounts();
    if(accounts.some(account=>account.email===email))throw new Error("Email ini sudah terdaftar. Silakan masuk.");
    const salt=encodeHex(crypto.getRandomValues(new Uint8Array(16)));
    const account={name,email,salt,iterations:passwordIterations,passwordHash:await hashPassword(password,salt)};
    accounts.push(account);
    localStorage.setItem(accountStorageKey,JSON.stringify(accounts));
    startSession(account);
  } catch(error) {
    showAuthMessage(error.message||"Tidak dapat membuat akun. Silakan coba lagi.");
  } finally {
    button.disabled=false;
  }
});
document.querySelector("#logout-button").addEventListener("click",()=>{
  sessionStorage.removeItem(sessionStorageKey);
  document.querySelector("#profile-modal").classList.remove("open");
  document.querySelector("#profile-modal").setAttribute("aria-hidden","true");
  showLogin();
});

try {
  const email=sessionStorage.getItem(sessionStorageKey);
  const account=readAccounts().find(candidate=>candidate.email===email);
  if(account)startSession(account);
  else {
    sessionStorage.removeItem(sessionStorageKey);
    showLogin();
  }
} catch(error) {
  showLogin();
  showAuthMessage(error.message||"Tidak dapat memuat akun.");
}
