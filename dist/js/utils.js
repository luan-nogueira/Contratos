export const $ = (id) => document.getElementById(id);
export const txt = (id, val) => { const el = $(id); if (el) el.textContent = val; };
export const html = (id, val) => { const el = $(id); if (el) el.innerHTML = val; };
export const show = (id, ok, disp = "block") => { const el = $(id); if (el) el.style.display = ok ? disp : "none"; };

export const emailKey = (email) => String(email || "").trim().toLowerCase();
export const pad2 = (n) => String(n).padStart(2, "0");
export const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
export const agoraISO = () => new Date().toISOString();
export const agoraBR = () => {
  const d = new Date();
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
export const formatarDataBR = (dataISO) => {
  if (!dataISO) return "";
  const [y, m, d] = dataISO.split("-");
  return `${d}/${m}/${y}`;
};
export const formatarDataHoraBR = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
export const ymFromISO = (dataISO) => (!dataISO || dataISO.length < 7 ? "" : dataISO.slice(0, 7));
export const inMesAno = (dataISO, y, m) => !!dataISO && dataISO.startsWith(`${y}-${m}-`);
export const idSeguro = (str) =>
  String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 80);

export function toast(msg, type = "success") {
  const stack = document.getElementById("toastStack");
  if (!stack) return;
  const t = document.createElement("div");
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  stack.appendChild(t);
  setTimeout(() => t.classList.add("show"), 10);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 200);
  }, 4000);
}

export function setLoading(id, isLoading = true) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle("is-loading", isLoading);
}

export function toggleInvalidField(id, isInvalid = true, errorMsg = "") {
  const input = document.getElementById(id);
  if (!input) return;
  const field = input.closest(".field");
  if (field) {
    field.classList.toggle("is-invalid", isInvalid);
    const msgEl = field.querySelector(".error-message");
    if (msgEl) msgEl.textContent = errorMsg;
  }
}
