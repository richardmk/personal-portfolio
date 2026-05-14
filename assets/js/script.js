// ============================================
// DOM Elements
// ============================================
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const closeBtn = document.getElementById('closeBtn');
const overlay = document.getElementById('overlay');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const contactForm = document.getElementById('contactForm');
const navTriggers = document.querySelectorAll('[data-nav]');

// ============================================
// Sidebar toggle en móvil
// ============================================
menuToggle.addEventListener('click', () => {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

const closeSidebar = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
};

closeBtn.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

// ============================================
// Navegación entre secciones
// ============================================
const navigateToSection = (sectionId) => {
    if (!sectionId) return;

    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));

    const targetLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    const targetSection = document.getElementById(sectionId);

    if (targetLink) targetLink.classList.add('active');
    if (targetSection) {
        targetSection.classList.add('active');
        // Reanimar las skill bars al entrar en la sección de servicios (donde viven ahora)
        if (sectionId === 'habilidades') {
            const skillFills = targetSection.querySelectorAll('.skill-fill');
            skillFills.forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0';
                setTimeout(() => {
                    fill.style.width = width;
                }, 100);
            });
        }
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    closeSidebar();

    // Actualizar URL hash sin saltar
    history.replaceState(null, '', `#${sectionId}`);
};

// Listeners para links del sidebar
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        navigateToSection(sectionId);
    });
});

// Listeners para otros triggers con data-nav (botones, enlaces del footer)
navTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = trigger.getAttribute('data-nav');
        navigateToSection(sectionId);
    });
});

// ============================================
// Toasts (notificaciones)
// ============================================
const toastContainer = document.getElementById('toastContainer');

const ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

const showToast = (type, title, message, duration = 4500) => {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `
        <div class="toast-icon">${ICONS[type] || ''}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close" aria-label="Cerrar notificación">${ICONS.close}</button>
    `;

    const dismiss = () => {
        if (toast.classList.contains('toast-leaving')) return;
        toast.classList.add('toast-leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };

    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    toastContainer.appendChild(toast);

    if (duration > 0) setTimeout(dismiss, duration);
};

// ============================================
// Formulario de contacto — POST a Google Apps Script
// El script (en script.google.com) recibe los campos, valida el honeypot
// y envía el email vía GmailApp.sendEmail desde la cuenta del owner.
// ============================================
const CONTACT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwVkf2jQtInY11hilKnHi_ODloMG2NmBJ6wA6VGz_uDDwpM5DPHTPl3_nZuZONrOFVj/exec';

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerHTML = '<span>Enviando…</span>';

        try {
            // URLSearchParams produce un POST application/x-www-form-urlencoded,
            // que es un "simple request" — evita el preflight CORS al endpoint de Apps Script.
            const body = new URLSearchParams(new FormData(contactForm));
            const res = await fetch(CONTACT_ENDPOINT, { method: 'POST', body });
            const data = await res.json();

            if (!data.ok) throw new Error(data.error || 'Respuesta no OK del servidor');

            contactForm.reset();
            showToast('success', 'Mensaje enviado', 'Gracias por escribir. Te respondo pronto.');
        } catch (err) {
            console.error('[contact] Error al enviar:', err);
            showToast('error', 'No se pudo enviar', 'Revisa tu conexión e intenta de nuevo.');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.style.opacity = '1';
            submitBtn.disabled = false;
        }
    });
}

// ============================================
// Inicialización desde hash en URL
// (script.js se carga por loader.js DESPUÉS de inyectar los partials,
//  por lo que window.load ya pudo haber disparado — ejecutamos directo)
// ============================================
{
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        navigateToSection(hash);
    }
}

// ============================================
// Formatear data-level de skills con símbolo %
// ============================================
document.querySelectorAll('.skill-name[data-level]').forEach(nameEl => {
    const raw = nameEl.getAttribute('data-level');
    if (raw && !raw.includes('%')) {
        nameEl.setAttribute('data-level', `${raw}%`);
    }
});

// ============================================
// Cerrar sidebar con Escape en móvil
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar();
    }
});
