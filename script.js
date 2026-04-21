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
        // Reanimar las skill bars si vamos a esa sección
        if (sectionId === 'skills') {
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
// Formulario de contacto
// ============================================
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        const mailtoLink = `mailto:richard.mejia.k@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}`)}`;
        window.location.href = mailtoLink;

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>✓ Mensaje preparado</span>';
        submitBtn.style.opacity = '0.7';

        setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.style.opacity = '1';
            contactForm.reset();
        }, 2500);
    });
}

// ============================================
// Inicialización desde hash en URL
// ============================================
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        navigateToSection(hash);
    }
});

// ============================================
// Agregar atributo data-level a skills (para mostrar %)
// ============================================
document.querySelectorAll('.skill-badge').forEach(badge => {
    const level = badge.getAttribute('data-level');
    const nameEl = badge.querySelector('.skill-name');
    if (level && nameEl) {
        nameEl.setAttribute('data-level', `${level}%`);
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
