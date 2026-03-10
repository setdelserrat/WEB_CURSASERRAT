/* 
   Lògica de la web 
   Inclou configuració del domini, compte enrere i scroll suau.
*/

// Objecte de configuració de la web
// Aquesta variable serveix per quan es connecti el domini real.
// En entorns locals pot quedar buida o amb el placeholder.
const configuracioWeb = {
    dominiPreferit: "http://cursadelserrat.com/",
    dataEsdeveniment: "2026-06-06T09:00:00",
    nomEsdeveniment: "Cursa del Serrat"
};

// El compte enrere ara està integrat a countdown-flip.js
// que utilitza les dades `configuracioWeb.dataEsdeveniment` i GSAP.

// Funció per al desplaçament suau (Smooth Scroll) als enllaços interns
document.querySelectorAll('a[href^="#"]').forEach(ancora => {
    ancora.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // Si és només '#' o no existeix l'element, no fem res especial
        if (href === '#' || !document.querySelector(href)) return;

        e.preventDefault();
        document.querySelector(href).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Gestió d'imatges placeholder (comentari per al client)
// Aquí es poden substituir les imatges per fotos oficials del perfil d'Instagram
// S'ha utilitzat una estructura de graella responsive per facilitar-ne el canvi.

console.log(`${configuracioWeb.nomEsdeveniment} configurada correctament al domini: ${configuracioWeb.dominiPreferit}`);

// Funció per forçar la descàrrega d'arxius (com els GPX) sense obrir-los com a text
function descarregarArxiu(url, nomArxiu) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = nomArxiu;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        })
        .catch(error => console.error("Error al descarregar l'arxiu:", error));
}

// --- Generació dinàmica de Patrocinadors ---
if (typeof llistaSponsors !== 'undefined') {
    const dirSponsors = "./Imatges/LOGOS SPONSORS/";

    // Funció per formatar el nom de l'arxiu com a atribut alt (sense extensió)
    function formatarAlt(nomArxiu) {
        return nomArxiu.split('.')[0].replace(/_/g, ' ');
    }

    // Filtrem per assegurar que només agafem imatges
    const sponsorsValids = llistaSponsors.filter(s => s.match(/\.(png|jpe?g|webp|gif|svg)$/i));

    // Generar l'HTML per cada grup
    let htmlNormal = sponsorsValids.map(sponsor =>
        `<img src="${dirSponsors}${sponsor}" alt="${formatarAlt(sponsor)}" />`
    ).join('');

    let htmReverse = [...sponsorsValids].reverse().map(sponsor =>
        `<img src="${dirSponsors}${sponsor}" alt="${formatarAlt(sponsor)}" />`
    ).join('');

    // Inserir als contenidors
    const marqueeNormal = document.getElementById('marquee-normal');
    if (marqueeNormal) {
        const grups = marqueeNormal.querySelectorAll('.marquee__group');
        grups.forEach(grup => grup.innerHTML = htmlNormal);
    }

    const marqueeReverse = document.getElementById('marquee-reverse');
    if (marqueeReverse) {
        const grups = marqueeReverse.querySelectorAll('.marquee__group');
        grups.forEach(grup => grup.innerHTML = htmReverse);
    }
}
