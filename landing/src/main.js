import './page.js';

import { enablePersistence, initAnalytics, track } from './analytics.js';
import { needsBanner, saveConsent } from './consent.js';
import { initMotion } from './motion.js';
import { COUNTRIES, DOORS, PRICES, SHARE_TEXT } from './config.js';
import {
  errorMessage,
  isValidEmail,
  isValidName,
  joinWaitlist,
  normalizeEmail,
  normalizeName,
  RateLimitError,
} from './waitlist.js';

initAnalytics();
initMotion();

const $ = (sel) => document.querySelector(sel);

// ---------- Contenido dinámico ----------
document.querySelectorAll('[data-price]').forEach((el) => {
  el.textContent = PRICES[el.dataset.price];
});
$('#year').textContent = new Date().getFullYear();

const countrySelect = $('#wl-country');
for (const [code, label] of COUNTRIES) {
  countrySelect.add(new Option(label, code));
}

// ---------- Tema claro / oscuro ----------
$('#theme-toggle').addEventListener('click', () => {
  const root = document.documentElement;
  const current =
    root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {
    // Sin almacenamiento (modo privado): el tema dura solo esta visita.
  }
});

// ---------- CTA del hero ----------
document.querySelectorAll('[data-track]').forEach((el) => {
  el.addEventListener('click', () => track(el.dataset.track));
});

// ---------- Helpers de formulario ----------
function showError(el, message) {
  el.textContent = message;
  el.hidden = !message;
}

function setInvalid(input, invalid) {
  input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
}

// ---------- Formulario de lista de espera ----------
const form = $('#waitlist-form');
const formError = $('#waitlist-error');
let formStarted = false;

form.addEventListener('focusin', () => {
  if (formStarted) return;
  formStarted = true;
  track('waitlist_form_iniciado');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  track('waitlist_form_enviar_click');

  const nameInput = form.elements.name;
  const emailInput = form.elements.email;
  const name = normalizeName(nameInput.value);
  const email = normalizeEmail(emailInput.value);
  const country = countrySelect.value;

  // Bot: completó el campo oculto. Fingimos éxito y no guardamos nada.
  if (form.elements.website.value) {
    showThanks(name);
    return;
  }

  const nameOk = isValidName(name);
  const emailOk = isValidEmail(email);
  const countryOk = COUNTRIES.some(([code]) => code === country);
  setInvalid(nameInput, !nameOk);
  setInvalid(emailInput, !emailOk);
  setInvalid(countrySelect, !countryOk);

  if (!nameOk || !emailOk || !countryOk) {
    const msg = !nameOk
      ? 'Escribe tu nombre.'
      : !emailOk
        ? 'Revisa tu email: parece que tiene un error.'
        : 'Elige tu país.';
    showError(formError, msg);
    track('waitlist_form_error_validacion', { campo: !nameOk ? 'nombre' : !emailOk ? 'email' : 'pais' });
    (!nameOk ? nameInput : !emailOk ? emailInput : countrySelect).focus();
    return;
  }

  showError(formError, '');
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Enviando…';

  try {
    await joinWaitlist({ name, email, country, source: 'landing' });
    track('waitlist_registro_ok', { pais: country });
    showThanks(name);
  } catch (err) {
    console.error(err);
    track('waitlist_registro_error', { motivo: err instanceof RateLimitError ? 'limite_ip' : 'otro' });
    showError(formError, errorMessage(err));
    button.disabled = false;
    button.textContent = 'Unirme a la lista';
  }
});

function showThanks(name) {
  $('#thanks-name').textContent = name.split(' ')[0] || '';
  $('#waitlist-form-wrap').hidden = true;
  const thanks = $('#waitlist-thanks');
  thanks.hidden = false;
  thanks.focus();
}

// ---------- Compartir ----------
const shareUrl = location.origin;
const shareWhatsapp = $('#share-whatsapp');
shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${shareUrl}`)}`;
shareWhatsapp.addEventListener('click', () => track('compartir_click', { metodo: 'whatsapp' }));

$('#share-btn').addEventListener('click', async () => {
  const status = $('#share-status');
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Bereano', text: SHARE_TEXT, url: shareUrl });
      track('compartir_click', { metodo: 'nativo' });
    } catch {
      // El usuario canceló el diálogo de compartir.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${SHARE_TEXT} ${shareUrl}`);
    status.textContent = 'Enlace copiado. ¡Pégalo donde quieras!';
    track('compartir_click', { metodo: 'copiar' });
  } catch {
    status.textContent = shareUrl;
  }
});

// ---------- Consentimiento de cookies (solo Europa) ----------
const banner = $('#consent');
if (needsBanner()) banner.hidden = false;
banner.addEventListener('click', (event) => {
  const choice = event.target.closest('[data-consent]')?.dataset.consent;
  if (!choice) return;
  saveConsent(choice);
  if (choice === 'yes') enablePersistence();
  track('consentimiento_cookies', { eleccion: choice === 'yes' ? 'acepta' : 'rechaza' });
  banner.hidden = true;
});

// ---------- Puertas falsas ----------
const dialog = $('#soon-dialog');
const soonForm = $('#soon-form');
const soonError = $('#soon-error');
let currentDoor = null;

document.querySelectorAll('[data-door]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.door;
    const door = DOORS[id];
    currentDoor = id;
    // Un evento distinto por puerta: se comparan directo en PostHog.
    track(door.event);

    $('#soon-title').textContent = door.title;
    $('#soon-text').textContent = door.text;
    $('#soon-body').hidden = false;
    $('#soon-thanks').hidden = true;
    showError(soonError, '');
    soonForm.reset();
    dialog.showModal();
  });
});

// Cerrar tocando el fondo. Comparamos con el rectángulo porque un clic en el
// padding del diálogo también tiene como target al propio <dialog>.
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  const inside =
    event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
  if (!inside) dialog.close();
});

soonForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const emailInput = soonForm.elements.email;
  const email = normalizeEmail(emailInput.value);
  if (!isValidEmail(email)) {
    setInvalid(emailInput, true);
    showError(soonError, 'Revisa tu email: parece que tiene un error.');
    emailInput.focus();
    return;
  }
  setInvalid(emailInput, false);
  showError(soonError, '');

  const button = soonForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await joinWaitlist({ email, source: `puerta_${currentDoor}` });
    track('puerta_falsa_email_enviado', { puerta: currentDoor });
    $('#soon-body').hidden = true;
    $('#soon-thanks').hidden = false;
  } catch (err) {
    console.error(err);
    showError(soonError, errorMessage(err));
  } finally {
    button.disabled = false;
  }
});
