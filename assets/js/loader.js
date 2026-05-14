// ============================================
// Carga de partials en paralelo y los inyecta uno por uno.
// Cada partial se parsea aislado para evitar artefactos del HTML parser
// al concatenar múltiples <section> con comentarios entremedio.
// ============================================
const PARTIALS = ['hero', 'about', 'skills', 'experience', 'projects', 'contact'];

// Live Server inyecta su script de auto-reload MÚLTIPLES veces dentro del HTML
// servido (no solo al final). Removemos cada bloque inyectado preservando el
// contenido original que viene entre ellos.
const stripLiveServerInjection = html =>
    html.replace(/<!-- Code injected by live-server -->[\s\S]*?<\/script>\s*/g, '');

const parseSection = (html, name) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = stripLiveServerInjection(html);
    const section = wrapper.querySelector('section');
    if (!section) throw new Error(`partials/${name}.html no contiene <section>`);
    return section;
};

async function loadPartials() {
    const main = document.querySelector('.main-content');
    const footer = main.querySelector('.footer');

    const htmls = await Promise.all(
        PARTIALS.map(name =>
            fetch(`partials/${name}.html`).then(r => {
                if (!r.ok) throw new Error(`partials/${name}.html → ${r.status}`);
                return r.text();
            })
        )
    );

    PARTIALS.forEach((name, i) => {
        const section = parseSection(htmls[i], name);
        main.insertBefore(section, footer);
    });

    await new Promise(resolve => {
        const s = document.createElement('script');
        s.src = 'assets/js/script.js';
        s.onload = resolve;
        s.onerror = resolve;
        document.body.appendChild(s);
    });
}

loadPartials().catch(err => {
    console.error('[loader] No se pudieron cargar los partials:', err);
    const main = document.querySelector('.main-content');
    if (main) {
        main.insertAdjacentHTML('afterbegin',
            `<div style="padding:2rem;color:#f87171;font-family:monospace">
                <strong>Error cargando contenido.</strong><br>
                ${err.message}<br>
                <small>Si estás abriendo el archivo con <code>file://</code>, sirve la carpeta con un servidor estático (ej. <code>python3 -m http.server</code>).</small>
            </div>`
        );
    }
});
